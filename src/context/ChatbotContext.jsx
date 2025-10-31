import { createContext, useState, useCallback, useEffect } from 'react';

const ChatbotContext = createContext(undefined);

export { ChatbotContext };

export function ChatbotProvider({ children }) {
  const [messages, setMessages] = useState([
    {
      id: 'initial-1',
      role: 'assistant',
      content: '👋 Hey there! I\'m AlgoBot, your AI assistant for learning algorithms! I can help you understand how algorithms work, explain complexity analysis, guide you through the AlgoVisualizer platform, and answer any CS questions. What would you like to learn today?',
      timestamp: Date.now(),
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiKey, setApiKeyState] = useState('');

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('VITE_GEMINI_API_KEY');
    if (savedKey) {
      setApiKeyState(savedKey);
      window.GEMINI_API_KEY = savedKey;
    }
  }, []);

  // Generate unique ID with timestamp + random component + counter
  const generateUniqueId = useCallback(() => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const counter = Math.floor(Math.random() * 1000);
    return `msg-${timestamp}-${random}-${counter}`;
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const addMessage = useCallback(
    (role, content) => {
      const newMessage = {
        id: generateUniqueId(),
        role,
        content,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, newMessage]);
    },
    [generateUniqueId]
  );

  const updateLastMessage = useCallback((content) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const updatedMessages = [...prev];
      const lastIndex = updatedMessages.length - 1;
      if (updatedMessages[lastIndex].role === 'assistant') {
        updatedMessages[lastIndex] = {
          ...updatedMessages[lastIndex],
          content,
        };
      }
      return updatedMessages;
    });
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: generateUniqueId(),
        role: 'assistant',
        content: '👋 Chat cleared! I\'m AlgoBot, your AI assistant for learning algorithms. What would you like to learn today?',
        timestamp: Date.now(),
      },
    ]);
    setError(null);
  }, [generateUniqueId]);

  const value = {
    messages,
    isOpen,
    isLoading,
    error,
    apiKey,
    toggleChat,
    addMessage,
    updateLastMessage,
    clearMessages,
    setError,
    setIsLoading,
    setApiKey: setApiKeyState,
  };

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
}
