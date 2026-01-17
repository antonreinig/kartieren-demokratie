import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Schema for the profile structure based on the Briefing
// Note: Using .nullable() instead of .optional() for OpenAI structured output compatibility
const ProfileSchema = z.object({
    profileTitle: z.string().describe('Short 2-4 word title capturing the core attitude'),
    subtitle: z.string().nullable().describe('Optional short clarifying phrase, max ~8 words'),
    roleContext: z.string().describe('Description of the role and position from which the person speaks'),
    overallAttitude: z.string().describe('General stance toward the topic including orientation and emotional tone'),
    coreValues: z.array(z.object({
        label: z.string().describe('Short name like Autonomy, Safety, Fairness'),
        description: z.string().nullable().describe('Short clarification in plain language')
    })).min(3).max(5).describe('3-5 key values and needs driving the attitude'),
    keyConcerns: z.array(z.object({
        text: z.string().describe('The concern itself'),
        qualification: z.string().nullable().describe('Why this matters')
    })).describe('Soft constraints - worries, risks that are potentially negotiable'),
    redLines: z.array(z.object({
        text: z.string().describe('The non-negotiable condition'),
        scope: z.enum(['personal', 'ethical', 'political']).nullable().describe('Scope of the red line')
    })).describe('Hard constraints - crossing these makes the option unacceptable'),
    counterarguments: z.array(z.object({
        argument: z.string().describe('Short paraphrase of the counterargument'),
        whyUnderstood: z.string().describe('What makes it understandable')
    })).describe('Arguments the person does not agree with but understands'),
    conditionsForChange: z.array(z.object({
        conditionText: z.string().describe('The condition itself'),
        type: z.enum(['safeguard', 'opt-out', 'pilot', 'transparency', 'separation']).nullable().describe('Type of condition')
    })).describe('Conditions under which the person might reconsider'),
    characterization: z.string().describe('1-2 sentence neutral summary of the attitude')
});


const PROFILE_SYSTEM_PROMPT = `You are an expert in deliberative democracy and attitude profiling. Your task is to create a structured profile of a person based on their chat conversation about a specific topic.

## Purpose
Create a **generalized, topic-agnostic attitude profile** that makes visible:
- How the person relates to the topic
- Which values and needs shape their view
- Where compromise is possible and where it is not

## Design Principles
- Topic-independent (works for political, social, practical, or everyday issues)
- Non-judgmental and non-diagnostic
- Focused on values, needs, and reasoning rather than positions alone
- Suitable for comparison across profiles
- Understandable to non-experts

## Important Guidelines
- The profile should be ANONYMOUS - do not mention the person's name
- Focus on the PERSPECTIVE, not the person
- Be neutral and descriptive, not evaluative
- Extract implicit values even when not explicitly stated
- Identify both stated and implied concerns
- Look for patterns in reasoning

## Profile Structure Requirements

### Profile Title (2-4 words)
A short, descriptive headline that captures the core attitude.
- Must be readable in a list of many profiles
- Not a slogan, not evaluative
- Examples: "Cautious Civic Pacifism", "Security-Oriented Pragmatism", "Community-First Autonomy"

### Context & Role
Describe from which position the person is speaking:
- Role(s) relevant to the topic
- Degree of personal involvement

### Overall Attitude
Summarize the general stance:
- Basic orientation (supportive, skeptical, opposed, ambivalent, undecided)
- Emotional tone (calm, concerned, defensive, curious, frustrated)

### Core Values & Needs (3-5 items)
Use universal, human-readable terms like:
Safety, Autonomy, Fairness, Care/responsibility for others, Sustainability, Transparency, Community, Freedom, Justice, Solidarity

### Key Concerns (Soft Constraints)
Worries and risks that are emotionally or ethically relevant but potentially negotiable.

### Red Lines (Hard Constraints)
Non-negotiable boundaries - crossing these makes the option unacceptable.

### Acknowledged Counterarguments
Arguments the person does NOT agree with but can understand why others hold them.

### Conditions for Change
Conditions under which the person might reconsider their stance.

### One-Sentence Characterization
1-2 sentences, descriptive not evaluative. No labeling or stereotyping.

Respond ONLY in German language.`;

export async function POST(req: Request) {
    try {
        const { sessionId } = await req.json();

        if (!sessionId) {
            return new Response(JSON.stringify({ error: 'sessionId is required' }), { status: 400 });
        }

        // 1. Load the chat session with all messages and topic
        const session = await prisma.chatSession.findUnique({
            where: { id: sessionId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                },
                topic: true
            }
        });

        if (!session) {
            return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404 });
        }

        // 2. Build conversation context for GPT
        const conversationText = session.messages
            .map(m => `${m.role === 'user' ? 'NUTZER' : 'MODERATOR'}: ${m.content}`)
            .join('\n\n');

        const userPrompt = `## Topic Context
Title: ${session.topic.title}
Description: ${session.topic.description || 'No description'}
Scope: ${session.topic.scope || 'No scope defined'}

## Conversation
${conversationText}

---

Based on this conversation, create a deliberative attitude profile for this anonymous participant. Focus on their perspective, values, concerns, and conditions for change.`;

        // 3. Generate profile using GPT
        const { object: profile } = await generateObject({
            model: openai('gpt-4o'),
            schema: ProfileSchema,
            system: PROFILE_SYSTEM_PROMPT,
            prompt: userPrompt,
        });

        // 4. Count user messages
        const userMessageCount = session.messages.filter(m => m.role === 'user').length;

        // 5. Upsert the profile (create or update)
        const savedProfile = await prisma.userProfile.upsert({
            where: { sessionId },
            create: {
                sessionId,
                topicId: session.topic.id,
                profileTitle: profile.profileTitle,
                subtitle: profile.subtitle,
                roleContext: profile.roleContext,
                overallAttitude: profile.overallAttitude,
                coreValues: profile.coreValues,
                keyConcerns: profile.keyConcerns,
                redLines: profile.redLines,
                counterarguments: profile.counterarguments,
                conditionsForChange: profile.conditionsForChange,
                characterization: profile.characterization,
                messageCount: userMessageCount
            },
            update: {
                profileTitle: profile.profileTitle,
                subtitle: profile.subtitle,
                roleContext: profile.roleContext,
                overallAttitude: profile.overallAttitude,
                coreValues: profile.coreValues,
                keyConcerns: profile.keyConcerns,
                redLines: profile.redLines,
                counterarguments: profile.counterarguments,
                conditionsForChange: profile.conditionsForChange,
                characterization: profile.characterization,
                messageCount: userMessageCount
            }
        });

        return Response.json({ success: true, profile: savedProfile });
    } catch (error: any) {
        console.error('Profile generation error:', error);
        return new Response(JSON.stringify({
            error: 'Profile generation failed',
            details: error?.message
        }), { status: 500 });
    }
}
