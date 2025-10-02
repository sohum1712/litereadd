import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface SavedAnalysis {
  _id: string;
  userId: string;
  title: string;
  summary: string;
  keywords: string[];
  markdownContent: string;
  inputContent: string;
  inputType: 'text' | 'url' | 'file';
  originalUrl?: string;
  fileName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisListResponse {
  analyses: SavedAnalysis[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SaveAnalysisData {
  title: string;
  summary: string;
  keywords: string[];
  markdownContent: string;
  inputContent: string;
  inputType: 'text' | 'url' | 'file';
  originalUrl?: string;
  fileName?: string;
}

export class AnalysisService {
  // Get all analyses for the authenticated user
  async getAnalyses(page: number = 1, limit: number = 10): Promise<AnalysisListResponse> {
    try {
      const response = await api.get(`/analysis?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      console.error('Get analyses error:', error);
      throw new Error(error.response?.data?.message || 'Failed to retrieve analyses');
    }
  }

  // Get specific analysis by ID
  async getAnalysis(id: string): Promise<SavedAnalysis> {
    try {
      const response = await api.get(`/analysis/${id}`);
      return response.data.analysis;
    } catch (error: any) {
      console.error('Get analysis error:', error);
      throw new Error(error.response?.data?.message || 'Failed to retrieve analysis');
    }
  }

  // Save new analysis
  async saveAnalysis(data: SaveAnalysisData): Promise<SavedAnalysis> {
    try {
      const response = await api.post('/analysis', data);
      return response.data.analysis;
    } catch (error: any) {
      console.error('Save analysis error:', error);
      throw new Error(error.response?.data?.message || 'Failed to save analysis');
    }
  }

  // Update existing analysis
  async updateAnalysis(id: string, data: Partial<SaveAnalysisData>): Promise<SavedAnalysis> {
    try {
      const response = await api.put(`/analysis/${id}`, data);
      return response.data.analysis;
    } catch (error: any) {
      console.error('Update analysis error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update analysis');
    }
  }

  // Delete analysis
  async deleteAnalysis(id: string): Promise<void> {
    try {
      await api.delete(`/analysis/${id}`);
    } catch (error: any) {
      console.error('Delete analysis error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete analysis');
    }
  }
}

export const analysisService = new AnalysisService();
