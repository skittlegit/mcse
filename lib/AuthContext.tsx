"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type UserRole = "user" | "company" | "admin";

const CREDENTIALS: { email: string; password: string; role: UserRole; name: string }[] = [
  { email: "aeleni@mcse.in", password: "Mcse@25", role: "user", name: "DEEPAK AELENI" },
  { email: "enigma@mcse.in", password: "Enigma@25", role: "company", name: "ENIGMA ADMIN" },
  { email: "admin@mcse.in", password: "Admin@25", role: "admin", name: "TOTAL ADMIN" },
];

interface AuthState {
  isLoggedIn: boolean;
  role: UserRole | null;
  userName: string | null;
  userEmail: string | null;
  login: (email: string, password: string) => UserRole | null;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  isLoggedIn: false,
  role: null,
  userName: null,
  userEmail: null,
  login: () => null,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const login = useCallback((email: string, password: string): UserRole | null => {
    const match = CREDENTIALS.find(c => c.email === email && c.password === password);
    if (match) {
      setIsLoggedIn(true);
      setRole(match.role);
      setUserName(match.name);
      setUserEmail(match.email);
      return match.role;
    }
    return null;
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
