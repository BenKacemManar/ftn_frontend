export type CompetitionType = 'NATIONAL' | 'REGIONAL' | 'INTERNATIONAL';
export type CompetitionStatut = 'A_VENIR' | 'EN_COURS' | 'TERMINE' | 'ANNULE';

export interface Competition {
    id: number;
    nom: string;
    type: CompetitionType;
    date_debut: string;
    date_fin: string;
    pool_id: number;
    pool_nom: string;
    statut: CompetitionStatut;
    description: string;
    nb_participants: number;
    created_at: string;
}

export interface CreateCompetition {
    nom: string;
    type?: CompetitionType;
    date_debut?: string;
    date_fin?: string;
    pool_id?: number;
    description?: string;
}

export interface UpdateCompetition {
    nom?: string;
    type?: CompetitionType;
    date_debut?: string;
    date_fin?: string;
    pool_id?: number;
    statut?: CompetitionStatut;
    description?: string;
    nb_participants?: number;
}
