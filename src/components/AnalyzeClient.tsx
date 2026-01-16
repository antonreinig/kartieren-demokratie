'use client'

import React, { useEffect, useState } from 'react'
import ContributeForm, { ContributeInitialData } from "@/components/ContributeForm"
import { Loader2, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

// ... (imports)

// Import this type from the form or re-define if not exported


interface AnalyzeClientProps {
    url: string;
    topicId: string;
    userId: string;
    slug: string;
}

type Step = 'fetch' | 'analyze' | 'generate' | 'done';

export default function AnalyzeClient({ url, topicId, userId, slug }: AnalyzeClientProps) {
    const [status, setStatus] = useState<Step>('fetch');
    const [data, setData] = useState<ContributeInitialData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const hasFetched = React.useRef(false);

    useEffect(() => {
        if (!url || hasFetched.current) return;
        hasFetched.current = true;

        const analyze = async () => {
            try {
                // ... same logic
                setStatus('fetch');
                // Artificial delay for better UX (so user sees the steps)
                await new Promise(r => setTimeout(r, 800));

                setStatus('analyze');
                const res = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url })
                });

                if (!res.ok) {
                    throw new Error("Fehler bei der Analyse");
                }

                setStatus('generate');
                await new Promise(r => setTimeout(r, 800));

                const json = await res.json();
                if (json.success) {
                    setData(json.data);
                    setStatus('done');
                } else {
                    throw new Error(json.error || "Unbekannter Fehler");
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Es ist ein Fehler aufgetreten.");
            }
        };

        analyze();
    }, [url]);

    if (error) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Card className="max-w-md p-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold">Das hat leider nicht geklappt</h2>
                    <p className="text-gray-500">{error}</p>
                    <div className="flex flex-col gap-2 pt-4">
                        <div className="flex gap-2 justify-center">
                            <Button variant="outline" onClick={() => window.location.reload()}>
                                Erneut versuchen
                            </Button>
                            <Button onClick={() => router.push(`/${slug}/contribute`)}>
                                Manuell eingeben
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        )
    }

    if (status !== 'done' || !data) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="max-w-md w-full space-y-8">
                    <div className="space-y-2 text-center">
                        <h2 className="text-3xl font-bold text-black drop-shadow-sm">Analysiere Quelle...</h2>
                        <p className="text-black/60 text-lg font-medium truncate px-4">{url}</p>
                    </div>

                    <Card className="p-8 space-y-6 shadow-xl border-none bg-white/95 backdrop-blur-sm rounded-3xl">
                        <LoadingStep
                            label="Link abrufen"
                            isActive={status === 'fetch'}
                            isCompleted={status !== 'fetch'}
                        />
                        <LoadingStep
                            label="Inhalte extrahieren"
                            isActive={status === 'analyze'}
                            isCompleted={status === 'generate' || status === 'done'}
                        />
                        <LoadingStep
                            label="Zusammenfassung generieren"
                            isActive={status === 'generate'}
                            isCompleted={status === 'done'}
                        />
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <ContributeForm
            topicId={topicId}
            userId={userId}
            slug={slug}
            initialData={data}
        />
    );
}

function LoadingStep({ label, isActive, isCompleted }: { label: string, isActive: boolean, isCompleted: boolean }) {
    return (
        <div className={`flex items-center gap-4 transition-opacity duration-500 ${isActive || isCompleted ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500 ${isCompleted ? 'bg-green-500 text-white' :
                isActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                {isCompleted ? <CheckCircle2 className="w-6 h-6" /> :
                    isActive ? <Loader2 className="w-5 h-5 animate-spin" /> :
                        <div className="w-3 h-3 bg-current rounded-full" />}
            </div>
            <span className={`font-bold text-lg ${isActive ? 'text-black' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                {label}
            </span>
        </div>
    )
}
