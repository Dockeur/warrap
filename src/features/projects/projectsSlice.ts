// src/features/projects/projectSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import projectService, { CreateProjectData } from './projectsService';
import { RootState } from '../../store/store';
import { Project } from '../../types';


// État initial
interface ProjectState {
  projects: Project[];
  myProjects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isAccepting: boolean;
  uploadProgress: number;
  error: string | null;
  successMessage: string | null;
}

const initialState: ProjectState = {
  projects: [],
  myProjects: [],
  currentProject: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isAccepting: false,
  uploadProgress: 0,
  error: null,
  successMessage: null,
};

// Thunks asynchrones
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      console.log(' Redux - Chargement des projets...');
      const projects = await projectService.fetchProjects();
      console.log(' Redux - Projets chargés:', projects.length);
      return projects;
    } catch (error: any) {
      console.error(' Redux - Erreur:', error.message);
      return rejectWithValue(error.message);
    }
  }
);



export const fetchMyProjects = createAsyncThunk(
  'projects/fetchMyProjects',
  async (_, { rejectWithValue }) => {
    try {
      console.log(' Redux - Chargement de mes projets...');
      const projects = await projectService.fetchMyProjects();
      console.log(' Redux - Mes projets chargés:', projects.length);
      return projects;
    } catch (error: any) {
      console.error(' Redux - Erreur:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  'projects/fetchProjectById',
  async (id: number | string, { rejectWithValue }) => {
    try {
      console.log(` Redux - Chargement du projet #${id}...`);
      const project = await projectService.fetchProjectById(id);
      console.log(' Redux - Projet chargé:', project.name);
      return project;
    } catch (error: any) {
      console.error(' Redux - Erreur:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (
    { 
      projectData, 
      onUploadProgress 
    }: { 
      projectData: CreateProjectData; 
      onUploadProgress?: (progress: number) => void 
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      console.log(' Redux - Création du projet...');
      
      const project = await projectService.createProject(
        projectData,
        (progress) => {
          dispatch(setUploadProgress(progress));
          if (onUploadProgress) {
            onUploadProgress(progress);
          }
        }
      );
      
      console.log(' Redux - Projet créé:', project.name);
      return project;
    } catch (error: any) {
      console.error(' Redux - Erreur:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async (
    { id, projectData }: { id: number | string; projectData: Partial<CreateProjectData> },
    { rejectWithValue }
  ) => {
    try {
      console.log(` Redux - Mise à jour du projet #${id}...`);
      const project = await projectService.updateProject(id, projectData);
      console.log(' Redux - Projet mis à jour:', project.name);
      return project;
    } catch (error: any) {
      console.error(' Redux - Erreur:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id: number | string, { rejectWithValue }) => {
    try {
      console.log(` Redux - Suppression du projet #${id}...`);
      await projectService.deleteProject(id);
      console.log(' Redux - Projet supprimé');
      return id;
    } catch (error: any) {
      console.error(' Redux - Erreur:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const acceptProject = createAsyncThunk(
  'projects/acceptProject',
  async (id: number | string, { rejectWithValue }) => {
    try {
      console.log(` Redux - Acceptation du projet #${id}...`);
      const project = await projectService.acceptProject(id);
      console.log(' Redux - Projet accepté');
      return project;
    } catch (error: any) {
      console.error(' Redux - Erreur:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const setProjectAmounts = createAsyncThunk(
  'projects/setProjectAmounts',
  async (
    { projectId, amount, amountToPerceive }: { projectId: number | string; amount: number; amountToPerceive: number },
    { rejectWithValue }
  ) => {
    try {
      console.log(` Redux - Définition des montants du projet #${projectId}...`);
      const project = await projectService.setProjectAmounts(projectId, amount, amountToPerceive);
      console.log(' Redux - Montants définis');
      return project;
    } catch (error: any) {
      console.error(' Redux - Erreur:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProjectImage = createAsyncThunk(
  'projects/deleteProjectImage',
  async (
    { projectId, imageId }: { projectId: number | string; imageId: number },
    { rejectWithValue }
  ) => {
    try {
      console.log(` Redux - Suppression de l'image #${imageId}...`);
      await projectService.deleteProjectImage(projectId, imageId);
      console.log(' Redux - Image supprimée');
      return { projectId, imageId };
    } catch (error: any) {
      console.error(' Redux - Erreur:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProjectFile = createAsyncThunk(
  'projects/deleteProjectFile',
  async (
    { projectId, fileId }: { projectId: number | string; fileId: number },
    { rejectWithValue }
  ) => {
    try {
      console.log(` Redux - Suppression du fichier #${fileId}...`);
      await projectService.deleteProjectFile(projectId, fileId);
      console.log(' Redux - Fichier supprimé');
      return { projectId, fileId };
    } catch (error: any) {
      console.error(' Redux - Erreur:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    // Réinitialiser l'erreur
    clearError: (state) => {
      state.error = null;
    },
    
    // Réinitialiser le message de succès
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    
    // Réinitialiser le projet actuel
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    
    // Définir la progression de l'upload
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    
    // Réinitialiser la progression de l'upload
    resetUploadProgress: (state) => {
      state.uploadProgress = 0;
    },
  },
  extraReducers: (builder) => {
    // Fetch Projects
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
        state.error = null;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });


   

    // Fetch My Projects
    builder
      .addCase(fetchMyProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myProjects = action.payload;
        state.error = null;
      })
      .addCase(fetchMyProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Project By ID
    builder
      .addCase(fetchProjectById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProject = action.payload;
        state.error = null;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Project
    builder
      .addCase(createProject.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isCreating = false;
        state.projects.unshift(action.payload); // Ajouter au début de la liste
        state.currentProject = action.payload;
        state.successMessage = 'Projet créé avec succès';
        state.uploadProgress = 100;
        state.error = null;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
        state.uploadProgress = 0;
      });

    // Update Project
    builder
      .addCase(updateProject.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.isUpdating = false;
        
        // Mettre à jour dans la liste
        const index = state.projects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        
        // Mettre à jour le projet actuel si c'est le même
        if (state.currentProject?.id === action.payload.id) {
          state.currentProject = action.payload;
        }
        
        state.successMessage = 'Projet mis à jour avec succès';
        state.error = null;
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete Project
    builder
      .addCase(deleteProject.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.isDeleting = false;
        
        // Retirer de la liste
        state.projects = state.projects.filter(p => p.id !== action.payload);
        
        // Réinitialiser le projet actuel si c'est celui supprimé
        if (state.currentProject?.id === action.payload) {
          state.currentProject = null;
        }
        
        state.successMessage = 'Projet supprimé avec succès';
        state.error = null;
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });

    // Delete Project Image
    builder
      .addCase(deleteProjectImage.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteProjectImage.fulfilled, (state, action) => {
        const { projectId, imageId } = action.payload;
        
        // Mettre à jour dans la liste
        const projectIndex = state.projects.findIndex(p => p.id === projectId);
        if (projectIndex !== -1) {
          state.projects[projectIndex].images = state.projects[projectIndex].images.filter(
            img => img.id !== imageId
          );
        }
        
        // Mettre à jour le projet actuel
        if (state.currentProject?.id === projectId) {
          state.currentProject.images = state.currentProject.images.filter(
            img => img.id !== imageId
          );
        }
        
        state.successMessage = 'Image supprimée avec succès';
        state.error = null;
      })
      .addCase(deleteProjectImage.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete Project File
    builder
      .addCase(deleteProjectFile.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteProjectFile.fulfilled, (state, action) => {
        const { projectId, fileId } = action.payload;
        
        // Mettre à jour dans la liste
        const projectIndex = state.projects.findIndex(p => p.id === projectId);
        if (projectIndex !== -1) {
          state.projects[projectIndex].files = state.projects[projectIndex].files.filter(
            file => file.id !== fileId
          );
        }
        
        // Mettre à jour le projet actuel
        if (state.currentProject?.id === projectId) {
          state.currentProject.files = state.currentProject.files.filter(
            file => file.id !== fileId
          );
        }
        
        state.successMessage = 'Fichier supprimé avec succès';
        state.error = null;
      })
      .addCase(deleteProjectFile.rejected, (state, action) => {
        state.error = action.payload as string;
      });

      // Accept Project
    builder
      .addCase(acceptProject.pending, (state) => {
        state.isAccepting = true;
        state.error = null;
      })
      .addCase(acceptProject.fulfilled, (state, action) => {
        state.isAccepting = false;
        
        const index = state.projects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        
        if (state.currentProject?.id === action.payload.id) {
          state.currentProject = action.payload;
        }
        
        state.successMessage = 'Projet accepté avec succès';
        state.error = null;
      })
      .addCase(acceptProject.rejected, (state, action) => {
        state.isAccepting = false;
        state.error = action.payload as string;
      });

    // Set Project Amounts
    builder
      .addCase(setProjectAmounts.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(setProjectAmounts.fulfilled, (state, action) => {
        state.isUpdating = false;
        
        const index = state.projects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        
        if (state.currentProject?.id === action.payload.id) {
          state.currentProject = action.payload;
        }
        
        state.successMessage = 'Montants définis avec succès';
        state.error = null;
      })
      .addCase(setProjectAmounts.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });
  }, // ✅ Fermeture de extraReducers
});

// Actions
export const {
  clearError,
  clearSuccessMessage,
  clearCurrentProject,
  setUploadProgress,
  resetUploadProgress,
} = projectSlice.actions;

// Sélecteurs
export const selectProjects = (state: RootState) => state.projects.projects;
export const selectMyProjects = (state: RootState) => state.projects.myProjects;
export const selectCurrentProject = (state: RootState) => state.projects.currentProject;
export const selectIsLoading = (state: RootState) => state.projects.isLoading;
export const selectIsCreating = (state: RootState) => state.projects.isCreating;
export const selectIsUpdating = (state: RootState) => state.projects.isUpdating;
export const selectIsDeleting = (state: RootState) => state.projects.isDeleting;
export const selectIsAccepting = (state: RootState) => state.projects.isAccepting;
export const selectUploadProgress = (state: RootState) => state.projects.uploadProgress;
export const selectError = (state: RootState) => state.projects.error;
export const selectSuccessMessage = (state: RootState) => state.projects.successMessage;

export const selectProjectById = (state: RootState, projectId: number | string) =>
  state.projects.projects.find(p => p.id === Number(projectId));

export const selectProjectsSortedByDate = (state: RootState) =>
  [...state.projects.projects].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

export const selectProjectsByStatus = (state: RootState, status: string) =>
  state.projects.projects.filter(p => p.status === status);

export default projectSlice.reducer;