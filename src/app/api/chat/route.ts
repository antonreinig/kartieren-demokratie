import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { prisma } from '@/lib/prisma';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages, slug } = await req.json();

    if (!slug) {
        return new Response('Slug is required', { status: 400 });
    }

    // 1. Fetch Topic Context
    const topic = await prisma.topic.findUnique({
        where: { slug },
    });

    if (!topic) {
        return new Response('Topic not found', { status: 404 });
    }

    // 2. Construct System Prompt
    const systemPrompt = `
You are a helpful facilitation assistant for a democratic deliberation process.
The user is participating in a discussion about: "${topic.title}".

Context/Description:
"${topic.description || 'No description provided.'}"

Scope:
"${topic.scope || 'No scope defined.'}"

Your goal is to:
1. Welcome the user and ask for their initial thoughts if they haven't shared them.
2. Help them refine their opinion by asking clarifying questions.
3. Challenge them gently to consider other perspectives (if applicable).
4. Keep the tone constructive, neutral, and encouraging.
5. Be concise. Do not write long essays.

Current date: ${new Date().toLocaleDateString('de-DE')}
Language: German (always reply in German).
`;

    // 3. Stream Response
    const result = streamText({
        model: openai('gpt-4o-mini'),
        system: systemPrompt,
        messages,
    });

    return result.toTextStreamResponse();
}
