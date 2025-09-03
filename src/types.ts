export interface SmartNote {
  id: string;
  content: string;
  aiAnalysis: {
    type: "todo" | "note" | "reminder" | "idea" | "important";
    priority: "low" | "medium" | "high";
    summary: string;
    actionItems?: string[];
    dueContext?: string;
  };
  timestamp: number;
  completed?: boolean;
}

export interface OllamaConfig {
  url: string;
  model: string;
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
}
