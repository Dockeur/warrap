// src/utils/redirectHelper.ts

import { User } from '../types';

// Routes de dashboard selon le type de worker
const DASHBOARD_ROUTES: Record<string, string> = {
  technicien: '/technicien/dashboard',
  worker: '/technicien/dashboard',
  architecte: '/architecte/dashboard',
  architect: '/architecte/dashboard', // Alias pour architect (API anglais)
  ingenieur: '/ingenieur/dashboard',
  engineer: '/ingenieur/dashboard', // Alias pour engineer (API anglais)
  chef_chantier: '/chef-chantier/dashboard',
  directeur_technique: '/directeur-technique/dashboard',
  conducteur_travaux: '/conducteur-travaux/dashboard',
};

/**
 * Obtient la route de dashboard selon le type de worker de l'utilisateur
 */
export const getDashboardRoute = (user: User | null): string => {
  if (!user) {
    return '/login';
  }

  const workerType = user.account_type?.worker;
  
  if (!workerType) {
    console.warn('Type de worker non trouvé, redirection vers dashboard par défaut');
    return '/dashboard';
  }

  // Chercher la route correspondante
  const route = DASHBOARD_ROUTES[workerType.toLowerCase()];
  
  if (!route) {
    console.warn(`Route non trouvée pour le type: ${workerType}, redirection vers dashboard par défaut`);
    return '/dashboard';
  }

  console.log(`✅ Redirection vers: ${route} (type: ${workerType})`);
  return route;
};

/**
 * Vérifie si l'utilisateur a le droit d'accéder à une route
 */
export const canAccessRoute = (user: User | null, allowedWorkerTypes?: string[]): boolean => {
  if (!user) return false;
  
  if (!allowedWorkerTypes || allowedWorkerTypes.length === 0) {
    return true; // Pas de restriction
  }

  const workerType = user.account_type?.worker?.toLowerCase();
  return allowedWorkerTypes.some(type => type.toLowerCase() === workerType);
};

/**
 * Obtient le type de worker de l'utilisateur
 */
export const getWorkerType = (user: User | null): string | null => {
  return user?.account_type?.worker || null;
};

/**
 * Vérifie si l'utilisateur est un type de worker spécifique
 */
export const isWorkerType = (user: User | null, workerType: string): boolean => {
  const userWorkerType = user?.account_type?.worker?.toLowerCase();
  return userWorkerType === workerType.toLowerCase();
};

/**
 * Obtient le nom d'affichage du type de worker
 */
export const getWorkerTypeLabel = (workerType: string): string => {
  const labels: Record<string, string> = {
    technicien: 'Technicien',
    worker: 'Technicien',
    architecte: 'Architecte',
    architect: 'Architecte',
    ingenieur: 'Ingénieur',
    engineer: 'Ingénieur',
    chef_chantier: 'Chef de chantier',
    directeur_technique: 'Directeur technique',
    conducteur_travaux: 'Conducteur de travaux',
  };

  return labels[workerType.toLowerCase()] || workerType;
};