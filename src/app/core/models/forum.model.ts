export interface Forum {
    id: number;
    nom: string;
    description: string;
    categorie: string;
    nb_sujets: number;
    created_at: string;
}

export interface Sujet {
    id: number;
    forum_id: number;
    auteur_id: number;
    titre: string;
    contenu: string;
    date_creation: string;
    epingle: boolean;
    ferme: boolean;
    nb_vues: number;
    nb_reponses: number;
    created_at: string;
}

export interface CreateSujet {
    forum_id: number;
    titre: string;
    contenu: string;
}

export interface Reponse {
    id: number;
    sujet_id: number;
    auteur_id: number;
    contenu: string;
    date_creation: string;
    nb_likes: number;
    signale: boolean;
    created_at: string;
}

export interface CreateReponse {
    sujet_id: number;
    contenu: string;
}
