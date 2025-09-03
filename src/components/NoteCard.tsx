import {
  CheckCircle,
  Circle,
  Trash2,
  Clock,
  Lightbulb,
  AlertCircle,
  BookOpen,
  Target,
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
  todo: "bg-blue-50 border-blue-200 text-blue-700",
  reminder: "bg-amber-50 border-amber-200 text-amber-700",
  idea: "bg-purple-50 border-purple-200 text-purple-700",
  important: "bg-red-50 border-red-200 text-red-700",
  note: "bg-gray-50 border-gray-200 text-gray-700",
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
      className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${priorityIndicators[note.aiAnalysis.priority]} ${note.completed ? "opacity-60" : ""}`}
      onClick={() => onOpenDetails(note)}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(note.id);
          }}
          className="mt-1 text-gray-400 hover:text-blue-500 transition-colors"
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
                  ? "bg-red-100 text-red-700"
                  : note.aiAnalysis.priority === "medium"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-green-100 text-green-700"
              }`}
            >
              {note.aiAnalysis.priority}
            </span>
          </div>

          <h3 className={`font-medium text-gray-900 mb-2 ${note.completed ? "line-through" : ""}`}>
            {note.aiAnalysis.summary}
          </h3>

          <p className={`text-gray-600 text-sm mb-3 ${note.completed ? "line-through" : ""}`}>
            {note.content}
          </p>

          {note.aiAnalysis.actionItems && note.aiAnalysis.actionItems.length > 0 && (
            <ul className="text-sm text-gray-700 mb-3 space-y-1">
              {note.aiAnalysis.actionItems.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <span className={note.completed ? "line-through" : ""}>{item}</span>
                </li>
              ))}
            </ul>
          )}

          {note.aiAnalysis.dueContext && (
            <p className="text-xs text-purple-600 mb-2 font-medium">
              ⏰ {note.aiAnalysis.dueContext}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{timeAgo}</span>
            {note.completed && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note.id);
                }}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
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
