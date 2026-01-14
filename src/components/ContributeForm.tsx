'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Plus, X, ArrowLeft, Loader2 } from 'lucide-react'
import { createArtifact } from '@/actions/artifact'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function ContributeForm({ topicId, userId, slug }: { topicId: string, userId: string, slug: string }) {
    const [url, setUrl] = useState('')
    const [takeawayInput, setTakeawayInput] = useState('')
    const [takeaways, setTakeaways] = useState<string[]>([])
    const [tagsInput, setTagsInput] = useState('') // Simple comma separated or tag input
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const addTakeaway = () => {
        if (!takeawayInput.trim()) return
        setTakeaways([...takeaways, takeawayInput.trim()])
        setTakeawayInput('')
    }

    const removeTakeaway = (idx: number) => {
        setTakeaways(takeaways.filter((_, i) => i !== idx))
    }

    const handleSubmit = async () => {
        if (!url) return toast.error("Bitte eine URL eingeben.")
        if (takeaways.length === 0) return toast.error("Bitte mindestens eine Erkenntnis hinzufügen.")

        setIsSubmitting(true)

        // Simple tag splitting
        const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)

        const res = await createArtifact({
            url,
            type: 'LINK', // User could select type later
            takeaways,
            tags,
            topicId,
            userId
        })

        if (res.success) {
            toast.success("Beitrag gespeichert!")
            router.push(`/${slug}`)
            router.refresh()
        } else {
            toast.error("Fehler beim Speichern.")
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4 pl-0 hover:bg-transparent hover:underline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Zurück zur Übersicht
            </Button>

            <h1 className="text-3xl font-bold">Wissen beitragen</h1>

            <Card className="p-8 rounded-[2rem] border-none shadow-sm bg-white space-y-6">

                {/* 1. Link */}
                <div>
                    <label className="block text-sm font-bold mb-2">Link zur Quelle (PDF, Video, Artikel)</label>
                    <Input
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        placeholder="https://..."
                        className="bg-gray-50 border-gray-200"
                    />
                </div>

                {/* 2. Takeaways */}
                <div>
                    <label className="block text-sm font-bold mb-2">Zentrale Erkenntnisse (Key Takeaways)</label>
                    <p className="text-xs text-muted-foreground mb-3">Was ist der Kernpunkt? Bitte extrahiere einzelne Aussagen.</p>

                    <div className="flex gap-2 mb-4">
                        <Textarea
                            value={takeawayInput}
                            onChange={e => setTakeawayInput(e.target.value)}
                            placeholder="Eine wichtige Erkenntnis..."
                            className="bg-gray-50 border-gray-200 min-h-[80px]"
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    addTakeaway()
                                }
                            }}
                        />
                        <Button onClick={addTakeaway} size="icon" className="h-[80px] w-[60px] rounded-xl shrink-0">
                            <Plus />
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {takeaways.map((t, i) => (
                            <div key={i} className="flex items-start justify-between bg-yellow-50 p-3 rounded-xl border border-yellow-100 text-sm">
                                <span>{t}</span>
                                <button onClick={() => removeTakeaway(i)} className="text-yellow-600 hover:text-yellow-800">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Tags */}
                <div>
                    <label className="block text-sm font-bold mb-2">Tags / Kategorien</label>
                    <Input
                        value={tagsInput}
                        onChange={e => setTagsInput(e.target.value)}
                        placeholder="Einstieg, Erfahrung, Vorschlag (mit Komma trennen)"
                        className="bg-gray-50 border-gray-200"
                    />
                </div>

                <div className="pt-4 flex justify-end">
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="rounded-full px-8 py-6 text-lg bg-black text-white hover:bg-gray-800"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Veröffentlichen'}
                    </Button>
                </div>

            </Card>
        </div>
    )
}
