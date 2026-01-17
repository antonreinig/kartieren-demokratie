"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, AlertTriangle, User, Heart, Shield, Lightbulb, Scale, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Type definitions based on the Briefing structure
interface CoreValue {
    label: string;
    description?: string;
}

interface KeyConcern {
    text: string;
    qualification?: string;
}

interface RedLine {
    text: string;
    scope?: 'personal' | 'ethical' | 'political';
}

interface Counterargument {
    argument: string;
    whyUnderstood: string;
}

interface ConditionForChange {
    conditionText: string;
    type?: 'safeguard' | 'opt-out' | 'pilot' | 'transparency' | 'separation';
}

export interface UserProfileData {
    id: string;
    profileTitle: string;
    subtitle?: string | null;
    roleContext: string;
    overallAttitude: string;
    coreValues: CoreValue[];
    keyConcerns: KeyConcern[];
    redLines: RedLine[];
    counterarguments: Counterargument[];
    conditionsForChange: ConditionForChange[];
    characterization: string;
    messageCount: number;
    createdAt: string;
    updatedAt: string;
}

interface ProfileCardProps {
    profile: UserProfileData;
}

// Collapsible section component
const Section = ({
    title,
    icon: Icon,
    children,
    defaultOpen = false,
    variant = 'default'
}: {
    title: string;
    icon?: React.ElementType;
    children: React.ReactNode;
    defaultOpen?: boolean;
    variant?: 'default' | 'warning';
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={cn(
            "border rounded-lg overflow-hidden",
            variant === 'warning' ? "border-red-200 bg-red-50/50" : "border-zinc-100 bg-white"
        )}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center justify-between p-3 text-left transition-colors",
                    variant === 'warning'
                        ? "hover:bg-red-50"
                        : "hover:bg-zinc-50"
                )}
            >
                <div className="flex items-center gap-2">
                    {Icon && <Icon className={cn(
                        "w-4 h-4",
                        variant === 'warning' ? "text-red-500" : "text-zinc-400"
                    )} />}
                    <span className={cn(
                        "text-sm font-semibold",
                        variant === 'warning' ? "text-red-700" : "text-zinc-700"
                    )}>
                        {title}
                    </span>
                </div>
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                )}
            </button>
            {isOpen && (
                <div className={cn(
                    "p-3 pt-0 text-sm",
                    variant === 'warning' ? "text-red-800" : "text-zinc-600"
                )}>
                    {children}
                </div>
            )}
        </div>
    );
};

// Value chip component
const ValueChip = ({ value }: { value: CoreValue }) => (
    <div
        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F8CD32]/20 border border-[#F8CD32]/30 rounded-full text-sm font-medium text-zinc-800"
        title={value.description}
    >
        <Heart className="w-3 h-3 text-[#D9B229]" />
        {value.label}
    </div>
);

// Concern item component
const ConcernItem = ({ concern }: { concern: KeyConcern }) => (
    <div className="flex gap-2 py-1.5">
        <span className="text-amber-500 shrink-0">•</span>
        <div>
            <span className="text-zinc-700">{concern.text}</span>
            {concern.qualification && (
                <span className="text-zinc-400 text-xs ml-1">({concern.qualification})</span>
            )}
        </div>
    </div>
);

// Red line item component
const RedLineItem = ({ redLine }: { redLine: RedLine }) => (
    <div className="flex gap-2 py-1.5">
        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
        <div>
            <span className="text-red-800 font-medium">{redLine.text}</span>
            {redLine.scope && (
                <span className="text-red-400 text-xs ml-1 uppercase">({redLine.scope})</span>
            )}
        </div>
    </div>
);

// Counterargument item component
const CounterargumentItem = ({ item }: { item: Counterargument }) => (
    <div className="border-l-2 border-zinc-200 pl-3 py-1.5">
        <p className="text-zinc-600 italic">&ldquo;{item.argument}&rdquo;</p>
        <p className="text-zinc-400 text-xs mt-1">→ {item.whyUnderstood}</p>
    </div>
);

