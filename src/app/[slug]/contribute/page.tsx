import { getTopicBySlug } from "@/actions/get-topic"
import { notFound } from "next/navigation"
import ContributeForm from "@/components/ContributeForm"
import { prisma } from "@/lib/prisma"

export default async function ContributePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const topic = await getTopicBySlug(slug)

    if (!topic) return notFound()

    // Temporary User Handling:
    // Ideally we verify Auth. For now, fetch the first user or create a guest one server-side to pass to client.
    // In a real scenario, we'd use `auth()` here.
    let userId = "guest-id"
    const firstUser = await prisma.user.findFirst()
    if (firstUser) userId = firstUser.id

    return (
        <div className="min-h-screen bg-[#EAEAEA] p-6">
            <ContributeForm topicId={topic.id} userId={userId} slug={slug} />
        </div>
    )
}
