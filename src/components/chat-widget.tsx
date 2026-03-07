"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from "react";
import { MessageCircle, X, Send, Bot, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  /** True while the assistant is still streaming this message */
  streaming?: boolean;
}

interface ChatWidgetProps {
  /** The authenticated user's role, passed from a server component. */
  userRole?: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Set to true to use the AI-powered /api/chat endpoint instead of static responses */
const USE_AI = false;

const QUICK_ACTIONS = [
  "How do I post a job?",
  "How do I apply for a job?",
  "How do payments work?",
  "Help me get started",
  "How do contracts work?",
  "How do reviews work?",
] as const;

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm the FreelanceHub assistant. I can help you navigate the platform, answer questions about jobs, contracts, payments, and more. What can I help you with today?",
};

// ─── Static FAQ responses ────────────────────────────────────────────────────

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
      "Payments on FreelanceHub:\n\n1. After hiring a freelancer, the client creates a fixed-price contract\n2. The client clicks \"Fund Contract\" to pay via Stripe\n3. Payment is held until the freelancer submits their work\n4. Once the client marks the contract as completed, the freelancer receives payment\n\nA 10% platform fee is applied. All payments are processed securely through Stripe.",
  },
  {
    keywords: ["get started", "start", "begin", "new here", "how to use"],
    response:
      "Welcome to FreelanceHub! Here's how to get started:\n\nAs a Client:\n\u2022 Sign up and create your company profile\n\u2022 Post your first job with required skills and budget\n\u2022 Review applications and hire the best freelancer\n\nAs a Freelancer:\n\u2022 Sign up and build your profile with skills and portfolio\n\u2022 Browse available jobs and submit proposals\n\u2022 Get hired, complete work, and get paid\n\nNeed help with something specific? Just ask!",
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
      "Messaging on FreelanceHub:\n\n1. When a client shortlists or interacts with an applicant, a conversation is created\n2. Go to Dashboard \u2192 Messages to see all your conversations\n3. Click a conversation to open the chat\n4. Send messages in real-time\n\nYou'll see an unread count badge in the navigation when you have new messages.",
  },
  {
    keywords: ["profile", "edit profile", "portfolio", "skills", "avatar"],
    response:
      "To set up your profile:\n\n1. Go to Dashboard \u2192 Profile\n2. Fill in your details:\n   \u2022 Clients: company name, description, website, industry\n   \u2022 Freelancers: bio, title, hourly rate, skills, portfolio items\n3. Upload an avatar\n4. Complete all fields to reach 100% profile completion\n\nA complete profile helps you stand out!",
  },
  {
    keywords: ["search", "find", "filter", "browse"],
    response:
      "Finding jobs on FreelanceHub:\n\n1. Go to the Jobs page from the navigation\n2. Use the search bar to find jobs by keyword\n3. Filter by:\n   \u2022 Skills required\n   \u2022 Budget range\n   \u2022 Category\n4. Click on any job to see full details and apply\n\nNew jobs appear at the top of the listing.",
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-800">
        <Bot className="h-3.5 w-3.5 text-white" aria-hidden="true" />
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3">
        <span className="flex gap-1" aria-label="Assistant is typing">
          <span
            className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </span>
      </div>
    </div>
  );
}

