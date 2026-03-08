"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationList } from "./conversation-list";
import { ChatWindow } from "./chat-window";
import type { Session } from "next-auth";

export type ConversationItem = {
  id: string;
  createdAt: string;
  unreadCount: number;
  messages: Array<{
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
  }>;
  jobApplication: {
    id: string;
    job: {
      id: string;
      title: string;
      clientProfile: {
        companyName: string | null;
        user: { id: string; email: string; avatar: string | null };
      };
    };
    freelancerProfile: {
      title: string | null;
      user: { id: string; email: string; avatar: string | null };
    };
  };
};

interface MessagesLayoutProps {
  session: Session;
  activeConversationId?: string;
}

export function MessagesLayout({ session, activeConversationId }: MessagesLayoutProps) {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | undefined>(activeConversationId);

  const fetchConversations = useCallback(async () => {
    if (document.hidden) return;
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const json = await res.json();
        setConversations(json.data);
      }
    } catch {
      // Swallow error — will retry on next poll
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);

    function handleVisibilityChange() {
      if (!document.hidden) fetchConversations();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchConversations]);

  function handleSelectConversation(id: string) {
    setActiveId(id);
    router.push(`/dashboard/messages/${id}`, { scroll: false });
    // Optimistically clear unread count for selected conversation
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  }

  function handleBackToList() {
    setActiveId(undefined);
    router.push("/dashboard/messages", { scroll: false });
  }

  const activeConversation = conversations.find((c) => c.id === activeId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
      <div className="flex gap-6 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Sidebar - hidden on mobile when a conversation is active */}
        <div className={`w-full md:w-80 md:shrink-0 flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden ${activeId ? "hidden md:flex" : "flex"}`}>
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            loading={loading}
            currentUserId={session.user.id}
            onSelect={handleSelectConversation}
          />
        </div>

        {/* Chat area - hidden on mobile when no conversation selected */}
        <div className={`flex-1 rounded-xl border border-gray-200 bg-white overflow-hidden ${activeId ? "flex flex-col" : "hidden md:flex md:flex-col"}`}>
          {!activeId ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 mb-4">
                <MessageSquare className="h-8 w-8 text-brand-800" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Your Messages</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-xs">
                Select a conversation from the left to start chatting, or hire a freelancer to begin.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile back button */}
              <div className="md:hidden border-b border-gray-100 px-3 py-2">
                <Button variant="ghost" size="sm" onClick={handleBackToList}>
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Back to conversations
                </Button>
              </div>
              <ChatWindow
                conversationId={activeId}
                conversation={activeConversation}
                currentUserId={session.user.id}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
