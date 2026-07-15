"use client";

import { useState, useEffect, useCallback } from "react";
import { getStoredUser, isAuthenticated, logout as authLogout, type User } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getStoredUser());
    }
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  return { user, loading, isLoggedIn: !!user, logout };
}
