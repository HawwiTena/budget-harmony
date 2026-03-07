import React, { createContext, useContext, useState, ReactNode } from "react";
import { User, UserRole, ROLE_LABELS } from "@/types/budget";
import { MOCK_USERS } from "@/data/mockData";

interface AuthContextType {
  currentUser: User;
  setRole: (role: UserRole) => void;
  roleLabel: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>("branch_manager");
  const currentUser = MOCK_USERS.find(u => u.role === currentRole) || MOCK_USERS[0];

  return (
    <AuthContext.Provider value={{
      currentUser,
      setRole: setCurrentRole,
      roleLabel: ROLE_LABELS[currentRole],
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
