import React from "react";
import HomePage from "./pages/HomePage";
import { AlertContextProvider } from "./context/AlertContext";
import { ChatbotProvider } from "./context/ChatbotContext";
import AlertBox from "./components/AlertBox";
import ChatbotWidget from "./components/ChatbotWidget";

export default function App() {
  return (
    <AlertContextProvider>
      <ChatbotProvider>
        <AlertBox />
        <HomePage />
        <ChatbotWidget />
      </ChatbotProvider>
    </AlertContextProvider>
  )
}
