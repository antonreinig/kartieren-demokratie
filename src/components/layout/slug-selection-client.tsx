"use client";

import React, { useState } from "react";
import { LogIn, Trash2, ArrowRight, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getGradientStyle } from "@/lib/avatar-gradient";
import { getOrCreateGuestToken, getGuestToken, resetGuestToken } from "@/lib/guest-token";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface TopicSummary {
    slug: string;
    title: string;
    description?: string;
    _count?: {
        artifacts: number;
    }
}

interface SlugSelectionClientProps {
    topics: TopicSummary[];
    prefilledSlug?: string;
}

export function SlugSelectionClient({ topics, prefilledSlug = "" }: SlugSelectionClientProps) {
    const [guestToken, setGuestToken] = useState<string | null>(null);
    const [newSlug, setNewSlug] = useState(prefilledSlug);
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();

    React.useEffect(() => {
        const token = getOrCreateGuestToken();
        setGuestToken(token);
    }, []);

    const handleCreate = async () => {
        if (!newSlug.trim()) return;

        const slug = newSlug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");

        // Basic validation
        if (slug.length < 3) {
            toast.error("Slug must be at least 3 characters long.");
            return;
        }

        setIsCreating(true);

        // Redirect to create page with prefilled slug
        // Actually the user wants to "create directly" or invoke the creation flow.
        // Assuming /create handles the flow, let's push there.
        // Or if we want to be fancy, we could call the server action directly, but the create flow might have a wizad.
        // Let's redirect to `/create?slug=...` if existing create flow supports it, or just to the new slug which will trigger 404 again?
        // No, we want to START the creation.
        // The previous `page.tsx` linked to `/create`.
        // Let's use `/create` but pass the slug.

        router.push(`/create?slug=${slug}`);
    }

    return (
        <div className="flex h-screen w-full bg-[#EAEAEA] overflow-hidden relative">
            {/* Left Sidebar - Yellow */}
            <aside className="w-16 md:w-20 bg-[#F8CD32] flex flex-col items-center py-6 gap-4 z-20 shadow-sm shrink-0 relative">
                {/* Top: Experiment Bubble (Rotated) */}
                <div className="mt-12 -rotate-90 origin-center whitespace-nowrap">
                    <div className="px-3 py-1 rounded-full border border-black text-xs font-medium text-black bg-transparent uppercase tracking-wide">
                        Experiment 1.001
                    </div>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Bottom: Text (Rotated) */}
                <div className="mt-auto mb-28 -rotate-90 whitespace-nowrap pointer-events-none">
                    <span className="text-2xl leading-none text-black font-gochi-hand text-left block">
                        Werkstatt der <br /> verbundenen Demokratie
                    </span>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col h-full min-w-0 bg-white">

                {/* Top Header */}
                <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 shrink-0 bg-[#EAEAEA] border-zinc-200">

                    {/* Left: Brand */}
                    <div className="flex items-center gap-3">
                        <span className="font-medium text-2xl tracking-tight">Kartieren</span>
                    </div>

                    {/* Right: Account Only */}
                    <div className="flex items-center gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 cursor-pointer hover:bg-black/5 px-2 py-1 rounded-full border border-black transition-colors outline-none text-left">
                                    <div className="text-right hidden md:block">
                                        <p className="text-xs font-medium text-black leading-none">Anonym</p>
                                    </div>
                                    <div
                                        className="h-7 w-7 rounded-full"
                                        style={{ background: getGradientStyle(guestToken || "loading") }}
                                    />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Mein Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <LogIn className="mr-2 h-4 w-4" />
                                    <span>Anmelden (Magic Link)</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                    onClick={async () => {
                                        if (confirm("Möchtest du wirklich deinen Account und alle Daten löschen? Dies kann nicht rückgängig gemacht werden.")) {
                                            const token = getGuestToken();
                                            if (token) {
                                                const { deleteGuestAccount } = await import("@/actions/guest");
                                                await deleteGuestAccount(token);
                                                resetGuestToken();
                                                window.location.reload();
                                            }
                                        }
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Account löschen</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Viewport */}
                <main className="flex-1 overflow-y-auto bg-[#EAEAEA] p-6 md:p-12 font-mono uppercase">
                    <div className="max-w-4xl mx-auto space-y-12">

                        {/* Missing Slug Section - Only if prefilledSlug is present */}
                        {prefilledSlug && (
                            <div className="space-y-4">
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 text-zinc-500">
                                    <span className="text-lg md:text-xl">
                                        /{newSlug} IST NOCH NICHT VERGEBEN
                                    </span>
                                    <Button
                                        size="sm"
                                        className="h-auto py-1 px-4 text-sm font-bold bg-[#F8CD32] hover:bg-[#E5BC2E] text-black rounded-full uppercase"
                                        onClick={handleCreate}
                                        disabled={isCreating}
                                    >
                                        {isCreating ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Plus className="mr-2 h-4 w-4" />}
                                        /{newSlug} ERSTELLEN
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Available Topics Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-black pb-2">
                                <h2 className="text-lg font-bold tracking-tight text-black">VERFÜGBARE THEMEN</h2>
                                <span className="text-sm text-zinc-500">{topics.length}</span>
                            </div>

                            <div className="flex flex-col gap-0 border-t border-zinc-300">
                                {topics.map((topic) => (
                                    <Link key={topic.slug} href={`/${topic.slug}`} className="group block">
                                        <div className="flex items-center justify-between py-3 border-b border-zinc-300 hover:bg-white/50 transition-colors px-2">
                                            <div className="flex items-center gap-4">
                                                <span className="text-lg text-black group-hover:text-[#E5BC2E] transition-colors">
                                                    /{topic.slug}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-zinc-500">
                                                <span>{topic._count?.artifacts || 0} BEITRÄGE</span>
                                                <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-[#F8CD32] transition-colors opacity-0 group-hover:opacity-100" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}

                                {topics.length === 0 && (
                                    <div className="py-8 text-center text-zinc-400 italic">
                                        KEINE THEMEN VORHANDEN
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Homepage Create Button - Only if NO prefilledSlug */}
                        {!prefilledSlug && (
                            <div className="pt-8">
                                <Link href="/create">
                                    <Button
                                        variant="outline"
                                        className="rounded-full px-6 py-2 border-black text-black hover:bg-black hover:text-white uppercase font-bold tracking-wide"
                                    >
                                        NEUES THEMA ERSTELLEN
                                    </Button>
                                </Link>
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
}
