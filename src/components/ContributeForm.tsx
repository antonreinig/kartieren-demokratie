'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Plus, X, ArrowLeft, Loader2, Link as LinkIcon, AlertCircle } from 'lucide-react'
import { createArtifact } from '@/actions/artifact'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function ContributeForm({ topicId, userId, slug }: { topicId: string, userId: string, slug: string }) {
    const [url, setUrl] = useState('')
    const [title, setTitle] = useState('')
    const [takeawayInput, setTakeawayInput] = useState('')
    const [takeaways, setTakeaways] = useState<string[]>([])
    // Single select for category to match the requested behavior
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const AVAILABLE_CATEGORIES = ['Forschung', 'Erfahrung', 'Vorschlag', 'Wissen']

    const addTakeaway = () => {
        if (!takeawayInput.trim()) return
        setTakeaways([...takeaways, takeawayInput.trim()])
        setTakeawayInput('')
    }

    const removeTakeaway = (idx: number) => {
        setTakeaways(takeaways.filter((_, i) => i !== idx))
    }

    const getMediaType = (url: string): 'VIDEO' | 'PDF' | 'LINK' => {
        const lower = url.toLowerCase()
        if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'VIDEO'
        if (lower.endsWith('.pdf')) return 'PDF'
        return 'LINK'
    }

    const handleSubmit = async () => {
        if (!url) return toast.error("Bitte eine URL eingeben.")
        if (!title) return toast.error("Bitte einen Titel eingeben.")
        if (takeaways.length === 0) return toast.error("Bitte mindestens eine Erkenntnis hinzufügen.")
        if (!selectedCategory) return toast.error("Bitte eine Kategorie wählen.")

        setIsSubmitting(true)

        const res = await createArtifact({
            url,
            title,
            type: getMediaType(url),
            takeaways,
            tags: [selectedCategory], // Send as array for Prisma
            topicId,
            userId
        })

        if (res.success) {
            toast.success("Perspektive erfolgreich hinzugefügt!")
            router.push(`/${slug}?view=mediathek`)
            router.refresh()
        } else {
            toast.error("Fehler beim Speichern.")
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-2 pl-0 hover:bg-transparent hover:underline text-black font-medium"
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Zurück zur Übersicht
            </Button>

            <div className="space-y-1">
                <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-sm">Perspektive hinzufügen</h1>
                <p className="text-black/70 font-medium">Ergänze die Wissensbasis mit neuen Inhalten.</p>
            </div>

            <Card className="p-8 rounded-3xl border-none shadow-xl bg-white space-y-8">

                {/* 1. Link & Titel */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-zinc-500">Quelle</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                placeholder="https://..."
                                className="pl-9 bg-gray-50 border-gray-200 focus:ring-black focus:border-black rounded-xl py-6"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-zinc-500">Titel</label>
                        <Input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Titel des Beitrags"
                            className="bg-gray-50 border-gray-200 focus:ring-black focus:border-black rounded-xl py-6 font-medium"
                        />
                    </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* 2. Takeaways */}
                <div>
                    <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-zinc-500">
                        Zentrale Erkenntnisse <span className="text-gray-300 font-normal normal-case">(Min. 1)</span>
                    </label>
                    <p className="text-sm text-gray-500 mb-4">
                        Was ist der Kernpunkt? Bitte extrahiere die wichtigste Aussage kurz und knapp.
                    </p>

                    <div className="flex gap-2 mb-4">
                        <Textarea
                            value={takeawayInput}
                            onChange={e => setTakeawayInput(e.target.value)}
                            placeholder="Eine wichtige Erkenntnis..."
                            className="bg-gray-50 border-gray-200 min-h-[80px] rounded-xl focus:ring-black focus:border-black"
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    addTakeaway()
                                }
                            }}
                        />
                        <Button
                            onClick={addTakeaway}
                            disabled={!takeawayInput.trim()}
                            className="h-[80px] w-[60px] rounded-xl shrink-0 bg-black hover:bg-gray-800"
                        >
                            <Plus className="h-6 w-6" />
                        </Button>
                    </div>

                    {takeaways.length > 0 ? (
                        <div className="space-y-2">
                            {takeaways.map((t, i) => (
                                <div key={i} className="flex items-start gap-3 bg-yellow-50 p-4 rounded-xl border border-[#F8CD32]/20 text-sm animate-in fade-in slide-in-from-bottom-2">
                                    <span className="text-[#F8CD32] font-bold mt-0.5">•</span>
                                    <span className="flex-1 font-medium text-gray-800">{t}</span>
                                    <button onClick={() => removeTakeaway(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                            <AlertCircle className="w-4 h-4" />
                            <span>Bitte füge mindestens eine Erkenntnis hinzu.</span>
                        </div>
                    )}
                </div>

                <div className="h-px bg-gray-100" />

                {/* 3. Tags (Single Select) */}
                <div>
                    <label className="block text-sm font-bold mb-3 uppercase tracking-wide text-zinc-500">Kategorie wählen</label>
                    <div className="flex flex-wrap gap-2">
                        {AVAILABLE_CATEGORIES.map(category => {
                            const isSelected = selectedCategory === category
                            return (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={cn(
                                        "px-6 py-3 text-sm font-bold tracking-wide transition-all uppercase rounded-sm border",
                                        isSelected
                                            ? "bg-black text-white border-black shadow-lg scale-105"
                                            : "bg-[#F8CD32] text-black border-transparent hover:bg-[#E5BC2E] hover:scale-105"
                                    )}
                                >
                                    {category}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="pt-6 flex justify-end">
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="rounded-full px-10 py-7 text-lg font-bold bg-black text-white hover:bg-black/80 hover:scale-105 transition-all shadow-xl uppercase"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                        {isSubmitting ? 'Speichert...' : 'Perspektive hinzufügen'}
                    </Button>
                </div>

            </Card>
        </div>
    )
}
