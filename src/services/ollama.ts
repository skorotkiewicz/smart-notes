import type { OllamaResponse } from "../types";
import { configService } from "./config";
import { ANALYSIS_PROMPT } from "../utils/prompts";

export const ollamaService = {
  async analyzeNote(content: string): Promise<OllamaResponse> {
    const config = configService.getConfig();
    const apiUrl = `${config.url}/api/generate`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: config.model,
          prompt: ANALYSIS_PROMPT(content),
          stream: false,
          format: "json",
        }),
      });

      if (!response.ok) {
        throw new Error("Ollama API request failed");
      }

      const data = await response.json();
      const analysis = JSON.parse(data.response);

      return {
        type: analysis.type || "note",
        priority: analysis.priority || "medium",
        summary: analysis.summary || content.substring(0, 50),
        actionItems: analysis.actionItems || [],
        dueContext: analysis.dueContext,
      };
    } catch (error) {
      console.error("Error analyzing note:", error);
      // Fallback analysis
      return {
        type: "note",
        priority: "medium",
        summary: content.substring(0, 50),
        actionItems: [],
        dueContext: undefined,
      };
    }
  },

  async testConnection(): Promise<boolean> {
    const config = configService.getConfig();
    try {
      const response = await fetch(`${config.url}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  },

  async getAvailableModels(): Promise<string[]> {
    const config = configService.getConfig();
    try {
      const response = await fetch(`${config.url}/api/tags`);
      if (!response.ok) return [];

      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch {
      return [];
    }
  },

  async askQuestion(noteContent: string, question: string): Promise<string> {
    const config = configService.getConfig();
    const apiUrl = `${config.url}/api/generate`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: config.model,
          prompt: `Based on this note: "${noteContent}"\n\nAnswer this question: ${question}\n\nProvide a helpful, concise response.`,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Ollama API request failed");
      }

      const data = await response.json();
      return data.response || "No response available";
    } catch (error) {
      console.error("Error asking question:", error);
      return "Sorry, I could not process your question at this time.";
    }
  },
};
