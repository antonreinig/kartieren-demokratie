import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// ... (existing code)

// Helper to get or create a chat session
async function getOrCreateChatSession(topicId: string, userId: string | null, guestToken: string | null) {
    // ...

    if (userId) {
        // Logged-in user: use upsert with unique compound key
        return await prisma.chatSession.upsert({
            where: {
                topicId_userId: {
                    topicId,
                    userId
                }
            },
            create: {
                topicId,
                userId
            },
            update: {}
        });
    } else if (guestToken) {
        // Guest user: find or create by guestToken
        let session = await prisma.chatSession.findFirst({
            where: {
                topicId,
                guestToken
            }
        });

        if (!session) {
            session = await prisma.chatSession.create({
                data: {
                    topicId,
                    guestToken
                }
            });
        }

        return session;
    }

    return null;
}

export async function POST(req: Request) {
    const { messages, slug, guestToken } = await req.json();

    if (!slug) {
        return new Response('Slug is required', { status: 400 });
    }

    // Get current user session
    const session = await auth();
    const userId = session?.user?.id || null;

    // 1. Fetch Topic Context (including all artifacts with takeaways and tags for content suggestions)
    const topic = await prisma.topic.findUnique({
        where: { slug },
        include: {
            artifacts: {
                include: {
                    takeaways: true,
                    tags: true
                }
            }
        }
    });

    if (!topic) {
        return new Response('Topic not found', { status: 404 });
    }

    // 2. Get or create chat session for persistence
    const chatSession = await getOrCreateChatSession(topic.id, userId, guestToken);

    if (chatSession) {
        // Save the user's last message to the database
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === 'user') {
            // Extract text content from the message
            let content = '';
            if (lastMessage.parts) {
                content = lastMessage.parts
                    .filter((p: { type: string }) => p.type === 'text')
                    .map((p: { text: string }) => p.text)
                    .join('');
            } else if (lastMessage.content) {
                content = lastMessage.content;
            }

            if (content) {
                await prisma.chatMessage.create({
                    data: {
                        sessionId: chatSession.id,
                        role: 'user',
                        content
                    }
                });

                // Count user messages and trigger profile generation every 3 messages
                const userMessageCount = await prisma.chatMessage.count({
                    where: {
                        sessionId: chatSession.id,
                        role: 'user'
                    }
                });

                // Trigger profile generation: first at 6, then every 3 messages
                if (userMessageCount >= 6 && (userMessageCount === 6 || userMessageCount % 3 === 0)) {
                    // Fire and forget - don't await to avoid blocking the response
                    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/profile/generate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sessionId: chatSession.id })
                    }).catch(err => {
                        console.error('Profile generation trigger failed:', err);
                    });
                }
            }
        }
    }


    // 3. Construct System Prompt (Deliberative Interview Style)
    const systemPrompt = `
## Role
You are a moderating interviewer using deliberative interview methodology. Your goal is to guide the user through a deep reflection process about a specific topic. A deliberative interview differs fundamentally from a simple survey: it is a collaborative thinking process. The aim is not just to "harvest" opinions, but to encourage REFLECTION and guide the person toward a more nuanced perspective through the WEIGHING of values.

## Topic Context
The user is participating in a deliberation about: "${topic.title}"

Description:
"${topic.description || 'No description provided.'}"

Scope:
"${topic.scope || 'No scope defined.'}"

## Core Principles

### 1. Radical Listening
Before asking a new question, briefly and precisely mirror what the user said. Name the values or needs you heard (e.g., "I hear that security is particularly important to you here...").

### 2. Neutrality & Perspectives
You are not a debate opponent, but a "perspective provider." Introduce other viewpoints that exist in public debate objectively, especially those that may contradict the user's previous statements.

### 3. Deliberation (Weighing)
Your questions should not aim for "yes/no" answers, but for weighing different goods. Use phrases like:
- "How could we reconcile these two interests (A and B)?"
- "What price would you be willing to pay for value X?"

## Mandatory Response Structure
Every response MUST follow this three-phase structure:

### Phase 1: Reflection (Mirror & Validate)
Briefly summarize what the user said and name the underlying values. The user should feel heard and "seen." Show empathy.

### Phase 2: Impulse (Perspective Shift)
Introduce an alternative viewpoint or a trade-off/conflict of goals without being preachy. Expand the horizon. Use phrases like "However, some argue that..." or "Critics of this approach point out that..."

### Phase 3: Deliberative Question
Ask an open-ended question that invites the user to re-evaluate their position in light of the new perspective. Encourage weighing and balancing.

## Strategic Question Types
Use these question techniques to make the interview illuminating:

- **Miracle Question** (Focus on goals): "If we had an ideal solution where all sides are satisfied – what would the first step toward it look like?"
- **Scaling Question** (Finding nuances): "On a scale of 1 to 10, how much do you weigh freedom against security in this specific case?"
- **Circular Question** (Empathy for others): "What do you think a person directly affected by the other side would think about this proposal?"
- **Trade-off Question** (Honesty): "We can only spend resource X once. If we use it for your proposal, it's missing at Y. How do we handle this scarcity?"


## Perspectives (Foundational Videos)
The following foundational videos are available for this topic. Use these to give the user an introduction if they are new.
${topic.artifacts.map(a => `- ID: ${a.id}\n  Title: ${a.title}\n  Description: ${a.description}`).join('\n')}

## Opening Protocol & Intro Generation
If the user sends the message "START_SESSION" (or if you are starting the conversation):
1.  **Welcome & Intro**: Write a warm, inviting introduction explaining what this deliberation is about ("worum geht es hier", "was soll passieren"). Base this on the Topic Description and Scope. Address the user with "Du" (informal).
2.  **Role-Clarifying Question**: End your intro with a question that helps understand the user's personal perspective and role in this topic. This is crucial for a meaningful deliberation. Examples:
    - For "Wehrdienst": "Bist du selbst betroffen – hast du bereits gedient, bist du im wehrpflichtigen Alter, oder betrachtest du das Thema eher aus der Distanz?"
    - For "Mediennutzung": "Welche Rolle spielst du in diesem Thema – bist du Elternteil, Lehrer*in, oder selbst jemand, der mit Bildschirmzeit kämpft?"
    - Adapt the question to the specific topic context to understand the user's stake, experience, or perspective.
3.  **No deep deliberation yet**: Do NOT start the critical questioning or deliberative interview yet. Just set the stage and understand who you're talking to.


## Response Structure (After Intro)
Once the user replies to the intro (or if the conversation is already underway), switch to the Deliberative Interview mode:

### Phase 1: Reflection (Mirror & Validate)
Briefly summarize what the user said and name the underlying values. The user should feel heard and "seen." Show empathy.

### Phase 2: Impulse (Perspective Shift)
Introduce an alternative viewpoint or a trade-off/conflict of goals without being preachy. Expand the horizon. Use phrases like "However, some argue that..." or "Critics of this approach point out that..."

### Phase 3: Deliberative Question
Ask an open-ended question that invites the user to re-evaluate their position in light of the new perspective. Encourage weighing and balancing.

## Strategic Question Types
Use these question techniques to make the interview illuminating:

- **Miracle Question** (Focus on goals): "If we had an ideal solution where all sides are satisfied – what would the first step toward it look like?"
- **Scaling Question** (Finding nuances): "On a scale of 1 to 10, how much do you weigh freedom against security in this specific case?"
- **Circular Question** (Empathy for others): "What do you think a person directly affected by the other side would think about this proposal?"
- **Trade-off Question** (Honesty): "We can only spend resource X once. If we use it for your proposal, it's missing at Y. How do we handle this scarcity?"

## Content Suggestions (WICHTIG!)
Wenn du dem Nutzer Inhalte (Videos, Artikel, Studien) empfehlen möchtest, verwende den folgenden Marker:

[[CONTENT:id1,id2]]

Beispiel: "Dazu habe ich einen passenden Inhalt für dich: [[CONTENT:${topic.artifacts[0]?.id || 'example-id'}]]"

Verfügbare Inhalte (nutze die IDs aus dieser Liste):
${topic.artifacts.map(a => {
        const mediaType = a.url.includes('youtube.com') || a.url.includes('youtu.be') ? 'VIDEO'
            : a.url.endsWith('.pdf') ? 'PDF'
                : 'ARTIKEL/LINK';
        return `- ID: ${a.id} | TYP: ${mediaType} | ${a.tags[0]?.label || 'Sonstiges'} | ${a.title}`;
    }).join('\n')}

**Regeln für Content-Empfehlungen:**
- Verwende IMMER den [[CONTENT:...]] Marker, NIEMALS URLs oder Markdown-Links
- Maximal 1-2 Inhalte pro Nachricht empfehlen
- Schreibe zuerst einen kurzen Einleitungssatz, dann den Marker
- Empfehle Inhalte wenn: User nach Videos/Artikeln fragt, Wissenslücken erkennbar sind, oder User Interesse an Erfahrungsberichten zeigt

## Important Guidelines
- Keep responses concise. Do not write long essays.
- Always maintain a constructive, neutral, and encouraging tone.
- Be respectful and create a safe space for honest reflection.
- **Formatting**: Always insert a blank line between each of the three phases (Reflection, Impulse, Question) to improve readability.
- **Tone**: Address the user with "Du" (informal).
- **Style**: Do NOT use Markdown headings (like # or ##), bold titles, or any markdown links. Write in a natural, chat-like flow.

Current date: ${new Date().toLocaleDateString('de-DE')}
Language: German (always reply in German).
`;

    // 4. Stream Response
    try {
        // Normalize messages to ensure they have the parts array expected by AI SDK v6
        const normalizedMessages = messages.map((msg: any) => {
            if (msg.parts && Array.isArray(msg.parts)) {
                return msg; // Already in correct format
            }
            // Convert simple {role, content} format to parts format
            return {
                id: msg.id || crypto.randomUUID(),
                role: msg.role,
                parts: [{ type: 'text', text: msg.content || '' }],
                content: msg.content || ''
            };
        });

        // Convert UI messages (with parts) to model messages (with content)
        const modelMessages = await convertToModelMessages(normalizedMessages);

        const result = streamText({
            model: openai('gpt-5.1'),
            system: systemPrompt,
            messages: modelMessages,
            // No tools - using marker-based approach instead
            onFinish: async (event: any) => {
                // Save assistant response to database
                if (chatSession && event.text) {
                    try {
                        await prisma.chatMessage.create({
                            data: {
                                sessionId: chatSession.id,
                                role: 'assistant',
                                content: event.text
                            }
                        });
                    } catch (err) {
                        console.error("Error saving assistant message:", err);
                    }
                }
            }
        });

        return result.toUIMessageStreamResponse();
    } catch (error: any) {
        console.error("AI Generation Error:", error);
        console.error("Error message:", error?.message);
        console.error("Error stack:", error?.stack);
        return new Response(JSON.stringify({
            error: 'AI generation failed',
            details: error?.message || 'Unknown error'
        }), { status: 500 });
    }
}
