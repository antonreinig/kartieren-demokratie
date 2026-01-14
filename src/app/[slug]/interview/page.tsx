'use client'

import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Send } from "lucide-react"
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

    const handleSend = () => {
        if (!input.trim()) return
        setMessages(prev => [...prev, { role: 'user', content: input }])
        setInput('')
        // Simulate AI response stub
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Das ist ein interessanter Punkt. Kannst du das näher erläutern?' }])
        }, 1000)
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
                <div className="max-w-3xl mx-auto flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Deine Meinung..."
                        className="rounded-full border-0 shadow-lg bg-white h-14 px-6 text-lg focus-visible:ring-yellow-400"
                    />
                    <Button
                        onClick={handleSend}
                        size="icon"
                        className="h-14 w-14 rounded-full bg-yellow-400 text-black hover:bg-yellow-500 shadow-lg shrink-0"
                    >
                        <Send className="w-6 h-6" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
