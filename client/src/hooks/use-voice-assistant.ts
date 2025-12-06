import { useState, useEffect, useRef, useCallback } from "react";
import type { Message, Settings, AssistantState, WSMessage } from "@shared/schema";

interface UseVoiceAssistantOptions {
  settings: Settings;
  onMessage: (message: Message) => void;
  onStateChange?: (state: AssistantState) => void;
}

interface UseVoiceAssistantReturn {
  state: AssistantState;
  isConnected: boolean;
  audioData: Uint8Array | null;
  sendMessage: (text: string) => void;
  startListening: () => void;
  stopListening: () => void;
  isListening: boolean;
}

export function useVoiceAssistant({
  settings,
  onMessage,
  onStateChange,
}: UseVoiceAssistantOptions): UseVoiceAssistantReturn {
  const [state, setState] = useState<AssistantState>("idle");
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const wakeWordTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settingsRef = useRef(settings);
  
  // Keep settings ref updated
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const updateState = useCallback((newState: AssistantState) => {
    setState(newState);
    onStateChange?.(newState);
  }, [onStateChange]);

  const playAudio = useCallback(async (audioBase64: string) => {
    try {
      updateState("speaking");
      
      const audioData = atob(audioBase64);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;

      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
      }

      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const updateVisualization = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          setAudioData(new Uint8Array(dataArray));
          animationFrameRef.current = requestAnimationFrame(updateVisualization);
        }
      };
      updateVisualization();

      source.onended = () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        setAudioData(null);
        updateState("idle");
        
        if (settingsRef.current.continuousListening) {
          setTimeout(() => {
            startListening();
          }, 500);
        }
      };

      source.start();
    } catch (error) {
      console.error("Error playing audio:", error);
      updateState("idle");
    }
  }, [updateState]);

  const startListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      console.error("Speech recognition not supported");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      updateState("listening");
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");

      if (event.results[0].isFinal && transcript.trim()) {
        sendMessage(transcript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      updateState("idle");
    };

    recognition.onend = () => {
      setIsListening(false);
      if (state === "listening") {
        updateState("idle");
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [state, updateState]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    updateState("idle");
  }, [updateState]);

  const sendMessage = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket not connected");
      return;
    }

    stopListening();
    updateState("processing");

    const message: WSMessage = {
      type: "user_text",
      text,
    };

    wsRef.current.send(JSON.stringify(message));
  }, [stopListening, updateState]);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      console.warn("Wake phrase detection not available - Speech recognition not supported");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const wakeRecognition = new SpeechRecognition();
    wakeRecognition.continuous = true;
    wakeRecognition.interimResults = true;
    wakeRecognition.lang = "en-US";

    let isActive = true;

    wakeRecognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript.toLowerCase())
        .join(" ");

      if (
        transcript.includes("helfer wake up") ||
        transcript.includes("helper wake up") ||
        transcript.includes("helfer, wake up") ||
        transcript.includes("helper, wake up")
      ) {
        updateState("wake-detected");
        
        if (wakeWordTimeoutRef.current) {
          clearTimeout(wakeWordTimeoutRef.current);
        }

        wakeWordTimeoutRef.current = setTimeout(() => {
          wakeRecognition.stop();
          startListening();
        }, 800);
      }
    };

    wakeRecognition.onerror = (event) => {
      if (event.error !== "aborted" && event.error !== "no-speech") {
        console.error("Wake phrase recognition error:", event.error);
      }
    };

    wakeRecognition.onend = () => {
      if (isActive && state === "idle") {
        try {
          wakeRecognition.start();
        } catch (e) {
          setTimeout(() => {
            if (isActive && state === "idle") {
              try {
                wakeRecognition.start();
              } catch (err) {
                console.error("Failed to restart wake phrase detection");
              }
            }
          }, 1000);
        }
      }
    };

    if (state === "idle") {
      try {
        wakeRecognition.start();
      } catch (e) {
        console.error("Failed to start wake phrase detection");
      }
    }

    return () => {
      isActive = false;
      if (wakeWordTimeoutRef.current) {
        clearTimeout(wakeWordTimeoutRef.current);
      }
      try {
        wakeRecognition.stop();
      } catch (e) {}
    };
  }, [state, startListening, updateState]);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isUnmounted = false;

    const connect = () => {
      if (isUnmounted) return;
      
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        
        const settingsMessage: WSMessage = {
          type: "settings_update",
          settings: settingsRef.current,
        };
        ws.send(JSON.stringify(settingsMessage));
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        
        if (!isUnmounted) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);

          switch (message.type) {
            case "assistant_response":
              const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: message.text,
                timestamp: Date.now(),
              };
              onMessage(assistantMessage);

              if (message.audioBase64) {
                playAudio(message.audioBase64);
              } else {
                updateState("idle");
              }
              break;

            case "state_change":
              updateState(message.state);
              break;

            case "error":
              console.error("Server error:", message.message);
              updateState("idle");
              break;
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      wsRef.current = ws;
    };

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [onMessage, playAudio, updateState]);

  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const settingsMessage: WSMessage = {
        type: "settings_update",
        settings,
      };
      wsRef.current.send(JSON.stringify(settingsMessage));
    }
  }, [settings]);

  return {
    state,
    isConnected,
    audioData,
    sendMessage,
    startListening,
    stopListening,
    isListening,
  };
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
