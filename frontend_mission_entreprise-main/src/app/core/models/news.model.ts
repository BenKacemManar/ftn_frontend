export type NewsCategory = 'natation' | 'water-polo' | 'plongeon' | 'eau-libre' | 'general' | 'annonce';

export interface News {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  publishedAt: string;
  category: NewsCategory;
  imageUrl?: string;
  slug: string;
  authorId?: string;
  authorName?: string;
  isFeatured?: boolean;
}

export interface Actualite {
  id: number;
  titre: string;
  contenu: string;
  imageUrl?: string;
  categorie: string;
  auteurId?: number;
  auteurNom?: string;
  auteurEmail?: string;
  datePublication?: string;
  publie?: boolean;
  createdAt?: string;
}

export interface NewsFilter {
  categorie?: string;
  search?: string;
  page?: number;
  size?: number;
}
