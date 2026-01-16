import { getTopicBySlug } from "@/actions/get-topic"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AnalyzeClient from "@/components/AnalyzeClient"

export default async function AnalyzePage({ params, searchParams }: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ url: string }>
}) {
    const { slug } = await params
    const { url } = await searchParams
    const topic = await getTopicBySlug(slug)

    if (!topic) return notFound()

    // Temporary User Handling (matching contribute/page.tsx)
    let userId = "guest-id"
    const firstUser = await prisma.user.findFirst()
    if (firstUser) userId = firstUser.id

    return (
        <div className="min-h-screen bg-[#F8CD32] p-6">
            <AnalyzeClient
                url={url}
                topicId={topic.id}
                userId={userId}
                slug={slug}
            />
        </div>
    )
}
