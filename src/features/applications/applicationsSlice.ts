// src/features/applications/applicationsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import applicationsService from './applicationsService';
import { DashboardResponse, ProjectStatsParsed } from '../../types';

interface ApplicationsState {
  dashboard: DashboardResponse | null;
  acceptedProjects: ProjectStatsParsed[]; // tableau de projets acceptés
  isLoading: boolean;
  error: string | null;
}

const initialState: ApplicationsState = {
  dashboard: null,
  acceptedProjects: [],
  isLoading: false,
  error: null,
};

// --- ASYNC THUNKS ---

// Récupérer les stats du worker
export const fetchWorker = createAsyncThunk<
  DashboardResponse,
  void,
  { rejectValue: string }
>('applications/fetchWorker', async (_, { rejectWithValue }) => {
  try {
    const worker = await applicationsService.fetchWorker();
    return worker;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

// --- fetchWorkerProjects ---
export const fetchWorkerProjects = createAsyncThunk<
  ProjectStatsParsed[],
  void,
  { rejectValue: string }
>('applications/fetchWorkerProjects', async (_, { rejectWithValue }) => {
  try {
    const response: any = await applicationsService.fetchWorkerProject();
    
    // Si l'API renvoie { data: [...] }, on prend response.data
    // Sinon on prend response directement
    const projects = response.data || response;
    
    return Array.isArray(projects) ? projects : [projects];
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

// --- SLICE ---
const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // --- fetchWorker ---
    builder
      .addCase(fetchWorker.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorker.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchWorker.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Erreur inconnue';
      });

    // --- fetchWorkerProjects ---
    builder
      .addCase(fetchWorkerProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkerProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.acceptedProjects = action.payload;
      })
      .addCase(fetchWorkerProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Erreur inconnue';
      });
  },
});

export const { clearError } = applicationsSlice.actions;
export default applicationsSlice.reducer;
