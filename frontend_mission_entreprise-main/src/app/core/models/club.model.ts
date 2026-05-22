export interface Club {
  id: string;
  name: string;
  abbreviation: string;
  logo?: string;
  city: string;
  governorate: string;
  region?: string;
  foundedYear?: number;
  affiliationDate?: string;
  homePool?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive';
  athleteCount?: number;
}

export interface Licence {
  id: string;
  athleteId: string;
  athleteName?: string;
  clubId: string;
  clubName?: string;
  season: string;
  licenseNumber: string;
  ageCategory: string;
  issueDate: string;
  status: 'active' | 'expired' | 'pending';
}

export interface ClubMembership {
  id: number;
  userId: number;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  clubId: number;
  clubNom: string;
  role: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  createdAt?: string;
}
