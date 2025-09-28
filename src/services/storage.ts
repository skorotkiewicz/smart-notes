import { del, get, keys, set } from "idb-keyval";
import type { SmartNote } from "../types";

const NOTES_KEY_PREFIX = "smart-note-";

export const storageService = {
  async saveNote(note: SmartNote): Promise<void> {
    await set(`${NOTES_KEY_PREFIX}${note.id}`, note);
  },

  async getAllNotes(): Promise<SmartNote[]> {
    try {
      const allKeys = await keys();
      const noteKeys = allKeys.filter(
        (key) => typeof key === "string" && key.startsWith(NOTES_KEY_PREFIX),
      );

      const notes = await Promise.all(noteKeys.map((key) => get(key)));

      return notes.filter((note) => note !== undefined).sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("Error loading notes:", error);
      return [];
    }
  },

  async deleteNote(id: string): Promise<void> {
    await del(`${NOTES_KEY_PREFIX}${id}`);
  },

  async updateNote(note: SmartNote): Promise<void> {
    await set(`${NOTES_KEY_PREFIX}${note.id}`, note);
  },
};
