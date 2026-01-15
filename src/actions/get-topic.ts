'use server'

import { prisma } from "@/lib/prisma"

export async function getTopicBySlug(slug: string) {
    return await prisma.topic.findUnique({
        where: { slug },
        include: {
            artifacts: {
                include: {
                    takeaways: true,
                    tags: true
                }
            }
        }
    })
}

export async function getAllTopics() {
    return await prisma.topic.findMany({
        select: {
            slug: true,
            title: true,
            _count: {
                select: { artifacts: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
}
