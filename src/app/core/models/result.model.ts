export type ResultStatut = 'EN_ATTENTE' | 'VALIDE' | 'REJETE';

export interface Result {
    id: number;
    athlete_id: number;
    athlete_nom: string;
    competition_id: number;
    competition_nom: string;
    epreuve: string;
    temps: string;
    rang: number;
    statut: ResultStatut;
    created_at: string;
}

export interface CreateResult {
    athlete_id: number;
    competition_id: number;
    epreuve: string;
    temps?: string;
    rang?: number;
}

export interface UpdateResult {
    athlete_id?: number;
    competition_id?: number;
    epreuve?: string;
    temps?: string;
    rang?: number;
    statut?: ResultStatut;
}
