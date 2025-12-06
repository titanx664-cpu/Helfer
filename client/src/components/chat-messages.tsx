import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";
import type { Message } from "@shared/schema";

interface ChatMessagesProps {
  messages: Message[];
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center mb-6 neon-border-cyan">
          <Bot className="w-10 h-10 text-neon-cyan" />
        </div>
        <h2 
          className="font-display text-xl font-semibold text-foreground mb-2 tracking-wide"
          data-testid="text-welcome-title"
        >
          Welcome to Helfer
        </h2>
        <p className="text-muted-foreground max-w-md font-body leading-relaxed">
          Say{" "}
          <span className="text-neon-cyan font-medium neon-text-cyan">
            "Helfer, wake up"
          </span>{" "}
          to activate voice commands, or use the microphone button below to start a conversation.
        </p>
        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider">Listening for wake phrase</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea 
      className="flex-1 p-4"
      ref={scrollRef}
    >
      <div className="space-y-4 max-w-3xl mx-auto" data-testid="container-messages">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex gap-3 animate-fade-in-up ${
              message.role === "user" ? "flex-row-reverse" : ""
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
            data-testid={`message-${message.role}-${message.id}`}
          >
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarFallback
                className={
                  message.role === "user"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 text-neon-cyan"
                }
              >
                {message.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </AvatarFallback>
            </Avatar>

            <div
              className={`flex-1 max-w-[80%] ${
                message.role === "user" ? "flex flex-col items-end" : ""
              }`}
            >
              <div
                className={`rounded-lg px-4 py-3 ${
                  message.role === "user"
                    ? "bg-secondary/80 border-l-2 border-neon-cyan/50"
                    : "bg-card/80 border-l-2 border-neon-purple/50 neon-border-purple"
                }`}
              >
                <p className="text-foreground font-body leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
              <span className="text-xs text-muted-foreground mt-1.5 font-mono">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
