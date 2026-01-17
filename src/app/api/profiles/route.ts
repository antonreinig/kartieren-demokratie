import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const topicId = searchParams.get('topicId');

    if (!slug && !topicId) {
        return new Response(JSON.stringify({ error: 'slug or topicId is required' }), { status: 400 });
    }

    try {
        // Find topic if slug provided
        let resolvedTopicId = topicId;
        if (slug && !topicId) {
            const topic = await prisma.topic.findUnique({
                where: { slug },
                select: { id: true }
            });
            if (!topic) {
                return new Response(JSON.stringify({ error: 'Topic not found' }), { status: 404 });
            }
            resolvedTopicId = topic.id;
        }

        // Fetch all profiles for the topic
        const profiles = await prisma.userProfile.findMany({
            where: { topicId: resolvedTopicId! },
            orderBy: { updatedAt: 'desc' }
        });

        return Response.json({ profiles });
    } catch (error: any) {
        console.error('Error fetching profiles:', error);
        return new Response(JSON.stringify({
            error: 'Failed to fetch profiles',
            details: error?.message
        }), { status: 500 });
    }
}
