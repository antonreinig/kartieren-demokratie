"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ProfileCard, UserProfileData } from "@/components/layout/ProfileCard";
import { SynthesisSection } from "@/components/layout/SynthesisSection";
import { getGradientStyle } from "@/lib/avatar-gradient";

interface PerspektivenViewProps {
    profiles: UserProfileData[];
    currentUserProfileId?: string;
    currentUserAvatarGradient?: string;
    topicId: string;
}

interface SynthesisData {
    commonalities: { text: string; profileIds: string[] }[];
    tensionFields: {
        leftLabel: string;
        rightLabel: string;
        clusters: { position: number; profileIds: string[]; summary: string }[];
    }[];
    profileCount: number;
}

export function PerspektivenView({
    profiles = [],
    currentUserProfileId,
    currentUserAvatarGradient,
    topicId
}: PerspektivenViewProps) {
    const [synthesis, setSynthesis] = useState<SynthesisData | null>(null);
    const [isLoadingSynthesis, setIsLoadingSynthesis] = useState(false);
    const [filteredProfileIds, setFilteredProfileIds] = useState<string[] | null>(null);

    // Fetch or generate synthesis
    useEffect(() => {
        if (profiles.length < 2) return;

        const fetchSynthesis = async () => {
            try {
                // Check if synthesis exists
                const checkRes = await fetch(`/api/synthesis?topicId=${topicId}`);
                const checkData = await checkRes.json();

                if (checkData.synthesis && !checkData.isStale) {
                    setSynthesis(checkData.synthesis);
                    return;
                }

                // Generate new synthesis
                setIsLoadingSynthesis(true);
                const genRes = await fetch("/api/synthesis", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ topicId }),
                });
                const genData = await genRes.json();

                if (genData.synthesis) {
                    setSynthesis(genData.synthesis);
                }
            } catch (error) {
                console.error("Failed to fetch synthesis:", error);
            } finally {
                setIsLoadingSynthesis(false);
            }
        };

        fetchSynthesis();
    }, [topicId, profiles.length]);

    // Handle cluster click - filter profiles
    const handleClusterClick = useCallback((profileIds: string[]) => {
        setFilteredProfileIds(prev => {
            // Toggle filter if same cluster clicked
            if (prev && prev.length === profileIds.length &&
                prev.every(id => profileIds.includes(id))) {
                return null;
            }
            return profileIds;
        });
    }, []);

    // Clear filter
    const clearFilter = useCallback(() => {
        setFilteredProfileIds(null);
    }, []);

    // Filtered and sorted profiles
    const displayProfiles = useMemo(() => {
        let filtered = filteredProfileIds
            ? profiles.filter(p => filteredProfileIds.includes(p.id))
            : profiles;

        // Sort: user's own profile first
        return [...filtered].sort((a, b) => {
            if (a.id === currentUserProfileId) return -1;
            if (b.id === currentUserProfileId) return 1;
            return 0;
        });
    }, [profiles, filteredProfileIds, currentUserProfileId]);

    if (profiles.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center p-8 text-center bg-[#EAEAEA]">
                <div className="max-w-md space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-800">Perspektiven</h2>
                    <p className="text-zinc-600">
                        Noch keine Perspektiven vorhanden. Führe ein Gespräch, um deine Perspektive zu erstellen!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-y-auto p-6 bg-[#EAEAEA]">
            <div className="max-w-6xl mx-auto pb-20">
                {/* Synthesis Section */}
                <SynthesisSection
                    synthesis={synthesis}
                    isLoading={isLoadingSynthesis}
                    onClusterClick={handleClusterClick}
                    profileCount={profiles.length}
                />

                {/* Filter indicator */}
                {filteredProfileIds && (
                    <div className="mb-6 flex items-center gap-4 p-4 bg-white/80 rounded-xl border border-zinc-200">
                        <span className="text-sm text-zinc-600">
                            Zeige {displayProfiles.length} von {profiles.length} Perspektiven
                        </span>
                        <button
                            onClick={clearFilter}
                            className="text-sm font-medium text-zinc-800 hover:text-zinc-900 underline"
                        >
                            Filter zurücksetzen
                        </button>
                    </div>
                )}

                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-zinc-800">Alle Perspektiven</h2>
                    <p className="text-zinc-600 mt-1">
                        {displayProfiles.length} Perspektive{displayProfiles.length !== 1 ? 'n' : ''}
                    </p>
                </div>

                {/* Profile Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayProfiles.map(profile => {
                        const isOwn = profile.id === currentUserProfileId;
                        return (
                            <ProfileCard
                                key={profile.id}
                                profile={profile}
                                avatarGradient={isOwn ? currentUserAvatarGradient : getGradientStyle(profile.id)}
                                isOwnProfile={isOwn}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
