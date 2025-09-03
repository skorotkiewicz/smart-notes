import { useState } from "react";
import { Header } from "./components/Header";
import { NoteInput } from "./components/NoteInput";
import { NotesList } from "./components/NotesList";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { TaskDetailModal } from "./components/TaskDetailModal";
import { ConfigModal } from "./components/ConfigModal";
import { useNotes } from "./hooks/useNotes";
import type { SmartNote } from "./types";

function App() {
  const { notes, isAnalyzing, addNote, updateNote, toggleComplete, deleteNote, getPrioritizedNotes } =
    useNotes();

  const [selectedNote, setSelectedNote] = useState<SmartNote | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configKey, setConfigKey] = useState(0); // Force re-render after config change

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
          <div className="bg-red-500 text-white p-4 rounded-xl shadow-lg">
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
    </div>
  );
}

export default App;
