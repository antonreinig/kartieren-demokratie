import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Youtube, FileText, Link as LinkIcon, ExternalLink } from "lucide-react"

interface PageProps {
    params: Promise<{
        slug: string;
        artifactId: string;
    }>
}

function getYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export default async function PerspectiveDetailPage({ params }: PageProps) {
    const { slug, artifactId } = await params;

    const artifact = await prisma.artifact.findUnique({
        where: { id: artifactId },
        include: {
            takeaways: true,
            tags: true,
            contributor: true
        }
    });

    if (!artifact) return notFound();

    const isVideo = artifact.url.toLowerCase().includes('youtube.com') || artifact.url.toLowerCase().includes('youtu.be');
    const youtubeId = isVideo ? getYouTubeId(artifact.url) : null;

    return (
        <div className="min-h-screen bg-[#F8CD32] p-6 lg:p-12">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Back Button */}
                <Link href={`/${slug}?view=mediathek`}>
                    <Button variant="ghost" className="pl-0 hover:bg-transparent hover:underline text-black font-medium">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Zurück zur Übersicht
                    </Button>
                </Link>

                {/* Main Content Card */}
                <div className="rounded-3xl shadow-2xl bg-white overflow-hidden p-0 flex flex-col leading-none">

                    {/* Media Header */}
                    <div className="w-full bg-black shrink-0">
                        {isVideo && youtubeId ? (
                            <div className="aspect-video w-full">
                                <iframe
                                    src={`https://www.youtube.com/embed/${youtubeId}`}
                                    title={artifact.title || "Video"}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    className="w-full h-full border-none block"
                                />
                            </div>
                        ) : (
                            <div className="aspect-[3/1] w-full bg-zinc-900 flex items-center justify-center p-10">
                                {artifact.type === 'PDF' ? <FileText className="w-16 h-16 text-zinc-700" /> : <LinkIcon className="w-16 h-16 text-zinc-700" />}
                            </div>
                        )}
                    </div>

                    <div className="p-8 lg:p-12 space-y-8">

                        {/* Title & Meta */}
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-3 mb-2">
                                {artifact.tags.map(tag => (
                                    <span key={tag.id} className="px-3 py-1 bg-black text-white rounded-full text-xs font-bold uppercase tracking-wider">
                                        {tag.label === "Grundlagenforschung" ? "Forschung" : tag.label}
                                    </span>
                                ))}
                            </div>

                            <h1 className="text-3xl lg:text-4xl font-bold leading-tight text-black">
                                {artifact.title || "Ohne Titel"}
                            </h1>

                            {artifact.description && (
                                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                                    {artifact.description}
                                </p>
                            )}

                            <a
                                href={artifact.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-black font-bold hover:underline decoration-2 decoration-[#F8CD32]"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" /> Originalquelle öffnen
                            </a>
                        </div>

                        {/* Analysis Dashboard */}
                        {(artifact.evidenceLevel || artifact.mainSource || artifact.contentCategories) && (
                            <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6">KI-Analyse</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    {/* Evidence Level */}
                                    <div>
                                        <h4 className="font-bold text-sm mb-2 text-zinc-900">Evidenzgrad</h4>
                                        <div className="flex items-center gap-2">
                                            {['Niedrig', 'Mittel', 'Hoch'].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${artifact.evidenceLevel === level
                                                            ? 'bg-black text-white border-black'
                                                            : 'bg-white text-zinc-300 border-zinc-200'
                                                        }`}
                                                >
                                                    {level}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Main Source */}
                                    <div>
                                        <h4 className="font-bold text-sm mb-2 text-zinc-900">Hauptquelle</h4>
                                        <div className="text-sm font-medium bg-white border border-zinc-200 px-3 py-2 rounded-lg inline-block text-zinc-700">
                                            {artifact.mainSource || 'Nicht bestimmt'}
                                        </div>
                                    </div>
                                </div>

                                {/* Content Categories */}
                                {(artifact.contentCategories as Record<string, number>) && (
                                    <div>
                                        <h4 className="font-bold text-sm mb-3 text-zinc-900">Inhaltliche Verteilung</h4>
                                        <div className="space-y-2">
                                            {Object.entries(artifact.contentCategories as Record<string, number>)
                                                .sort(([, a], [, b]) => b - a)
                                                .slice(0, 5) // Show top 5
                                                .map(([category, percentage]) => (
                                                    <div key={category} className="flex items-center gap-3 text-xs">
                                                        <div className="w-8 text-right font-bold text-zinc-500">{percentage}%</div>
                                                        <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-[#F8CD32]"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                        <div className="w-1/2 truncate font-medium text-zinc-700" title={category}>
                                                            {category}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="h-px bg-gray-100" />

                        {/* Takeaways */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold uppercase tracking-wide text-gray-400">
                                Zentrale Erkenntnisse
                            </h2>
                            <div className="grid gap-4">
                                {artifact.takeaways.map((takeaway, idx) => (
                                    <div key={takeaway.id} className="flex gap-4 p-4 rounded-xl bg-yellow-50/50 border border-[#F8CD32]/10 transition-colors hover:bg-yellow-50">
                                        <span className="text-[#F8CD32] font-bold text-lg">•</span>
                                        <p className="text-gray-900 text-lg leading-relaxed font-medium">
                                            {takeaway.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