// Condition item component
const ConditionItem = ({ condition }: { condition: ConditionForChange }) => {
    const typeColors: Record<string, string> = {
        'safeguard': 'bg-blue-100 text-blue-700',
        'opt-out': 'bg-purple-100 text-purple-700',
        'pilot': 'bg-green-100 text-green-700',
        'transparency': 'bg-amber-100 text-amber-700',
        'separation': 'bg-gray-100 text-gray-700'
    };

    return (
        <div className="flex gap-2 py-1.5">
            <Lightbulb className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-zinc-700">{condition.conditionText}</span>
                {condition.type && (
                    <span className={cn(
                        "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                        typeColors[condition.type] || "bg-gray-100 text-gray-700"
                    )}>
                        {condition.type}
                    </span>
                )}
            </div>
        </div>
    );
};

export function ProfileCard({ profile }: ProfileCardProps) {
    const coreValues = profile.coreValues as CoreValue[];
    const keyConcerns = profile.keyConcerns as KeyConcern[];
    const redLines = profile.redLines as RedLine[];
    const counterarguments = profile.counterarguments as Counterargument[];
    const conditionsForChange = profile.conditionsForChange as ConditionForChange[];

    return (
        <Card className="bg-white border-none rounded-2xl shadow-lg overflow-hidden p-0">
            {/* Header */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-5 text-white">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold leading-tight mb-1">
                            {profile.profileTitle}
                        </h3>
                        {profile.subtitle && (
                            <p className="text-zinc-400 text-sm">
                                {profile.subtitle}
                            </p>
                        )}
                    </div>
                    <div className="shrink-0 p-2 bg-[#F8CD32] rounded-full">
                        <User className="w-5 h-5 text-black" />
                    </div>
                </div>

                {/* Quick summary */}
                <p className="mt-4 text-sm text-zinc-300 leading-relaxed italic border-l-2 border-[#F8CD32] pl-3">
                    {profile.characterization}
                </p>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Core Values - Always visible as chips */}
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                        Kernwerte
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {coreValues.map((value, idx) => (
                            <ValueChip key={idx} value={value} />
                        ))}
                    </div>
                </div>

                {/* Collapsible sections */}
                <div className="space-y-2 pt-2">
                    {/* Context & Role */}
                    <Section title="Kontext & Rolle" icon={User}>
                        <p className="text-zinc-600 leading-relaxed">
                            {profile.roleContext}
                        </p>
                    </Section>

                    {/* Overall Attitude */}
                    <Section title="Grundhaltung" icon={Scale}>
                        <p className="text-zinc-600 leading-relaxed">
                            {profile.overallAttitude}
                        </p>
                    </Section>

                    {/* Key Concerns */}
                    {keyConcerns.length > 0 && (
                        <Section title="Bedenken" icon={Shield}>
                            <div className="space-y-1">
                                {keyConcerns.map((concern, idx) => (
                                    <ConcernItem key={idx} concern={concern} />
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* Red Lines - Warning variant */}
                    {redLines.length > 0 && (
                        <Section title="Rote Linien" icon={AlertTriangle} variant="warning">
                            <div className="space-y-1">
                                {redLines.map((line, idx) => (
                                    <RedLineItem key={idx} redLine={line} />
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* Counterarguments */}
                    {counterarguments.length > 0 && (
                        <Section title="Anerkannte Gegenargumente" icon={MessageCircle}>
                            <div className="space-y-3">
                                {counterarguments.map((item, idx) => (
                                    <CounterargumentItem key={idx} item={item} />
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* Conditions for Change */}
                    {conditionsForChange.length > 0 && (
                        <Section title="Bedingungen für Veränderung" icon={Lightbulb}>
                            <div className="space-y-1">
                                {conditionsForChange.map((condition, idx) => (
                                    <ConditionItem key={idx} condition={condition} />
                                ))}
                            </div>
                        </Section>
                    )}
                </div>
            </div>
        </Card>
    );
}
