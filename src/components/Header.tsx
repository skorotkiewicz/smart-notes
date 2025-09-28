import { Brain, Moon, Sparkles, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

interface HeaderProps {
  totalNotes: number;
  urgentCount: number;
}

export const Header: React.FC<HeaderProps> = ({ totalNotes, urgentCount }) => {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="w-full max-w-4xl mx-auto mb-8 text-center relative">
      {/* Theme toggle button */}
      <button
        type="button"
        onClick={toggleTheme}
        className="fixed top-4 left-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-md z-40"
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        ) : (
          <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Smart Notes
        </h1>
        <Sparkles className="w-6 h-6 text-purple-500 dark:text-purple-400" />
      </div>

      <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
        Your intelligent assistant for organizing thoughts and tasks
      </p>

      {totalNotes > 0 && (
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-300">Total: {totalNotes}</span>
          </div>
          {urgentCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-red-600 dark:text-red-400 font-medium">
                Urgent: {urgentCount}
              </span>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
