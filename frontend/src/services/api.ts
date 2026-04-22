import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { Artwork, AuthResponse, Favorite, ArtworkFormData } from '../types';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

let accessToken: string | null = null;
let refreshPromise: Promise<AuthResponse> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

function notifyAuthExpired() {
  window.dispatchEvent(new Event('auth:expired'));
}

API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url ?? '';

    const isRefreshRequest = requestUrl.includes('/auth/refresh');
    const isLoginRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

    if (status !== 401 || !originalRequest || originalRequest._retry || isRefreshRequest || isLoginRequest) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = apiRefreshToken()
          .then((response) => response.data)
          .finally(() => {
            refreshPromise = null;
          });
      }

      const refreshed = await refreshPromise;
      setAccessToken(refreshed.accessToken);
      originalRequest.headers.set('Authorization', `Bearer ${refreshed.accessToken}`);
      return API.request(originalRequest);
    } catch (refreshError) {
      setAccessToken(null);
      notifyAuthExpired();
      return Promise.reject(refreshError);
    }
  },
);

export const apiLogin = (email: string, password: string) => API.post<AuthResponse>('/auth/login', { email, password });
export const apiRegister = (email: string, password: string) => API.post<AuthResponse>('/auth/register', { email, password });
export const apiRefreshToken = () => API.post<AuthResponse>('/auth/refresh');
export const apiLogout = () => API.post('/auth/logout');
export const apiGetMe = () => API.get('/auth/me');

export const apiGetArtworks = (search?: string) => API.get<Artwork[]>('/artworks', { params: search ? { search } : {} });
export interface ArtworkFilterParams {
  width?: number;
  height?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  square?: boolean;
  orientation?: 'portrait' | 'landscape';
}

export const apiFilterArtworks = (params: ArtworkFilterParams) => API.get<Artwork[]>('/api/artworks/filter', { params });
export const apiGetFeatured = () => API.get<Artwork[]>('/artworks/featured');
export const apiGetArtwork = (id: number) => API.get<Artwork>(`/artworks/${id}`);

export const apiUploadArtwork = (file: File, data: ArtworkFormData) => {
  const form = new FormData();
  form.append('file', file);
  form.append('data', JSON.stringify({
    ...data,
    title: data.titleMk,
    description: data.descriptionMk,
    year: data.year ? parseInt(data.year, 10) : null,
    width: data.width ? parseFloat(data.width) : null,
    height: data.height ? parseFloat(data.height) : null,
  }));
  return API.post<Artwork>('/artworks', form, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const apiUpdateArtwork = (id: number, data: ArtworkFormData) => API.put<Artwork>(`/artworks/${id}`, {
  ...data,
  title: data.titleMk,
  description: data.descriptionMk,
  year: data.year ? parseInt(data.year, 10) : null,
  width: data.width ? parseFloat(data.width) : null,
  height: data.height ? parseFloat(data.height) : null,
});

export const apiReplaceArtworkImage = (id: number, file: File) => {
  const form = new FormData();
  form.append('file', file);
  return API.patch<Artwork>(`/artworks/${id}/image`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const apiUpdateArtworkStatus = (id: number, status: 'AVAILABLE' | 'SOLD') =>
  API.patch<Artwork>(`/artworks/${id}/status`, { status });

export const apiDeleteArtwork = (id: number) => API.delete(`/artworks/${id}`);
export const apiToggleFeatured = (id: number) => API.patch<Artwork>(`/artworks/${id}/featured`);

export const apiGetFavorites = () => API.get<Favorite[]>('/favorites');
export const apiAddFavorite = (artworkId: number) => API.post<Favorite>('/favorites', { artworkId });
export const apiRemoveFavorite = (artworkId: number) => API.delete(`/favorites/${artworkId}`);
