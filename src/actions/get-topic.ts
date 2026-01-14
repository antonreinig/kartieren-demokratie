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
