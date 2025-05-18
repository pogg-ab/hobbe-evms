import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

// API URL configuration
const API_URL = "http://localhost:4000";
const EVENT_URL = "http://localhost:4001";
const STREAM_URL = "http://localhost:4003";

// Helper function to get token
const getToken = () => {
  return localStorage.getItem("accessToken");
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "API request failed");
  }
  return response.json();
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("API Error:", error.response.data);

      // Handle specific error cases
      if (error.response.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request setup error:", error.message);
    }
    return Promise.reject(error);
  }
);

export const auth = {

  login: async (data: { username: string; password: string }) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },
};

export const decodeToken = (token: string | null) => {
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const getOrganizerId = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  const decoded = decodeToken(token);
  return decoded?.sub || decoded?.sub || null;
};

export const streams = {
  create: async (data: any) => {
    const response = await fetch(`${STREAM_URL}/streams/schedule`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  list: async () => {
    const response = await fetch(`${EVENT_URL}/events?page=1&limit=10`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  getByOrganiser: async (organiser: any) => {
    const response = await fetch(`${EVENT_URL}/events/organiser/${organiser}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  get: async (id: string) => {
    const response = await fetch(`${STREAM_URL}/streams/${id}`);
    return handleResponse(response);
  },
  getAllStreams: async () => {
    const response = await fetch(`${STREAM_URL}/streams`);
    return handleResponse(response);
  },

  getStreamByEventId: async (eventId: string) => {
    const response = await fetch(`${STREAM_URL}/streams/${eventId}`);
    return handleResponse(response);
  },

  start: async (id: string) => {
    const response = await fetch(`${STREAM_URL}/streams/${id}/start`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  end: async (id: string) => {
    const response = await fetch(`${STREAM_URL}/streams/${id}/end`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  getStreamUrls: async (id: string) => {
    const response = await fetch(`${API_URL}/streams/${id}/stream-urls`);
    return handleResponse(response);
  },
};
