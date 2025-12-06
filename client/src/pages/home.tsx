import { useState, useRef, useEffect, useCallback } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HelferAvatar } from "@/components/helfer-avatar";
import { ChatMessages } from "@/components/chat-messages";
import { WaveformVisualizer } from "@/components/waveform-visualizer";
import { SettingsPanel } from "@/components/settings-panel";
import { VoiceInput } from "@/components/voice-input";
import { useVoiceAssistant } from "@/hooks/use-voice-assistant";
import type { Message, Settings as SettingsType, AssistantState } from "@shared/schema";

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<SettingsType>({
    voiceGender: "nova",
    voiceSpeed: 1.0,
    continuousListening: false,
  });

  const handleMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleStateChange = useCallback((newState: AssistantState) => {
    console.log("State changed:", newState);
  }, []);

  const {
    state,
    isConnected,
    audioData,
    sendMessage,
    startListening,
    stopListening,
    isListening,
  } = useVoiceAssistant({
    settings,
    onMessage: handleMessage,
    onStateChange: handleStateChange,
  });

  const handleSendText = useCallback((text: string) => {
    if (text.trim()) {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);
      sendMessage(text);
    }
  }, [sendMessage]);

  const handleSettingsChange = useCallback((newSettings: SettingsType) => {
    setSettings(newSettings);
  }, []);

  return (
    <div className="min-h-screen bg-background gradient-mesh flex flex-col">
      <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
              <span className="font-display font-bold text-lg text-background">H</span>
            </div>
            <div className="absolute inset-0 rounded-full bg-neon-cyan/20 animate-pulse-glow" />
          </div>
          <h1 
            className="font-display text-2xl font-bold tracking-wider text-foreground neon-text-cyan"
            data-testid="text-app-title"
          >
            HELFER
          </h1>
          <div className="flex items-center gap-2 ml-4">
            <div 
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-status-online' : 'bg-status-offline'}`}
              data-testid="status-connection"
            />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              {isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSettingsOpen(true)}
          data-testid="button-settings"
          className="text-muted-foreground hover:text-foreground"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <section 
          className="flex-1 lg:w-3/5 flex flex-col min-h-0 border-r border-border/30"
          aria-label="Chat section"
        >
          <ChatMessages messages={messages} />
          <VoiceInput
            state={state}
            isListening={isListening}
            onSend={handleSendText}
            onStartListening={startListening}
            onStopListening={stopListening}
            continuousListening={settings.continuousListening}
          />
        </section>

        <aside 
          className="hidden lg:flex lg:w-2/5 flex-col items-center justify-center p-8 relative"
          aria-label="Helfer avatar section"
        >
          <div className="absolute inset-0 gradient-mesh opacity-50" />
          <div className="relative z-10 flex flex-col items-center gap-8">
            <HelferAvatar state={state} />
            <div className="text-center">
              <p 
                className="font-display text-sm font-medium tracking-widest uppercase text-muted-foreground mb-2"
                data-testid="text-status-label"
              >
                Status
              </p>
              <p 
                className={`font-body text-lg font-medium capitalize ${
                  state === 'idle' ? 'text-muted-foreground' :
                  state === 'listening' ? 'text-neon-cyan neon-text-cyan' :
                  state === 'processing' ? 'text-neon-purple neon-text-purple' :
                  state === 'speaking' ? 'text-neon-magenta neon-text-magenta' :
                  state === 'wake-detected' ? 'text-neon-cyan neon-text-cyan' :
                  'text-foreground'
                }`}
                data-testid="text-status-value"
              >
                {state === 'wake-detected' ? 'Wake Phrase Detected' : state}
              </p>
            </div>
            <WaveformVisualizer audioData={audioData} isActive={state === 'speaking'} />
          </div>
        </aside>
      </main>

      <SettingsPanel
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
}
