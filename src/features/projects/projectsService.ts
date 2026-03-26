// src/features/projects/projectService.ts
import axios from 'axios';
import { Project } from '../../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Interfaces
export interface ProjectImage {
  id: number;
  url: string;
}

export interface ProjectFile {
  id: number;
  url: string;
  filename: string;
}


export interface ProjectsResponse {
  success: boolean;
  data: Project[];
}

export interface ProjectResponse {
  success: boolean;
  data: Project;
}

export interface CreateProjectData {
  name: string;
  description: string;
  images: File[];
  files: File[];
}

const projectService = {
  // Récupérer tous les projets
  fetchProjects: async (): Promise<Project[]> => {    
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await axios.get<ProjectsResponse>(
        `${API_URL}/projects`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

    

      // Gérer le cas où data peut être un tableau ou un objet avec data
      const projects = response.data.data || response.data;
      
      if (!Array.isArray(projects)) {
        console.error('❌ ProjectService - Format de réponse invalide');
        throw new Error('Format de réponse invalide');
      }

      return projects;
    } catch (error: any) {
      console.error('❌ ProjectService - Erreur lors de la récupération:', error);

      if (error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de la récupération des projets');
      } else if (error.request) {
        throw new Error('Impossible de contacter le serveur');
      } else {
        throw error;
      }
    }
  },

  // Récupérer mes projets (projets de l'utilisateur connecté)
  fetchMyProjects: async (): Promise<Project[]> => {
    
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await axios.get<ProjectsResponse>(
        `${API_URL}/my-projects`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      const projects = response.data.data || response.data;
      
      if (!Array.isArray(projects)) {
        console.error('❌ ProjectService - Format de réponse invalide');
        throw new Error('Format de réponse invalide');
      }

      return projects;
    } catch (error: any) {
      console.error('❌ ProjectService - Erreur lors de la récupération de mes projets:', error);

      if (error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de la récupération de vos projets');
      } else if (error.request) {
        throw new Error('Impossible de contacter le serveur');
      } else {
        throw error;
      }
    }
  },


  // Récupérer un projet par ID
  fetchProjectById: async (id: number | string): Promise<Project> => {
    console.log(`📄 ProjectService - Récupération du projet #${id}`);
    
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await axios.get<ProjectResponse>(
        `${API_URL}/projects/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',

           'Content-Type': 'application/json',

          },
        }
      );

      console.log(' ProjectService - Projet récupéré:', response.data);

      const project = response.data.data || response.data;

      if (!project || !project.id) {
        throw new Error('Projet non trouvé');
      }

      return project;
    } catch (error: any) {
      console.error(` ProjectService - Erreur lors de la récupération du projet #${id}:`, error);

      if (error.response?.status === 404) {
        throw new Error('Projet non trouvé');
      } else if (error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de la récupération du projet');
      } else if (error.request) {
        throw new Error('Impossible de contacter le serveur');
      } else {
        throw error;
      }
    }
  },





  // Créer un nouveau projet
  createProject: async (projectData: CreateProjectData, onUploadProgress?: (progress: number) => void): Promise<Project> => {
    console.log(' ProjectService - Création d\'un nouveau projet');
    console.log(' Données:', {
      name: projectData.name,
      imagesCount: projectData.images.length,
      filesCount: projectData.files.length,
    });

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      // Validation
      if (!projectData.name.trim()) {
        throw new Error('Le nom du projet est requis');
      }

      if (!projectData.description.trim()) {
        throw new Error('La description est requise');
      }

      if (projectData.images.length === 0) {
        throw new Error('Au moins une image est requise');
      }

      // Créer FormData
      const formData = new FormData();
      formData.append('name', projectData.name);
      formData.append('description', projectData.description);

      // Ajouter les images
      projectData.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

      // Ajouter les fichiers
      projectData.files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });

      const response = await axios.post<ProjectResponse>(
        `${API_URL}/projects`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onUploadProgress) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onUploadProgress(progress);
            }
          },
        }
      );

      console.log(' ProjectService - Projet créé:', response.data);

      const project = response.data.data || response.data;

      if (!project || !project.id) {
        throw new Error('Erreur lors de la création du projet');
      }

      return project;
    } catch (error: any) {
      console.error(' ProjectService - Erreur lors de la création:', error);

      if (error.response?.data?.errors) {
        // Erreurs de validation Laravel
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        throw new Error(Array.isArray(firstError) ? firstError[0] : 'Erreur de validation');
      } else if (error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de la création du projet');
      } else if (error.request) {
        throw new Error('Impossible de contacter le serveur');
      } else {
        throw error;
      }
    }
  },

  // Mettre à jour un projet
  updateProject: async (id: number | string, projectData: Partial<CreateProjectData>): Promise<Project> => {
    console.log(` ProjectService - Mise à jour du projet #${id}`);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      // Créer FormData
      const formData = new FormData();
      
      if (projectData.name) {
        formData.append('name', projectData.name);
      }
      
      if (projectData.description) {
        formData.append('description', projectData.description);
      }

      // Ajouter les nouvelles images si présentes
      if (projectData.images && projectData.images.length > 0) {
        projectData.images.forEach((image, index) => {
          formData.append(`images[${index}]`, image);
        });
      }

      // Ajouter les nouveaux fichiers si présents
      if (projectData.files && projectData.files.length > 0) {
        projectData.files.forEach((file, index) => {
          formData.append(`files[${index}]`, file);
        });
      }

      // Utiliser _method pour simuler PUT avec FormData
      formData.append('_method', 'PUT');

      const response = await axios.post<ProjectResponse>(
        `${API_URL}/projects/${id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log(' ProjectService - Projet mis à jour:', response.data);

      const project = response.data.data || response.data;

      return project;
    } catch (error: any) {
      console.error(` ProjectService - Erreur lors de la mise à jour du projet #${id}:`, error);

      if (error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de la mise à jour du projet');
      } else if (error.request) {
        throw new Error('Impossible de contacter le serveur');
      } else {
        throw error;
      }
    }
  },

  // Supprimer un projet
  deleteProject: async (id: number | string): Promise<void> => {
    console.log(` ProjectService - Suppression du projet #${id}`);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      await axios.delete(
        `${API_URL}/projects/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      console.log(` ProjectService - Projet #${id} supprimé avec succès`);
    } catch (error: any) {
      console.error(` ProjectService - Erreur lors de la suppression du projet #${id}:`, error);

      if (error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de la suppression du projet');
      } else if (error.request) {
        throw new Error('Impossible de contacter le serveur');
      } else {
        throw error;
      }
    }
  },

  // Accepter un projet (Admin/Validator uniquement)
  acceptProject: async (id: number | string): Promise<Project> => {
    console.log(` ProjectService - Acceptation du projet #${id}`);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await axios.patch<ProjectResponse>(
        `${API_URL}/projects/${id}/accept`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      console.log(' ProjectService - Projet accepté avec succès:', response.data);

      const project = response.data.data || response.data;

      return project;
    } catch (error: any) {
      console.error(` ProjectService - Erreur lors de l'acceptation du projet #${id}:`, error);

      if (error.response?.status === 403) {
        throw new Error('Vous n\'avez pas les droits pour accepter ce projet');
      } else if (error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de l\'acceptation du projet');
      } else if (error.request) {
        throw new Error('Impossible de contacter le serveur');
      } else {
        throw error;
      }
    }
  },

  // Définir les montants d'un projet (Admin/Validator uniquement)
  setProjectAmounts: async (id: number | string, amount: number, amountToPerceive: number): Promise<Project> => {
    console.log(` ProjectService - Définition des montants du projet #${id}`);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await axios.patch<ProjectResponse>(
        `${API_URL}/projects/${id}/set-amounts`,
        {
          amount,
          amount_to_perceive: amountToPerceive,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(' ProjectService - Montants définis avec succès:', response.data);

      const project = response.data.data || response.data;

      return project;
    } catch (error: any) {
      console.error(` ProjectService - Erreur lors de la définition des montants du projet #${id}:`, error);

      if (error.response?.status === 403) {
        throw new Error('Vous n\'avez pas les droits pour définir les montants de ce projet');
      } else if (error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de la définition des montants');
      } else if (error.request) {
        throw new Error('Impossible de contacter le serveur');
      } else {
        throw error;
      }
    }
  },


  deleteProjectImage: async (projectId: number | string, imageId: number): Promise<void> => {
    console.log(` ProjectService - Suppression de l'image #${imageId} du projet #${projectId}`);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      await axios.delete(
        `${API_URL}/projects/${projectId}/images/${imageId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      console.log(` ProjectService - Image #${imageId} supprimée avec succès`);
    } catch (error: any) {
      console.error(` ProjectService - Erreur lors de la suppression de l'image:`, error);

      if (error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de la suppression de l\'image');
      } else {
        throw error;
      }
    }
  },

 
  deleteProjectFile: async (projectId: number | string, fileId: number): Promise<void> => {
    console.log(` ProjectService - Suppression du fichier #${fileId} du projet #${projectId}`);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      await axios.delete(
        `${API_URL}/projects/${projectId}/files/${fileId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      console.log(` ProjectService - Fichier #${fileId} supprimé avec succès`);
    } catch (error: any) {
      console.error(` ProjectService - Erreur lors de la suppression du fichier:`, error);

      if (error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de la suppression du fichier');
      } else {
        throw error;
      }
    }
  },


addProjectSold: async (projectId: number | string, customerName: string): Promise<any> => {
  console.log(` ProjectService - Ajout d'une vente pour le projet #${projectId}`);
  
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }

    const response = await axios.post(
      `${API_URL}/projects/${projectId}/solds`,
      { customer_of_name: customerName },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(' ProjectService - Vente ajoutée:', response.data);
    return response.data;
    
  } catch (error: any) {
    console.error(` ProjectService - Erreur ajout vente:`, error);

    if (error.response?.status === 403) {
      throw new Error('Accès refusé. Seuls les administrateurs peuvent ajouter des ventes.');
    } else if (error.response?.status === 404) {
      throw new Error('Projet non trouvé');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.request) {
      throw new Error('Impossible de contacter le serveur');
    } else {
      throw new Error("Erreur lors de l'ajout de la vente");
    }
  }
},
};

export default projectService;