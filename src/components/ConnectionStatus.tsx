import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";
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
    setCurrentProvider(aiConfig.provider === "ollama" ? "Ollama" : "Gemini");

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
          ? "bg-green-100 text-green-700 border border-green-200 hover:bg-green-200"
          : "bg-red-100 text-red-700 border border-red-200 hover:bg-red-200"
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
