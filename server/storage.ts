import type { Message, Settings } from "@shared/schema";

export interface IStorage {
  getMessages(): Promise<Message[]>;
  addMessage(message: Message): Promise<void>;
  getSettings(): Promise<Settings>;
  updateSettings(settings: Settings): Promise<void>;
}

export class MemStorage implements IStorage {
  private messages: Message[] = [];
  private settings: Settings = {
    voiceGender: "nova",
    voiceSpeed: 1.0,
    continuousListening: false,
  };

  async getMessages(): Promise<Message[]> {
    return [...this.messages];
  }

  async addMessage(message: Message): Promise<void> {
    this.messages.push(message);
  }

  async getSettings(): Promise<Settings> {
    return { ...this.settings };
  }

  async updateSettings(settings: Settings): Promise<void> {
    this.settings = { ...settings };
  }
}

export const storage = new MemStorage();
