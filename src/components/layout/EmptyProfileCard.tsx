"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

interface EmptyProfileCardProps {
    messageCount: number;
    messagesUntilNextUpdate: number;
    avatarGradient?: string;
    isInChatSidebar?: boolean;
}

export function EmptyProfileCard({ messageCount, messagesUntilNextUpdate, avatarGradient, isInChatSidebar = false }: EmptyProfileCardProps) {
    const progress = Math.min(messageCount, 6);
    const progressPercent = (progress / 6) * 100;

    return (
        <Card className={`backdrop-blur-sm border rounded-xl shadow-md overflow-hidden p-0 ${isInChatSidebar ? 'bg-[#F8CD32] border-[#E5BC2E]' : 'bg-white/95 border-zinc-200/50'}`}>
            {/* Header - compact */}
            <div className="bg-zinc-50 px-3 py-2.5 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                    {/* Dynamic gradient avatar */}
                    <div
                        className="h-6 w-6 rounded-full shrink-0"
                        style={{ background: avatarGradient || 'linear-gradient(135deg, #94a3b8, #64748b)' }}
                    />
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-zinc-700 truncate">
                            Deine Perspektive
                        </h3>
                        <p className="text-zinc-400 text-[10px]">
                            Wird gerade erstellt...
                        </p>
                    </div>
                </div>
            </div>

            {/* Content - compact */}
            <div className="p-3 space-y-3">
                {/* Info Text */}
                <div className="flex items-start gap-2 text-xs text-zinc-500 leading-relaxed">
                    <MessageCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <p>
                        Tausche dich über deine Perspektiven und Bedürfnisse zum Thema im Chat aus, dann wird dein Profil hier erstellt.
                    </p>
                </div>

                {/* Progress */}
                <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-zinc-400">
                        <span>Fortschritt</span>
                        <span>{progress}/6 Nachrichten</span>
                    </div>
                    <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-zinc-400 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Placeholder sections - more compact */}
                <div className="space-y-1 pt-0.5">
                    {['Kernwerte', 'Grundhaltung', 'Bedenken'].map((label) => (
                        <div key={label} className="border border-dashed border-zinc-200 rounded-lg px-2 py-1.5">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded bg-zinc-100" />
                                <span className="text-[10px] text-zinc-400">{label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}
