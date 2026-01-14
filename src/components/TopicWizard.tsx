'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { checkSlugAvailability, createTopic } from '@/actions/topic'
import { Loader2, Check, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function TopicWizard() {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        slug: '',
        duration: '1week',
        title: '',
        scope: '',
        description: '',
        ownerName: ''
    })

    const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const router = useRouter()

    const handleSlugChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
        setFormData(prev => ({ ...prev, slug: val }))

        if (val.length < 3) {
            setSlugStatus('idle')
            return
        }

        setSlugStatus('checking')
        try {
            const available = await checkSlugAvailability(val)
            setSlugStatus(available ? 'available' : 'taken')
        } catch (error) {
            console.error("Failed to check slug:", error)
            setSlugStatus('taken') // Fail safe
            toast.error("Verbindungsfehler beim Prüfen des Slugs.")
        }
    }

    const nextStep = () => setStep(s => s + 1)
    const prevStep = () => setStep(s => s - 1)

    const handleSubmit = async () => {
        setIsSubmitting(true)
        const form = new FormData()
        Object.entries(formData).forEach(([k, v]) => form.append(k, v))

        const res = await createTopic(form)

        if (res?.success && res.redirectUrl) {
            router.push(res.redirectUrl)
        } else {
            toast.error("Oops, something went wrong.")
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            {/* Progress / Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Neues Thema starten</h1>
                <div className="flex gap-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full bg-primary transition-all duration-500 ease-out`} style={{ width: `${(step / 4) * 100}%` }} />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="p-8 border-none shadow-xl rounded-3xl bg-white">
                        {step === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-semibold mb-2">Wie soll der Link heißen?</h2>
                                    <p className="text-muted-foreground mb-4">Wähle einen kurzen, prägnanten Begriff (Slug) für die URL.</p>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-400">kartieren.demokratie.dev/</span>
                                        <Input
                                            value={formData.slug}
                                            onChange={handleSlugChange}
                                            className="pl-[198px] font-mono"
                                            placeholder="mein-thema"
                                            autoFocus
                                        />
                                        <div className="absolute right-3 top-2.5">
                                            {slugStatus === 'checking' && <Loader2 className="animate-spin w-5 h-5 text-gray-400" />}
                                            {slugStatus === 'available' && <Check className="w-5 h-5 text-green-500" />}
                                            {slugStatus === 'taken' && <AlertCircle className="w-5 h-5 text-red-500" />}
                                        </div>
                                    </div>
                                    {slugStatus === 'taken' && <p className="text-red-500 text-sm mt-1">Dieser Slug ist leider schon vergeben.</p>}
                                    {slugStatus === 'available' && <p className="text-green-600 text-sm mt-1">Perfekt! Dieser Link ist noch frei.</p>}
                                </div>
                                <div className="flex justify-end pt-4">
                                    <Button onClick={nextStep} disabled={slugStatus !== 'available'} className="rounded-full px-8 py-6 text-lg">
                                        Weiter <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-semibold mb-2">Wie lange läuft die Aushandlung?</h2>
                                    <p className="text-muted-foreground mb-4">Nach Ablauf wird das Ergebnis ausgewertet.</p>

                                    <div className="grid grid-cols-2 gap-4">
                                        {['3days', '1week', '2weeks', '1month'].map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => setFormData(p => ({ ...p, duration: opt }))}
                                                className={`p-4 rounded-xl border-2 text-left transition-all ${formData.duration === opt
                                                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                                    : 'border-gray-100 hover:border-gray-300'
                                                    }`}
                                            >
                                                <span className="block font-semibold capitalize">
                                                    {opt === '3days' && '3 Tage'}
                                                    {opt === '1week' && '1 Woche'}
                                                    {opt === '2weeks' && '2 Wochen'}
                                                    {opt === '1month' && '1 Monat'}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-between pt-4">
                                    <Button variant="ghost" onClick={prevStep} className="rounded-full px-6">Zurück</Button>
                                    <Button onClick={nextStep} className="rounded-full px-8 py-6 text-lg">
                                        Weiter <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">Worum geht es genau?</h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Kernfrage / Titel</label>
                                            <Input
                                                value={formData.title}
                                                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                                                placeholder="Wie gehen wir mit X um?"
                                                className="text-lg py-6"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Scope</label>
                                            <Textarea
                                                value={formData.scope}
                                                onChange={e => setFormData(p => ({ ...p, scope: e.target.value }))}
                                                placeholder="Was gehört dazu, was nicht?"
                                                rows={3}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Kontext / Beschreibung</label>
                                            <Textarea
                                                value={formData.description}
                                                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                                placeholder="Hintergrundinfos..."
                                                rows={3}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Dein Name (Optional)</label>
                                            <Input
                                                value={formData.ownerName}
                                                onChange={e => setFormData(p => ({ ...p, ownerName: e.target.value }))}
                                                placeholder="Name oder Pseudonym"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button variant="ghost" onClick={prevStep} className="rounded-full px-6">Zurück</Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!formData.title || isSubmitting}
                                        className="rounded-full px-8 py-6 text-lg bg-black text-white hover:bg-gray-800"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Thema erstellen'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
