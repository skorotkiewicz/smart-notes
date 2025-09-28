import { AlertCircle, BookOpen, Clock, Lightbulb, Search, Target } from "lucide-react";
import { useState } from "react";
import type { SmartNote } from "../types";
import { NoteCard } from "./NoteCard";

interface NotesListProps {
  notes: SmartNote[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenDetails: (note: SmartNote) => void;
}

type FilterType = "all" | "urgent" | "upcoming" | "ideas" | "completed";

export const NotesList: React.FC<NotesListProps> = ({
  notes,
  onToggleComplete,
  onDelete,
  onOpenDetails,
}) => {
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const getFilteredNotes = () => {
    switch (filter) {
      case "urgent":
        return notes.filter(
          (n) =>
            !n.completed &&
            (n.aiAnalysis.type === "important" ||
              (n.aiAnalysis.type === "todo" && n.aiAnalysis.priority === "high")),
        );
      case "upcoming":
        return notes.filter(
          (n) =>
            !n.completed &&
            (n.aiAnalysis.type === "reminder" ||
              (n.aiAnalysis.type === "todo" && n.aiAnalysis.priority === "medium")),
        );
      case "ideas":
        return notes.filter((n) => !n.completed && n.aiAnalysis.type === "idea");
      case "completed":
        return notes.filter((n) => n.completed);
      default:
        return notes.filter((n) => !n.completed);
    }
  };

  const filteredNotes = getFilteredNotes().filter((note) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.content.toLowerCase().includes(query) ||
      note.aiAnalysis.summary.toLowerCase().includes(query) ||
      note.aiAnalysis.actionItems?.some((item) => item.toLowerCase().includes(query)) ||
      false
    );
  });

  const filters = [
    {
      key: "all" as FilterType,
      label: "All",
      icon: BookOpen,
      count: notes.filter((n) => !n.completed).length,
    },
    {
      key: "urgent" as FilterType,
      label: "Urgent",
      icon: AlertCircle,
      count: notes.filter(
        (n) =>
          !n.completed &&
          (n.aiAnalysis.type === "important" ||
            (n.aiAnalysis.type === "todo" && n.aiAnalysis.priority === "high")),
      ).length,
    },
    {
      key: "upcoming" as FilterType,
      label: "Upcoming",
      icon: Clock,
      count: notes.filter(
        (n) =>
          !n.completed &&
          (n.aiAnalysis.type === "reminder" ||
            (n.aiAnalysis.type === "todo" && n.aiAnalysis.priority === "medium")),
      ).length,
    },
    {
      key: "ideas" as FilterType,
      label: "Ideas",
      icon: Lightbulb,
      count: notes.filter((n) => !n.completed && n.aiAnalysis.type === "idea").length,
    },
    {
      key: "completed" as FilterType,
      label: "Completed",
      icon: Target,
      count: notes.filter((n) => n.completed).length,
    },
  ];

  if (notes.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-600 mb-2">No notes yet</h3>
        <p className="text-gray-400">Start by adding your first thought above</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search tasks by content, summary, or action items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
        {filters.map(({ key, label, icon: Icon, count }) => (
          <button
            type="button"
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === key
                ? "bg-white text-blue-600 shadow-md"
                : "text-gray-600 hover:text-blue-600 hover:bg-white/50"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {count > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  filter === key ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-600"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">
              {searchQuery.trim()
                ? `No tasks found matching "${searchQuery}"`
                : "No notes in this category"}
            </p>
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onOpenDetails={onOpenDetails}
            />
          ))
        )}
      </div>
    </div>
  );
};
