'use client'

import { useRef, useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, Loader2, Mic, ArrowUp, X } from "lucide-react"
import Link from "next/link"
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { toast } from "sonner"
import AudioVisualizer from "@/components/AudioVisualizer"

// Type for message parts
type MessagePart = { type: string; text?: string }

// Helper to extract text from message parts or content
function getMessageText(message: { parts?: MessagePart[]; content?: string }): string {
    // Fallback to content if parts is not available (for static welcome message)
    if (message.content) {
        return message.content
    }

    if (!message.parts || !Array.isArray(message.parts)) {
        console.log('getMessageText: no parts found', message)
        return ''
    }

    // Extract text from all text parts
    const textParts = message.parts.filter(part => part.type === 'text' && typeof part.text === 'string')
    const text = textParts.map(part => part.text).join('')

    if (!text && message.parts.length > 0) {
        console.log('getMessageText: parts found but no text:', message.parts)
    }

    return text
}

export default function InterviewPage() {
    const params = useParams()
    const slug = params?.slug as string

    // Persistence state
    const [guestToken, setGuestToken] = useState<string | null>(null)
    const [initialMessages, setInitialMessages] = useState<any[]>([])
    const [isLoadingHistory, setIsLoadingHistory] = useState(true)

    // Load/Create guest token and fetch history on mount
    useEffect(() => {
        const initChat = async () => {
            let token = localStorage.getItem('guestToken')
            if (!token) {
                token = crypto.randomUUID()
                localStorage.setItem('guestToken', token)
            }
            setGuestToken(token)

            if (slug && token) {
                try {
                    const res = await fetch(`/api/chat/history?slug=${slug}&guestToken=${token}`)
                    if (res.ok) {
                        const data = await res.json()
                        if (data.messages && Array.isArray(data.messages)) {
                            console.log("Loaded history:", data.messages.length, "messages")
                            setInitialMessages(data.messages)
                        }
                    }
                } catch (err) {
                    console.error("Failed to load chat history:", err)
                } finally {
                    setIsLoadingHistory(false)
                }
            } else {
                setIsLoadingHistory(false)
            }
        }

        initChat()
    }, [slug])

    if (isLoadingHistory || !guestToken) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#EAEAEA]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <InterviewChat
            slug={slug}
            guestToken={guestToken}
            initialMessages={initialMessages}
        />
    )
}

