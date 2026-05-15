export type PoolType = 'INDOOR' | 'OUTDOOR';

export interface Pool {
    id: number;
    nom: string;
    ville: string;
    adresse: string;
    longueur: number;
    nb_couloirs: number;
    type: PoolType;
    actif: boolean;
    created_at: string;
}

export interface CreatePool {
    nom: string;
    ville?: string;
    adresse?: string;
    longueur?: number;
    nb_couloirs?: number;
    type?: PoolType;
    actif?: boolean;
}

export interface UpdatePool {
    nom?: string;
    ville?: string;
    adresse?: string;
    longueur?: number;
    nb_couloirs?: number;
    type?: PoolType;
    actif?: boolean;
}
