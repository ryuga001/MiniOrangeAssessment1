import { createContext, ReactNode, useContext, useState } from "react";

type User = {
  id: string;
  username: string;
  email: string;
  phoneNo?: string;
};

type UserContextType = {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };
  const updateUser = (userData: User) => {
    setUser(userData);
  };
  const isLoggedIn = !!user;

  return (
    <UserContext.Provider
      value={{ user, isLoggedIn, login, logout, updateUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser => must be used within a UserProvider");
  }
  return context;
};
