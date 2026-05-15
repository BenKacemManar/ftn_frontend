export interface Club {
    id: number;
    nom: string;
    ville: string;
    region: string;
    logo: string;
    president_nom: string;
    date_affiliation: string;
    actif: boolean;
    created_at: string;
}

export interface CreateClub {
    nom: string;
    ville?: string;
    region?: string;
    logo?: string;
    president_nom?: string;
    date_affiliation?: string;
    actif?: boolean;
}

export interface UpdateClub {
    nom?: string;
    ville?: string;
    region?: string;
    logo?: string;
    president_nom?: string;
    date_affiliation?: string;
    actif?: boolean;
}
