import { Download, RefreshCw, Settings, Upload, Wifi, X } from "lucide-react";
import { useEffect, useState } from "react";
import { aiService } from "../services/ai";
import { configService } from "../services/config";
import { exportImportService } from "../services/exportImport";
import type { AIConfig } from "../types";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdate: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, onConfigUpdate }) => {
  const [aiConfig, setAiConfig] = useState<AIConfig>(configService.getAIConfig());
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAiConfig(configService.getAIConfig());
      loadModels();
    }
  }, [isOpen]);

  const loadModels = async () => {
    setIsLoadingModels(true);
    try {
      const models = await aiService.getAvailableModels();
      setAvailableModels(models);
    } catch (error) {
      console.error("Error loading models:", error);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const testConnection = async () => {
    setTestStatus("testing");

    if (aiConfig.provider === "ollama") {
      // Temporarily save config for testing
      const originalConfig = configService.getConfig();
      configService.saveConfig(aiConfig.ollama);

      try {
        const isConnected = await aiService.testConnection();
        setTestStatus(isConnected ? "success" : "error");

        if (isConnected) {
          await loadModels();
        } else {
          // Restore original config if test failed
          configService.saveConfig(originalConfig);
        }
      } catch (_error) {
        setTestStatus("error");
        configService.saveConfig(originalConfig);
      }
    } else {
      // Test Gemini/OpenAI connection
      try {
        const isConnected = await aiService.testConnection();
        setTestStatus(isConnected ? "success" : "error");
        if (isConnected) {
          await loadModels();
        }
      } catch (_error) {
        setTestStatus("error");
      }
    }
  };

  const handleSave = () => {
    configService.saveAIConfig(aiConfig);
    // Also save ollama config for backward compatibility
    if (aiConfig.provider === "ollama") {
      configService.saveConfig(aiConfig.ollama);
    }
    onConfigUpdate();
    onClose();
  };

  const handleProviderChange = (provider: "ollama" | "gemini" | "openai") => {
    setAiConfig((prev) => ({ ...prev, provider }));
    setTestStatus("idle");
  };

  const handleUrlChange = (url: string) => {
    setAiConfig((prev) => ({
      ...prev,
      ollama: { ...prev.ollama, url },
    }));
    setTestStatus("idle");
  };

  const handleModelChange = (model: string) => {
    if (aiConfig.provider === "ollama") {
      setAiConfig((prev) => ({
        ...prev,
        ollama: { ...prev.ollama, model },
      }));
    } else if (aiConfig.provider === "gemini") {
      setAiConfig((prev) => ({
        ...prev,
        gemini: { ...prev.gemini, model },
      }));
    } else if (aiConfig.provider === "openai") {
      setAiConfig((prev) => ({
        ...prev,
        openai: { ...prev.openai, model },
      }));
    }
  };

  const handleApiKeyChange = (apikey: string) => {
    setAiConfig((prev) => ({
      ...prev,
      gemini: { ...prev.gemini, apikey },
    }));
    setTestStatus("idle");
  };

  const handleOpenAIApiKeyChange = (apikey: string) => {
    setAiConfig((prev) => ({
      ...prev,
      openai: { ...prev.openai, apikey },
    }));
    setTestStatus("idle");
  };

  const handleOpenAIBaseUrlChange = (baseUrl: string) => {
    setAiConfig((prev) => ({
      ...prev,
      openai: { ...prev.openai, baseUrl },
    }));
    setTestStatus("idle");
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await exportImportService.downloadExportFile();
      alert("Data exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      alert("Please select a valid JSON file");
      return;
    }

    setIsImporting(true);
    try {
      await exportImportService.uploadImportFile(file);
      alert("Data imported successfully! The page will reload to apply changes.");
      window.location.reload();
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to import data. Please check the file format.");
    } finally {
      setIsImporting(false);
      // Reset the file input
      event.target.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              AI Configuration
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AI Provider
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleProviderChange("ollama")}
                className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                  aiConfig.provider === "ollama"
                    ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                    : "bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                Ollama
              </button>
              <button
                type="button"
                onClick={() => handleProviderChange("gemini")}
                className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                  aiConfig.provider === "gemini"
                    ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                    : "bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                Google Gemini
              </button>
              <button
                type="button"
                onClick={() => handleProviderChange("openai")}
                className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                  aiConfig.provider === "openai"
                    ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                    : "bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                OpenAI
              </button>
            </div>
          </div>

          {aiConfig.provider === "ollama" && (
            <>
              {/* Ollama URL Configuration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ollama API URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiConfig.ollama.url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="http://localhost:11434"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={testConnection}
                    disabled={testStatus === "testing"}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                      testStatus === "success"
                        ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                        : testStatus === "error"
                          ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                          : "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500"
                    }`}
                  >
                    {testStatus === "testing" ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wifi className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {testStatus === "success" && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    ✓ Connection successful
                  </p>
                )}
                {testStatus === "error" && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">✗ Connection failed</p>
                )}
              </div>
            </>
          )}

          {aiConfig.provider === "gemini" && (
            <>
              {/* Gemini API Key Configuration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={aiConfig.gemini.apikey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder="Enter your Google Gemini API key"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                />
              </div>
            </>
          )}

          {aiConfig.provider === "openai" && (
            <>
              {/* OpenAI Base URL Configuration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  OpenAI API Base URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiConfig.openai.baseUrl}
                    onChange={(e) => handleOpenAIBaseUrlChange(e.target.value)}
                    placeholder="https://api.openai.com/v1"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={testConnection}
                    disabled={testStatus === "testing"}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                      testStatus === "success"
                        ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                        : testStatus === "error"
                          ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                          : "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500"
                    }`}
                  >
                    {testStatus === "testing" ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wifi className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {testStatus === "success" && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    ✓ Connection successful
                  </p>
                )}
                {testStatus === "error" && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">✗ Connection failed</p>
                )}
              </div>

              {/* OpenAI API Key Configuration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={aiConfig.openai.apikey}
                  onChange={(e) => handleOpenAIApiKeyChange(e.target.value)}
                  placeholder="Enter your OpenAI API key"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                />
              </div>
            </>
          )}

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Model
            </label>
            {aiConfig.provider === "ollama" ? (
              <div className="flex gap-2">
                <select
                  value={aiConfig.ollama.model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  disabled={isLoadingModels}
                >
                  <option value={aiConfig.ollama.model}>{aiConfig.ollama.model}</option>
                  {availableModels
                    .filter((model) => model !== aiConfig.ollama.model)
                    .map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={loadModels}
                  disabled={isLoadingModels}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingModels ? "animate-spin" : ""}`} />
                </button>
              </div>
            ) : aiConfig.provider === "gemini" ? (
              <select
                value={aiConfig.gemini.model}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              >
                <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <select
                  value={aiConfig.openai.model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  disabled={isLoadingModels}
                >
                  <option value={aiConfig.openai.model}>{aiConfig.openai.model}</option>
                  {availableModels
                    .filter((model) => model !== aiConfig.openai.model)
                    .map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={loadModels}
                  disabled={isLoadingModels}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingModels ? "animate-spin" : ""}`} />
                </button>
              </div>
            )}
            {(aiConfig.provider === "ollama" || aiConfig.provider === "openai") &&
              isLoadingModels && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Loading available models...
                </p>
              )}
            {aiConfig.provider === "ollama" &&
              availableModels.length === 0 &&
              !isLoadingModels &&
              testStatus === "success" && (
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                  No models found. Make sure Ollama has models installed.
                </p>
              )}
            {aiConfig.provider === "openai" &&
              availableModels.length === 0 &&
              !isLoadingModels &&
              testStatus === "success" && (
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                  No models found. Make sure your OpenAI API key is valid.
                </p>
              )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            Data Management
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleExportData}
              disabled={isExporting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              {isExporting ? "Exporting..." : "Export Data"}
            </button>

            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              {isImporting ? "Importing..." : "Import Data"}
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                disabled={isImporting}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Export creates a JSON file with all your notes and settings. Import will replace your
            current data.
          </p>

          <p className="py-2 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400">
            <a
              href="https://github.com/skorotkiewicz/smart-notes"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub Repo"
            >
              build {import.meta.env.VITE_APP_VERSION}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
