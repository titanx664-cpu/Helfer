import { useState, useRef, KeyboardEvent } from "react";
import { Mic, MicOff, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { AssistantState } from "@shared/schema";

interface VoiceInputProps {
  state: AssistantState;
  isListening: boolean;
  onSend: (text: string) => void;
  onStartListening: () => void;
  onStopListening: () => void;
  continuousListening: boolean;
}

export function VoiceInput({
  state,
  isListening,
  onSend,
  onStartListening,
  onStopListening,
  continuousListening,
}: VoiceInputProps) {
  const [inputText, setInputText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (inputText.trim()) {
      onSend(inputText.trim());
      setInputText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (value: string) => {
    setInputText(value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const isProcessing = state === "processing";
  const isSpeaking = state === "speaking";

  return (
    <div className="p-4 border-t border-border/50 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto">
        <div 
          className="flex items-end gap-3 p-3 rounded-2xl bg-card/50 border border-border/50 neon-border-cyan"
          style={{
            boxShadow: isListening 
              ? "0 0 30px hsl(var(--neon-cyan) / 0.3)" 
              : undefined
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={isListening ? onStopListening : onStartListening}
            disabled={isProcessing || isSpeaking}
            className={`shrink-0 relative ${
              isListening 
                ? "text-neon-cyan bg-neon-cyan/10" 
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="button-mic"
            aria-label={isListening ? "Stop listening" : "Start listening"}
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5" />
                <span className="absolute inset-0 rounded-md animate-listening-pulse" />
              </>
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </Button>

          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => handleTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening 
                  ? "Listening..." 
                  : isProcessing 
                  ? "Processing..." 
                  : isSpeaking 
                  ? "Speaking..." 
                  : "Type a message or use the mic..."
              }
              disabled={isProcessing || isSpeaking}
              className="min-h-[44px] max-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 font-body text-foreground placeholder:text-muted-foreground"
              rows={1}
              data-testid="input-message"
            />
          </div>

          <Button
            variant="default"
            size="icon"
            onClick={handleSend}
            disabled={!inputText.trim() || isProcessing || isSpeaking}
            className="shrink-0 bg-neon-cyan text-background hover:bg-neon-cyan/90"
            data-testid="button-send"
            aria-label="Send message"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div 
              className={`w-1.5 h-1.5 rounded-full ${
                isListening 
                  ? "bg-neon-cyan animate-pulse" 
                  : "bg-muted-foreground/50"
              }`} 
            />
            <span className="font-mono uppercase tracking-wider">
              {isListening ? "Listening" : continuousListening ? "Continuous mode" : "Push to talk"}
            </span>
          </div>
          {state !== "idle" && (
            <div className="flex items-center gap-1.5">
              <div 
                className={`w-1.5 h-1.5 rounded-full ${
                  state === "processing" 
                    ? "bg-neon-purple animate-pulse" 
                    : state === "speaking" 
                    ? "bg-neon-magenta animate-pulse" 
                    : "bg-muted-foreground/50"
                }`} 
              />
              <span className="font-mono uppercase tracking-wider capitalize">
                {state}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