// ─── Single message bubble ────────────────────────────────────────────────────

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-800">
          <Bot className="h-3.5 w-3.5 text-white" aria-hidden="true" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words",
          isUser
            ? "bg-brand-800 text-white rounded-br-sm"
            : "bg-gray-100 text-gray-900 rounded-bl-sm"
        )}
      >
        {message.content}
        {message.streaming && (
          <span
            className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-current align-middle opacity-75"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}

// ─── Main widget ──────────────────────────────────────────────────────────────

export function ChatWidget({ userRole }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom when messages change
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
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, scrollToBottom]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setHasUnread(false);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    // Cancel any in-flight stream when user closes the widget
    abortRef.current?.abort();
  }, []);

  // ── Static (FAQ) message handler ──────────────────────────────────────────
  const sendStaticMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isStreaming) return;

      setInputValue("");

      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content: trimmed,
      };

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "",
        streaming: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      // Simulate a short typing delay then show the response
      const response = getStaticResponse(trimmed);
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, content: response, streaming: false }
              : m
          )
        );
        setIsStreaming(false);
        if (!isOpen) setHasUnread(true);
      }, 600);
    },
    [isStreaming, isOpen]
  );

  // ── AI-powered message handler (used when USE_AI = true) ────────────────
  const sendAIMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isStreaming) return;

      setInputValue("");

      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content: trimmed,
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      const assistantId = generateId();
      const assistantPlaceholder: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        streaming: true,
      };
      setMessages((prev) => [...prev, assistantPlaceholder]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const apiMessages = updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            userRole: userRole ?? undefined,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            err?.error?.message ?? "Failed to get a response. Please try again."
          );
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
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: accumulated, streaming: true }
                : m
            )
          );
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: accumulated, streaming: false }
              : m
          )
        );

        if (!isOpen) setHasUnread(true);
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setMessages((prev) =>
            prev.filter((m) => !(m.id === assistantId && m.content === ""))
          );
          return;
        }

        const errorText =
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.";

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: errorText, streaming: false }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
        if (inputRef.current) {
          inputRef.current.style.height = "auto";
        }
      }
    },
    [messages, isStreaming, userRole, isOpen]
  );

  const sendMessage = USE_AI ? sendAIMessage : sendStaticMessage;

  const handleQuickAction = useCallback(
    (action: string) => {
      sendMessage(action);
    },
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

  // Determine if we should show quick action chips
  // Show them only when the only message is the welcome message
  const showQuickActions = messages.length === 1 && messages[0].id === "welcome";

  return (
    <>
      {/* ── Chat window ──────────────────────────────────────────────────── */}
      <div
        className={cn(
          // Positioning & sizing
          "fixed bottom-24 right-4 z-50 flex flex-col",
          "w-[calc(100vw-2rem)] sm:w-[400px]",
          "h-[min(520px,calc(100dvh-8rem))]",
          // Appearance
          "rounded-2xl bg-white shadow-2xl ring-1 ring-black/10",
          // Animation
          "transition-all duration-300 ease-in-out origin-bottom-right",
          isOpen
            ? "scale-100 opacity-100 pointer-events-auto"
            : "scale-90 opacity-0 pointer-events-none"
        )}
        role="dialog"
        aria-label="FreelanceHub AI assistant"
        aria-modal="false"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 rounded-t-2xl bg-brand-800 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none">
                FreelanceHub Assistant
              </p>
              <p className="mt-0.5 text-xs text-brand-300 leading-none">
                {isStreaming ? "Typing..." : "Online"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close chat"
          >
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Quick action chips — shown only at start */}
          {showQuickActions && !isStreaming && (
            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => handleQuickAction(action)}
                  className="rounded-full border border-accent-400 px-3 py-1.5 text-xs font-medium text-accent-700 transition-colors hover:bg-accent-50 hover:border-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          {/* Typing indicator while awaiting first chunk */}
          {isStreaming &&
            messages[messages.length - 1]?.role === "assistant" &&
            messages[messages.length - 1]?.content === "" && (
              <TypingIndicator />
            )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="shrink-0 rounded-b-2xl border-t border-gray-100 px-3 py-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                // Auto-resize
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything… (Enter to send)"
              rows={1}
              disabled={isStreaming}
              className={cn(
                "flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900",
                "placeholder:text-gray-400",
                "focus:border-accent-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent-600",
                "disabled:cursor-not-allowed disabled:opacity-60",
                "transition-colors min-h-[40px] max-h-[120px]"
              )}
              style={{ height: "auto" }}
              aria-label="Chat message input"
            />
            <button
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isStreaming}
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                "bg-brand-800 text-white shadow-sm",
                "transition-all hover:bg-brand-900 active:bg-brand-950",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-gray-400">
            {USE_AI ? "AI-generated answers · May not always be accurate" : "FreelanceHub Help Assistant"}
          </p>
        </div>
      </div>

      {/* ── Floating trigger button ───────────────────────────────────────── */}
      <button
        onClick={isOpen ? handleClose : handleOpen}
        className={cn(
          "fixed bottom-5 right-5 z-50",
          "flex h-14 w-14 items-center justify-center rounded-full",
          "bg-brand-800 text-white shadow-lg",
          "transition-all duration-200 hover:bg-brand-900 hover:scale-105 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
        )}
        aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
        aria-expanded={isOpen}
      >
        {/* Unread indicator dot */}
        {hasUnread && !isOpen && (
          <span
            className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 ring-2 ring-white"
            aria-label="New message"
          />
        )}

        {/* Icon toggle with animation */}
        <span
          className={cn(
            "absolute transition-all duration-200",
            isOpen ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-50 opacity-0"
          )}
          aria-hidden="true"
        >
          <X className="h-6 w-6" />
        </span>
        <span
          className={cn(
            "absolute transition-all duration-200",
            isOpen ? "-rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"
          )}
          aria-hidden="true"
        >
          <MessageCircle className="h-6 w-6" />
        </span>
      </button>
    </>
  );
}
