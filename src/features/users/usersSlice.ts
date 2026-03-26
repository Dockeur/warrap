// src/features/users/usersSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import usersService from './usersService';
import { UsersState, WorkerProfile, WorkerFilters, Availability } from '@/types';
import { toast } from 'react-toastify';

const initialState: UsersState = {
  workers: [],
  selectedWorker: null,
  isLoading: false,
  error: null,
};

// Actions asynchrones
export const fetchWorkers = createAsyncThunk(
  'users/fetchWorkers',
  async (filters: WorkerFilters | undefined, { rejectWithValue }) => {
    try {
      return await usersService.getWorkers(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement');
    }
  }
);

export const fetchWorkersDis = createAsyncThunk(
  'users/fetchWorkersDis',
  async (id: number, { rejectWithValue }) => {
    try {
      return await usersService.getWorkersDis(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement');
    }
  }
);

export const fetchWorker = createAsyncThunk(
  'users/fetchWorker',
  async (id: number, { rejectWithValue }) => {
    try {
      return await usersService.getWorker(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Travailleur non trouvé');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'users/updateProfile',
  async (data: Partial<WorkerProfile>, { rejectWithValue }) => {
    try {
      const result = await usersService.updateProfile(data);
      toast.success('Profil mis à jour avec succès');
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'users/uploadAvatar',
  async (file: File, { rejectWithValue }) => {
    try {
      const url = await usersService.uploadAvatar(file);
      toast.success('Photo de profil mise à jour');
      return url;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Erreur lors de l'upload");
    }
  }
);

export const createAvailability = createAsyncThunk(
  'users/createAvailability',
  async (data: Omit<Availability, 'id'>, { rejectWithValue }) => {
    try {
      const result = await usersService.createAvailability(data);
      toast.success('Disponibilité ajoutée');
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Erreur lors de l'ajout");
    }
  }
);

export const updateAvailability = createAsyncThunk(
  'users/updateAvailability',
  async ({ id, data }: { id: number; data: Partial<Availability> }, { rejectWithValue }) => {
    try {
      const result = await usersService.updateAvailability(id, data);
      toast.success('Disponibilité mise à jour');
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  }
);

export const deleteAvailability = createAsyncThunk(
  'users/deleteAvailability',
  async (id: number, { rejectWithValue }) => {
    try {
      await usersService.deleteAvailability(id);
      toast.success('Disponibilité supprimée');
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  }
);

// Slice
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedWorker: (state) => {
      state.selectedWorker = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Workers
    builder
      .addCase(fetchWorkers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workers = action.payload;
      })
      .addCase(fetchWorkers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Worker
    builder
      .addCase(fetchWorker.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorker.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedWorker = action.payload;
      })
      .addCase(fetchWorker.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Worker Availa
    builder
      .addCase(fetchWorkersDis.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
    .addCase(fetchWorkersDis.fulfilled, (state, action) => {
  state.isLoading = false;
  state.workers = action.payload; // ← doit aller dans workers
})
      .addCase(fetchWorkersDis.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.selectedWorker?.id === action.payload.id) {
          state.selectedWorker = action.payload;
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSelectedWorker } = usersSlice.actions;
export default usersSlice.reducer;