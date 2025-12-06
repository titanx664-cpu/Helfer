import { useEffect, useState } from "react";
import type { AssistantState } from "@shared/schema";

interface HelferAvatarProps {
  state: AssistantState;
}

export function HelferAvatar({ state }: HelferAvatarProps) {
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    if (state === "wake-detected") {
      setShowPulse(true);
      const timer = setTimeout(() => setShowPulse(false), 800);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <div 
      className="relative w-60 h-60 flex items-center justify-center"
      data-testid="avatar-helfer"
      role="img"
      aria-label={`Helfer is ${state}`}
    >
      {showPulse && (
        <div className="absolute inset-0 rounded-full border-2 border-neon-cyan animate-pulse-ring" />
      )}

      <div
        className={`absolute inset-4 rounded-full border border-neon-cyan/30 transition-all duration-500 ${
          state === "idle" ? "animate-breathe opacity-40" : ""
        } ${state === "listening" ? "animate-rotate-slow opacity-70" : ""} ${
          state === "processing" ? "animate-rotate-slow opacity-80" : ""
        } ${state === "speaking" ? "opacity-90" : ""}`}
        style={{
          boxShadow:
            state !== "idle"
              ? "0 0 20px hsl(var(--neon-cyan) / 0.3), inset 0 0 20px hsl(var(--neon-cyan) / 0.1)"
              : undefined,
        }}
      />

      <div
        className={`absolute inset-10 rounded-full border transition-all duration-500 ${
          state === "listening"
            ? "border-neon-blue/50 animate-rotate-reverse"
            : state === "processing"
            ? "border-neon-purple/60 animate-rotate-reverse"
            : state === "speaking"
            ? "border-neon-magenta/50 animate-rotate-slow"
            : "border-transparent"
        }`}
        style={{
          boxShadow:
            state === "processing"
              ? "0 0 15px hsl(var(--neon-purple) / 0.4)"
              : state === "speaking"
              ? "0 0 15px hsl(var(--neon-magenta) / 0.4)"
              : undefined,
        }}
      />

      <div
        className={`absolute inset-16 rounded-full border transition-all duration-500 ${
          state === "processing"
            ? "border-neon-magenta/40 animate-rotate-slow"
            : state === "speaking"
            ? "border-neon-purple/40 animate-rotate-reverse"
            : "border-transparent"
        }`}
      />

      <div
        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
          state === "idle"
            ? "bg-gradient-to-br from-muted/50 to-muted/30"
            : state === "listening"
            ? "bg-gradient-to-br from-neon-cyan/20 to-neon-blue/10"
            : state === "processing"
            ? "bg-gradient-to-br from-neon-purple/20 to-neon-magenta/10"
            : state === "speaking"
            ? "bg-gradient-to-br from-neon-magenta/20 to-neon-purple/10"
            : state === "wake-detected"
            ? "bg-gradient-to-br from-neon-cyan/30 to-neon-cyan/10"
            : "bg-muted/30"
        }`}
        style={{
          boxShadow:
            state === "listening"
              ? "0 0 40px hsl(var(--neon-cyan) / 0.5), inset 0 0 30px hsl(var(--neon-cyan) / 0.2)"
              : state === "processing"
              ? "0 0 40px hsl(var(--neon-purple) / 0.5), inset 0 0 30px hsl(var(--neon-purple) / 0.2)"
              : state === "speaking"
              ? "0 0 40px hsl(var(--neon-magenta) / 0.5), inset 0 0 30px hsl(var(--neon-magenta) / 0.2)"
              : state === "wake-detected"
              ? "0 0 60px hsl(var(--neon-cyan) / 0.7), inset 0 0 40px hsl(var(--neon-cyan) / 0.3)"
              : undefined,
        }}
      >
        <span
          className={`font-display text-4xl font-bold transition-all duration-300 ${
            state === "idle"
              ? "text-muted-foreground"
              : state === "listening"
              ? "text-neon-cyan"
              : state === "processing"
              ? "text-neon-purple"
              : state === "speaking"
              ? "text-neon-magenta"
              : state === "wake-detected"
              ? "text-neon-cyan"
              : "text-foreground"
          }`}
          style={{
            textShadow:
              state !== "idle"
                ? state === "listening" || state === "wake-detected"
                  ? "0 0 20px hsl(var(--neon-cyan))"
                  : state === "processing"
                  ? "0 0 20px hsl(var(--neon-purple))"
                  : "0 0 20px hsl(var(--neon-magenta))"
                : undefined,
          }}
        >
          H
        </span>
      </div>

      {state === "listening" && (
        <div className="absolute inset-0 rounded-full animate-listening-pulse" />
      )}

      {state === "speaking" && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end gap-1 h-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-neon-magenta rounded-full animate-speaking-wave"
              style={{
                animationDelay: `${i * 0.1}s`,
                height: "100%",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
