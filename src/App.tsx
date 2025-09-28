import { useEffect, useState } from "react";
import { ConfigModal } from "./components/ConfigModal";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { Header } from "./components/Header";
import { NoteInput } from "./components/NoteInput";
import { NotesList } from "./components/NotesList";
import PWABadge from "./components/PWABadge";
import { TaskDetailModal } from "./components/TaskDetailModal";
import { useNotes } from "./hooks/useNotes";
import type { SmartNote } from "./types";

function App() {
  const {
    notes,
    isAnalyzing,
    addNote,
    updateNote,
    toggleComplete,
    deleteNote,
    getPrioritizedNotes,
  } = useNotes();

  const [selectedNote, setSelectedNote] = useState<SmartNote | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configKey, setConfigKey] = useState(0); // Force re-render after config change

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Comma opens config modal when no modal or note open
      if (selectedNote === null && !isConfigOpen) {
        if (e.ctrlKey && e.key === ",") {
          e.preventDefault();
          setIsConfigOpen(true);
        }
      }
      // Escape closes modals or selected note
      if (e.key === "Escape") {
        if (isConfigOpen) setIsConfigOpen(false);
        if (selectedNote !== null) setSelectedNote(null);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [selectedNote, isConfigOpen]);

  const prioritized = getPrioritizedNotes();
  const urgentCount = prioritized.urgent.length;
  const totalActiveNotes = notes.filter((n) => !n.completed).length;

  const handleOpenDetails = (note: SmartNote) => {
    setSelectedNote(note);
  };

  const handleCloseDetails = () => {
    setSelectedNote(null);
  };

  const handleConfigUpdate = () => {
    setConfigKey((prev) => prev + 1); // Force re-render to update connection status
  };

  const handleUpdateNote = async (updatedNote: SmartNote) => {
    await updateNote(updatedNote);
    setSelectedNote(updatedNote); // Update selected note to reflect changes
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ConnectionStatus key={configKey} onOpenConfig={() => setIsConfigOpen(true)} />
      <div className="container mx-auto px-4 py-8">
        <Header totalNotes={totalActiveNotes} urgentCount={urgentCount} />

        <NoteInput onAddNote={addNote} isAnalyzing={isAnalyzing} />

        <NotesList
          notes={notes}
          onToggleComplete={toggleComplete}
          onDelete={deleteNote}
          onOpenDetails={handleOpenDetails}
        />
      </div>
      {urgentCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80">
          <div className="bg-red-500 dark:bg-red-600 text-white p-4 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="font-medium">You have {urgentCount} urgent tasks!</span>
            </div>
            <div className="space-y-1">
              {prioritized.urgent.slice(0, 2).map((note) => (
                <p key={note.id} className="text-sm opacity-90 truncate">
                  • {note.aiAnalysis.summary}
                </p>
              ))}
              {urgentCount > 2 && (
                <p className="text-xs opacity-75">and {urgentCount - 2} more...</p>
              )}
            </div>
          </div>
        </div>
      )}
      <TaskDetailModal
        // biome-ignore lint/style/noNonNullAssertion: <!>
        note={selectedNote!}
        isOpen={selectedNote !== null}
        onClose={handleCloseDetails}
        onUpdateNote={handleUpdateNote}
      />
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onConfigUpdate={handleConfigUpdate}
      />
      <PWABadge />
    </div>
  );
}

export default App;
