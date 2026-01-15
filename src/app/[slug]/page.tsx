import { getTopicBySlug } from "@/actions/get-topic";
import { notFound } from "next/navigation";
import { TopicPageClient } from "@/components/layout/topic-page-client";

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const topic = await getTopicBySlug(slug);

    if (!topic) return notFound();

    return <TopicPageClient topic={topic} slug={slug} />;
}
