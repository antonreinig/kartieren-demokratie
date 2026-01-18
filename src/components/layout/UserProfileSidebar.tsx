"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { ProfileCard, UserProfileData } from "./ProfileCard";
import { EmptyProfileCard } from "./EmptyProfileCard";

interface UserProfileSidebarProps {
    profile: UserProfileData | null;
    messageCount: number;
    messagesUntilNextUpdate: number;
    isLoading?: boolean;
    isRefreshing?: boolean;
    onRefresh: () => void;
    avatarGradient?: string;
}

export function UserProfileSidebar({
    profile,
    messageCount,
    messagesUntilNextUpdate,
    isLoading = false,
    isRefreshing = false,
    onRefresh,
    avatarGradient
}: UserProfileSidebarProps) {
    const canRefresh = messageCount >= 6;

    return (
        <div className="flex flex-col gap-2">
            {/* Profile Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                </div>
            ) : profile ? (
                <ProfileCard profile={profile} avatarGradient={avatarGradient} isInChatSidebar={true} />
            ) : (
                <EmptyProfileCard
                    messageCount={messageCount}
                    messagesUntilNextUpdate={messagesUntilNextUpdate}
                    avatarGradient={avatarGradient}
                    isInChatSidebar={true}
                />
            )}

            {/* Refresh Button - below the card */}
            <div className="flex flex-col items-center gap-1">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isRefreshing || !canRefresh}
                    className="w-full text-[10px] h-7 bg-white/80 border-zinc-200 hover:bg-zinc-50 text-zinc-600 disabled:opacity-50"
                >
                    {isRefreshing ? (
                        <>
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            Wird aktualisiert...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Profil jetzt aktualisieren
                        </>
                    )}
                </Button>
                <span className="text-[9px] text-zinc-400">
                    Automatische Aktualisierung in {messagesUntilNextUpdate} {messagesUntilNextUpdate === 1 ? 'Nachricht' : 'Nachrichten'}
                </span>
            </div>
        </div>
    );
}
