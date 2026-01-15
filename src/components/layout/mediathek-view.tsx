"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Link as LinkIcon, Youtube, FileText, ArrowUpRight, Search, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type MediaType = "all" | "link" | "youtube" | "pdf";

interface Artifact {
    id: string;
    title?: string | null;
    url: string;
    tags: { id: string; label: string }[];
    takeaways: { id: string; content: string }[];
}

interface MediathekViewProps {
    artifacts: Artifact[];
    slug: string;
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
        {/* Strich entfernt wie gewünscht */}
    </div>
);

const VideoCard = ({ artifact, onPlay }: { artifact: Artifact, onPlay: (videoId: string) => void }) => {
    const videoId = getYouTubeId(artifact.url);
    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;

    const handleClick = (e: React.MouseEvent) => {
        if (videoId) {
            e.preventDefault();
            onPlay(videoId);
        }
    }

    return (
        <Card className="group flex flex-col h-full bg-black text-white border-none rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 p-0">
            {/* Thumbnail Area - Force no top spacing */}
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
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-16 h-16 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 group-hover:bg-[#F8CD32] group-hover:border-[#F8CD32] group-hover:text-black transition-all duration-300 shrink-0 shadow-lg">
                            <Play className="w-6 h-6 fill-white text-white group-hover:text-black group-hover:fill-black ml-1" />
                        </div>
                    </div>
                </a>
            </div>

            {/* Content */}
            <div className="p-4 pt-3 flex flex-col flex-1">
                <h4 className="font-bold text-lg leading-snug mb-2 group-hover:text-[#F8CD32] transition-colors line-clamp-2">
                    <a href={artifact.url} onClick={handleClick} target="_blank" rel="noopener noreferrer">
                        {artifact.title || "Ohne Titel"}
                    </a>
                </h4>

                {artifact.takeaways.length > 0 && (
                    <div className="mb-4 space-y-1.5 ">
                        {artifact.takeaways.slice(0, 2).map((t) => (
                            <div key={t.id} className="flex gap-2 items-baseline text-sm text-zinc-400 line-clamp-2">
                                <span className="text-[#F8CD32] shrink-0">•</span>
                                <span className="leading-relaxed">{t.content}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-auto pt-3 flex flex-wrap gap-2">
                    {artifact.tags.map((tag) => (
                        <span key={tag.id} className="px-2 py-0.5 bg-white/10 rounded-md text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                            {tag.label === "Grundlagenforschung" ? "FORSCHUNG" : tag.label}
                        </span>
                    ))}
                </div>
            </div>
        </Card>
    );
};

const CompactCard = ({ artifact, type }: { artifact: Artifact, type: 'pdf' | 'link' }) => {
    const Icon = type === 'pdf' ? FileText : LinkIcon;
    const label = type === 'pdf' ? 'DOKUMENT' : 'LINK';

    return (
        <Card className="group flex flex-col h-full bg-black text-white border-none rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-5">
            <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2 text-[#F8CD32]">
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{label}</span>
                </div>
                <a
                    href={artifact.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-white transition-colors"
                >
                    <ArrowUpRight className="w-4 h-4" />
                </a>
            </div>

            <h4 className="font-bold text-lg leading-snug mb-2 group-hover:text-[#F8CD32] transition-colors">
                <a href={artifact.url} target="_blank" rel="noopener noreferrer">
                    {artifact.title || artifact.url}
                </a>
            </h4>

            <a
                href={artifact.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-500 truncate hover:text-zinc-300 transition-colors mb-4 block"
            >
                {artifact.url}
            </a>

            {artifact.takeaways.length > 0 && (
                <div className="mb-4 space-y-1.5 flex-1">
                    {artifact.takeaways.slice(0, 3).map((t) => (
                        <div key={t.id} className="flex gap-2 items-baseline text-sm text-zinc-300 line-clamp-3">
                            <span className="text-[#F8CD32] shrink-0">•</span>
                            <span className="leading-relaxed">{t.content}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-auto flex flex-wrap gap-2 pt-2 border-t border-white/10">
                {artifact.tags.map((tag) => (
                    <span key={tag.id} className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        #{tag.label === "Grundlagenforschung" ? "FORSCHUNG" : tag.label}
                    </span>
                ))}
            </div>
        </Card>
    );
};

// --- Main Component ---

export function MediathekView({ artifacts, slug }: MediathekViewProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

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
            // Filter by search query
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesTitle = artifact.title?.toLowerCase().includes(query);
                const matchesUrl = artifact.url.toLowerCase().includes(query);
                const matchesTag = artifact.tags.some(t => t.label.toLowerCase().includes(query));
                if (!matchesTitle && !matchesUrl && !matchesTag) return false;
            }

            // Filter by category
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
    }, [artifacts, selectedCategory, searchQuery]);

    if (artifacts.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center p-8 text-center bg-[#F8CD32]">
                <div className="max-w-md space-y-6">
                    <h2 className="text-3xl font-bold text-black">Perspektiven</h2>
                    <p className="text-black/70 text-lg">
                        Noch keine Beiträge vorhanden. Mach den Anfang!
                    </p>
                    <Link href={`/${slug}/contribute`}>
                        <Button className="mt-4 px-6 py-4 text-sm font-bold tracking-wide rounded-full bg-black text-white hover:bg-black/90 shadow-lg uppercase">
                            <Plus className="w-4 h-4 mr-2" />
                            Perspektive hinzufügen
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
                        {/* Close Button - Outside Top Right */}
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

                {/* Search Bar - Big & Rounded */}
                <div className="flex justify-center mb-10">
                    <div className="w-full max-w-2xl relative">
                        <input
                            type="text"
                            placeholder="Suchen..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-4 pl-14 pr-6 rounded-full bg-white border-none shadow-sm text-lg font-medium placeholder:text-black/30 text-black outline-none focus:ring-2 focus:ring-black/10 transition-shadow"
                        />
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-black/40" />
                    </div>
                </div>

                {/* Filter & Action */}
                <div className="mb-10">
                    <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
                        {/* Category Filters */}
                        <div className="space-y-4 flex-1">
                            {categories.length > 0 && (
                                <div className="flex flex-wrap">
                                    {categories.map((category, index) => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(
                                                selectedCategory === category ? null : category
                                            )}
                                            className={cn(
                                                "px-4 py-2 text-sm font-bold tracking-wide transition-all uppercase border-r border-black/10 last:border-0",
                                                selectedCategory === category
                                                    ? "bg-black text-white"
                                                    : "bg-[#E5BC2E] text-black hover:bg-[#D9B229]",
                                                index === 0 && "rounded-l-sm",
                                                index === categories.length - 1 && "rounded-r-sm"
                                            )}
                                        >
                                            {category.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Add New Button */}
                        <Link href={`/${slug}/contribute`} className="shrink-0">
                            <Button className="w-full sm:w-auto px-8 py-6 text-sm font-bold tracking-wide rounded-full bg-black text-white hover:bg-black/90 shadow-xl uppercase transition-transform hover:scale-105 active:scale-95">
                                <Plus className="w-4 h-4 mr-2" />
                                Perspektive hinzufügen
                            </Button>
                        </Link>
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
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* DOCUMENTS SECTION */}
                    {groupedArtifacts.pdfs.length > 0 && (
                        <section>
                            <SectionHeader label="Dokumente" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {groupedArtifacts.pdfs.map(artifact => (
                                    <CompactCard key={artifact.id} artifact={artifact} type="pdf" />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* LINKS SECTION */}
                    {groupedArtifacts.links.length > 0 && (
                        <section>
                            <SectionHeader label="Links" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {groupedArtifacts.links.map(artifact => (
                                    <CompactCard key={artifact.id} artifact={artifact} type="link" />
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
                                Suche & Filter zurücksetzen
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
