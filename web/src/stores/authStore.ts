import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string
  ) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const response = await axios.post("/api/auth/login", {
            email,
            password,
          });

          const { access_token, refresh_token } = response.data;
          const user = response.data.user;

          set({
            user,
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
          });

          // Set default authorization header
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${access_token}`;
        } catch (error) {
          console.error("Login failed:", error);
          throw error;
        }
      },

      register: async (email: string, password: string, username: string) => {
        try {
          const response = await axios.post("/api/auth/register", {
            email,
            password,
            username,
          });

          const { access_token, refresh_token } = response.data;
          const user = response.data.user;

          set({
            user,
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
          });

          // Set default authorization header
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${access_token}`;
        } catch (error) {
          console.error("Registration failed:", error);
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });

        // Remove authorization header
        delete axios.defaults.headers.common["Authorization"];
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        try {
          const response = await axios.post("/api/auth/refresh", {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token } = response.data;

          set({
            accessToken: access_token,
            refreshToken: refresh_token,
          });

          // Update authorization header
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${access_token}`;
        } catch (error) {
          console.error("Token refresh failed:", error);
          get().logout();
          throw error;
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
