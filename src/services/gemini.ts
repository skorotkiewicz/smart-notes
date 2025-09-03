import type { GeminiConfig, GeminiResponse } from "../types";

export class GeminiService {
  async generateWithGemini(
    prompt: string,
    { apikey, model }: GeminiConfig,
  ): Promise<string> {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apikey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );
    const data: GeminiResponse = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().replace(/\s+/g, " ") || "";
  }

  async testConnection(config: GeminiConfig): Promise<boolean> {
    try {
      const response = await this.generateWithGemini("Test", config);
      return response.length > 0;
    } catch (error) {
      console.error("Gemini connection test failed:", error);
      return false;
    }
  }
}

export const geminiService = new GeminiService();