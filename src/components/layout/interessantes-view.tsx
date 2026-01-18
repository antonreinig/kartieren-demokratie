"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Link as LinkIcon, Youtube, FileText, ArrowUpRight, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";

type MediaType = "all" | "link" | "youtube" | "pdf";

interface Artifact {
    id: string;
    title?: string | null;
    description?: string | null;
    url: string;
    imageUrl?: string | null;
    tags: { id: string; label: string }[];
    takeaways: { id: string; content: string }[];
    evidenceLevel?: string | null;
    mainSource?: string | null;
    contentCategories?: any;
}

interface InteressantesViewProps {
    artifacts: Artifact[];
    slug: string;
    isAdmin?: boolean;
}

// --- Helper Functions ---

function getMediaType(url: string): MediaType {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
        return "youtube";
    }
    if (lowerUrl.endsWith(".pdf")) {
        return "pdf";
    }
    return "link";
}

function getYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// --- Components ---

const SectionHeader = ({ label }: { label: string }) => (
    <div className="flex items-center gap-4 mb-6 mt-8 lg:mt-12 first:mt-0">
        <div className="px-3 py-1 border border-black rounded-sm text-sm font-bold uppercase tracking-widest bg-transparent text-black">
            {label}
        </div>
    </div>
);

const VideoCard = ({ artifact, onPlay, slug, isAdmin, onDelete }: { artifact: Artifact, onPlay: (videoId: string) => void, slug: string, isAdmin?: boolean, onDelete?: (id: string) => void }) => {
    const videoId = getYouTubeId(artifact.url);
    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;

    const handleClick = (e: React.MouseEvent) => {
        if (videoId) {
            e.preventDefault();
            onPlay(videoId);
        }
    }

    return (
        <Card className="group relative flex flex-col h-full bg-black text-white border-none rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 p-0">
            {/* Admin Delete Button */}
            {isAdmin && onDelete && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(artifact.id);
                    }}
                    className="absolute top-2 right-2 z-20 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                    title="Löschen"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
            <div className="relative w-full aspect-video bg-zinc-900">
                <a href={artifact.url} onClick={handleClick} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                    {thumbnailUrl ? (
                        <img
                            src={thumbnailUrl}
                            alt={artifact.title || "Video"}
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 block"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Youtube className="w-12 h-12 text-zinc-700" />
                        </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-16 h-16 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 group-hover:bg-[#F8CD32] group-hover:border-[#F8CD32] group-hover:text-black transition-all duration-300 shrink-0 shadow-lg">
                            <Play className="w-6 h-6 fill-white text-white group-hover:text-black group-hover:fill-black ml-1" />
                        </div>
                    </div>
                </a>
            </div>
            <div className="p-4 pt-3 flex flex-col flex-1">
                <h4 className="font-bold text-lg leading-snug mb-2 group-hover:text-[#F8CD32] transition-colors line-clamp-2">
                    <a href={artifact.url} onClick={handleClick} target="_blank" rel="noopener noreferrer">
                        {artifact.title || "Ohne Titel"}
                    </a>
                </h4>
                {artifact.description && (
                    <p className="text-sm text-zinc-400 mb-3 line-clamp-2 leading-relaxed">
                        {artifact.description}
                    </p>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                    {artifact.tags.map((tag) => (
                        <span key={tag.id} className="px-2 py-0.5 bg-white/10 rounded-md text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                            {tag.label === "Grundlagenforschung" ? "FORSCHUNG" : tag.label}
                        </span>
                    ))}
                </div>
                <div className="mt-auto grid gap-2">
                    <Link href={`/${slug}/perspective/${artifact.id}`} className="block w-full">
                        <Button variant="outline" className="w-full border-white/20 hover:bg-white hover:text-black hover:border-white text-xs uppercase tracking-wider font-bold h-9 bg-transparent text-zinc-300">
                            Mehr erfahren
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    );
};

const CompactCard = ({ artifact, type, slug, isAdmin, onDelete }: { artifact: Artifact, type: 'pdf' | 'link', slug: string, isAdmin?: boolean, onDelete?: (id: string) => void }) => {
    const Icon = type === 'pdf' ? FileText : LinkIcon;
    const label = type === 'pdf' ? 'DOKUMENT' : 'ARTIKEL';
    const hasImage = artifact.imageUrl && !artifact.imageUrl.includes('logo') && !artifact.imageUrl.includes('favicon');

    return (
        <Card className="group relative flex flex-col h-full bg-black text-white border-none rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 p-0">
            {/* Admin Delete Button */}
            {isAdmin && onDelete && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(artifact.id);
                    }}
                    className="absolute top-2 right-2 z-20 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                    title="Löschen"
                >
                    <X className="w-4 h-4" />
                </button>
            )}

            {/* Image Section - matches VideoCard aspect-video */}
            <div className="relative w-full aspect-video bg-zinc-900">
                <a href={artifact.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                    {hasImage ? (
                        <img
                            src={artifact.imageUrl!}
                            alt={artifact.title || 'Preview'}
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 block"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Icon className="w-12 h-12 text-zinc-700" />
                        </div>
                    )}
                    {/* Type Badge Overlay */}
                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md flex items-center gap-1.5">
                        <Icon className="w-3 h-3 text-[#F8CD32]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">{label}</span>
                    </div>
                </a>
            </div>

            {/* Content Section - matches VideoCard padding */}
            <div className="p-4 pt-3 flex flex-col flex-1">
                <h4 className="font-bold text-lg leading-snug mb-2 group-hover:text-[#F8CD32] transition-colors line-clamp-2">
                    <a href={artifact.url} target="_blank" rel="noopener noreferrer">
                        {artifact.title || "Ohne Titel"}
                    </a>
                </h4>
                {artifact.description && (
                    <p className="text-sm text-zinc-400 mb-3 line-clamp-2 leading-relaxed">
                        {artifact.description}
                    </p>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                    {artifact.tags.map((tag) => (
                        <span key={tag.id} className="px-2 py-0.5 bg-white/10 rounded-md text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                            {tag.label === "Grundlagenforschung" ? "FORSCHUNG" : tag.label}
                        </span>
                    ))}
                </div>
                <div className="mt-auto grid gap-2">
                    <Link href={`/${slug}/perspective/${artifact.id}`} className="block w-full">
                        <Button variant="outline" className="w-full border-white/20 hover:bg-white hover:text-black hover:border-white text-xs uppercase tracking-wider font-bold h-9 bg-transparent text-zinc-300">
                            Mehr erfahren
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    );
};

// --- Main Component ---

export function InteressantesView({ artifacts: initialArtifacts, slug, isAdmin = false }: InteressantesViewProps) {
    const [artifacts, setArtifacts] = useState(initialArtifacts);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    // Handle delete artifact
    const handleDelete = async (id: string) => {
        if (!confirm('Wirklich löschen?')) return;

        setIsDeleting(id);
        try {
            const res = await fetch(`/api/artifacts/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setArtifacts(prev => prev.filter(a => a.id !== id));
            } else {
                throw new Error('Delete failed');
            }
        } catch (error) {
            console.error('Error deleting artifact:', error);
            alert('Fehler beim Löschen');
        } finally {
            setIsDeleting(null);
        }
    };

    // Extract unique categories
    const categories = useMemo(() => {
        const categorySet = new Set<string>();
        artifacts.forEach((artifact) => {
            artifact.tags.forEach((tag) => {
                const label = tag.label === "Grundlagenforschung" ? "Forschung" : tag.label;
                categorySet.add(label);
            });
        });
        return Array.from(categorySet).sort();
    }, [artifacts]);

    // Filter and Group artifacts
    const groupedArtifacts = useMemo(() => {
        const filtered = artifacts.filter((artifact) => {
            if (selectedCategory) {
                const hasCategory = artifact.tags.some((tag) => {
                    const label = tag.label === "Grundlagenforschung" ? "Forschung" : tag.label;
                    return label === selectedCategory;
                });
                if (!hasCategory) return false;
            }
            return true;
        });

        const videos = filtered.filter(a => getMediaType(a.url) === 'youtube');
        const pdfs = filtered.filter(a => getMediaType(a.url) === 'pdf');
        const links = filtered.filter(a => getMediaType(a.url) === 'link');

        return { videos, pdfs, links, isEmpty: filtered.length === 0 };
    }, [artifacts, selectedCategory]);

    if (artifacts.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center p-8 text-center bg-[#F8CD32]">
                <div className="max-w-md space-y-6">
                    <h2 className="text-3xl font-bold text-black">Interessantes</h2>
                    <p className="text-black/70 text-lg">
                        Noch keine Beiträge vorhanden. Mach den Anfang!
                    </p>
                    <Link href={`/${slug}/contribute`}>
                        <Button className="mt-4 px-6 py-4 text-sm font-bold tracking-wide rounded-full bg-black text-white hover:bg-black/90 shadow-lg uppercase">
                            <Plus className="w-4 h-4 mr-2" />
                            Quelle hinzufügen
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-y-auto p-6 bg-[#F8CD32] relative">
            {/* YouTube Modal Overlay */}
            {selectedVideoId && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setSelectedVideoId(null)}
                >
                    <div className="relative w-full max-w-4xl" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedVideoId(null)}
                            className="absolute -top-12 right-0 md:-right-12 md:top-0 p-2 text-white/70 hover:text-white transition-colors z-50"
                        >
                            <X className="w-8 h-8" />
                        </button>
                        <div className="w-full aspect-video bg-black rounded-xl shadow-2xl overflow-hidden">
                            <iframe
                                src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1`}
                                title="YouTube video player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="w-full h-full border-none"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto pb-20">
                {/* Input Area + Button */}
                <div className="flex justify-center mb-10">
                    <div className="flex items-center gap-2 w-full max-w-2xl">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="URL zu interessanter Quelle eingeben"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full py-3.5 pl-12 pr-6 rounded-full bg-white border-none shadow-sm text-lg font-medium placeholder:text-black/40 text-black outline-none focus:ring-2 focus:ring-black/10 transition-shadow"
                            />
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
                        </div>
                        {(() => {
                            const isUrl = /^(https?:\/\/[^\s]+)$/.test(searchQuery);
                            return (
                                <Link
                                    href={isUrl
                                        ? `/${slug}/contribute/analyze?url=${encodeURIComponent(searchQuery)}`
                                        : `/${slug}/contribute`
                                    }
                                    className="shrink-0"
                                >
                                    <Button className="h-[54px] w-[54px] p-0 rounded-full bg-black text-white hover:bg-black/90 shadow-xl transition-transform hover:scale-105 active:scale-95 flex items-center justify-center">
                                        <Plus className="w-6 h-6" />
                                    </Button>
                                </Link>
                            );
                        })()}
                    </div>
                </div>

                {/* Filters Row */}
                <div className="mb-10">
                    <div className="flex justify-center">
                        <div className="space-y-4">
                            {categories.length > 0 && (
                                <div className="flex flex-wrap shadow-sm rounded-sm overflow-hidden">
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(
                                                selectedCategory === category ? null : category
                                            )}
                                            className={cn(
                                                "px-5 py-2.5 text-sm font-bold tracking-wide transition-all uppercase border-r border-black/5 last:border-0",
                                                selectedCategory === category
                                                    ? "bg-black text-white"
                                                    : "bg-[#E5BC2E] text-black hover:bg-[#D9B229]"
                                            )}
                                        >
                                            {category.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="space-y-12">
                    {/* VIDEOS SECTION */}
                    {groupedArtifacts.videos.length > 0 && (
                        <section>
                            <SectionHeader label="Videos" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {groupedArtifacts.videos.map(artifact => (
                                    <VideoCard
                                        key={artifact.id}
                                        artifact={artifact}
                                        onPlay={setSelectedVideoId}
                                        slug={slug}
                                        isAdmin={isAdmin}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* DOCUMENTS SECTION */}
                    {groupedArtifacts.pdfs.length > 0 && (
                        <section>
                            <SectionHeader label="Dokumente" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {groupedArtifacts.pdfs.map(artifact => (
                                    <CompactCard key={artifact.id} artifact={artifact} type="pdf" slug={slug} isAdmin={isAdmin} onDelete={handleDelete} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* LINKS SECTION */}
                    {groupedArtifacts.links.length > 0 && (
                        <section>
                            <SectionHeader label="Links" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {groupedArtifacts.links.map(artifact => (
                                    <CompactCard key={artifact.id} artifact={artifact} type="link" slug={slug} isAdmin={isAdmin} onDelete={handleDelete} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Empty State */}
                    {groupedArtifacts.isEmpty && artifacts.length > 0 && (
                        <div className="text-center py-20 bg-black/5 rounded-3xl border border-black/5">
                            <p className="text-black/60 font-medium text-lg">
                                Keine Beiträge gefunden für diese Auswahl.
                            </p>
                            <button
                                onClick={() => {
                                    setSelectedCategory(null);
                                    setSearchQuery("");
                                }}
                                className="mt-4 text-black font-bold underline decoration-2 hover:decoration-[#F8CD32] transition-all"
                            >
                                Filter zurücksetzen
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
