// src/features/observations/observationsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import observationsService, {
  Observation,
  CreateObservationData,
  UpdateObservationData,
} from './observationsService';
import { RootState } from '../../store/store';

// État initial
interface ObservationsState {
  observations: Observation[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ObservationsState = {
  observations: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  successMessage: null,
};

// Thunks asynchrones
export const fetchObservations = createAsyncThunk(
  'observations/fetchObservations',
  async (projectId: number | string, { rejectWithValue }) => {
    try {
      console.log(`🔄 Redux - Chargement des observations du projet #${projectId}...`);
      const observations = await observationsService.fetchObservations(projectId);
      console.log('✅ Redux - Observations chargées:', observations.length);
      return observations;
    } catch (error: any) {
      console.error('❌ Redux - Erreur:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const createObservation = createAsyncThunk(
  'observations/createObservation',
  async (
    {
      projectId,
      observationData,
    }: {
      projectId: number | string;
      observationData: CreateObservationData;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log(`🔄 Redux - Création d'une observation...`);
      const observation = await observationsService.createObservation(projectId, observationData);
      console.log('✅ Redux - Observation créée:', observation.name);
      return observation;
    } catch (error: any) {
      console.error('❌ Redux - Erreur:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const updateObservation = createAsyncThunk(
  'observations/updateObservation',
  async (
    {
      projectId,
      observationId,
      observationData,
    }: {
      projectId: number | string;
      observationId: number;
      observationData: UpdateObservationData;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log(`🔄 Redux - Mise à jour de l'observation #${observationId}...`);
      const observation = await observationsService.updateObservation(
        projectId,
        observationId,
        observationData
      );
      console.log('✅ Redux - Observation mise à jour');
      return observation;
    } catch (error: any) {
      console.error('❌ Redux - Erreur:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteObservation = createAsyncThunk(
  'observations/deleteObservation',
  async (
    {
      projectId,
      observationId,
    }: {
      projectId: number | string;
      observationId: number;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log(`🔄 Redux - Suppression de l'observation #${observationId}...`);
      await observationsService.deleteObservation(projectId, observationId);
      console.log('✅ Redux - Observation supprimée');
      return observationId;
    } catch (error: any) {
      console.error('❌ Redux - Erreur:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const observationsSlice = createSlice({
  name: 'observations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearObservations: (state) => {
      state.observations = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch Observations
    builder
      .addCase(fetchObservations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchObservations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.observations = action.payload;
        state.error = null;
      })
      .addCase(fetchObservations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Observation
    builder
      .addCase(createObservation.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createObservation.fulfilled, (state, action) => {
        state.isCreating = false;
        state.observations.unshift(action.payload); // Ajouter au début
        state.successMessage = 'Observation ajoutée avec succès';
        state.error = null;
      })
      .addCase(createObservation.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Update Observation
    builder
      .addCase(updateObservation.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateObservation.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.observations.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.observations[index] = action.payload;
        }
        state.successMessage = 'Observation mise à jour avec succès';
        state.error = null;
      })
      .addCase(updateObservation.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete Observation
    builder
      .addCase(deleteObservation.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteObservation.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.observations = state.observations.filter((o) => o.id !== action.payload);
        state.successMessage = 'Observation supprimée avec succès';
        state.error = null;
      })
      .addCase(deleteObservation.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { clearError, clearSuccessMessage, clearObservations } = observationsSlice.actions;

// Sélecteurs
export const selectObservations = (state: RootState) => state.observations.observations;
export const selectIsLoading = (state: RootState) => state.observations.isLoading;
export const selectIsCreating = (state: RootState) => state.observations.isCreating;
export const selectIsUpdating = (state: RootState) => state.observations.isUpdating;
export const selectIsDeleting = (state: RootState) => state.observations.isDeleting;
export const selectError = (state: RootState) => state.observations.error;
export const selectSuccessMessage = (state: RootState) => state.observations.successMessage;

export default observationsSlice.reducer;