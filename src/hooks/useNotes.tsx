import { useState, useEffect } from "react";
import type { SmartNote } from "../types";
import { storageService } from "../services/storage";
import { ollamaService } from "../services/ollama";

export const useNotes = () => {
  const [notes, setNotes] = useState<SmartNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const savedNotes = await storageService.getAllNotes();
      setNotes(savedNotes);
    } catch (error) {
      console.error("Error loading notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addNote = async (content: string) => {
    if (!content.trim()) return;

    setIsAnalyzing(true);
    try {
      const aiAnalysis = await ollamaService.analyzeNote(content);

      const newNote: SmartNote = {
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: content.trim(),
        aiAnalysis,
        timestamp: Date.now(),
        completed: false,
      };

      await storageService.saveNote(newNote);
      setNotes((prev) => [newNote, ...prev]);
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleComplete = async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    const updatedNote = { ...note, completed: !note.completed };
    await storageService.updateNote(updatedNote);
    setNotes((prev) => prev.map((n) => (n.id === id ? updatedNote : n)));
  };

  const deleteNote = async (id: string) => {
    await storageService.deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const getPrioritizedNotes = () => {
    const incomplete = notes.filter((n) => !n.completed);
    const todos = incomplete.filter((n) => n.aiAnalysis.type === "todo");
    const reminders = incomplete.filter((n) => n.aiAnalysis.type === "reminder");
    const important = incomplete.filter((n) => n.aiAnalysis.type === "important");

    return {
      urgent: [...important, ...todos.filter((n) => n.aiAnalysis.priority === "high")],
      upcoming: [...reminders, ...todos.filter((n) => n.aiAnalysis.priority === "medium")],
      later: todos.filter((n) => n.aiAnalysis.priority === "low"),
      ideas: incomplete.filter((n) => n.aiAnalysis.type === "idea"),
      general: incomplete.filter((n) => n.aiAnalysis.type === "note"),
    };
  };

  return {
    notes,
    isLoading,
    isAnalyzing,
    addNote,
    toggleComplete,
    deleteNote,
    getPrioritizedNotes,
    refresh: loadNotes,
  };
};
