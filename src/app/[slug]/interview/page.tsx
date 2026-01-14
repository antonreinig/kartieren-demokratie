'use client'

import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Send, Loader2, Mic } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Input } from "@/components/ui/input"

export default function InterviewPage() {
    const params = useParams()
    const slug = params?.slug as string

    // Placeholder state for chat
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hallo! Schön, dass du dich einbringen möchtest. Was sind deine Gedanken zu diesem Thema?' }
    ])
    const [input, setInput] = useState('')

    const [isRecording, setIsRecording] = useState(false)
    const [isTranscribing, setIsTranscribing] = useState(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            chunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data)
                }
            }

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
                stream.getTracks().forEach(track => track.stop()) // Stop mic stream
                await transcribeAudio(audioBlob)
            }

            mediaRecorder.start()
            setIsRecording(true)
        } catch (err) {
            console.error("Error accessing microphone:", err)
            toast.error("Zugriff auf Mikrofon verweigert.")
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    const transcribeAudio = async (blob: Blob) => {
        setIsTranscribing(true)
        const formData = new FormData()
        formData.append('file', blob, 'recording.webm')

        try {
            const res = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData
            })
            const data = await res.json()
            if (res.ok && data.text) {
                // Append text to existing input
                setInput(prev => (prev ? `${prev} ${data.text}` : data.text))
            } else {
                toast.error("Transkription fehlgeschlagen.")
            }
        } catch (error) {
            console.error("Transcribe error:", error)
            toast.error("Fehler bei der Transkription.")
        } finally {
            setIsTranscribing(false)
        }
    }

    return (
        <div className="flex flex-col h-screen bg-[#EAEAEA]">
            {/* Header */}
            <header className="p-4 bg-white/50 backdrop-blur-md border-b flex items-center gap-4 sticky top-0 z-10">
                <Link href={`/${slug}`}>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="font-bold">Interview</h1>
                    <p className="text-xs text-muted-foreground">Persönliche Aushandlung</p>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm md:text-base ${m.role === 'user'
                            ? 'bg-[#303030] text-white rounded-br-none'
                            : 'bg-white shadow-sm text-gray-800 rounded-bl-none'
                            }`}>
                            {m.content}
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Input Bar (Bottom) */}
            <div className="p-4 bg-[#EAEAEA]">
                <div className="max-w-3xl mx-auto flex flex-col gap-2">
                    {/* Recording Indicator */}
                    {(isRecording || isTranscribing) && (
                        <div className="flex items-center justify-center gap-2 text-sm text-[#303030] animate-pulse mb-2">
                            {isRecording ? (
                                <>
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    Aufnahme läuft...
                                </>
                            ) : (
                                <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Transkribiere...
                                </>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex gap-2">
                        {/* Mic Button */}
                        <Button
                            type="button"
                            onClick={isRecording ? stopRecording : startRecording}
                            variant="secondary"
                            className={`h-14 w-14 rounded-full shadow-lg shrink-0 transition-colors ${isRecording
                                    ? 'bg-red-100 hover:bg-red-200 text-red-600'
                                    : 'bg-white hover:bg-gray-100 text-gray-600'
                                }`}
                            disabled={isLoading || isTranscribing}
                        >
                            {isRecording ? <div className="w-4 h-4 rounded-sm bg-red-500" /> : <Mic className="w-6 h-6" />}
                        </Button>

                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isRecording ? "Höre zu..." : "Deine Meinung..."}
                            className="rounded-full border-0 shadow-lg bg-white h-14 px-6 text-lg focus-visible:ring-yellow-400"
                            disabled={isLoading || isRecording || isTranscribing}
                        />
                        <Button
                            type="submit"
                            disabled={isLoading || !input.trim() || isRecording || isTranscribing}
                            size="icon"
                            className="h-14 w-14 rounded-full bg-yellow-400 text-black hover:bg-yellow-500 shadow-lg shrink-0 disabled:opacity-50"
                        >
                            <Send className="w-6 h-6" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
