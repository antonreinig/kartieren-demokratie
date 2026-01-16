"use client";

import React, { useState, useEffect } from "react";
import { Menu, MessageSquare, MonitorPlay, LogIn, LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getGradientStyle } from "@/lib/avatar-gradient";
import { getGuestToken, resetGuestToken } from "@/lib/guest-token";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { deleteGuestAccount } from "@/actions/guest";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ViewMode = "chat" | "mediathek";

interface TopicAppShellProps {
    topic: {
        title: string;
        description?: string | null;
        scope?: string | null;
        centralQuestion?: string | null;
        context?: string | null;
        endsAt?: Date | null;
        artifacts: any[];
    };
    slug: string;
    guestToken: string;
    chatView: React.ReactNode;
    mediathekView: React.ReactNode;
}

export function TopicAppShell({ topic, slug, guestToken, chatView, mediathekView }: TopicAppShellProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Initialize view from URL or default to 'chat'
    const initialView = searchParams.get('view') === 'mediathek' ? 'mediathek' : 'chat';
    const [activeView, setActiveView] = useState<ViewMode>(initialView);

    // Sync state with URL changes (e.g. back button)
    useEffect(() => {
        const view = searchParams.get('view') === 'mediathek' ? 'mediathek' : 'chat';
        setActiveView(view);
    }, [searchParams]);

    const handleViewChange = (view: ViewMode) => {
        setActiveView(view);
        const params = new URLSearchParams(searchParams.toString());
        if (view === 'mediathek') {
            params.set('view', 'mediathek');
        } else {
            params.delete('view');
        }
        // Use replace to avoid filling history stack with tab switches
        router.replace(`${pathname}?${params.toString()}`);
    };

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
                <header className={cn(
                    "h-16 border-b flex items-center justify-between px-4 md:px-6 shrink-0 relative transition-colors",
                    activeView === "mediathek" ? "bg-[#F8CD32] border-[#E5BC2E]" : "bg-[#EAEAEA] border-zinc-200"
                )}>

                    {/* Left: Brand */}
                    <div className="flex items-center gap-3">
                        <span className="font-medium text-2xl tracking-tight">Kartieren &nbsp;/&nbsp; {slug}</span>
                        {/* Experiment Bubble Removed from here */}
                    </div>

                    {/* Center: Switcher */}
                    <div className={cn(
                        "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center border p-1 rounded-full bg-transparent",
                        activeView === "mediathek" ? "border-black/30" : "border-zinc-300"
                    )}>
                        <button
                            onClick={() => handleViewChange("chat")}
                            className={cn(
                                "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all text-black",
                                activeView === "chat"
                                    ? "bg-[#F8CD32] shadow-sm"
                                    : activeView === "mediathek"
                                        ? "hover:bg-black/10"
                                        : "hover:bg-zinc-100"
                            )}
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span className="hidden sm:inline">Gespräch</span>
                        </button>
                        <button
                            onClick={() => handleViewChange("mediathek")}
                            className={cn(
                                "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all text-black",
                                activeView === "mediathek"
                                    ? "bg-[#EAEAEA] shadow-sm"
                                    : "hover:bg-zinc-100"
                            )}
                        >
                            <MonitorPlay className="w-4 h-4" />
                            <span className="hidden sm:inline">Perspektiven</span>
                        </button>
                    </div>

                    {/* Right: Account Only (no hamburger) */}
                    <div className="flex items-center gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 cursor-pointer hover:bg-black/5 px-2 py-1 rounded-full border border-black transition-colors outline-none text-left">
                                    <div className="text-right hidden md:block">
                                        <p className="text-xs font-medium text-black leading-none">Anonym</p>
                                    </div>
                                    <div
                                        className="h-7 w-7 rounded-full"
                                        style={{ background: getGradientStyle(guestToken) }}
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
                                                // 1. Delete on server
                                                // 1. Delete on server
                                                await deleteGuestAccount(token);

                                                // 2. Clear local storage via utility
                                                resetGuestToken();

                                                // 3. Reload page to generate fresh token/session
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
                <main className="flex-1 overflow-hidden relative bg-[#EAEAEA]">
                    {activeView === "chat" ? chatView : mediathekView}
                </main>
            </div>
        </div>
    );
}
