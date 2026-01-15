import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const guestToken = searchParams.get('guestToken');

    if (!slug) {
        return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    // Get the current session to check for logged-in user
    const session = await auth();
    const userId = session?.user?.id;

    // Find the topic
    const topic = await prisma.topic.findUnique({
        where: { slug },
        select: { id: true }
    });

    if (!topic) {
        return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Find chat session - either by userId or guestToken
    let chatSession = null;

    if (userId) {
        // Logged-in user: find by userId
        chatSession = await prisma.chatSession.findUnique({
            where: {
                topicId_userId: {
                    topicId: topic.id,
                    userId: userId
                }
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
    } else if (guestToken) {
        // Guest user: find by guestToken
        chatSession = await prisma.chatSession.findFirst({
            where: {
                topicId: topic.id,
                guestToken: guestToken
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
    }

    if (!chatSession) {
        // No existing session - return empty messages
        return NextResponse.json({ messages: [] });
    }

    // Transform messages to the format expected by useChat
    const messages = chatSession.messages.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        parts: [{ type: 'text', text: msg.content }]
    }));

    return NextResponse.json({ messages, sessionId: chatSession.id });
}
