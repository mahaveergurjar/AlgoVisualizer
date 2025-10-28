import React from "react";
import HomePage from "./pages/HomePage";
import { AlertContextProvider } from "./context/AlertContext";
import AlertBox from "./components/AlertBox";

export default function App() {
  return (
    <AlertContextProvider>
      <AlertBox />
      <HomePage />
    </AlertContextProvider>
  )
}
