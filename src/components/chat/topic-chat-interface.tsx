"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Mic, ArrowUp, X } from "lucide-react";
import { toast } from "sonner";
import AudioVisualizer from "@/components/AudioVisualizer";

type MessagePart = { type: string; text?: string };

function getMessageText(message: { parts?: MessagePart[]; content?: string }): string {
    if (message.content) return message.content;
    if (!message.parts || !Array.isArray(message.parts)) return "";
    const textParts = message.parts.filter(part => part.type === "text" && typeof part.text === "string");
    return textParts.map(part => part.text).join("");
}

interface TopicChatInterfaceProps {
    slug: string;
    messages: any[];
    input: string;
    setInput: (value: string) => void;
    sendMessage: (message: string) => Promise<void>;
    isLoading: boolean;
    error?: Error;
    centralQuestion?: string;
}

export function TopicChatInterface({
    slug,
    messages,
    input,
    setInput,
    sendMessage,
    isLoading,
    error,
    centralQuestion
}: TopicChatInterfaceProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Audio State
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input?.trim() || isLoading) return;

        await sendMessage(input);
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setMediaStream(stream);
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            toast.error("Zugriff auf Mikrofon verweigert.");
        }
    };

    const stopRecording = (shouldTranscribe: boolean = true) => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.onstop = async () => {
                mediaStream?.getTracks().forEach(track => track.stop());
                setMediaStream(null);
                if (shouldTranscribe) {
                    const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
                    await transcribeAudio(audioBlob);
                } else {
                    toast.info("Aufnahme abgebrochen.");
                }
            };
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const transcribeAudio = async (blob: Blob) => {
        setIsTranscribing(true);
        const formData = new FormData();
        formData.append("file", blob, "recording.webm");
        try {
            const res = await fetch("/api/transcribe", { method: "POST", body: formData });
            const data = await res.json();
            if (res.ok && data.text) {
                await sendMessage(data.text);
            } else {
                toast.error("Transkription fehlgeschlagen.");
            }
        } catch (error) {
            console.error("Transcribe error:", error);
            toast.error("Fehler bei der Transkription.");
        } finally {
            setIsTranscribing(false);
        }
    };

    // Auto-start is now handled by the parent effect or implicit "empty messages" check is moved/adjusted?
    // Actually, keep the check here but it will rely on the passed `messages` prop which checks persistence.
    // If messages are empty (and we are not loading), we start.
    // But since `messages` comes from parent who loads history, this shouldn't trigger if history exists.
    useEffect(() => {
        if (messages.length === 0 && !isLoading) {
            const timer = setTimeout(() => {
                sendMessage('START_SESSION');
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [messages.length, isLoading, sendMessage]);

    const displayMessages = messages.filter((m: any) => getMessageText(m)?.trim() !== 'START_SESSION');

    return (
        <div className="flex flex-col h-full w-full bg-[#EAEAEA] relative">
            {/* Chat Area - Sticky Bottom & Upwards Building */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col">
                <div className="mt-auto space-y-4">
                    {displayMessages.map((m: any) => (
                        <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm whitespace-pre-wrap ${m.role === "user"
                                ? "bg-[#303030] text-white rounded-br-none"
                                : "bg-white text-gray-800 rounded-bl-none"
                                }`}>
                                {getMessageText(m)}
                            </div>
                        </div>
                    ))}
                    {isLoading && messages[messages.length - 1]?.role === "user" && (
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
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-[#EAEAEA]">
                <div className="max-w-3xl mx-auto flex flex-col gap-2">
                    {isTranscribing && (
                        <div className="flex items-center justify-center gap-2 text-sm text-[#303030] animate-pulse mb-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Verarbeite Audio...
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                        <Button
                            type="button"
                            onClick={isRecording ? () => stopRecording(true) : startRecording}
                            variant="secondary"
                            className={`h-14 w-14 rounded-full shadow-lg shrink-0 transition-all ${isRecording
                                ? "bg-[#F8CD32] hover:bg-[#E5BC2E] text-black scale-110"
                                : "bg-white hover:bg-gray-100 text-gray-600"
                                }`}
                            disabled={isLoading || isTranscribing}
                        >
                            {isRecording ? <ArrowUp className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </Button>

                        <div className={`flex-1 relative h-14 rounded-full shadow-lg overflow-hidden flex items-center ${isRecording ? "bg-[#F8CD32]" : "bg-white"}`}>
                            {isRecording && mediaStream ? (
                                <div className="w-full h-full px-4 flex items-center justify-center">
                                    <AudioVisualizer stream={mediaStream} />
                                </div>
                            ) : (
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={isRecording ? "Höre zu..." : (centralQuestion || "Was denkst du?")}
                                    className="border-0 shadow-none bg-transparent h-14 px-6 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                                    disabled={isLoading || isRecording || isTranscribing}
                                />
                            )}
                        </div>

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
                                size="icon"
                                className="h-14 w-14 rounded-full bg-[#F8CD32] text-black hover:bg-[#E5BC2E] shadow-lg shrink-0"
                            >
                                <Send className="w-6 h-6" />
                            </Button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

