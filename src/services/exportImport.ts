import { del, get, keys, set } from "idb-keyval";
import type { SmartNote } from "../types";

const NOTES_KEY_PREFIX = "smart-note-";

export interface ExportData {
  version: string;
  timestamp: number;
  notes: SmartNote[];
  localStorageKeys: string[];
  localStorageData: Record<string, string>;
}

export const exportImportService = {
  async exportData(): Promise<string> {
    try {
      // Export notes from IndexedDB
      const allKeys = await keys();
      const noteKeys = allKeys.filter(
        (key) => typeof key === "string" && key.startsWith(NOTES_KEY_PREFIX),
      );

      const notes = await Promise.all(
        noteKeys.map(async (key) => {
          const note = await get(key);
          return note;
        }),
      );

      // Export localStorage data
      const localStorageKeys = ["ollama-config", "ai-config"];
      const localStorageData: Record<string, string> = {};

      for (const key of localStorageKeys) {
        const value = localStorage.getItem(key);
        if (value !== null) {
          localStorageData[key] = value;
        }
      }

      const exportData: ExportData = {
        version: "1.0",
        timestamp: Date.now(),
        notes: notes.filter((note) => note !== undefined),
        localStorageKeys,
        localStorageData,
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error("Error exporting data:", error);
      throw new Error("Failed to export data");
    }
  },

  async importData(jsonData: string): Promise<void> {
    try {
      const data: ExportData = JSON.parse(jsonData);

      if (!data.version || !data.notes || !data.localStorageData) {
        throw new Error("Invalid export file format");
      }

      console.log(
        `Importing data from version ${data.version} exported at ${new Date(data.timestamp).toISOString()}`,
      );

      // Clear existing notes from IndexedDB
      const allKeys = await keys();
      const noteKeys = allKeys.filter(
        (key) => typeof key === "string" && key.startsWith(NOTES_KEY_PREFIX),
      );

      await Promise.all(noteKeys.map((key) => del(key)));

      // Import notes to IndexedDB
      for (const note of data.notes) {
        if (note?.id) {
          await set(`${NOTES_KEY_PREFIX}${note.id}`, note);
        }
      }

      // Clear existing localStorage configurations
      data.localStorageKeys.forEach((key) => {
        localStorage.removeItem(key);
      });

      // Import localStorage data
      for (const [key, value] of Object.entries(data.localStorageData)) {
        localStorage.setItem(key, value);
      }

      // Refresh config service cache
      // Note: Since configService reads from localStorage directly,
      // it should automatically pick up the new values on next read

      console.log(`Successfully imported ${data.notes.length} notes and configuration`);
    } catch (error) {
      console.error("Error importing data:", error);
      throw new Error("Failed to import data. Please check the file format.");
    }
  },

  async downloadExportFile(): Promise<void> {
    try {
      const exportData = await this.exportData();
      const blob = new Blob([exportData], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `smart-notes-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading export file:", error);
      throw error;
    }
  },

  async uploadImportFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          if (event.target?.result && typeof event.target.result === "string") {
            await this.importData(event.target.result);
            resolve();
          } else {
            throw new Error("Failed to read file content");
          }
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsText(file);
    });
  },
};
