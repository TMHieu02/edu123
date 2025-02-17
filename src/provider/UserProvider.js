import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [navigationHistory, setNavigationHistory] = useState([]);

  const setUserIdValue = (value) => {
    setUserId(value);

    // Save userId to session storage
    sessionStorage.setItem('userId', value);

    // Update navigation history
    setNavigationHistory((history) => [...history, value]);
  };

  const goBack = () => {
    // Pop the last ID from the history
    const lastId = navigationHistory.pop();
    setUserId(lastId);

    // Save the updated history to session storage
    sessionStorage.setItem('userId', lastId);
    setNavigationHistory([...navigationHistory]);
  };

  useEffect(() => {
    // Try to get userId from session storage
    const storedUserId = sessionStorage.getItem('userId');
    setUserId(storedUserId || null);
    setNavigationHistory([storedUserId]);
  }, []);

  return (
    <UserContext.Provider value={{ userId, setUserIdValue, goBack }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
