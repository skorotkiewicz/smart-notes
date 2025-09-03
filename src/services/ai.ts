import type { OllamaResponse } from "../types";
import { configService } from "./config";
import { ollamaService } from "./ollama";
import { geminiService } from "./gemini";
import { ANALYSIS_PROMPT, ASK_PROMPT } from "../utils/prompts";
import { extractAndParseJSON } from "../utils/jsonParser";

export const aiService = {
  async analyzeNote(content: string): Promise<OllamaResponse> {
    const aiConfig = configService.getAIConfig();

    if (aiConfig.provider === "gemini") {
      try {
        const response = await geminiService.generateWithGemini(
          ANALYSIS_PROMPT(content),
          aiConfig.gemini,
        );
        const analysis = extractAndParseJSON(response);

        return {
          type: analysis.type || "note",
          priority: analysis.priority || "medium",
          summary: analysis.summary || content.substring(0, 50),
          actionItems: analysis.actionItems || [],
          dueContext: analysis.dueContext,
          model: aiConfig.gemini.model,
        };
      } catch (error) {
        console.error("Error with Gemini analysis:", error);
        // Fallback analysis
        return {
          type: "note",
          priority: "medium",
          summary: content.substring(0, 50),
          actionItems: [],
          dueContext: undefined,
          model: "unknown",
        };
      }
    }

    return await ollamaService.analyzeNote(content);
  },

  async askQuestion(noteContent: string, question: string): Promise<string> {
    const aiConfig = configService.getAIConfig();

    if (aiConfig.provider === "gemini") {
      const response = await geminiService.generateWithGemini(
        ASK_PROMPT(noteContent, question),
        aiConfig.gemini,
      );
      const parsed = extractAndParseJSON(response);
      return parsed.answer || response;
    }

    return await ollamaService.askQuestion(noteContent, question);
  },

  async testConnection(): Promise<boolean> {
    const aiConfig = configService.getAIConfig();

    if (aiConfig.provider === "gemini") {
      return await geminiService.testConnection(aiConfig.gemini);
    }

    return await ollamaService.testConnection();
  },

  async getAvailableModels(): Promise<string[]> {
    const aiConfig = configService.getAIConfig();

    if (aiConfig.provider === "gemini") {
      // Return predefined Gemini models
      return ["gemini-1.5-flash", "gemini-2.5-flash"];
    }

    return await ollamaService.getAvailableModels();
  },
};
