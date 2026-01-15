'use client'

import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Lock, Copy, ArrowRight, Check } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Suspense, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function SuccessContent() {
    const searchParams = useSearchParams()
    const slug = searchParams.get('slug')
    const secret = searchParams.get('secret')

    const [copiedPublic, setCopiedPublic] = useState(false)
    const [copiedSecret, setCopiedSecret] = useState(false)

    // Prevent hydration mismatch or server render error if query params missing during static opt 
    if (!slug || !secret) return <div className="p-12 text-center text-gray-500">Lade Ergebnisse...</div>

    const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/${slug}` : `/${slug}`
    const adminUrl = typeof window !== 'undefined' ? `${window.location.origin}/${slug}/edit?secret=${secret}` : `/${slug}/edit?secret=${secret}`

    const copyToClipboard = (text: string, type: 'public' | 'secret') => {
        navigator.clipboard.writeText(text)
        toast.success('In Zwischenablage kopiert!')

        if (type === 'public') {
            setCopiedPublic(true)
            setTimeout(() => setCopiedPublic(false), 2000)
        } else {
            setCopiedSecret(true)
            setTimeout(() => setCopiedSecret(false), 2000)
        }
    }

    return (
        <Card className="max-w-xl w-full p-8 rounded-3xl shadow-xl border-none">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Thema erstellt!</h1>
                <p className="text-muted-foreground">Dein Aushandlungsraum ist jetzt bereit.</p>
            </div>

            <div className="space-y-6">
                {/* Public Link - Green */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <label className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 block">Öffentlicher Link (für Teilnehmer)</label>
                    <div className="flex gap-2 items-center">
                        <code className="flex-1 bg-white border border-green-200 p-3 rounded-lg text-sm truncate text-green-900 font-medium">
                            {publicUrl}
                        </code>
                        <div className="relative">
                            <AnimatePresence>
                                {copiedPublic && (
                                    <motion.span
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap"
                                    >
                                        Kopiert!
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(publicUrl, 'public')}
                                className={copiedPublic ? "bg-green-100 border-green-300 text-green-700" : ""}
                            >
                                {copiedPublic ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Secret Admin Link - Gray with Red Accents */}
                <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 bg-red-100 rounded-bl-xl">
                        <Lock className="w-4 h-4 text-red-500" />
                    </div>
                    <label className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2 block">Dein Secret Admin Link</label>
                    <p className="text-sm text-gray-600 mb-3">
                        Speichere diesen Link gut! Nur damit kannst du das Thema bearbeiten oder löschen.
                    </p>
                    <div className="flex gap-2 items-center">
                        <code className="flex-1 bg-white border border-gray-300 p-3 rounded-lg text-sm truncate text-gray-500">
                            {adminUrl}
                        </code>
                        <div className="relative">
                            <AnimatePresence>
                                {copiedSecret && (
                                    <motion.span
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap"
                                    >
                                        Kopiert!
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            <Button
                                className={`border-none ${copiedSecret ? "bg-green-500 hover:bg-green-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
                                size="icon"
                                onClick={() => copyToClipboard(adminUrl, 'secret')}
                            >
                                {copiedSecret ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <Link href={`/${slug}`}>
                    <Button className="rounded-full px-8 py-6 text-lg">
                        Zum Thema <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </Link>
            </div>
        </Card>
    )
}

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-[#EAEAEA] flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-center">Lade...</div>}>
                <SuccessContent />
            </Suspense>
        </div>
    )
}
