import MDEditor from "@uiw/react-md-editor";
import { Brain, Send } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

interface NoteInputProps {
  onAddNote: (content: string) => Promise<void>;
  isAnalyzing: boolean;
}

export const NoteInput: React.FC<NoteInputProps> = ({ onAddNote, isAnalyzing }) => {
  const [content, setContent] = useState("");
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isAnalyzing) return;

    await onAddNote(content);
    setContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div data-color-mode={theme}>
            <MDEditor
              value={content}
              onChange={(value) => setContent(value || "")}
              onKeyDown={handleKeyDown}
              textareaProps={{
                placeholder: "Write your thought, idea, task... AI will help you organize it ✨",
                disabled: isAnalyzing,
              }}
              autoFocus
              preview="edit"
            />
          </div>

          <button
            type="submit"
            disabled={!content.trim() || isAnalyzing}
            className="absolute bottom-4 right-4 p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isAnalyzing ? (
              <Brain className="w-5 h-5 animate-pulse" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
          {isAnalyzing ? (
            <span className="flex items-center justify-center gap-2">
              <Brain className="w-4 h-4 animate-pulse" />
              AI is analyzing your note...
            </span>
          ) : (
            "Press Cmd+Enter or click the button to add"
          )}
        </p>
      </form>
    </div>
  );
};
