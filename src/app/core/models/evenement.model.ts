export type EvenementType = 'COMPETITION' | 'CEREMONIE' | 'STAGE' | 'AUTRE';
export type EvenementStatus = 'BROUILLON' | 'PUBLIE' | 'INSCRIPTIONS_OUVERTES' | 'EN_COURS' | 'TERMINE' | 'ARCHIVE';

export interface Evenement {
  id: number;
  type: EvenementType;
  titre: string;
  description?: string;
  dateDebut: string;
  dateFin: string;
  lieu?: string;
  capaciteMax?: number;
  status: EvenementStatus;
  createdById?: number;
  createdByName?: string;
  createdAt?: string;
  competitionId?: number;
}

export interface Participation {
  id: number;
  evenementId: number;
  userId: number;
  message?: string;
  status: 'EN_ATTENTE' | 'VALIDEE' | 'ANNULEE';
}

export interface Inscription {
  id: number;
  athleteId?: number;
  eventId?: number;
  seedTime?: string;
  status: string;
  registeredAt?: string;
  createdAt?: string;
}
