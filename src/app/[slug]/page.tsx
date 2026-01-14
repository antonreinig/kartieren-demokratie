import { getTopicBySlug } from "@/actions/get-topic"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { PlusCircle, MessageCircle } from "lucide-react"

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const topic = await getTopicBySlug(slug)

    if (!topic) return notFound()

    return (
        <div className="min-h-screen bg-[#EAEAEA]">
            {/* Sidebar / Layout Placeholder - For now just a centered layout */}
            <div className="max-w-4xl mx-auto p-6 space-y-8">

                {/* Header Card */}
                <Card className="p-8 rounded-[2rem] border-none shadow-sm bg-white">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{topic.title}</h1>
                            <p className="text-muted-foreground">{topic.description || "Keine Beschreibung vorhanden."}</p>
                        </div>
                        <div className="bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full text-sm font-medium">
                            Läuft bis {topic.endsAt ? new Date(topic.endsAt).toLocaleDateString() : 'Ende offen'}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <h3 className="font-semibold mb-2 text-sm uppercase text-gray-500">Scope: Was gehört dazu?</h3>
                        <p className="leading-relaxed">{topic.scope || "Nicht definiert."}</p>
                    </div>
                </Card>

                {/* Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link href={`/${slug}/contribute`}>
                        <Card className="h-full p-8 rounded-[2rem] border-none shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer group flex flex-col items-center text-center justify-center space-y-4">
                            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <PlusCircle className="w-8 h-8 text-black" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Wissen beitragen</h3>
                                <p className="text-muted-foreground mt-2">Füge Links, Videos oder Dokumente hinzu und extrahiere Kernaussagen.</p>
                            </div>
                        </Card>
                    </Link>

                    <Link href={`/${slug}/interview`}>
                        <Card className="h-full p-8 rounded-[2rem] border-none shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer group flex flex-col items-center text-center justify-center space-y-4">
                            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <MessageCircle className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Diskutieren / Einordnen</h3>
                                <p className="text-muted-foreground mt-2">Starte ein Deliberatives Interview, um deine Perspektive zu klären.</p>
                            </div>
                        </Card>
                    </Link>
                </div>

                {/* Artifacts List (Preview) */}
                <div className="pt-8">
                    <h2 className="text-2xl font-bold mb-6">Wissensbasis <span className="text-gray-400 text-lg font-normal">({topic.artifacts.length} Beiträge)</span></h2>

                    <div className="grid gap-4">
                        {topic.artifacts.length === 0 ? (
                            <p className="text-gray-500 italic">Noch keine Beiträge vorhanden. Mach den Anfang!</p>
                        ) : (
                            topic.artifacts.map((artifact: any) => (
                                <Card key={artifact.id} className="p-6 rounded-2xl border-none bg-white shadow-sm">
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-lg hover:underline"><a href={artifact.url} target="_blank" rel="noopener noreferrer">{artifact.title || artifact.url}</a></h4>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {artifact.tags.map((tag: any) => (
                                                    <span key={tag.id} className="px-2 py-0.5 bg-gray-100 rounded-md text-xs text-gray-600">#{tag.label}</span>
                                                ))}
                                            </div>
                                            <div className="mt-4 space-y-2">
                                                {artifact.takeaways.map((t: any) => (
                                                    <div key={t.id} className="flex gap-2 items-start text-sm text-gray-700">
                                                        <span className="text-yellow-500 font-bold">•</span>
                                                        {t.content}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
