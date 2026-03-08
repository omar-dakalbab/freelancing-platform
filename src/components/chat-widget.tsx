"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from "react";
import {
  MessageCircle, X, Send, Bot, ChevronDown, Sparkles,
  Briefcase, FileText, CreditCard, Rocket, ScrollText, Star,
  User, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/components/ui/logo";
import { track, EVENTS } from "@/lib/analytics";

type Role = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  streaming?: boolean;
  timestamp?: Date;
}

interface ChatWidgetProps {
  userRole?: string | null;
}

const USE_AI = false;

const QUICK_ACTIONS = [
  { label: "Post a job", icon: Briefcase },
  { label: "Apply for a job", icon: FileText },
  { label: "How payments work", icon: CreditCard },
  { label: "Get started", icon: Rocket },
  { label: "How contracts work", icon: ScrollText },
  { label: "How reviews work", icon: Star },
] as const;

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: `Hi! I'm your ${BRAND_NAME} assistant. I can help you with jobs, contracts, payments, and more. What can I help you with?`,
  timestamp: new Date(),
};

const STATIC_RESPONSES: Array<{ keywords: string[]; response: string }> = [
  {
    keywords: ["post a job", "create a job", "publish a job", "new job", "post job"],
    response:
      "To post a job:\n\n1. Log in as a Client\n2. Go to Dashboard \u2192 Post a Job\n3. Fill in the title, description, required skills, budget range, and timeline\n4. Click Publish to make it visible to freelancers\n\nYou can also save it as a Draft and publish later from My Jobs.",
  },
  {
    keywords: ["apply", "apply for a job", "submit proposal", "bid", "apply job"],
    response:
      "To apply for a job:\n\n1. Log in as a Freelancer\n2. Browse jobs from the Jobs page\n3. Click on a job to view details\n4. Click Apply and write your proposal\n5. Enter your bid amount\n6. Submit your application\n\nYou can only apply once per job. Track your applications from Dashboard \u2192 My Applications.",
  },
  {
    keywords: ["payment", "pay", "stripe", "fund", "money"],
    response:
      `Payments on ${BRAND_NAME}:\n\n1. After hiring a freelancer, the client creates a fixed-price contract\n2. The client clicks "Fund Contract" to pay via Stripe\n3. Payment is held until the freelancer submits their work\n4. Once the client marks the contract as completed, the freelancer receives payment\n\nA 10% platform fee is applied. All payments are processed securely through Stripe.`,
  },
  {
    keywords: ["get started", "start", "begin", "new here", "how to use"],
    response:
      `Welcome to ${BRAND_NAME}! Here's how to get started:\n\n**As a Client:**\n\u2022 Sign up and create your company profile\n\u2022 Post your first job with required skills and budget\n\u2022 Review applications and hire the best freelancer\n\n**As a Freelancer:**\n\u2022 Sign up and build your profile with skills and portfolio\n\u2022 Browse available jobs and submit proposals\n\u2022 Get hired, complete work, and get paid`,
  },
  {
    keywords: ["contract", "contracts", "hire", "hiring"],
    response:
      "How contracts work:\n\n1. Client reviews applications and hires a freelancer\n2. Client creates a fixed-price contract with the agreed amount\n3. Freelancer accepts (or rejects) the contract\n4. Client funds the contract via Stripe\n5. Freelancer works and marks it as \"Submitted\"\n6. Client reviews and marks the contract as \"Completed\"\n\nContracts can be viewed from Dashboard \u2192 Contracts.",
  },
  {
    keywords: ["review", "reviews", "rating", "feedback"],
    response:
      "After a contract is completed, the client can leave a review for the freelancer:\n\n\u2022 Rate from 1 to 5 stars\n\u2022 Add a written comment\n\u2022 One review per contract\n\nReviews appear on the freelancer's public profile and help build their reputation on the platform.",
  },
  {
    keywords: ["message", "chat", "messaging", "contact"],
    response:
      `Messaging on ${BRAND_NAME}:\n\n1. When a client shortlists or interacts with an applicant, a conversation is created\n2. Go to Dashboard \u2192 Messages to see all your conversations\n3. Click a conversation to open the chat\n4. Send messages in real-time\n\nYou'll see an unread count badge in the navigation when you have new messages.`,
  },
  {
    keywords: ["profile", "edit profile", "portfolio", "skills", "avatar"],
    response:
      "To set up your profile:\n\n1. Go to Dashboard \u2192 Profile\n2. Fill in your details:\n   \u2022 Clients: company name, description, website, industry\n   \u2022 Freelancers: bio, title, hourly rate, skills, portfolio items\n3. Upload an avatar\n4. Complete all fields to reach 100% profile completion\n\nA complete profile helps you stand out!",
  },
  {
    keywords: ["search", "find", "filter", "browse"],
    response:
      `Finding jobs on ${BRAND_NAME}:\n\n1. Go to the Jobs page from the navigation\n2. Use the search bar to find jobs by keyword\n3. Filter by:\n   \u2022 Skills required\n   \u2022 Budget range\n   \u2022 Category\n4. Click on any job to see full details and apply\n\nNew jobs appear at the top of the listing.`,
  },
];

function getStaticResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const entry of STATIC_RESPONSES) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.response;
    }
  }
  return "I can help you with:\n\n\u2022 Posting or finding jobs\n\u2022 Applying for jobs\n\u2022 Contracts and hiring\n\u2022 Payments\n\u2022 Messaging\n\u2022 Reviews and ratings\n\u2022 Profile setup\n\nTry asking about any of these topics, or click one of the quick action buttons!";
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function formatTime(date?: Date): string {
  if (!date) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Renders markdown-lite: **bold** */
function renderContent(text: string) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
    return (
      <span key={i}>
        {i > 0 && <br />}
        {parts}
      </span>
    );
  });
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 px-1">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-800 to-brand-900 shadow-sm">
        <Bot className="h-3.5 w-3.5 text-white" aria-hidden="true" />
      </div>
      <div className="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3">
        <span className="flex gap-1.5 items-center" aria-label="Assistant is typing">
          <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </span>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-2.5 px-1", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-800 to-brand-900 shadow-sm mt-0.5">
          <Bot className="h-3.5 w-3.5 text-white" aria-hidden="true" />
        </div>
      )}
      <div className="flex flex-col gap-1 max-w-[80%]">
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed",
            isUser
              ? "bg-gradient-to-br from-brand-800 to-brand-900 text-white rounded-br-md shadow-sm"
              : "bg-gray-50 text-gray-700 rounded-bl-md border border-gray-100"
          )}
        >
          {isUser ? message.content : renderContent(message.content)}
          {message.streaming && (
            <span className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-current align-middle opacity-60" aria-hidden="true" />
          )}
        </div>
        {message.timestamp && (
          <span className={cn("text-[10px] text-gray-300 px-1", isUser ? "text-right" : "text-left")}>
            {formatTime(message.timestamp)}
          </span>
        )}
      </div>
      {isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-accent-100 mt-0.5">
          <User className="h-3.5 w-3.5 text-accent-700" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

export function ChatWidget({ userRole }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom("instant");
      setHasUnread(false);
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, scrollToBottom]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);

  const handleOpen = useCallback(() => {
    track(EVENTS.CHAT_WIDGET_OPENED);
    setIsOpen(true);
    setHasUnread(false);
  }, []);

  const handleClose = useCallback(() => {
    track(EVENTS.CHAT_WIDGET_CLOSED);
    setIsOpen(false);
    abortRef.current?.abort();
  }, []);

  const handleReset = useCallback(() => {
    track(EVENTS.CHAT_WIDGET_RESET);
    abortRef.current?.abort();
    setMessages([{ ...WELCOME_MESSAGE, id: generateId(), timestamp: new Date() }]);
    setIsStreaming(false);
    setInputValue("");
  }, []);

  const sendStaticMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      track(EVENTS.CHAT_WIDGET_MESSAGE_SENT, { message_length: trimmed.length });
      if (!trimmed || isStreaming) return;

      setInputValue("");

      const userMessage: ChatMessage = { id: generateId(), role: "user", content: trimmed, timestamp: new Date() };
      const assistantMessage: ChatMessage = { id: generateId(), role: "assistant", content: "", streaming: true };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      const response = getStaticResponse(trimmed);
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => m.id === assistantMessage.id ? { ...m, content: response, streaming: false, timestamp: new Date() } : m)
        );
        setIsStreaming(false);
        if (!isOpen) setHasUnread(true);
      }, 600);
    },
    [isStreaming, isOpen]
  );

  const sendAIMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      track(EVENTS.CHAT_WIDGET_MESSAGE_SENT, { message_length: trimmed.length, ai_mode: true });
      if (!trimmed || isStreaming) return;

      setInputValue("");

      const userMessage: ChatMessage = { id: generateId(), role: "user", content: trimmed, timestamp: new Date() };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      const assistantId = generateId();
      const assistantPlaceholder: ChatMessage = { id: assistantId, role: "assistant", content: "", streaming: true };
      setMessages((prev) => [...prev, assistantPlaceholder]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const apiMessages = updatedMessages.map((m) => ({ role: m.role, content: m.content }));
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, userRole: userRole ?? undefined }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error?.message ?? "Failed to get a response. Please try again.");
        }

        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) => m.id === assistantId ? { ...m, content: accumulated, streaming: true } : m)
          );
        }

        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, content: accumulated, streaming: false, timestamp: new Date() } : m)
        );
        if (!isOpen) setHasUnread(true);
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setMessages((prev) => prev.filter((m) => !(m.id === assistantId && m.content === "")));
          return;
        }
        const errorText = err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, content: errorText, streaming: false, timestamp: new Date() } : m)
        );
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
        if (inputRef.current) inputRef.current.style.height = "auto";
      }
    },
    [messages, isStreaming, userRole, isOpen]
  );

  const sendMessage = USE_AI ? sendAIMessage : sendStaticMessage;

  const handleQuickAction = useCallback(
    (action: string) => { track(EVENTS.CHAT_WIDGET_QUICK_ACTION, { action }); sendMessage(action); },
    [sendMessage]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(inputValue);
      }
    },
    [inputValue, sendMessage]
  );

  const showQuickActions = messages.length === 1 && messages[0].id === "welcome";

  return (
    <>
      {/* Chat window */}
      <div
        className={cn(
          "fixed bottom-20 right-4 z-50 flex flex-col",
          "w-[calc(100vw-2rem)] sm:w-[400px]",
          "h-[min(560px,calc(100dvh-7rem))]",
          "rounded-2xl bg-white shadow-2xl shadow-gray-900/10 ring-1 ring-gray-900/5",
          "transition-all duration-200 ease-out origin-bottom-right",
          isOpen
            ? "scale-100 opacity-100 pointer-events-auto translate-y-0"
            : "scale-95 opacity-0 pointer-events-none translate-y-2"
        )}
        role="dialog"
        aria-label={`${BRAND_NAME} AI assistant`}
        aria-modal="false"
      >
        {/* Header — dark gradient */}
        <div className="flex shrink-0 items-center justify-between gap-3 rounded-t-2xl bg-gradient-to-r from-brand-900 to-brand-800 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              <span className={cn(
                "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-brand-900",
                isStreaming ? "bg-amber-400" : "bg-emerald-400"
              )} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none">
                {BRAND_NAME} AI
              </p>
              <p className="mt-1 text-[11px] text-white/50 leading-none">
                {isStreaming ? "Thinking..." : "Always here to help"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleReset}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              aria-label="Reset conversation"
              title="New conversation"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              onClick={handleClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              aria-label="Close chat"
            >
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 bg-white">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Quick action grid */}
          {showQuickActions && !isStreaming && (
            <div className="px-1 pt-2">
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2.5 px-1">
                Quick actions
              </p>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.label)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2.5",
                      "text-xs font-medium text-gray-600",
                      "transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800 hover:shadow-sm",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
                    )}
                  >
                    <action.icon className="h-3.5 w-3.5 text-gray-400 shrink-0" aria-hidden="true" />
                    <span className="truncate">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isStreaming &&
            messages[messages.length - 1]?.role === "assistant" &&
            messages[messages.length - 1]?.content === "" && (
              <TypingIndicator />
            )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="shrink-0 rounded-b-2xl border-t border-gray-100 bg-gray-50/50 px-3 py-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              rows={1}
              disabled={isStreaming}
              className={cn(
                "flex-1 resize-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] text-gray-900",
                "placeholder:text-gray-400",
                "focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100",
                "disabled:cursor-not-allowed disabled:opacity-60",
                "transition-all min-h-[40px] max-h-[100px] shadow-sm"
              )}
              style={{ height: "auto" }}
              aria-label="Chat message input"
            />
            <button
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isStreaming}
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                "bg-gradient-to-br from-brand-800 to-brand-900 text-white shadow-sm",
                "transition-all hover:shadow-md hover:from-brand-700 hover:to-brand-800",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              )}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-gray-300">
            Press Enter to send &middot; Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Floating trigger button */}
      <button
        onClick={isOpen ? handleClose : handleOpen}
        className={cn(
          "fixed bottom-4 right-4 z-50 group",
          "flex h-14 w-14 items-center justify-center rounded-full",
          "bg-gradient-to-br from-brand-800 to-brand-950 text-white",
          "shadow-lg shadow-brand-900/25",
          "transition-all duration-200 hover:shadow-xl hover:shadow-brand-900/30 hover:scale-105 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
        )}
        aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
        aria-expanded={isOpen}
      >
        {/* Unread pulse badge */}
        {hasUnread && !isOpen && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
            <span className="absolute h-full w-full animate-ping rounded-full bg-accent-500 opacity-40" />
            <span className="relative h-3.5 w-3.5 rounded-full bg-accent-500 ring-2 ring-white" />
          </span>
        )}

        {/* Animated icon toggle */}
        <span
          className={cn(
            "absolute transition-all duration-200",
            isOpen ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-50 opacity-0"
          )}
          aria-hidden="true"
        >
          <X className="h-5 w-5" />
        </span>
        <span
          className={cn(
            "absolute transition-all duration-200",
            isOpen ? "-rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"
          )}
          aria-hidden="true"
        >
          <MessageCircle className="h-5 w-5" />
        </span>

        {/* Subtle ring */}
        <span className="absolute inset-0 rounded-full ring-1 ring-white/10" aria-hidden="true" />
      </button>
    </>
  );
}
