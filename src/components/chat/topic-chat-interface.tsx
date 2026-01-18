"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Mic, ArrowUp, X, Play } from "lucide-react";
import { toast } from "sonner";
import AudioVisualizer from "@/components/AudioVisualizer";
import { UserProfileSidebar } from "@/components/layout/UserProfileSidebar";

type MessagePart = { type: string; text?: string };

// Helper to extract YouTube ID
function getYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Artifact type for content cards
interface Artifact {
    id: string;
    title?: string | null;
    url: string;
    tags?: { id: string; label: string }[];
}

function getMessageText(message: { parts?: MessagePart[]; content?: string }): string {
    if (message.content) return message.content;
    if (!message.parts || !Array.isArray(message.parts)) return "";
    const textParts = message.parts.filter(part => part.type === "text" && typeof part.text === "string");
    return textParts.map(part => part.text).join("");
}

// Parse [[CONTENT:id1,id2]] markers from text
function parseContentMarkers(text: string): { cleanText: string; contentIds: string[] } {
    const regex = /\[\[CONTENT:([^\]]+)\]\]/g;
    const contentIds: string[] = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
        const ids = match[1].split(',').map(id => id.trim());
        contentIds.push(...ids);
    }

    const cleanText = text.replace(regex, '').trim();
    return { cleanText, contentIds };
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
    artifacts?: Artifact[];  // NEW: artifacts for content cards
    // Profile sidebar props
    userProfile?: any;
    messageCount?: number;
    messagesUntilNextUpdate?: number;
    isProfileLoading?: boolean;
    isRefreshing?: boolean;
    onRefreshProfile?: () => void;
    profileSidebarCollapsed?: boolean;
    onToggleProfileSidebar?: () => void;
    avatarGradient?: string;
}

