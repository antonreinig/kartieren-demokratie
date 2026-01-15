import TopicWizard from '@/components/TopicWizard'

export default async function CreateTopicPage({ searchParams }: { searchParams: Promise<{ slug?: string }> }) {
    const { slug } = await searchParams;
    return (
        <div className="min-h-screen bg-[#EAEAEA] flex items-center justify-center">
            <TopicWizard initialSlug={slug} />
        </div>
    )
}
