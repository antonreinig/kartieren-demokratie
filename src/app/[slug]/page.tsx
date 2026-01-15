import { getTopicBySlug, getAllTopics } from "@/actions/get-topic";
import { TopicPageClient } from "@/components/layout/topic-page-client";
import { SlugSelectionClient } from "@/components/layout/slug-selection-client";

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const topic = await getTopicBySlug(slug);

    if (!topic) {
        const topics = await getAllTopics();
        return <SlugSelectionClient topics={topics} prefilledSlug={slug} />;
    }

    return <TopicPageClient topic={topic} slug={slug} />;
}
