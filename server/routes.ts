import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import OpenAI from "openai";
import type { Settings, WSMessage } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
let openai: OpenAI | null = null;

if (process.env.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) {
  openai = new OpenAI({ apiKey: process.env.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 });
} else {
  console.warn("OPENAI_API_KEY not set - running in demo mode without AI capabilities");
}

const deepseekApiKey = process.env.sk-ae961a7509af4f3c9e745bab64050f5f;
const deepseekBaseUrl = "https://api.deepseek.com";

interface ClientState {
  settings: Settings;
}

const clientStates = new Map<WebSocket, ClientState>();

async function callDeepSeek(prompt: string): Promise<string> {
  if (!deepseekApiKey) {
    console.warn("DeepSeek API key not configured, using OpenAI only");
    return prompt;
  }

  try {
    const response = await fetch(`${deepseekBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${deepseekApiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-reasoner",
        messages: [
          {
            role: "system",
            content: `You are DeepSeek R1, an advanced reasoning AI. Analyze the user's query deeply and provide comprehensive reasoning. Focus on understanding context, implications, and provide thoughtful analysis. Be concise but thorough.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      console.error("DeepSeek API error:", response.status, await response.text());
      return prompt;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || prompt;
  } catch (error) {
    console.error("DeepSeek API call failed:", error);
    return prompt;
  }
}

async function processWithHybridAI(userMessage: string): Promise<string> {
  if (!openai) {
    return `[Demo Mode] I received your message: "${userMessage}". To enable AI responses, please configure the OPENAI_API_KEY environment variable.`;
  }

  const deepseekAnalysis = await callDeepSeek(userMessage);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are Helfer, a helpful AI voice assistant. You receive analysis from DeepSeek R1 reasoning model and refine it into a clear, conversational response.

Guidelines:
- Be helpful, friendly, and conversational
- Keep responses concise and suitable for voice output (1-3 sentences when possible)
- If the DeepSeek analysis is just the original question (no additional reasoning), respond directly to the user's question
- Format responses for natural speech - avoid bullet points, markdown, or complex formatting
- Be warm and engaging while remaining professional`,
        },
        {
          role: "user",
          content: deepseekApiKey
            ? `Original user query: "${userMessage}"

DeepSeek R1 Analysis:
${deepseekAnalysis}

Please provide a refined, conversational response.`
            : userMessage,
        },
      ],
      max_completion_tokens: 1024,
    });

    return response.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to process with AI");
  }
}

async function generateSpeech(text: string, settings: Settings): Promise<Buffer | null> {
  if (!openai) {
    return null;
  }

  try {
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: settings.voiceGender,
      input: text,
      speed: settings.voiceSpeed,
    });

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("TTS generation error:", error);
    return null;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    console.log("New WebSocket connection");

    clientStates.set(ws, {
      settings: {
        voiceGender: "nova",
        voiceSpeed: 1.0,
        continuousListening: false,
      },
    });

    ws.on("message", async (data: Buffer) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());
        const clientState = clientStates.get(ws);

        if (!clientState) {
          console.error("No client state found");
          return;
        }

        switch (message.type) {
          case "settings_update":
            clientState.settings = message.settings;
            console.log("Settings updated:", message.settings);
            break;

          case "user_text":
            console.log("Received user text:", message.text);

            const stateMessage: WSMessage = {
              type: "state_change",
              state: "processing",
            };
            ws.send(JSON.stringify(stateMessage));

            try {
              const responseText = await processWithHybridAI(message.text);

              let audioBase64: string | undefined;
              
              const audioBuffer = await generateSpeech(responseText, clientState.settings);
              if (audioBuffer) {
                audioBase64 = audioBuffer.toString("base64");
              }

              const response: WSMessage = {
                type: "assistant_response",
                text: responseText,
                audioBase64,
              };

              ws.send(JSON.stringify(response));
            } catch (error) {
              console.error("Processing error:", error);
              const errorMessage: WSMessage = {
                type: "error",
                message: error instanceof Error ? error.message : "An error occurred",
              };
              ws.send(JSON.stringify(errorMessage));
            }
            break;

          case "user_audio":
            console.log("Received user audio - transcription would happen here");
            break;

          default:
            console.log("Unknown message type");
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        const errorMessage: WSMessage = {
          type: "error",
          message: "Failed to process message",
        };
        ws.send(JSON.stringify(errorMessage));
      }
    });

    ws.on("close", () => {
      console.log("WebSocket connection closed");
      clientStates.delete(ws);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      clientStates.delete(ws);
    });
  });

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      openai: !!process.env.OPENAI_API_KEY,
      deepseek: !!process.env.DEEPSEEK_API_KEY,
    });
  });

  return httpServer;
}
