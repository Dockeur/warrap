// src/constants/specialties.ts
// Spécialités disponibles selon le type de compte

export interface Specialty {
  value: string;
  label: string;
}

export const SPECIALTIES_BY_ACCOUNT_TYPE: Record<string, Specialty[]> = {
  technicien: [
    { value: 'electricien', label: 'Électricien' },
    { value: 'plomberie', label: 'Plomberie' },
    { value: 'assainissement', label: 'Assainissement' },
    { value: 'climatisation', label: 'Climatisation' },
    { value: 'electrotechnique', label: 'Électrotechnique' },
    { value: 'acoustique', label: 'Acoustique' },
    { value: 'ing_tp', label: 'Ingénierie TP' },
    { value: 'topographie', label: 'Topographie' },
  ],
  
  architect: [
    { value: 'dao', label: 'DAO (Dessin Assisté par Ordinateur)' },
    { value: 'urbaniste', label: 'Urbaniste' },
    { value: 'paysage', label: 'Paysage' },
    { value: 'interieur', label: 'Intérieur' },
    { value: 'rendeur', label: 'Rendeur 3D' },
  ],
  
  engineer: [
    { value: 'genie_civil', label: 'Génie Civil' },
    { value: 'genie_electrique', label: 'Génie Électrique' },
    { value: 'genie_mecanique', label: 'Génie Mécanique' },
    { value: 'structures', label: 'Structures' },
    { value: 'gestion_projet', label: 'Gestion de projet' },
    { value: 'vrd', label: 'VRD (Voirie et Réseaux Divers)' },
  ],
  
  technical_director: [
    { value: 'projet_batiment', label: 'Projet Bâtiment' },
    { value: 'pont_chaussee', label: 'Pont et Chaussée' },
    { value: 'industriels', label: 'Projets Industriels' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'genie_civil', label: 'Génie Civil' },
  ],
  
  site_manager: [
    { value: 'projet_batiment', label: 'Projet Bâtiment' },
    { value: 'pont_chaussee', label: 'Pont et Chaussée' },
    { value: 'industriel', label: 'Industriel' },
    { value: 'gros_oeuvre', label: 'Gros Œuvre' },
    { value: 'second_oeuvre', label: 'Second Œuvre' },
  ],
  
  site_supervisor: [
    { value: 'projet_batiment', label: 'Projet Bâtiment' },
    { value: 'pont_chaussee', label: 'Pont et Chaussée' },
    { value: 'industriel', label: 'Industriel' },
    { value: 'terrassement', label: 'Terrassement' },
    { value: 'maconnerie', label: 'Maçonnerie' },
  ],
};

/**
 * Récupère les spécialités disponibles pour un type de compte
 */
export const getSpecialtiesByAccountType = (accountType: string): Specialty[] => {
  return SPECIALTIES_BY_ACCOUNT_TYPE[accountType] || [];
};

/**
 * Vérifie si une spécialité est valide pour un type de compte
 */
export const isValidSpecialty = (accountType: string, specialty: string): boolean => {
  const specialties = getSpecialtiesByAccountType(accountType);
  return specialties.some(s => s.value === specialty);
};

/**
 * Convertit les valeurs de spécialités en labels lisibles
 */
export const getSpecialtyLabel = (accountType: string, specialtyValue: string): string => {
  const specialties = getSpecialtiesByAccountType(accountType);
  const specialty = specialties.find(s => s.value === specialtyValue);
  return specialty?.label || specialtyValue;
};