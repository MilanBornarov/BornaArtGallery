export interface Artwork {
  id: number;
  title: string;
  titleEn?: string | null;
  titleMk?: string | null;
  description: string;
  descriptionEn?: string | null;
  descriptionMk?: string | null;
  category: string;
  categoryEn?: string | null;
  categoryMk?: string | null;
  categorySlug?: string | null;
  imageUrl: string;
  cloudinaryPublicId?: string | null;
  featured: boolean;
  year: number | null;
  width: number | null;
  height: number | null;
  status: 'AVAILABLE' | 'SOLD';
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresInSeconds: number;
  role: 'USER' | 'ADMIN';
  email: string;
  userId: number;
}

export interface Favorite {
  id: number;
  artwork: Artwork;
  createdAt: string;
}

export interface ArtworkFormData {
  title: string;
  titleMk: string;
  titleEn?: string;
  description: string;
  descriptionMk: string;
  descriptionEn?: string;
  category: string;
  year: string;
  width: string;
  height: string;
  featured: boolean;
  status: 'AVAILABLE' | 'SOLD';
}
