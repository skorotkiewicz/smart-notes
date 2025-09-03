import { useState, useEffect } from "react";
import {
  X,
  Brain,
  List,
  Target,
  Package,
  MessageCircle,
  History,
  Edit2,
  Save,
  XCircle,
  Trash2,
} from "lucide-react";
import { get, set } from "idb-keyval";
import MDEditor from "@uiw/react-md-editor";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { SmartNote } from "../types";
import { aiService } from "../services/ai";

interface TaskDetailModalProps {
  note: SmartNote;
  isOpen: boolean;
  onClose: () => void;
  onUpdateNote?: (updatedNote: SmartNote) => void;
}

interface ChatMessage {
  id: string;
  question: string;
  response: string;
  timestamp: number;
}

const predefinedQuestions = [
  {
    label: "Break Down Steps",
    icon: List,
    question: "Break this down into specific, actionable steps.",
  },
  {
    label: "Get Context",
    icon: Brain,
    question: "Provide more context and background information about this.",
  },
  {
    label: "Priority Analysis",
    icon: Target,
    question: "Analyze why this is important and how urgent it really is.",
  },
  {
    label: "Required Resources",
    icon: Package,
    question: "What resources, tools, or information do I need to complete this?",
  },
];

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  note,
  isOpen,
  onClose,
  onUpdateNote,
}) => {
  const [customQuestion, setCustomQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(note?.content || "");

  useEffect(() => {
    if (isOpen && note) {
      loadChatHistory();
      setEditedContent(note.content);
      setIsEditing(false);
    }
  }, [isOpen, note?.id, note?.content]);

  const loadChatHistory = async () => {
    if (!note?.id) return;
    try {
      const history = await get(`chat-history-${note.id}`);
      setChatHistory(history || []);
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const saveChatMessage = async (question: string, response: string) => {
    if (!note?.id) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      question,
      response,
      timestamp: Date.now(),
    };
    const updatedHistory = [...chatHistory, newMessage];
    setChatHistory(updatedHistory);

    try {
      await set(`chat-history-${note.id}`, updatedHistory);
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  };

  const deleteChatMessage = async (messageId: string) => {
    if (!note?.id) return;
    const updatedHistory = chatHistory.filter((msg) => msg.id !== messageId);
    setChatHistory(updatedHistory);

    try {
      await set(`chat-history-${note.id}`, updatedHistory);
    } catch (error) {
      console.error("Error deleting chat message:", error);
    }
  };

  const handleSaveEdit = () => {
    if (onUpdateNote && note && editedContent.trim() !== note.content) {
      const updatedNote: SmartNote = {
        ...note,
        content: editedContent.trim(),
      };
      onUpdateNote(updatedNote);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(note?.content || "");
    setIsEditing(false);
  };

  if (!isOpen || !note) return null;

  const handlePredefinedQuestion = async (question: string) => {
    if (!note?.content) return;
    setIsLoading(true);
    setAiResponse("");
    try {
      const response = await aiService.askQuestion(note.content, question);
      setAiResponse(response);
      await saveChatMessage(question, response);
    } catch (_error) {
      const errorMsg = "Error getting AI response. Please try again.";
      setAiResponse(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || !note?.content) return;

    const question = customQuestion;
    setIsLoading(true);
    setAiResponse("");
    try {
      const response = await aiService.askQuestion(note.content, question);
      setAiResponse(response);
      await saveChatMessage(question, response);
      setCustomQuestion("");
    } catch (_error) {
      const errorMsg = "Error getting AI response. Please try again.";
      setAiResponse(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Task Analysis</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-lg transition-colors ${
                showHistory ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
              }`}
              title="Toggle chat history"
            >
              <History className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setAiResponse("");
                setShowHistory(false);
                onClose();
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Original Note */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">{note.aiAnalysis.summary}</h3>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title={isEditing ? "Cancel edit" : "Edit task"}
              >
                {isEditing ? (
                  <XCircle className="w-4 h-4 text-gray-500" />
                ) : (
                  <Edit2 className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>

            {isEditing ? (
              <div className="mb-4">
                <div data-color-mode="light">
                  <MDEditor
                    value={editedContent}
                    onChange={(value) => setEditedContent(value || "")}
                    preview="edit"
                    height={120}
                    // hideToolbar
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors flex items-center gap-1"
                  >
                    <Save className="w-3 h-3" />
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-600 text-sm mb-4 prose prose-sm max-w-none">
                <Markdown remarkPlugins={[remarkGfm]}>{note.content}</Markdown>
              </div>
            )}

            {/* AI Analysis Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Type:</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {note.aiAnalysis.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Priority:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      note.aiAnalysis.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : note.aiAnalysis.priority === "medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {note.aiAnalysis.priority}
                  </span>
                </div>
              </div>

              {note.aiAnalysis.actionItems && note.aiAnalysis.actionItems.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-2">
                    Action Items:
                  </span>
                  <ul className="space-y-1">
                    {note.aiAnalysis.actionItems.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {note.aiAnalysis.dueContext && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Time Context:</span>
                  <span className="text-sm text-purple-600 ml-2">{note.aiAnalysis.dueContext}</span>
                </div>
              )}
            </div>
          </div>

          {/* Predefined Questions */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Ask AI for more insights:</h4>
            <div className="grid grid-cols-2 gap-3">
              {predefinedQuestions.map(({ label, icon: Icon, question }) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => handlePredefinedQuestion(question)}
                  disabled={isLoading}
                  className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Question */}
          <div className="mb-6">
            <form onSubmit={handleCustomQuestion} className="flex gap-2">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Ask your own question about this note..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!customQuestion.trim() || isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Chat History */}
          {showHistory && chatHistory.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Chat History</h4>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {chatHistory.map((message) => (
                  <div key={message.id} className="border border-gray-200 rounded-lg p-3 group">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700 flex-1">
                        Q: {message.question}
                      </p>
                      <button
                        type="button"
                        onClick={() => deleteChatMessage(message.id)}
                        className="ml-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded transition-all duration-200"
                        title="Delete message"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                    <div className="bg-blue-50 rounded p-2">
                      <div className="text-sm text-blue-800 prose prose-sm max-w-none">
                        <Markdown remarkPlugins={[remarkGfm]}>{message.response}</Markdown>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(message.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Response */}
          {(isLoading || aiResponse) && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className={`w-4 h-4 text-blue-500 ${isLoading ? "animate-pulse" : ""}`} />
                <span className="font-medium text-blue-700">AI Analysis</span>
              </div>
              {isLoading ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <span className="ml-2">Analyzing...</span>
                </div>
              ) : (
                <Markdown remarkPlugins={[remarkGfm]}>{aiResponse}</Markdown>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
