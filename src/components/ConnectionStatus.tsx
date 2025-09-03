import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { ollamaService } from "../services/ollama";

interface ConnectionStatusProps {
  onOpenConfig: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ onOpenConfig }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    const connected = await ollamaService.testConnection();
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
          Ollama connected
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          Ollama offline
        </>
      )}
    </button>
  );
};
