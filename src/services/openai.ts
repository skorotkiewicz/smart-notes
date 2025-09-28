import type { OllamaResponse, OpenAIConfig, OpenAIResponse } from "../types";
import { extractAndParseJSON } from "../utils/jsonParser";
import { ANALYSIS_PROMPT, ASK_PROMPT } from "../utils/prompts";

export class OpenAIService {
  async generateWithOpenAI(
    prompt: string,
    { apikey, model, baseUrl }: OpenAIConfig,
  ): Promise<string> {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apikey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed: ${response.status} ${response.statusText}`);
    }

    const data: OpenAIResponse = await response.json();
    return data?.choices?.[0]?.message?.content?.trim() || "";
  }

  async analyzeNote(content: string, config: OpenAIConfig): Promise<OllamaResponse> {
    try {
      const response = await this.generateWithOpenAI(ANALYSIS_PROMPT(content), config);
      const analysis = extractAndParseJSON(response);

      return {
        type: analysis.type || "note",
        priority: analysis.priority || "medium",
        summary: analysis.summary || content.substring(0, 50),
        actionItems: analysis.actionItems || [],
        dueContext: analysis.dueContext,
        model: config.model,
      };
    } catch (error) {
      console.error("Error with OpenAI analysis:", error);
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

  async askQuestion(noteContent: string, question: string, config: OpenAIConfig): Promise<string> {
    try {
      const response = await this.generateWithOpenAI(ASK_PROMPT(noteContent, question), config);
      const parsed = extractAndParseJSON(response);
      return parsed.answer || response;
    } catch (error) {
      console.error("Error asking question with OpenAI:", error);
      return "Sorry, I could not process your question at this time.";
    }
  }

  async testConnection(config: OpenAIConfig): Promise<boolean> {
    try {
      // Test with a simple request to check if the API key and base URL work
      const response = await fetch(`${config.baseUrl}/models`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.apikey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getAvailableModels(config: OpenAIConfig): Promise<string[]> {
    try {
      const response = await fetch(`${config.baseUrl}/models`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.apikey}`,
        },
      });

      if (!response.ok) return [];

      const data = await response.json();
      return (
        data.data
          ?.map((model: any) => model.id)
          .filter((id: string) => id.includes("gpt") || id.includes("o1")) || []
      );
    } catch {
      return ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"];
    }
  }
}

export const openaiService = new OpenAIService();
