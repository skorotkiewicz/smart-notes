import { useState, useEffect } from "react";
import { X, Settings, Wifi, RefreshCw } from "lucide-react";
import type { AIConfig } from "../types";
import { configService } from "../services/config";
import { aiService } from "../services/ai";

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
      // Test Gemini connection would be implemented here
      setTestStatus("success"); // For now, assume success
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

  const handleProviderChange = (provider: "ollama" | "gemini") => {
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
    } else {
      setAiConfig((prev) => ({
        ...prev,
        gemini: { ...prev.gemini, model },
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">AI Configuration</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">AI Provider</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleProviderChange("ollama")}
                className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                  aiConfig.provider === "ollama"
                    ? "bg-blue-100 border-blue-300 text-blue-700"
                    : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Ollama
              </button>
              <button
                type="button"
                onClick={() => handleProviderChange("gemini")}
                className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                  aiConfig.provider === "gemini"
                    ? "bg-blue-100 border-blue-300 text-blue-700"
                    : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Google Gemini
              </button>
            </div>
          </div>

          {aiConfig.provider === "ollama" && (
            <>
              {/* Ollama URL Configuration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ollama API URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiConfig.ollama.url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="http://localhost:11434"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={testConnection}
                    disabled={testStatus === "testing"}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                      testStatus === "success"
                        ? "bg-green-100 text-green-700"
                        : testStatus === "error"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                  <p className="text-sm text-green-600 mt-1">✓ Connection successful</p>
                )}
                {testStatus === "error" && (
                  <p className="text-sm text-red-600 mt-1">✗ Connection failed</p>
                )}
              </div>
            </>
          )}

          {aiConfig.provider === "gemini" && (
            <>
              {/* Gemini API Key Configuration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <input
                  type="password"
                  value={aiConfig.gemini.apikey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder="Enter your Google Gemini API key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                />
              </div>
            </>
          )}

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
            {aiConfig.provider === "ollama" ? (
              <div className="flex gap-2">
                <select
                  value={aiConfig.ollama.model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
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
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingModels ? "animate-spin" : ""}`} />
                </button>
              </div>
            ) : (
              <select
                value={aiConfig.gemini.model}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              >
                <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                <option value="gemini-1.5-pro">gemini-2.5-flash</option>
              </select>
            )}
            {aiConfig.provider === "ollama" && isLoadingModels && (
              <p className="text-sm text-gray-500 mt-1">Loading available models...</p>
            )}
            {aiConfig.provider === "ollama" &&
              availableModels.length === 0 &&
              !isLoadingModels &&
              testStatus === "success" && (
                <p className="text-sm text-amber-600 mt-1">
                  No models found. Make sure Ollama has models installed.
                </p>
              )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
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
      </div>
    </div>
  );
};
