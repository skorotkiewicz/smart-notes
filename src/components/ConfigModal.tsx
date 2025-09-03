import { useState, useEffect } from "react";
import { X, Settings, Wifi, RefreshCw } from "lucide-react";
import type { OllamaConfig } from "../types";
import { configService } from "../services/config";
import { ollamaService } from "../services/ollama";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdate: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, onConfigUpdate }) => {
  const [config, setConfig] = useState<OllamaConfig>(configService.getConfig());
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");

  useEffect(() => {
    if (isOpen) {
      loadModels();
    }
  }, [isOpen]);

  const loadModels = async () => {
    setIsLoadingModels(true);
    try {
      const models = await ollamaService.getAvailableModels();
      setAvailableModels(models);
    } catch (error) {
      console.error("Error loading models:", error);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const testConnection = async () => {
    setTestStatus("testing");

    // Temporarily save config for testing
    const originalConfig = configService.getConfig();
    configService.saveConfig(config);

    try {
      const isConnected = await ollamaService.testConnection();
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
  };

  const handleSave = () => {
    configService.saveConfig(config);
    onConfigUpdate();
    onClose();
  };

  const handleUrlChange = (url: string) => {
    setConfig((prev) => ({ ...prev, url }));
    setTestStatus("idle");
  };

  const handleModelChange = (model: string) => {
    setConfig((prev) => ({ ...prev, model }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Ollama Configuration</h2>
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
          {/* URL Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ollama API URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={config.url}
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

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
            <div className="flex gap-2">
              <select
                value={config.model}
                onChange={(e) => handleModelChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                disabled={isLoadingModels}
              >
                <option value={config.model}>{config.model}</option>
                {availableModels
                  .filter((model) => model !== config.model)
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
            {isLoadingModels && (
              <p className="text-sm text-gray-500 mt-1">Loading available models...</p>
            )}
            {availableModels.length === 0 && !isLoadingModels && testStatus === "success" && (
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
