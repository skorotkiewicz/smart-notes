import type { OllamaResponse } from "../types";
import { extractAndParseJSON } from "../utils/jsonParser";
import { ANALYSIS_PROMPT, ASK_PROMPT } from "../utils/prompts";
import { configService } from "./config";
import { geminiService } from "./gemini";
import { ollamaService } from "./ollama";
import { openaiService } from "./openai";

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

    if (aiConfig.provider === "openai") {
      return await openaiService.analyzeNote(content, aiConfig.openai);
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

    if (aiConfig.provider === "openai") {
      return await openaiService.askQuestion(noteContent, question, aiConfig.openai);
    }

    return await ollamaService.askQuestion(noteContent, question);
  },

  async testConnection(): Promise<boolean> {
    const aiConfig = configService.getAIConfig();

    if (aiConfig.provider === "gemini") {
      return await geminiService.testConnection(aiConfig.gemini);
    }

    if (aiConfig.provider === "openai") {
      return await openaiService.testConnection(aiConfig.openai);
    }

    return await ollamaService.testConnection();
  },

  async getAvailableModels(): Promise<string[]> {
    const aiConfig = configService.getAIConfig();

    if (aiConfig.provider === "gemini") {
      // Return predefined Gemini models
      return ["gemini-2.5-flash-lite"];
    }

    if (aiConfig.provider === "openai") {
      return await openaiService.getAvailableModels(aiConfig.openai);
    }

    return await ollamaService.getAvailableModels();
  },
};
