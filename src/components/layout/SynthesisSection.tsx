"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Check, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface Commonality {
    text: string;
    profileIds: string[];
}

interface Cluster {
    position: number;
    profileIds: string[];
    summary: string;
}

interface TensionField {
    leftLabel: string;
    rightLabel: string;
    clusters: Cluster[];
}

interface SynthesisData {
    commonalities: Commonality[];
    tensionFields: TensionField[];
    profileCount: number;
}

interface SynthesisSectionProps {
    synthesis: SynthesisData | null;
    isLoading: boolean;
    onClusterClick?: (profileIds: string[]) => void;
    profileCount: number;
}

// Tension Bar Component
function TensionBar({
    field,
    onClusterClick
}: {
    field: TensionField;
    onClusterClick?: (profileIds: string[]) => void;
}) {
    const [hoveredCluster, setHoveredCluster] = useState<Cluster | null>(null);
    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

    // Sort clusters by position
    const sortedClusters = [...field.clusters].sort((a, b) => a.position - b.position);

    // Calculate total profiles for proportional width
    const totalProfiles = sortedClusters.reduce((sum, c) => sum + c.profileIds.length, 0);

    // Generate monochrome colors based on position (lighter = left, darker = right)
    const getClusterColor = (position: number) => {
        // Single-color scheme: zinc with varying lightness
        // Left (0) = lighter zinc-300, Right (1) = darker zinc-700
        const lightness = 75 - (position * 40); // 75% (light) to 35% (dark)
        return `hsl(240, 5%, ${lightness}%)`;
    };

    // Track mouse position
    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    return (
        <div className="space-y-2">
            {/* Labels */}
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-500">
                <span>{field.leftLabel}</span>
                <span>{field.rightLabel}</span>
            </div>

            {/* Bar */}
            <div
                className="relative h-10 bg-zinc-100 rounded-lg overflow-hidden flex"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => {
                    setHoveredCluster(null);
                    setMousePos(null);
                }}
            >
                {sortedClusters.map((cluster, idx) => {
                    const width = (cluster.profileIds.length / totalProfiles) * 100;
                    const isHovered = hoveredCluster === cluster;

                    return (
                        <div
                            key={idx}
                            className={cn(
                                "h-full transition-all duration-200 cursor-pointer relative",
                                isHovered && "scale-y-110 z-10 shadow-lg"
                            )}
                            style={{
                                width: `${width}%`,
                                backgroundColor: getClusterColor(cluster.position),
                            }}
                            onMouseEnter={() => setHoveredCluster(cluster)}
                            onClick={() => onClusterClick?.(cluster.profileIds)}
                        >
                            {/* Cluster count badge */}
                            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                                {cluster.profileIds.length}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Fixed tooltip that follows mouse */}
            {hoveredCluster && mousePos && (
                <div
                    className="fixed z-50 bg-zinc-900 text-white text-xs p-3 rounded-lg shadow-xl pointer-events-none max-w-xs"
                    style={{
                        left: mousePos.x + 12,
                        top: mousePos.y + 12,
                    }}
                >
                    <p className="font-medium mb-1">
                        {hoveredCluster.profileIds.length} Perspektive{hoveredCluster.profileIds.length !== 1 ? 'n' : ''}
                    </p>
                    <p className="text-zinc-300">{hoveredCluster.summary}</p>
                    <p className="text-zinc-500 mt-1 text-[10px]">Klicken zum Filtern</p>
                </div>
            )}
        </div>
    );
}

// Main Synthesis Section Component
export function SynthesisSection({
    synthesis,
    isLoading,
    onClusterClick,
    profileCount
}: SynthesisSectionProps) {
    // Not enough profiles
    if (profileCount < 2) {
        return (
            <div className="mb-12 p-8 bg-white/50 rounded-2xl border border-zinc-200/50 text-center">
                <p className="text-zinc-500 text-lg">
                    Mindestens 2 Perspektiven nötig für die Synthese.
                </p>
                <p className="text-zinc-400 text-sm mt-1">
                    Aktuell: {profileCount} Perspektive{profileCount !== 1 ? 'n' : ''}
                </p>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="mb-12 p-8 bg-white/50 rounded-2xl border border-zinc-200/50 text-center">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-zinc-200 rounded w-2/3 mx-auto" />
                    <div className="h-4 bg-zinc-200 rounded w-1/2 mx-auto" />
                    <div className="grid grid-cols-2 gap-6 mt-8">
                        <div className="h-40 bg-zinc-200 rounded-xl" />
                        <div className="h-40 bg-zinc-200 rounded-xl" />
                    </div>
                </div>
                <p className="text-zinc-400 text-sm mt-4">Synthese wird generiert...</p>
            </div>
        );
    }

    // No synthesis yet
    if (!synthesis) {
        return null;
    }

    return (
        <div className="mb-12">

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Commonalities */}
                <Card className="p-6 bg-white/95 border-zinc-200/50 rounded-xl shadow-sm">
                    <h3 className="text-lg font-bold text-zinc-800 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-600" />
                        </span>
                        Gemeinsamkeiten
                    </h3>

                    <ul className="space-y-3">
                        {synthesis.commonalities.map((item, idx) => (
                            <li key={idx} className="flex gap-3 items-start">
                                <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                <span className="text-zinc-700 text-sm leading-relaxed">
                                    {item.text}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {synthesis.commonalities.length === 0 && (
                        <p className="text-zinc-400 text-sm italic">
                            Keine gemeinsamen Themen identifiziert.
                        </p>
                    )}
                </Card>

                {/* Right: Tension Fields */}
                <Card className="p-6 bg-white/95 border-zinc-200/50 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                <HelpCircle className="w-4 h-4 text-red-600" />
                            </span>
                            Spannungsfelder
                        </h3>
                        <span className="text-xs text-zinc-400">Klicken zum Filtern</span>
                    </div>

                    <div className="space-y-6">
                        {synthesis.tensionFields.map((field, idx) => (
                            <TensionBar
                                key={idx}
                                field={field}
                                onClusterClick={onClusterClick}
                            />
                        ))}
                    </div>

                    {synthesis.tensionFields.length === 0 && (
                        <p className="text-zinc-400 text-sm italic">
                            Keine Spannungsfelder identifiziert.
                        </p>
                    )}
                </Card>
            </div>
        </div>
    );
}
