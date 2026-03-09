"use client";

import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { TimeAgo } from "@/components/ui/time-ago";
import { MessageSquare } from "lucide-react";
import type { ConversationItem } from "./messages-layout";

interface ConversationListProps {
  conversations: ConversationItem[];
  activeId: string | undefined;
  loading: boolean;
  currentUserId: string;
  onSelect: (id: string) => void;
}

export function ConversationList({
  conversations,
  activeId,
  loading,
  currentUserId,
  onSelect,
}: ConversationListProps) {
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">Conversations</p>
          {totalUnread > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-800 px-1.5 text-xs font-medium text-white">
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-1 p-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <MessageSquare className="h-8 w-8 text-gray-300 mb-2" aria-hidden="true" />
            <p className="text-sm text-gray-500">No conversations yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Hire a freelancer to start a conversation
            </p>
          </div>
        ) : (
          <ul className="p-2 space-y-0.5">
            {conversations.map((conv) => {
              const isClient = conv.jobApplication.job.clientProfile.user.id === currentUserId;
              const otherParty = isClient
                ? conv.jobApplication.freelancerProfile
                : {
                    title: conv.jobApplication.job.clientProfile.companyName,
                    user: conv.jobApplication.job.clientProfile.user,
                  };

              const displayName =
                (otherParty as { title?: string | null }).title ||
                otherParty.user.email.split("@")[0];
              const lastMessage = conv.messages[0];

              return (
                <li key={conv.id}>
                  <button
                    onClick={() => onSelect(conv.id)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                      activeId === conv.id
                        ? "bg-brand-50 border border-brand-300"
                        : "hover:bg-gray-50 border border-transparent"
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar
                        src={otherParty.user.avatar}
                        alt={displayName}
                        email={otherParty.user.email}
                        size="md"
                      />
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-800 text-xs font-bold text-white">
                          {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={cn(
                            "text-sm truncate",
                            conv.unreadCount > 0
                              ? "font-semibold text-gray-900"
                              : "font-medium text-gray-700"
                          )}
                        >
                          {displayName}
                        </p>
                        {lastMessage && (
                          <TimeAgo date={lastMessage.createdAt} className="text-xs text-gray-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {conv.jobApplication.job.title}
                      </p>
                      {lastMessage && (
                        <p
                          className={cn(
                            "text-xs truncate mt-0.5",
                            conv.unreadCount > 0 ? "text-gray-700 font-medium" : "text-gray-400"
                          )}
                        >
                          {lastMessage.senderId === currentUserId ? "You: " : ""}
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
