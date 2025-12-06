import { z } from "zod";

export const messageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.number(),
  audioUrl: z.string().optional(),
});

export type Message = z.infer<typeof messageSchema>;

export const settingsSchema = z.object({
  voiceGender: z.enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]),
  voiceSpeed: z.number().min(0.25).max(4.0),
  continuousListening: z.boolean(),
});

export type Settings = z.infer<typeof settingsSchema>;

export const assistantStateSchema = z.enum(["idle", "listening", "processing", "speaking", "wake-detected"]);
export type AssistantState = z.infer<typeof assistantStateSchema>;

export const wsMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("user_audio"),
    audio: z.string(),
  }),
  z.object({
    type: z.literal("user_text"),
    text: z.string(),
  }),
  z.object({
    type: z.literal("assistant_response"),
    text: z.string(),
    audioBase64: z.string().optional(),
  }),
  z.object({
    type: z.literal("state_change"),
    state: assistantStateSchema,
  }),
  z.object({
    type: z.literal("error"),
    message: z.string(),
  }),
  z.object({
    type: z.literal("settings_update"),
    settings: settingsSchema,
  }),
]);

export type WSMessage = z.infer<typeof wsMessageSchema>;

export const users = {
  id: "",
  username: "",
  password: "",
};

export type User = typeof users;
export type InsertUser = Omit<User, "id">;
