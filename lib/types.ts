export interface Demande {
  id: number;
  prenom_nom: string;
  filiere: string;
  annee: string;
  sujet: string;
  description: string;
  duree: number;
  date_heure: string;
  lieu: string;
  nb_souhaites: number;
  nb_inscrits: number;
  types_retour: string; // JSON string
  created_at: string;
}

export interface Message {
  id: number;
  demande_id: number;
  prenom_nom: string;
  contenu: string;
  created_at: string;
}

export const FILIERES = [
  "Informatique",
  "Web & Mobile",
  "3D & Animation",
  "Audiovisuel",
  "Marketing",
  "Design",
  "Cybersécurité",
  "IA & Data",
  "Autre",
] as const;

export const ANNEES = ["B1", "B2", "B3", "M1", "M2"] as const;

export const DUREES = [3, 5, 8, 10, 15, 20] as const;

export const TYPES_RETOUR = ["Bienveillant", "Cash", "Fond", "Forme"] as const;