function InterviewChat({
    slug,
    guestToken,
    initialMessages
}: {
    slug: string,
    guestToken: string,
    initialMessages: any[]
}) {
    // Local input state (AI SDK v3 doesn't manage input state)
    const [input, setInput] = useState('')

    // Create transport with custom API endpoint and body
    const transport = useMemo(() => new DefaultChatTransport({
        api: '/api/chat',
        body: { slug, guestToken }
    }), [slug, guestToken])

    // Connect to AI API using AI SDK v3 API
    const {
        messages,
        sendMessage,
        status,
        error
    } = useChat({
        transport,
        id: `interview-${slug}`,
        messages: initialMessages,
        onFinish: ({ message }) => {
            console.log("Chat finished:", message);
        },
        onError: (err) => {
            console.error("Chat error:", err)
            toast.error("Verbindungsfehler. Bitte prüfe deinen API Key.")
        }
    })

    // Derive loading state from status
    const isLoading = status === 'streaming' || status === 'submitted'

    // Helper function for programmatic message submission (used by audio transcription)
    const submitMessage = async (text: string) => {
        if (!text?.trim()) return

        if (!slug) {
            console.error("No slug found!");
            toast.error("Fehler: Kein Thema gefunden (Slug fehlt).");
            return;
        }

        console.log("Submitting message programmatically...", { slug, text });

        try {
            await sendMessage({ text })
        } catch (err) {
            console.error(err)
            toast.error("Nachricht konnte nicht gesendet werden.")
        }
    }

    // Form submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input?.trim() || isLoading) return

        if (!slug) {
            console.error("No slug found!");
            toast.error("Fehler: Kein Thema gefunden (Slug fehlt).");
            return;
        }

        const currentInput = input
        setInput('') // Clear input immediately

        console.log("Sending message...", { slug, input: currentInput });

        try {
            await sendMessage({ text: currentInput })
        } catch (err) {
            console.error(err)
            toast.error("Nachricht konnte nicht gesendet werden.")
            setInput(currentInput) // Restore on error
        }
    }

    const scrollRef = useRef<HTMLDivElement>(null)

    // Audio State
    const [isRecording, setIsRecording] = useState(false)
    const [isTranscribing, setIsTranscribing] = useState(false)
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            setMediaStream(stream)
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            chunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data)
                }
            }

            mediaRecorder.start()
            setIsRecording(true)
        } catch (err) {
            console.error("Error accessing microphone:", err)
            toast.error("Zugriff auf Mikrofon verweigert.")
        }
    }

    const stopRecording = (shouldTranscribe: boolean = true) => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.onstop = async () => {
                const stream = mediaStream
                stream?.getTracks().forEach(track => track.stop())
                setMediaStream(null)

                if (shouldTranscribe) {
                    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
                    await transcribeAudio(audioBlob)
                } else {
                    toast.info("Aufnahme abgebrochen.")
                }
            }
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
                await submitMessage(data.text)
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

    // Auto-start conversation if empty
    useEffect(() => {
        if (messages.length === 0 && !isLoading) {
            const timer = setTimeout(() => {
                submitMessage('START_SESSION');
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [messages.length, isLoading]);

    const displayMessages = messages.filter((m: any) => m.content !== 'START_SESSION');

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
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {displayMessages.map((m: any) => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-2xl text-sm md:text-base leading-relaxed ${m.role === 'user'
                            ? 'bg-[#303030] text-white rounded-br-none'
                            : 'bg-white shadow-sm text-gray-800 rounded-bl-none'
                            }`}>
                            {getMessageText(m)}

                            {/* Render Tool Invocations (Video Suggestions) */}
                            {m.toolInvocations?.map((toolInvocation: any) => {
                                if (toolInvocation.toolName === 'suggestVideos' && 'result' in toolInvocation) {
                                    const videos = toolInvocation.result as any[];
                                    return (
                                        <div key={toolInvocation.toolCallId} className="mt-4 flex flex-col gap-2">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Empfohlene Einstiegsvideos:</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {videos.map((video: any) => (
                                                    <a
                                                        key={video.id}
                                                        href={video.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block group bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-lg overflow-hidden transition-all"
                                                    >
                                                        <div className="p-3">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Video</span>
                                                            </div>
                                                            <h4 className="font-semibold text-sm mt-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                                {video.title}
                                                            </h4>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex justify-start">
                        <div className="bg-white/50 p-4 rounded-2xl rounded-bl-none shadow-sm">
                            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                        </div>
                    </div>
                )}
                {error && (
                    <div className="text-center text-red-500 text-sm p-4">
                        Ein Fehler ist aufgetreten. Bitte versuche es später erneut.
                    </div>
                )}
            </div>

            {/* Floating Input Bar (Bottom) */}
            <div className="p-4 bg-[#EAEAEA]">
                <div className="max-w-3xl mx-auto flex flex-col gap-2">
                    {/* Recording Indicator */}
                    {(isTranscribing) && (
                        <div className="flex items-center justify-center gap-2 text-sm text-[#303030] animate-pulse mb-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Verarbeite Audio...
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                        {/* Mic Button - Standard or Active (Send) */}
                        <Button
                            type="button"
                            onClick={isRecording ? () => stopRecording(true) : startRecording}
                            variant="secondary"
                            className={`h-14 w-14 rounded-full shadow-lg shrink-0 transition-all ${isRecording
                                ? 'bg-red-500 hover:bg-red-600 text-white scale-110'
                                : 'bg-white hover:bg-gray-100 text-gray-600'
                                }`}
                            disabled={isLoading || isTranscribing}
                        >
                            {isRecording ? <ArrowUp className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </Button>

                        {/* Input Area or Waveform */}
                        <div className="flex-1 relative h-14 bg-white rounded-full shadow-lg overflow-hidden flex items-center">
                            {isRecording && mediaStream ? (
                                <div className="w-full h-full px-4 flex items-center justify-center bg-gray-50">
                                    <AudioVisualizer stream={mediaStream} />
                                </div>
                            ) : (
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={isRecording ? "Höre zu..." : "Deine Meinung..."}
                                    className="border-0 shadow-none bg-transparent h-14 px-6 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                                    disabled={isLoading || isRecording || isTranscribing}
                                />
                            )}
                        </div>

                        {/* Send Button or Cancel Button */}
                        {isRecording ? (
                            <Button
                                type="button"
                                onClick={() => stopRecording(false)}
                                size="icon"
                                variant="outline"
                                className="h-14 w-14 rounded-full border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-red-500 shadow-lg shrink-0"
                            >
                                <X className="w-6 h-6" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={isLoading || !input?.trim() || isTranscribing}
                                size="icon"
                                className="h-14 w-14 rounded-full bg-[#F8CD32] text-black hover:bg-[#E5BC2E] shadow-lg shrink-0 disabled:opacity-50"
                            >
                                <Send className="w-6 h-6" />
                            </Button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}
