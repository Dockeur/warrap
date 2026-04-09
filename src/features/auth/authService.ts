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
    const response = await axios.post<LoginResponse>(
        `${API_URL}/loginWorker`,
        credentials,
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            maxRedirects: 0,
            validateStatus: (status) => status === 200 || status === 302,
        }
    );

    const data = response.data;

    console.log('status:', response.status);
    console.log('data:', data);

    if (!data.token || !data.user) {
        throw new Error(data.message || 'Structure de réponse invalide');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

  
    

    if (response.status === 302 || data.redirect_url) {
        let path: string;

        if (data.redirect_url) {
            path = new URL(data.redirect_url).pathname;
        } else {
            const locationHeader = response.headers['location'];
            path = locationHeader
                ? new URL(locationHeader).pathname
                : '/edit-profile';
        }
    
        

        return { ...data, redirect_url: data.redirect_url };
    }

    return data;
},




  // Inscription
  register: async (data: any): Promise<LoginResponse> => {


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


      return response.data;
    } catch (error: any) {
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

    } catch (error) {

    }
  },

  // Mot de passe oublié
  forgotPassword: async (email: string): Promise<void> => {


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


    } catch (error: any) {


      if (error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de l\'envoi de l\'email');
      } else {
        throw new Error('Impossible de contacter le serveur');
      }
    }
  },

  // Réinitialiser le mot de passe
  resetPassword: async (token: string, password: string): Promise<void> => {


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


    } catch (error: any) {


      if (error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de la réinitialisation');
      } else {
        throw new Error('Impossible de contacter le serveur');
      }
    }
  },
};

export default authService;