import React, { createContext, useContext, useState, ReactNode } from "react";
import { User, UserRole, ROLE_LABELS } from "@/types/budget";
import { MOCK_USERS } from "@/data/mockData";

interface AuthContextType {
  currentUser: User;
  setRole: (role: UserRole) => void;
  roleLabel: string;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>("branch_manager");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const currentUser = MOCK_USERS.find(u => u.role === currentRole) || MOCK_USERS[0];

  const login = (role: UserRole) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      setRole: (role: UserRole) => { setCurrentRole(role); },
      roleLabel: ROLE_LABELS[currentRole],
      isAuthenticated,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
