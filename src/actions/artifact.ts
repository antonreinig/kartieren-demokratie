'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const artifactSchema = z.object({
    url: z.string().url(),
    title: z.string().min(1, "Titel wird benötigt"),
    description: z.string().optional(),
    type: z.enum(["LINK", "PDF", "VIDEO"]),
    takeaways: z.array(z.string().min(5)),
    tags: z.array(z.string()),
    topicId: z.string(),
    // For now assuming anonymous or guest user
    userId: z.string(),
    evidenceLevel: z.string().optional(),
    mainSource: z.string().optional(),
    contentCategories: z.record(z.string(), z.number()).optional(),
})

export async function createArtifact(data: z.infer<typeof artifactSchema>) {
    const { url, title, description, type, takeaways, tags, topicId, userId, evidenceLevel, mainSource, contentCategories } = data

    // Create Artifact
    const artifact = await prisma.artifact.create({
        data: {
            url,
            title,
            description,
            type,
            topicId,
            contributorId: userId,
            evidenceLevel,
            mainSource,
            contentCategories: contentCategories as any, // Cast for Prisma JSON
            takeaways: {
                create: takeaways.map(t => ({ content: t }))
            },
            tags: {
                create: tags.map(t => ({ label: t }))
            }
        }
    })

    revalidatePath(`/${topicId}`) // Actually need the slug here or revalidate logic
    // But since I don't have the slug easily in the component without passing it carefully, 
    // I can fetch topic to get slug or just rely on page refresh. 
    // Usually revalidatePath works with the route.

    // Let's revalidate globally for now or fetch topic slug
    const topic = await prisma.topic.findUnique({ where: { id: topicId } })
    if (topic) {
        revalidatePath(`/${topic.slug}`)
    }

    return { success: true }
}
