import { useContext } from 'react';
import { ChatbotContext } from '../context/ChatbotContext';

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
}
