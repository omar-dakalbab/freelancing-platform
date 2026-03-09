"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { Send, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TimeAgo } from "@/components/ui/time-ago";
import { track, EVENTS } from "@/lib/analytics";
import type { ConversationItem } from "./messages-layout";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  readAt: string | null;
  senderId: string;
  sender: {
    id: string;
    email: string;
    avatar: string | null;
  };
};

interface ChatWindowProps {
  conversationId: string;
  conversation: ConversationItem | undefined;
  currentUserId: string;
}

export function ChatWindow({ conversationId, conversation, currentUserId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const fetchMessages = useCallback(async (scrollToBottom = false) => {
    if (document.hidden) return;
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (res.ok) {
        const json = await res.json();
        setMessages(json.data);
        if (scrollToBottom) {
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        }
      }
    } catch {
      // Swallow — will retry
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    setLoading(true);
    fetchMessages(true);
    const interval = setInterval(() => fetchMessages(false), 8000);

    function handleVisibilityChange() {
      if (!document.hidden) fetchMessages(false);
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchMessages]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.senderId === currentUserId) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, currentUserId]);

  async function sendMessage() {
    const content = inputValue.trim();
    if (!content || sending) return;

    setSending(true);
    setInputValue("");

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Failed to send");
      }

      const json = await res.json();
      setMessages((prev) => [...prev, json.data]);
      track(EVENTS.MESSAGE_SENT, { conversation_id: conversationId });
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      inputRef.current?.focus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
      setInputValue(content); // Restore input on failure
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // Determine the other party for header display
  const isCurrentUserClient =
    conversation?.jobApplication.job.clientProfile.user.id === currentUserId;
  const otherParty = conversation
    ? isCurrentUserClient
      ? {
          name:
            conversation.jobApplication.freelancerProfile.title ||
            conversation.jobApplication.freelancerProfile.user.email.split("@")[0],
          email: conversation.jobApplication.freelancerProfile.user.email,
          avatar: conversation.jobApplication.freelancerProfile.user.avatar,
        }
      : {
          name:
            conversation.jobApplication.job.clientProfile.companyName ||
            conversation.jobApplication.job.clientProfile.user.email.split("@")[0],
          email: conversation.jobApplication.job.clientProfile.user.email,
          avatar: conversation.jobApplication.job.clientProfile.user.avatar,
        }
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 shrink-0">
        {otherParty ? (
          <div className="flex items-center gap-3">
            <Avatar
              src={otherParty.avatar}
              alt={otherParty.name}
              email={otherParty.email}
              size="sm"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">{otherParty.name}</p>
              {conversation && (
                <p className="text-xs text-gray-500 truncate max-w-[200px]">
                  {conversation.jobApplication.job.title}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="h-9 w-40 animate-pulse bg-gray-100 rounded" />
        )}
        {conversation && (
          <Link href={`/dashboard/contracts`}>
            <Button variant="outline" size="sm">
              View Contract
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-end gap-2 animate-pulse",
                  i % 2 === 0 ? "justify-start" : "justify-end"
                )}
              >
                {i % 2 === 0 && <div className="h-8 w-8 rounded-full bg-gray-200 shrink-0" />}
                <div
                  className={cn(
                    "h-10 rounded-2xl",
                    i % 2 === 0 ? "w-48 bg-gray-200" : "w-36 bg-brand-100"
                  )}
                />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <p className="text-sm text-gray-400">No messages yet</p>
            <p className="text-xs text-gray-300 mt-1">Start the conversation below</p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const isMine = msg.sender.id === currentUserId;
              const prevMsg = messages[i - 1];
              const showAvatar = !isMine && prevMsg?.sender.id !== msg.sender.id;
              const showTime =
                i === messages.length - 1 ||
                new Date(messages[i + 1].createdAt).getTime() -
                  new Date(msg.createdAt).getTime() >
                  5 * 60 * 1000;

              return (
                <div
                  key={msg.id}
                  className={cn("flex items-end gap-2", isMine ? "justify-end" : "justify-start")}
                >
                  {!isMine && (
                    <div className="w-8 shrink-0">
                      {showAvatar && (
                        <Avatar
                          src={msg.sender.avatar}
                          alt={msg.sender.email}
                          email={msg.sender.email}
                          size="sm"
                        />
                      )}
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] sm:max-w-[70%] flex flex-col",
                      isMine ? "items-end" : "items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words",
                        isMine
                          ? "bg-brand-800 text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-900 rounded-bl-sm"
                      )}
                    >
                      {msg.content}
                    </div>
                    {showTime && (
                      <span className="mt-1 text-xs text-gray-400">
                        <TimeAgo date={msg.createdAt} />
                        {isMine && msg.readAt && (
                          <span className="ml-1 text-brand-600">· Read</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-gray-100 px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600 transition-colors min-h-[44px] max-h-32"
            style={{ height: "auto" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
            }}
          />
          <Button
            onClick={sendMessage}
            loading={sending}
            disabled={!inputValue.trim() || sending}
            size="icon"
            className="shrink-0"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
