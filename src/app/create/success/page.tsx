'use client'

import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Lock, Copy, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Suspense } from 'react'

function SuccessContent() {
    const searchParams = useSearchParams()
    const slug = searchParams.get('slug')
    const secret = searchParams.get('secret')

    // Prevent hydration mismatch or server render error if query params missing during static opt (though client component usually fine but useSearchParams forces dynamic)
    // If no slug/secret, show loading or empty.
    if (!slug || !secret) return <div className="p-12 text-center text-gray-500">Lade Ergebnisse...</div>

    const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/${slug}` : `/${slug}`
    const adminUrl = typeof window !== 'undefined' ? `${window.location.origin}/${slug}/edit?secret=${secret}` : `/${slug}/edit?secret=${secret}`

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success('In Zwischenablage kopiert!')
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
                {/* Public Link */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Öffentlicher Link (für Teilnehmer)</label>
                    <div className="flex gap-2">
                        <code className="flex-1 bg-white border border-gray-200 p-3 rounded-lg text-sm truncate">
                            {publicUrl}
                        </code>
                        <Button variant="outline" size="icon" onClick={() => copyToClipboard(publicUrl)}>
                            <Copy className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Secret Admin Link */}
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 bg-yellow-200 rounded-bl-xl">
                        <Lock className="w-4 h-4 text-yellow-800" />
                    </div>
                    <label className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-2 block">Dein Secret Admin Link</label>
                    <p className="text-sm text-yellow-800 mb-3">
                        Speichere diesen Link gut! Nur damit kannst du das Thema bearbeiten oder löschen.
                    </p>
                    <div className="flex gap-2">
                        <code className="flex-1 bg-white border border-yellow-200 p-3 rounded-lg text-sm truncate text-yellow-900">
                            {adminUrl}
                        </code>
                        <Button className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border-none" size="icon" onClick={() => copyToClipboard(adminUrl)}>
                            <Copy className="w-4 h-4" />
                        </Button>
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
