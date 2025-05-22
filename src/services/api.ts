import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

export interface ScrapeResult {
  url: string;
  title: string;
  content: string;
  word_count: number;
}

export class ApiError extends Error {
  status: number;
  
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export const scrapeUrl = async (url: string): Promise<ScrapeResult> => {
  try {
    const response = await api.post<ScrapeResult>('/scrape', { url });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.detail || 'Network error occurred';
      throw new ApiError(status, message);
    }
    throw new ApiError(500, 'Unknown error occurred');
  }
};