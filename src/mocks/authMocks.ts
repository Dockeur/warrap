// src/mocks/authMocks.ts

import engineerAuth from './mock-auth-engineer.json';
import workerAuth from './mock-auth-worker.json';

/**
 * Mock Authentication Service
 * Utilisez ce service pour simuler l'authentification en développement
 */

export const mockAuthService = {
  /**
   * Simule une connexion avec le rôle engineer
   */
  loginAsEngineer: () => {
    localStorage.setItem('token', engineerAuth.data.token);
    localStorage.setItem('user', JSON.stringify(engineerAuth.data.user));
    return engineerAuth.data;
  },

  /**
   * Simule une connexion avec le rôle worker
   */
  loginAsWorker: () => {
    localStorage.setItem('token', workerAuth.data.token);
    localStorage.setItem('user', JSON.stringify(workerAuth.data.user));
    return workerAuth.data;
  },

  /**
   * Connexion mock basée sur l'email
   */
  mockLogin: (email: string, password: string) => {
    // Simuler un délai réseau
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'engineer@example.com' && password === 'password') {
          const data = engineerAuth.data;
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          resolve(data);
        } else if (email === 'worker@example.com' && password === 'password') {
          const data = workerAuth.data;
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          resolve(data);
        } else {
          reject(new Error('Email ou mot de passe incorrect'));
        }
      }, 500); // Délai de 500ms pour simuler une requête réseau
    });
  },
};

// Exemple d'utilisation dans votre composant de login
/*
import { mockAuthService } from './mocks/authMocks';

// Option 1: Login direct
const handleMockLogin = async () => {
  try {
    const data = await mockAuthService.mockLogin('engineer@example.com', 'password');
    console.log('Connecté en tant que:', data.user.name);
  } catch (error) {
    console.error(error);
  }
};

// Option 2: Login rapide
const loginAsEngineer = () => {
  const data = mockAuthService.loginAsEngineer();
  console.log('Connecté en tant que engineer:', data.user.name);
};

const loginAsWorker = () => {
  const data = mockAuthService.loginAsWorker();
  console.log('Connecté en tant que worker:', data.user.name);
};
*/

// ============================================
// INTÉGRATION AVEC VOTRE authService.ts
// ============================================

/**
 * Pour utiliser les mocks dans votre authService, ajoutez ceci en haut du fichier:
 */

/*
// src/features/auth/authService.ts

import { mockAuthService } from '../../mocks/authMocks';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Mode MOCK
    if (USE_MOCK) {
      const mockData = await mockAuthService.mockLogin(
        credentials.email, 
        credentials.password
      );
      return mockData;
    }
    
    // Mode RÉEL (API)
    const response = await apiRequest.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.LOGIN,
      credentials
    );
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },
  // ... autres méthodes
};
*/

// ============================================
// CONFIGURATION .env
// ============================================

/**
 * Ajoutez cette variable dans votre fichier .env pour activer/désactiver les mocks:
 * 
 * VITE_USE_MOCK_AUTH=true
 * 
 * Pour utiliser l'API réelle, changez en:
 * VITE_USE_MOCK_AUTH=false
 */

// ============================================
// COMPTES DE TEST
// ============================================

export const TEST_ACCOUNTS = {
  engineer: {
    email: 'engineer@example.com',
    password: 'password',
    role: 'engineer',
    description: 'Ingénieur avec accès complet aux projets et gestion des workers'
  },
  worker: {
    email: 'worker@example.com',
    password: 'password',
    role: 'worker',
    description: 'Ouvrier avec accès limité aux tâches assignées'
  }
};

export default mockAuthService;
