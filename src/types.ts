export interface SmartNote {
  id: string;
  content: string;
  aiAnalysis: {
    type: "todo" | "note" | "reminder" | "idea" | "important";
    priority: "low" | "medium" | "high";
    summary: string;
    actionItems?: string[];
    dueContext?: string;
    model?: string;
  };
  timestamp: number;
  completed?: boolean;
}

export interface OllamaConfig {
  url: string;
  model: string;
}

export interface GeminiConfig {
  apikey: string;
  model: string;
}

export interface OpenAIConfig {
  apikey: string;
  model: string;
  baseUrl: string;
}

export interface AIConfig {
  provider: "ollama" | "gemini" | "openai";
  ollama: OllamaConfig;
  gemini: GeminiConfig;
  openai: OpenAIConfig;
}

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

export interface OllamaResponse {
  type: "todo" | "note" | "reminder" | "idea" | "important";
  priority: "low" | "medium" | "high";
  summary: string;
  actionItems?: string[];
  dueContext?: string;
  model?: string;
}

export interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

export interface OpenAIResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}
