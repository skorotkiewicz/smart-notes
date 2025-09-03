import type { GeminiConfig, GeminiResponse } from "../types";

export class GeminiService {
  async generateWithGemini(prompt: string, { apikey, model }: GeminiConfig): Promise<string> {
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
    // For Gemini, just check if API key is provided
    // We don't want to spam the API with test requests
    return config.apikey.length > 0;
  }
}

export const geminiService = new GeminiService();
