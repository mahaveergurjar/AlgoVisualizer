import React, { createContext, useState, useContext } from "react";

const AlertContext = createContext();

export const AlertContextProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    message: "",
    heading: "",
    type: "error",
    autoDismiss: 4,
    visible: false,
  });

  const showAlert = (heading, message, type = "error", autoDismiss = 3) => {
    setAlert({ heading, message, type, autoDismiss, visible: true });
  };

  const hideAlert = () => {
    setTimeout(() => {
      setAlert((prev) => ({
        message: "",
        heading: "",
        type: "error",
        visible: false,
      }));
    }, 320);
  };

  return (
    <AlertContext.Provider value={{ alert, showAlert, hideAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlertContext = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useErrorAlert must be used within a ErrorAlertProvider");
  }
  return context;
};
