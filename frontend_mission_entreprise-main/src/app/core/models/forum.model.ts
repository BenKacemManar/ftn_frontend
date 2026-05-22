export interface ForumCategory {
  id: number;
  nom: string;
  description: string;
  categorie: string;
  nbSujets: number;
  slug?: string;
  orderIndex?: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface ForumThread {
  id: number;
  forumId: number;
  forumNom: string;
  auteurId?: number;
  auteurNom?: string;
  auteurPrenom?: string;
  auteurEmail?: string;
  titre: string;
  contenu: string;
  dateCreation: string;
  epingle: boolean;
  ferme: boolean;
  nbVues: number;
  nbReponses: number;
}

export interface ForumPost {
  id: number;
  sujetId: number;
  auteurId?: number;
  auteurNom?: string;
  auteurPrenom?: string;
  auteurEmail?: string;
  contenu: string;
  dateCreation: string;
  nbLikes: number;
  signale: boolean;
  parentReponseId?: number;
  reactions?: ForumReaction[];
}

export interface ForumReaction {
  id: number;
  threadId?: number;
  postId?: number;
  userId: number;
  userEmail: string;
  type: string;
}

export interface CreateThreadDto {
  forumId: number;
  auteurId?: number;
  titre: string;
  contenu: string;
}

export interface CreatePostDto {
  sujetId: number;
  auteurId?: number;
  contenu: string;
  parentReponseId?: number;
}
