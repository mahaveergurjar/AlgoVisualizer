import { useState, useRef, useEffect } from 'react';
import { useChatbot } from '../hooks/useChatbot';
import { MessageCircle, X, Send, Maximize2, Minimize2, AlertCircle, Loader, Settings } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export default function ChatbotWidget() {
  const {
    messages,
    isOpen,
    toggleChat,
    addMessage,
    updateLastMessage,
    isLoading,
    setIsLoading,
    error,
    setError,
  } = useChatbot();
  
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatSessionRef = useRef(null);

  // Initialize LLM on mount
  useEffect(() => {
    const apiKey = localStorage.getItem('VITE_GEMINI_API_KEY');
    if (apiKey) {
      try {
        chatSessionRef.current = new ChatGoogleGenerativeAI({
          apiKey,
          model: 'gemini-2.0-flash',
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.95,
        });
      } catch (err) {
        console.error('Failed to initialize LLM:', err);
      }
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message
    const userMessage = input.trim();
    addMessage('user', userMessage);
    setInput('');
    setIsLoading(true);
    setError(null);

    // Create placeholder message for streaming
    addMessage('assistant', '');

    try {
      // Check if LLM is initialized
      if (!chatSessionRef.current) {
        const apiKey = localStorage.getItem('VITE_GEMINI_API_KEY');
        
        if (!apiKey) {
          setError('❌ API key not configured. Click ⚙️ Settings to add your Gemini API key.');
          setIsLoading(false);
          return;
        }

        // Initialize LLM if not already done
        try {
          chatSessionRef.current = new ChatGoogleGenerativeAI({
            apiKey,
            model: 'gemini-2.0-flash',
            temperature: 0.7,
            maxOutputTokens: 2048,
            topP: 0.95,
          });
        } catch {
          throw new Error('Failed to initialize LLM with provided API key');
        }
      }

      // Create system prompt to constrain responses to AlgoVisualizer
      const systemPrompt = `You are AlgoBot, an AI assistant specialized in helping users with the AlgoVisualizer platform and learning algorithms and data structures. 

Your role is to:
1. Help users understand algorithms (sorting, searching, graph algorithms, dynamic programming, etc.)
2. Explain data structures (arrays, linked lists, trees, graphs, etc.)
3. Guide users through using the AlgoVisualizer platform and its features
4. Explain time and space complexity (Big-O notation)
5. Help with algorithm problem-solving and interview preparation
6. Provide code explanations and optimization tips

IMPORTANT: Only answer questions related to:
- Algorithms and data structures
- The AlgoVisualizer platform and its features
- Computer science and programming concepts
- Algorithm complexity analysis
- Interview preparation and coding problems

If someone asks you something NOT related to these topics (like general AI, unrelated topics, etc.), politely redirect them by saying:
"I'm specialized in helping with algorithms, data structures, and the AlgoVisualizer platform. I can help you understand sorting algorithms, search algorithms, dynamic programming, and more! What algorithm or data structure would you like to learn about? 🚀"

Keep your responses:
- Clear and concise
- Educational and beginner-friendly
- With code examples when helpful (use markdown code blocks)
- Focused on practical learning

User's question: ${userMessage}`;

      // Stream response directly from LLM
      let accumulatedText = '';
      const stream = await chatSessionRef.current.stream(systemPrompt);

      // Handle streaming response
      for await (const chunk of stream) {
        if (chunk.content) {
          accumulatedText += chunk.content;
          updateLastMessage(accumulatedText);
        }
      }

      setIsLoading(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';

      console.error('Chat error:', err);

      setError(`❌ ${errorMessage}`);
      updateLastMessage(
        `Oops! Something went wrong: ${errorMessage}\n\n**Troubleshooting:**\n- Make sure your Gemini API key is valid (Click ⚙️ to configure)\n- Check your internet connection\n- Try again in a moment`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const MarkdownComponents = {
    code({ inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          className="rounded-md text-sm my-2"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-gray-800 px-2 py-1 rounded text-sm font-mono text-cyan-300" {...props}>
          {children}
        </code>
      );
    },
    h1: ({ children }) => <h1 className="text-xl font-bold mb-2 text-blue-400 mt-2">{children}</h1>,
    h2: ({ children }) => <h2 className="text-lg font-bold mb-2 text-blue-300 mt-2">{children}</h2>,
    h3: ({ children }) => <h3 className="text-base font-bold mb-1 text-blue-200">{children}</h3>,
    p: ({ children }) => <p className="mb-2 text-gray-200 leading-relaxed">{children}</p>,
    ul: ({ children }) => <ul className="mb-2 ml-4 list-disc text-gray-200">{children}</ul>,
    ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal text-gray-200">{children}</ol>,
    li: ({ children }) => <li className="mb-1">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-300 mb-2 py-1">
        {children}
      </blockquote>
    ),
    strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
    em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
    a: ({ href, children }) => (
      <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 group"
          title="Open AlgoBot"
        >
          <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity animate-pulse">
            ?
          </div>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-700 rounded-2xl shadow-2xl z-50 transition-all duration-300 flex flex-col overflow-hidden" style={{ height: isMinimized ? '56px' : '600px' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">AlgoBot</h3>
            <p className="text-xs text-white/80">AI Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="h-4 w-4 text-white" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            title={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4 text-white" />
            ) : (
              <Minimize2 className="h-4 w-4 text-white" />
            )}
          </button>
          <button
            onClick={toggleChat}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            title="Close chat"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950/50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
              >
                {message.role === 'assistant' && (
                  <div className="p-2 bg-blue-600/20 rounded-lg h-fit flex-shrink-0">
                    <MessageCircle className="h-4 w-4 text-blue-400" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown components={MarkdownComponents}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm break-words">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start animate-in fade-in">
                <div className="p-2 bg-blue-600/20 rounded-lg h-fit">
                  <MessageCircle className="h-4 w-4 text-blue-400" />
                </div>
                <div className="bg-gray-800 p-3 rounded-2xl rounded-bl-none border border-gray-700">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="flex gap-3 justify-start">
                <div className="p-2 bg-red-600/20 rounded-lg h-fit flex-shrink-0">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                </div>
                <div className="bg-red-900/20 text-red-300 p-3 rounded-2xl text-sm border border-red-700/30 rounded-bl-none">
                  {error}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Section */}
          <div className="p-4 border-t border-gray-700 bg-gray-900">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about algorithms..."
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg transition-all text-white flex items-center justify-center"
                title="Send message"
              >
                {isLoading ? (
                  <span className="animate-spin"><Loader className="h-4 w-4" /></span>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by Gemini 2.0 • AlgoVisualizer
            </p>
          </div>
        </>
      )}
        </div>
      )}
      {showSettings && (
        <div className="absolute inset-0 bg-black/80 rounded-2xl z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl w-80 max-h-80 overflow-y-auto p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* API Key Section */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white flex items-center gap-2">
                🔐 API Key
              </label>
              <input
                type="password"
                id="apiKeyInput"
                placeholder="Enter Gemini API key..."
                defaultValue={localStorage.getItem('VITE_GEMINI_API_KEY') || ''}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              />
              <p className="text-xs text-slate-400">
                Get free key from{' '}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  Google AI Studio
                </a>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  const input = document.getElementById('apiKeyInput');
                  if (input?.value.trim()) {
                    localStorage.setItem('VITE_GEMINI_API_KEY', input.value);
                    alert('✅ API key saved!');
                    setShowSettings(false);
                  } else {
                    alert('❌ Please enter an API key');
                  }
                }}
                className="flex-1 py-2 px-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-semibold rounded-lg transition-all"
              >
                Save
              </button>
              <button
                onClick={() => {
                  if (confirm('Remove saved API key?')) {
                    localStorage.removeItem('VITE_GEMINI_API_KEY');
                    document.getElementById('apiKeyInput').value = '';
                    alert('✅ API key removed!');
                  }
                }}
                className="py-2 px-3 bg-red-900/30 hover:bg-red-900/40 text-red-300 text-sm font-semibold rounded-lg border border-red-700/50 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
