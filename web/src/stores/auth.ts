import { create } from "zustand";
import { auth } from "@/lib/api";

interface User {
  id: string;
  username: string;
  isStreamer: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem("accessToken"),
  isAuthenticated: !!localStorage.getItem("accessToken"),
  login: async (username: string, password: string) => {
    const response = await auth.login({ username, password });
    localStorage.setItem("accessToken", response.access_token);
    set({
      user: response.user,
      accessToken: response.accessToken,
      isAuthenticated: true,
    });
  },
  logout: () => {
    localStorage.removeItem("accessToken");
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
