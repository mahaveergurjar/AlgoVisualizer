import React from "react";
import HomePage from "./pages/HomePage";
import { ThemeProvider } from "./context/ThemeContext";
import { AlertContextProvider } from "./context/AlertContext";
import { ChatbotProvider } from "./context/ChatbotContext";
import AlertBox from "./components/AlertBox";
import ChatbotWidget from "./components/ChatbotWidget";

export default function App() {
  return (
    <ThemeProvider>
      <AlertContextProvider>
      <ChatbotProvider>
        <AlertBox />
        <HomePage />
        <ChatbotWidget />
      </ChatbotProvider>
    </AlertContextProvider>
    </ThemeProvider>
    

  )
}
