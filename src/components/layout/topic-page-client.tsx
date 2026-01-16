"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { TopicAppShell } from "@/components/layout/topic-app-shell";
import { TopicChatInterface } from "@/components/chat/topic-chat-interface";
import { MediathekView } from "@/components/layout/mediathek-view";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";
import { getOrCreateGuestToken } from "@/lib/guest-token";

interface Topic {
    id: string;
    title: string;
    description?: string | null;
    scope?: string | null;
    centralQuestion?: string | null;
    context?: string | null;
    endsAt?: Date | null;
    artifacts: any[];
}

interface TopicPageClientProps {
    topic: Topic;
    slug: string;
}

export function TopicPageClient({ topic, slug }: TopicPageClientProps) {
    const [guestToken, setGuestToken] = useState<string | null>(null);
    const [initialMessages, setInitialMessages] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    // Load/Create guest token and fetch history on mount
    useEffect(() => {
        const initChat = async () => {
            const token = getOrCreateGuestToken();
            setGuestToken(token);

            // Fetch history
            if (slug && token) {
                try {
                    const res = await fetch(`/api/chat/history?slug=${slug}&guestToken=${token}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.messages && Array.isArray(data.messages)) {
                            setInitialMessages(data.messages);
                        }
                    }
                } catch (err) {
                    console.error("Failed to load chat history:", err);
                } finally {
                    setIsLoadingHistory(false);
                }
            } else {
                setIsLoadingHistory(false);
            }
        };

        if (typeof window !== "undefined") {
            initChat();
        }
    }, [slug]);

    if (isLoadingHistory || !guestToken) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#EAEAEA]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <TopicPageChat
            topic={topic}
            slug={slug}
            guestToken={guestToken}
            initialMessages={initialMessages}
        />
    );
}

// Inner component that uses useChat - only rendered when guestToken is available
function TopicPageChat({
    topic,
    slug,
    guestToken,
    initialMessages
}: {
    topic: Topic;
    slug: string;
    guestToken: string;
    initialMessages: any[];
}) {
    const [input, setInput] = useState("");

    // Create transport with custom API endpoint and body
    const transport = useMemo(() => new DefaultChatTransport({
        api: "/api/chat",
        body: { slug, guestToken }
    }), [slug, guestToken]);

    // Connect to AI API using AI SDK v3 API
    const { messages, sendMessage: chatSendMessage, status, error, setMessages } = useChat({
        transport,
        id: `topic-${slug}`,
        messages: initialMessages,
        onError: (err) => {
            console.error("Chat error:", err);
            toast.error("Verbindungsfehler. Bitte prüfe deinen API Key.");
        }
    });

    const isLoading = status === "streaming" || status === "submitted";

    const sendMessage = async (text: string) => {
        if (!text?.trim()) return;
        try {
            await chatSendMessage({ text });
            setInput("");
        } catch (err) {
            console.error(err);
            toast.error("Nachricht konnte nicht gesendet werden.");
        }
    };

    return (
        <TopicAppShell
            topic={topic}
            slug={slug}
            guestToken={guestToken}
            chatView={
                <TopicChatInterface
                    slug={slug}
                    messages={messages}
                    input={input}
                    setInput={setInput}
                    sendMessage={sendMessage}
                    isLoading={isLoading}
                    error={error}
                    centralQuestion={topic.centralQuestion || undefined}
                    artifacts={topic.artifacts}
                />
            }
            mediathekView={<MediathekView artifacts={topic.artifacts} slug={slug} />}
        />
    );
}
