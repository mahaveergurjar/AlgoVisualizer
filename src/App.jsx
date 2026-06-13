import React from "react";
import HomePage from "./pages/HomePage";
import { ThemeProvider } from "./context/ThemeContext";
import { AlertContextProvider } from "./context/AlertContext";

import AlertBox from "./components/AlertBox";


export default function App() {
  return (
    <ThemeProvider>
      <AlertContextProvider>
      <AlertContextProvider>
        <AlertBox />
        <HomePage />
      </AlertContextProvider>
    </AlertContextProvider>
    </ThemeProvider>
    

  )
}
