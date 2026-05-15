export type Categorie = 'POUSSIN' | 'BENJAMIN' | 'MINIME' | 'CADET' | 'JUNIOR' | 'SENIOR';
export type Sexe = 'MASCULIN' | 'FEMININ';
export type StatutLicence = 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE' | 'EXPIREE';
export type TypeLicence = 'COMPETITION' | 'LOISIR' | 'ENTRAINEMENT';

export interface Athlete {
    id: number;
    nom: string;
    prenom: string;
    club_id: number | null;
    club_nom: string | null;
    date_naissance: string | null;
    nationalite: string | null;
    categorie: Categorie | null;
    sexe: Sexe | null;
    created_at: string;
}

export interface CreateAthlete {
    nom: string;
    prenom: string;
    club_id?: number;
    date_naissance?: string;
    nationalite?: string;
    categorie?: string;
    sexe?: string;
}

export interface UpdateAthlete {
    nom?: string;
    prenom?: string;
    club_id?: number;
    date_naissance?: string;
    nationalite?: string;
    categorie?: string;
    sexe?: string;
}

export interface Licence {
    id: number;
    athlete_id: number;
    club_id: number;
    numero: string;
    type: TypeLicence;
    date_debut: string;
    date_expiration: string;
    statut: StatutLicence;
    created_at: string;
}
