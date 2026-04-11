"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type UserRole = "user" | "companyAdmin" | "totalAdmin";

const CREDENTIALS: { email: string; password: string; role: UserRole; name: string }[] = [
  { email: "aeleni@mcse.in", password: "Mcse@25", role: "user", name: "DEEPAK AELENI" },
  { email: "companyadmin@mcse.in", password: "CompAdmin@25", role: "companyAdmin", name: "ENIGMA ADMIN" },
  { email: "totaladmin@mcse.in", password: "TotalAdmin@25", role: "totalAdmin", name: "TOTAL ADMIN" },
];

interface AuthState {
  isLoggedIn: boolean;
  role: UserRole | null;
  userName: string | null;
  userEmail: string | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  isLoggedIn: false,
  role: null,
  userName: null,
  userEmail: null,
  login: () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const login = useCallback((email: string, password: string) => {
    const match = CREDENTIALS.find(c => c.email === email && c.password === password);
    if (match) {
      setIsLoggedIn(true);
      setRole(match.role);
      setUserName(match.name);
      setUserEmail(match.email);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setRole(null);
    setUserName(null);
    setUserEmail(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, role, userName, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