export function TopicChatInterface({
    slug,
    messages,
    input,
    setInput,
    sendMessage,
    isLoading,
    error,
    centralQuestion,
    artifacts = [],  // NEW
    // Profile sidebar props
    userProfile,
    messageCount = 0,
    messagesUntilNextUpdate = 3,
    isProfileLoading = false,
    isRefreshing = false,
    onRefreshProfile,
    profileSidebarCollapsed = false,
    onToggleProfileSidebar,
    avatarGradient
}: TopicChatInterfaceProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Create artifacts lookup map for quick access
    const artifactsMap = useMemo(() => {
        const map = new Map<string, Artifact>();
        artifacts.forEach(a => map.set(a.id, a));
        return map;
    }, [artifacts]);

    // Audio State
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // Video Overlay State
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input?.trim() || isLoading) return;

        await sendMessage(input);
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
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
            {/* YouTube Modal Overlay */}
            {selectedVideoId && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setSelectedVideoId(null)}
                >
                    <div className="relative w-full max-w-4xl" onClick={e => e.stopPropagation()}>
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedVideoId(null)}
                            className="absolute -top-12 right-0 md:-right-12 md:top-0 p-2 text-white/70 hover:text-white transition-colors z-50"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <div className="w-full aspect-video bg-black rounded-xl shadow-2xl overflow-hidden">
                            <iframe
                                src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1`}
                                title="YouTube video player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="w-full h-full border-none"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Area - Sticky Bottom & Upwards Building */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col">
                <div className="mt-auto flex gap-4">
                    {/* Messages Column */}
                    <div className="flex-1 space-y-4 pb-4 lg:pr-4">
                        {displayMessages.map((m: any) => (
                            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm whitespace-pre-wrap ${m.role === "user"
                                    ? "bg-[#303030] text-white rounded-br-none"
                                    : "bg-white text-gray-800 rounded-bl-none"
                                    }`}>
                                    {(() => {
                                        const messageText = getMessageText(m);
                                        const { cleanText, contentIds } = parseContentMarkers(messageText);
                                        const matchedArtifacts = contentIds
                                            .map(id => artifactsMap.get(id))
                                            .filter((a): a is Artifact => a !== undefined);

                                        return (
                                            <>
                                                {/* Message text (without markers) */}
                                                {cleanText}

                                                {/* Render content cards if any markers found */}
                                                {matchedArtifacts.length > 0 && (
                                                    <div className={cleanText.length > 0 ? "mt-4 pt-3 border-t border-gray-100" : ""}>
                                                        <div className="flex flex-col gap-3">
                                                            {matchedArtifacts.map(artifact => {
                                                                const youtubeId = getYouTubeId(artifact.url);
                                                                const isVideo = !!youtubeId;

                                                                if (isVideo && youtubeId) {
                                                                    return (
                                                                        <button
                                                                            key={artifact.id}
                                                                            onClick={() => setSelectedVideoId(youtubeId)}
                                                                            className="group flex w-full items-center gap-3 p-2 pr-3 bg-gray-50 hover:bg-gray-100 rounded-xl overflow-hidden transition-all border border-gray-100 hover:border-gray-200 text-left"
                                                                        >
                                                                            {/* Small Thumbnail Left */}
                                                                            <div className="relative h-16 w-24 shrink-0 rounded-lg overflow-hidden bg-black/10 shadow-sm ring-1 ring-black/5">
                                                                                <img
                                                                                    src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                                                                                    alt={artifact.title || 'Video thumbnail'}
                                                                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                                                                />
                                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/0 transition-all">
                                                                                    <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow-sm text-black">
                                                                                        {/* Small Play Icon */}
                                                                                        <svg className="w-3 h-3 ml-0.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Text Content */}
                                                                            <div className="flex-1 min-w-0 py-1">
                                                                                <div className="flex items-center gap-2 mb-1">
                                                                                    <span className="text-[10px] font-bold tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded uppercase">
                                                                                        {artifact.tags?.[0]?.label || 'VIDEO'}
                                                                                    </span>
                                                                                </div>
                                                                                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight group-hover:text-amber-700 transition-colors">
                                                                                    {artifact.title || 'Video'}
                                                                                </h4>
                                                                            </div>

                                                                            <span className="text-gray-300 group-hover:text-amber-500 transition-colors self-center">
                                                                                <Play className="w-4 h-4 fill-current ml-0.5" />
                                                                            </span>
                                                                        </button>
                                                                    );
                                                                }

                                                                return (
                                                                    <a
                                                                        key={artifact.id}
                                                                        href={artifact.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 hover:border-gray-200 transition-all group"
                                                                    >
                                                                        <div className="h-10 w-10 flex items-center justify-center bg-white rounded-lg border border-gray-100 text-gray-400 shrink-0">
                                                                            {artifact.url.endsWith('.pdf') ? (
                                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                                </svg>
                                                                            ) : (
                                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                                <span className="text-[10px] font-bold tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded uppercase">
                                                                                    {artifact.tags?.[0]?.label || 'INFO'}
                                                                                </span>
                                                                            </div>
                                                                            <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                                                                                {artifact.title || 'Link'}
                                                                            </h4>
                                                                            <p className="text-xs text-gray-500 truncate">{new URL(artifact.url).hostname}</p>
                                                                        </div>
                                                                        <span className="text-gray-300 group-hover:text-amber-500 transition-colors">
                                                                            <ArrowUp className="w-4 h-4 rotate-45" />
                                                                        </span>
                                                                    </a>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
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

                    {/* Profile Sidebar - scrolls with chat, sticks to bottom */}
                    <div className="hidden lg:block w-64 shrink-0 self-end pb-4">
                        <UserProfileSidebar
                            profile={userProfile}
                            messageCount={messageCount}
                            messagesUntilNextUpdate={messagesUntilNextUpdate}
                            isLoading={isProfileLoading}
                            isRefreshing={isRefreshing}
                            onRefresh={onRefreshProfile || (() => { })}
                            avatarGradient={avatarGradient}
                        />
                    </div>
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
