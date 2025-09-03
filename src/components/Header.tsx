import { Brain, Sparkles } from "lucide-react";

interface HeaderProps {
  totalNotes: number;
  urgentCount: number;
}

export const Header: React.FC<HeaderProps> = ({ totalNotes, urgentCount }) => {
  return (
    <header className="w-full max-w-4xl mx-auto mb-8 text-center">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Smart Notes
        </h1>
        <Sparkles className="w-6 h-6 text-purple-500" />
      </div>

      <p className="text-gray-600 text-lg mb-6">
        Your intelligent assistant for organizing thoughts and tasks
      </p>

      {totalNotes > 0 && (
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-gray-600">Total: {totalNotes}</span>
          </div>
          {urgentCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-red-600 font-medium">Urgent: {urgentCount}</span>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
