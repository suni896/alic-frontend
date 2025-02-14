// UserContext.tsx
import React, { createContext, useContext, useState } from "react";

interface UserContextType {
  email: string;
  password: string;
  username: string;
  setUser: (email: string, password: string, username: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  const setUser = (email: string, password: string, username: string) => {
    setEmail(email);
    setPassword(password);
    setUsername(username);
  };

  return (
    <UserContext.Provider value={{ email, password, username, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
