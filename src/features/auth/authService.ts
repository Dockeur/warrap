// src/features/auth/authService.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: any;
}

const authService = {
  // Connexion
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    console.log('🔐 AuthService - Tentative de connexion');
    console.log('📍 URL:', `${API_URL}/api/loginWorker`);
    console.log('📤 Credentials:', { email: credentials.email });

    try {
      const response = await axios.post<LoginResponse>(
        `${API_URL}/loginWorker`,
        credentials,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ AuthService - Réponse reçue:', response.data);

      // L'API renvoie directement { success, message, token, user }
      const data = response.data;

      // Vérifier que la réponse contient les données nécessaires
      if (!data.token || !data.user) {
        console.error('❌ AuthService - Structure de réponse invalide:', data);
        throw new Error('Structure de réponse invalide');
      }

      console.log('✅ AuthService - Token:', data.token.substring(0, 20) + '...');
      console.log('✅ AuthService - User ID:', data.user.id);
      console.log('✅ AuthService - Worker Type:', data.user.account_type?.worker);

      return data;
    } catch (error: any) {
      console.error('❌ AuthService - Erreur:', error);

      if (error.response) {
        console.error('❌ Erreur serveur:', error.response.data);
        throw new Error(error.response.data.message || 'Erreur de connexion');
      } else if (error.request) {
        console.error('❌ Pas de réponse du serveur');
        throw new Error('Impossible de contacter le serveur');
      } else {
        console.error('❌ Erreur:', error.message);
        throw error;
      }
    }
  },

  // Inscription
  register: async (data: any): Promise<LoginResponse> => {
    console.log('📝 AuthService - Tentative d\'inscription');
    
    const apiData = {
      email: data.email,
      password: data.password,
      password_confirmation: data.password,
      privacy_policy: data.acceptPrivacy || true,
      phoneNumber: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      worker: data.accountType,
      years_of_experience: data.experience || 0,
      presentation: data.bio || '',
      ...(data.entityType === 'entreprise' && {
        company_name: data.companyName,
        company_registration: data.companyRegistration,
        company_address: data.companyAddress,
        tax_number: data.taxNumber,
      }),
      specialties: data.specialties || [],
      certifications: data.certifications || [],
    };

    console.log('📤 Données envoyées:', apiData);

    try {
      const response = await axios.post<LoginResponse>(
        `${API_URL}/registerWorker`,
        apiData,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Inscription réussie:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur d\'inscription:', error);
      
      if (error.response) {
        throw new Error(error.response.data.message || 'Erreur d\'inscription');
      } else {
        throw new Error('Impossible de contacter le serveur');
      }
    }
  },

  // Déconnexion
  logout: async (): Promise<void> => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.log('⚠️ Pas de token, déconnexion locale uniquement');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/logout`,
        {},
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      console.log('✅ Déconnexion réussie côté serveur');
    } catch (error) {
      console.error('⚠️ Erreur lors de la déconnexion côté serveur:', error);
      // On continue quand même pour nettoyer le localStorage
    }
  },

  // Mot de passe oublié
  forgotPassword: async (email: string): Promise<void> => {
    console.log('📧 AuthService - Demande de réinitialisation pour:', email);

    try {
      await axios.post(
        `${API_URL}/api/forgot-password`,
        { email },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Email de réinitialisation envoyé');
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);

      if (error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de l\'envoi de l\'email');
      } else {
        throw new Error('Impossible de contacter le serveur');
      }
    }
  },

  // Réinitialiser le mot de passe
  resetPassword: async (token: string, password: string): Promise<void> => {
    console.log('🔑 AuthService - Réinitialisation du mot de passe');

    try {
      await axios.post(
        `${API_URL}/api/reset-password`,
        { token, password, password_confirmation: password },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Mot de passe réinitialisé avec succès');
    } catch (error: any) {
      console.error('❌ Erreur lors de la réinitialisation:', error);

      if (error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de la réinitialisation');
      } else {
        throw new Error('Impossible de contacter le serveur');
      }
    }
  },
};

export default authService;