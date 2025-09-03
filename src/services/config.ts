import type { OllamaConfig } from "../types";

const CONFIG_KEY = "ollama-config";

const DEFAULT_CONFIG: OllamaConfig = {
  url: "http://localhost:11434",
  model: "llama3.2",
};

export const configService = {
  getConfig(): OllamaConfig {
    try {
      const stored = localStorage.getItem(CONFIG_KEY);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error("Error loading config:", error);
    }
    return DEFAULT_CONFIG;
  },

  saveConfig(config: OllamaConfig): void {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error("Error saving config:", error);
    }
  },
};
