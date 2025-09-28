import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  Circle,
  Clock,
  Lightbulb,
  Target,
  Trash2,
} from "lucide-react";
import type { SmartNote } from "../types";

interface NoteCardProps {
  note: SmartNote;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenDetails: (note: SmartNote) => void;
}

const typeIcons = {
  todo: Target,
  reminder: Clock,
  idea: Lightbulb,
  important: AlertCircle,
  note: BookOpen,
};

const typeColors = {
  todo: "bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300",
  reminder:
    "bg-amber-50 dark:bg-amber-900 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300",
  idea: "bg-purple-50 dark:bg-purple-900 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300",
  important:
    "bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300",
  note: "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300",
};

const priorityIndicators = {
  high: "border-l-4 border-l-red-400",
  medium: "border-l-4 border-l-amber-400",
  low: "border-l-4 border-l-green-400",
};

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onToggleComplete,
  onDelete,
  onOpenDetails,
}) => {
  const IconComponent = typeIcons[note.aiAnalysis.type];
  const timeAgo = new Date(note.timestamp).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`p-4 rounded-xl border-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md cursor-pointer ${priorityIndicators[note.aiAnalysis.priority]} ${note.completed ? "opacity-60" : ""}`}
      onClick={() => onOpenDetails(note)}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(note.id);
          }}
          className="mt-1 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          {note.completed ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${typeColors[note.aiAnalysis.type]}`}
            >
              <IconComponent className="w-3 h-3" />
              {note.aiAnalysis.type}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                note.aiAnalysis.priority === "high"
                  ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                  : note.aiAnalysis.priority === "medium"
                    ? "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
                    : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
              }`}
            >
              {note.aiAnalysis.priority}
            </span>
          </div>

          <h3
            className={`font-medium text-gray-900 dark:text-white mb-2 ${note.completed ? "line-through" : ""}`}
          >
            {note.aiAnalysis.summary}
          </h3>

          <p
            className={`text-gray-600 dark:text-gray-300 text-sm mb-3 ${note.completed ? "line-through" : ""}`}
          >
            {note.content}
          </p>

          {note.aiAnalysis.actionItems && note.aiAnalysis.actionItems.length > 0 && (
            <ul className="text-sm text-gray-700 dark:text-gray-300 mb-3 space-y-1">
              {note.aiAnalysis.actionItems.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <span className={note.completed ? "line-through" : ""}>{item}</span>
                </li>
              ))}
            </ul>
          )}

          {note.aiAnalysis.dueContext && (
            <p className="text-xs text-purple-600 dark:text-purple-400 mb-2 font-medium">
              ⏰ {note.aiAnalysis.dueContext}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
              {timeAgo} • {note.aiAnalysis.model}
            </span>
            {note.completed && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note.id);
                }}
                className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
