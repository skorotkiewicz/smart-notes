import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { aiService } from "../services/ai";
import { configService } from "../services/config";

interface ConnectionStatusProps {
  onOpenConfig: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ onOpenConfig }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [currentProvider, setCurrentProvider] = useState<string>("");

  useEffect(() => {
    checkConnection();

    // Only set up interval for Ollama, not for Gemini
    const aiConfig = configService.getAIConfig();
    if (aiConfig.provider === "ollama") {
      const interval = setInterval(checkConnection, 30000); // Check every 30s
      return () => clearInterval(interval);
    }
  }, []);

  const checkConnection = async () => {
    const aiConfig = configService.getAIConfig();
    const providerName =
      aiConfig.provider === "ollama"
        ? "Ollama"
        : aiConfig.provider === "gemini"
          ? "Gemini"
          : aiConfig.provider === "openai"
            ? "OpenAI"
            : "Unknown";
    setCurrentProvider(providerName);

    const connected = await aiService.testConnection();
    setIsConnected(connected);
  };

  if (isConnected === null) return null;

  return (
    <button
      type="button"
      onClick={onOpenConfig}
      className={`fixed top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md ${
        isConnected
          ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800"
          : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-800"
      }`}
    >
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4" />
          {currentProvider} connected
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          {currentProvider} offline
        </>
      )}
    </button>
  );
};
