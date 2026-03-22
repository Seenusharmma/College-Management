import { create } from 'zustand';
import { Content, ContentFilters, PaginatedResponse, ApiResponse } from '@/types';

interface ContentState {
  contents: Content[];
  currentContent: Content | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
  filters: ContentFilters;
  setFilters: (filters: ContentFilters) => void;
  fetchContents: () => Promise<void>;
  fetchContentById: (id: string) => Promise<void>;
  createContent: (formData: FormData) => Promise<boolean>;
  deleteContent: (id: string) => Promise<void>;
  incrementDownloads: (id: string) => Promise<void>;
}

const API_URL = '/api';

export const useContentStore = create<ContentState>((set, get) => ({
  contents: [],
  currentContent: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },
  isLoading: false,
  error: null,
  filters: {},

  setFilters: (filters) => {
    set({ filters, pagination: { ...get().pagination, page: 1 } });
    get().fetchContents();
  },

  fetchContents: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          params.append(key, String(value));
        }
      });

      const response = await fetch(`${API_URL}/content?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const result: ApiResponse<PaginatedResponse<Content>> = await response.json();
        set({
          contents: result.data?.data || [],
          pagination: result.data?.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0
          },
          isLoading: false
        });
      } else {
        set({ 
          contents: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('Failed to fetch contents:', error);
      set({ 
        contents: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        isLoading: false,
        error: 'Failed to fetch content'
      });
    }
  },

  fetchContentById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/content/${id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const result: ApiResponse<Content> = await response.json();
        set({ currentContent: result.data || null, isLoading: false });
      } else {
        set({ currentContent: null, isLoading: false });
      }
    } catch {
      set({ currentContent: null, isLoading: false });
    }
  },

  createContent: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/content/upload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        await get().fetchContents();
        set({ isLoading: false });
        return true;
      } else {
        const errorData = await response.json();
        set({ isLoading: false, error: errorData.error || 'Failed to create content' });
        return false;
      }
    } catch (error) {
      console.error('Failed to create content:', error);
      set({ isLoading: false, error: 'Failed to upload content' });
      return false;
    }
  },

  deleteContent: async (id) => {
    try {
      const response = await fetch(`${API_URL}/content/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        set((state) => ({
          contents: state.contents.filter(c => c._id !== id),
          pagination: {
            ...state.pagination,
            total: state.pagination.total - 1
          }
        }));
      }
    } catch (error) {
      console.error('Failed to delete content:', error);
    }
  },

  incrementDownloads: async (id) => {
    try {
      await fetch(`${API_URL}/content/${id}/download`, {
        method: 'POST',
        credentials: 'include'
      });
      
      set((state) => ({
        contents: state.contents.map(c => 
          c._id === id ? { ...c, downloads: c.downloads + 1 } : c
        )
      }));
    } catch (error) {
      console.error('Failed to increment downloads:', error);
    }
  }
}));
