import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const slug = searchParams.get('slug');
        const guestToken = searchParams.get('guestToken');

        if (!slug) {
            return Response.json({ error: 'slug is required' }, { status: 400 });
        }

        // Get current user session
        const session = await auth();
        const userId = session?.user?.id || null;

        if (!userId && !guestToken) {
            return Response.json({ error: 'Authentication required' }, { status: 401 });
        }

        // Find the topic
        const topic = await prisma.topic.findUnique({
            where: { slug }
        });

        if (!topic) {
            return Response.json({ error: 'Topic not found' }, { status: 404 });
        }

        // Find the chat session for this user/guest
        let chatSession;
        if (userId) {
            chatSession = await prisma.chatSession.findFirst({
                where: {
                    topicId: topic.id,
                    userId
                }
            });
        } else if (guestToken) {
            chatSession = await prisma.chatSession.findFirst({
                where: {
                    topicId: topic.id,
                    guestToken
                }
            });
        }

        if (!chatSession) {
            // No session yet - return empty state with message count 0
            return Response.json({
                profile: null,
                messageCount: 0,
                messagesUntilNextUpdate: 3
            });
        }

        // Count user messages
        const messageCount = await prisma.chatMessage.count({
            where: {
                sessionId: chatSession.id,
                role: 'user'
            }
        });

        // Find the profile for this session
        const profile = await prisma.userProfile.findUnique({
            where: { sessionId: chatSession.id }
        });

        // Calculate messages until next update
        // First profile at 6, then every 3 messages
        const messagesUntilNextUpdate = messageCount < 6
            ? 6 - messageCount
            : 3 - (messageCount % 3);

        return Response.json({
            profile,
            messageCount,
            messagesUntilNextUpdate: messagesUntilNextUpdate === 0 ? 3 : messagesUntilNextUpdate
        });
    } catch (error: any) {
        console.error('Error fetching user profile:', error);
        return Response.json({
            error: 'Failed to fetch profile',
            details: error?.message
        }, { status: 500 });
    }
}
