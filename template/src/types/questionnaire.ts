export type QuestionType = 'text' | 'select' | 'multiselect' | 'number' | 'time' | 'color' | 'services';

export interface QuestionnaireQuestion {
  id: string;
  type: QuestionType;
  label: string;
  description?: string;
  required: boolean;
  options?: string[]; // Pour select/multiselect
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ServiceAnswer {
  name: string;
  duration: number;
  price: number;
}

export interface QuestionnaireAnswer {
  questionId: string;
  value: string | string[] | number | ServiceAnswer[];
}

export interface QuestionnaireState {
  currentQuestionIndex: number;
  answers: Record<string, QuestionnaireAnswer>;
  isComplete: boolean;
}

// Questions du questionnaire initial (toutes en texte)
export const INITIAL_QUESTIONNAIRE: QuestionnaireQuestion[] = [
  {
    id: 'business_type',
    type: 'text',
    label: 'Quel type de business avez-vous ?',
    description: 'Décrivez votre activité (ex: Salon de coiffure, Cabinet médical, Terrain de padel, etc.)',
    required: true,
    placeholder: 'Ex: Salon de coiffure',
  },
  {
    id: 'business_name',
    type: 'text',
    label: 'Quel est le nom de votre établissement ?',
    description: 'Le nom qui apparaîtra sur votre site',
    required: true,
    placeholder: 'Ex: Salon Coiffure Marie',
  },
  {
    id: 'services',
    type: 'services',
    label: 'Quels services proposez-vous ?',
    description: 'Ajoutez un ou plusieurs services (nom, durée en minutes, prix en €)',
    required: false,
  },
  {
    id: 'opening_days',
    type: 'text',
    label: 'Quels jours êtes-vous ouverts ?',
    description: 'Listez les jours d\'ouverture séparés par des virgules (ex: Lundi, Mardi, Mercredi, Jeudi, Vendredi)',
    required: true,
    placeholder: 'Ex: Lundi, Mardi, Mercredi, Jeudi, Vendredi',
  },
  {
    id: 'opening_hours',
    type: 'text',
    label: 'Quels sont vos horaires d\'ouverture ?',
    description: 'Heure d\'ouverture et de fermeture',
    required: true,
    placeholder: 'Ex: 9h00 - 18h00',
  },
  {
    id: 'primary_color',
    type: 'color',
    label: 'Quelle couleur principale souhaitez-vous pour votre site ?',
    description: 'La couleur principale de votre identité visuelle',
    required: false,
    placeholder: '#0EA5E9',
  },
  {
    id: 'contact_email',
    type: 'text',
    label: 'Quel est votre email de contact ?',
    description: 'Email affiché sur le site pour les clients',
    required: true,
    placeholder: 'contact@monsalon.com',
  },
  {
    id: 'contact_phone',
    type: 'text',
    label: 'Quel est votre numéro de téléphone ?',
    description: 'Téléphone affiché sur le site (optionnel)',
    required: false,
    placeholder: '+33 6 12 34 56 78',
  },
];

