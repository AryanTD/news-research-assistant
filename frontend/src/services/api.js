import axios from "axios";

// Base URL for your backend
export const API_BASE_URL = "http://localhost:3000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const newsAPI = {
  search: async (query, pageSize = 10) => {
    const response = await api.post("/news/search", { query, pageSize });
    return response.data;
  },
  trending: async () => {
    const response = await api.get("/news/trending");
    return response.data;
  },
};

// Documents API
export const documentsAPI = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append("document", file);

    const response = await api.post("/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  list: async () => {
    const response = await api.get("/documents");
    return response.data;
  },

  getContent: async (documentId) => {
    const response = await api.get(`/documents/${documentId}/content`);
    return response.data;
  },

  delete: async (documentId) => {
    const response = await api.delete(`/documents/${documentId}`);
    return response.data;
  },

  ask: async (documentId, question, history = []) => {
    const response = await api.post(`/documents/${documentId}/qa`, { question, history });
    return response.data;
  },
};

// Search API (semantic search in documents)
export const searchAPI = {
  search: async (query, nResults = 5, documentId = null) => {
    const response = await api.post("/search", { query, nResults, documentId });
    return response.data;
  },
};

// System API
export const systemAPI = {
  health: async () => {
    const response = await api.get("/health");
    return response.data;
  },

  stats: async () => {
    const response = await api.get("/stats");
    return response.data;
  },
};

export default api;
