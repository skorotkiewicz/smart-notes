import type { OllamaConfig, AIConfig } from "../types";

const CONFIG_KEY = "ollama-config";
const AI_CONFIG_KEY = "ai-config";

const DEFAULT_OLLAMA_CONFIG: OllamaConfig = {
  url: "http://localhost:11434",
  model: "llama3.2",
};

const DEFAULT_AI_CONFIG: AIConfig = {
  provider: "ollama",
  ollama: DEFAULT_OLLAMA_CONFIG,
  gemini: { apikey: "", model: "gemini-1.5-flash" }
};

export const configService = {
  getConfig(): OllamaConfig {
    try {
      const stored = localStorage.getItem(CONFIG_KEY);
      if (stored) {
        return { ...DEFAULT_OLLAMA_CONFIG, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error("Error loading config:", error);
    }
    return DEFAULT_OLLAMA_CONFIG;
  },

  saveConfig(config: OllamaConfig): void {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error("Error saving config:", error);
    }
  },

  getAIConfig(): AIConfig {
    try {
      const stored = localStorage.getItem(AI_CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_AI_CONFIG,
          ...parsed,
          ollama: { ...DEFAULT_AI_CONFIG.ollama, ...parsed.ollama },
          gemini: { ...DEFAULT_AI_CONFIG.gemini, ...parsed.gemini }
        };
      }
    } catch (error) {
      console.error("Error loading AI config:", error);
    }
    return DEFAULT_AI_CONFIG;
  },

  saveAIConfig(config: AIConfig): void {
    try {
      localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error("Error saving AI config:", error);
    }
  },
};
