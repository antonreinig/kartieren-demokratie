"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Loader2 } from "lucide-react";
import { TopicAppShell } from "@/components/layout/topic-app-shell";
import { TopicChatInterface } from "@/components/chat/topic-chat-interface";
import { PerspektivenView } from "@/components/layout/perspektiven-view";
import { InteressantesView } from "@/components/layout/interessantes-view";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";
import { getOrCreateGuestToken } from "@/lib/guest-token";
import { getGradientStyle } from "@/lib/avatar-gradient";
import { UserProfileData } from "@/components/layout/ProfileCard";
import { useSearchParams } from "next/navigation";

// Polling interval for real-time profile updates (15 seconds)
const PROFILE_POLL_INTERVAL = 15000;

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
    const searchParams = useSearchParams();
    const isAdmin = searchParams.get('admin') === 'true';

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
                    const historyRes = await fetch(`/api/chat/history?slug=${slug}&guestToken=${token}`);
                    if (historyRes.ok) {
                        const data = await historyRes.json();
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
            isAdmin={isAdmin}
        />
    );
}

// Inner component that uses useChat - only rendered when guestToken is available
function TopicPageChat({
    topic,
    slug,
    guestToken,
    initialMessages,
    isAdmin = false
}: {
    topic: Topic;
    slug: string;
    guestToken: string;
    initialMessages: any[];
    isAdmin?: boolean;
}) {
    const [input, setInput] = useState("");
    const [profiles, setProfiles] = useState<UserProfileData[]>([]);

    // User's own profile state
    const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
    const [messageCount, setMessageCount] = useState(0);
    const [messagesUntilNextUpdate, setMessagesUntilNextUpdate] = useState(3);
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [profileSidebarCollapsed, setProfileSidebarCollapsed] = useState(false);

    // Track last known message count to detect new messages
    const lastMessageCountRef = useRef(0);

    // Function to fetch user's own profile
    const fetchUserProfile = useCallback(async () => {
        try {
            const res = await fetch(`/api/profile/my-profile?slug=${slug}&guestToken=${guestToken}`);
            if (res.ok) {
                const data = await res.json();
                setUserProfile(data.profile);
                setMessageCount(data.messageCount || 0);
                setMessagesUntilNextUpdate(data.messagesUntilNextUpdate || 3);
            }
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
        } finally {
            setIsProfileLoading(false);
        }
    }, [slug, guestToken]);

    // Manual profile refresh (triggers profile generation)
    const handleManualRefresh = useCallback(async () => {
        if (messageCount < 6) return;

        setIsRefreshing(true);
        try {
            // First, we need to get the session ID - fetch it from my-profile
            const profileRes = await fetch(`/api/profile/my-profile?slug=${slug}&guestToken=${guestToken}`);
            if (!profileRes.ok) throw new Error('Failed to get profile info');

            // Trigger profile generation via chat API with special signal
            // Actually, we'll call the generate endpoint indirectly by calling a simpler approach
            // For now, just refetch the profile (the generation happens on the server side)

            // Trigger a profile regeneration by calling the generate endpoint
            // We need to expose a way to trigger this - let's create a simple POST
            const historyRes = await fetch(`/api/chat/history?slug=${slug}&guestToken=${guestToken}`);
            if (historyRes.ok) {
                const historyData = await historyRes.json();
                if (historyData.sessionId) {
                    // Trigger profile generation
                    await fetch('/api/profile/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sessionId: historyData.sessionId })
                    });

                    // Refetch profile
                    await fetchUserProfile();
                }
            }
        } catch (err) {
            console.error('Failed to refresh profile:', err);
        } finally {
            setIsRefreshing(false);
        }
    }, [messageCount, slug, guestToken, fetchUserProfile]);

    // Function to fetch all profiles (for mediathek view)
    const fetchProfiles = useCallback(async () => {
        try {
            const res = await fetch(`/api/profiles?slug=${slug}`);
            if (res.ok) {
                const data = await res.json();
                if (data.profiles && Array.isArray(data.profiles)) {
                    setProfiles(data.profiles);
                }
            }
        } catch (err) {
            // Silently fail for polling - don't spam errors
        }
    }, [slug]);

    // Initial load + polling for real-time updates
    useEffect(() => {
        // Initial fetch
        fetchProfiles();
        fetchUserProfile();

        // Set up polling interval
        const pollInterval = setInterval(() => {
            fetchProfiles();
            fetchUserProfile();
        }, PROFILE_POLL_INTERVAL);

        return () => clearInterval(pollInterval);
    }, [fetchProfiles, fetchUserProfile]);

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

    // Detect when a user message is sent and update profile after every 3rd message
    useEffect(() => {
        const userMessages = messages.filter(m => m.role === 'user');
        const currentUserMessageCount = userMessages.length;

        // If we have new user messages and it's been 3 since last check
        if (currentUserMessageCount > lastMessageCountRef.current) {
            lastMessageCountRef.current = currentUserMessageCount;

            // Update local message count immediately for UI feedback
            setMessageCount(currentUserMessageCount);
            setMessagesUntilNextUpdate(currentUserMessageCount < 6
                ? 6 - currentUserMessageCount
                : 3 - (currentUserMessageCount % 3) || 3);

            // First profile at 6, then every 3 messages
            // (give the server time to generate the profile)
            if (currentUserMessageCount >= 6 && (currentUserMessageCount === 6 || currentUserMessageCount % 3 === 0)) {
                setTimeout(() => {
                    fetchUserProfile();
                }, 3000); // Wait 3 seconds for profile generation
            }
        }
    }, [messages, fetchUserProfile]);

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
                    userProfile={userProfile}
                    messageCount={messageCount}
                    messagesUntilNextUpdate={messagesUntilNextUpdate}
                    isProfileLoading={isProfileLoading}
                    isRefreshing={isRefreshing}
                    onRefreshProfile={handleManualRefresh}
                    profileSidebarCollapsed={profileSidebarCollapsed}
                    onToggleProfileSidebar={() => setProfileSidebarCollapsed(!profileSidebarCollapsed)}
                    avatarGradient={getGradientStyle(guestToken)}
                />
            }
            perspektivenView={
                <PerspektivenView
                    profiles={profiles}
                    currentUserProfileId={userProfile?.id}
                    currentUserAvatarGradient={getGradientStyle(guestToken)}
                    topicId={topic.id}
                />
            }
            interessantesView={
                <InteressantesView
                    artifacts={topic.artifacts}
                    slug={slug}
                    isAdmin={isAdmin}
                />
            }
        />
    );
}

