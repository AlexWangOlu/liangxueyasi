export interface User {
  id: string;
  email: string;
  name: string;
}

const STORAGE_KEY = "liangxue_user";
const AUTH_KEY = "liangxue_auth";

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}

export function setStoredUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_KEY, "true");
  } else {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(AUTH_KEY);
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function login(email: string, password: string): { success: boolean; error?: string } {
  // 模拟登录 — 后续替换为真实 API
  if (!email || !password) return { success: false, error: "请填写所有字段" };
  if (password.length < 6) return { success: false, error: "密码至少6位" };

  const user: User = {
    id: crypto.randomUUID(),
    email,
    name: email.split("@")[0],
  };
  setStoredUser(user);
  return { success: true };
}

export function register(email: string, password: string, confirmPassword: string): { success: boolean; error?: string } {
  if (!email || !password || !confirmPassword) return { success: false, error: "请填写所有字段" };
  if (password.length < 6) return { success: false, error: "密码至少6位" };
  if (password !== confirmPassword) return { success: false, error: "两次密码不一致" };

  const user: User = {
    id: crypto.randomUUID(),
    email,
    name: email.split("@")[0],
  };
  setStoredUser(user);
  return { success: true };
}

export function logout() {
  setStoredUser(null);
}
