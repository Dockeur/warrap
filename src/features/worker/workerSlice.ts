// src/features/worker/workerSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import workerService, {
  WorkerStats,
  AcceptedProject,
  ActiveProject,
  RecentProject,
  WorkerAvailability,
  WorkerNotification,
  EnginNotification,
  NotificationResponse,
  EnginNotificationResponse,
  MyProject,
} from './workerService';
import { RootState } from '../../store/store';

// ─── STATE ────────────────────────────────────────────────────────────────────

interface WorkerState {
  stats: WorkerStats | null;
  acceptedProjects: AcceptedProject[];
  activeProjects: ActiveProject[];
  recentProjects: RecentProject[];
  myProjects: MyProject[];
  availabilities: WorkerAvailability[];
  // Notifications worker (assignation projet)
  notifications: WorkerNotification[];
  // Notifications engin (assignation engin à projet)
  enginNotifications: EnginNotification[];
  isLoadingStats: boolean;
  isLoadingProjects: boolean;
  isLoadingMyProjects: boolean;
  isLoadingAvailabilities: boolean;
  isLoadingNotifications: boolean;
  isLoadingEnginNotifications: boolean;
  respondingId: number | null;       // id de la notif worker en cours de réponse
  respondingEnginId: number | null;  // id de la notif engin en cours de réponse
  error: string | null;
}

const initialState: WorkerState = {
  stats: null,
  acceptedProjects: [],
  activeProjects: [],
  recentProjects: [],
  myProjects: [],
  availabilities: [],
  notifications: [],
  enginNotifications: [],
  isLoadingStats: false,
  isLoadingProjects: false,
  isLoadingMyProjects: false,
  isLoadingAvailabilities: false,
  isLoadingNotifications: false,
  isLoadingEnginNotifications: false,
  respondingId: null,
  respondingEnginId: null,
  error: null,
};

// ─── THUNKS ───────────────────────────────────────────────────────────────────

export const fetchWorkerStats = createAsyncThunk(
  'worker/fetchStats',
  async (_, { rejectWithValue }) => {
    try { return await workerService.fetchWorkerStats(); }
    catch (error: any) { return rejectWithValue(error.message); }
  }
);

export const fetchAcceptedProjects = createAsyncThunk(
  'worker/fetchAcceptedProjects',
  async (_, { rejectWithValue }) => {
    try { return await workerService.fetchAcceptedProjects(); }
    catch (error: any) { return rejectWithValue(error.message); }
  }
);

export const fetchActiveProjects = createAsyncThunk(
  'worker/fetchActiveProjects',
  async (_, { rejectWithValue }) => {
    try { return await workerService.fetchActiveProjects(); }
    catch (error: any) { return rejectWithValue(error.message); }
  }
);

export const fetchRecentProjects = createAsyncThunk(
  'worker/fetchRecentProjects',
  async (_, { rejectWithValue }) => {
    try { return await workerService.fetchRecentProjects(); }
    catch (error: any) { return rejectWithValue(error.message); }
  }
);

/** GET /api/worker/my-projects */
export const fetchMyProjects = createAsyncThunk<MyProject[], void, { rejectValue: string }>(
  'worker/fetchMyProjects',
  async (_, { rejectWithValue }) => {
    try { return await workerService.fetchMyProjects(); }
    catch (error: any) { return rejectWithValue(error.message || 'Erreur récupération mes projets'); }
  }
);

export const fetchWorkerAvailabilities = createAsyncThunk(
  'worker/fetchAvailabilities',
  async (_, { rejectWithValue }) => {
    try { return await workerService.fetchWorkerAvailabilities(); }
    catch (error: any) { return rejectWithValue(error.message); }
  }
);

// ── Notifications worker ───────────────────────────────────────────────────────

/** GET /api/worker/my-notifications */
export const fetchMyNotifications = createAsyncThunk(
  'worker/fetchMyNotifications',
  async (_, { rejectWithValue }) => {
    try { return await workerService.fetchMyNotifications(); }
    catch (error: any) { return rejectWithValue(error.message); }
  }
);

/** PATCH /api/worker/notifications/{id}/respond */
export const respondToNotification = createAsyncThunk(
  'worker/respondToNotification',
  async (
    { id, response }: { id: number; response: NotificationResponse },
    { rejectWithValue }
  ) => {
    try { return await workerService.respondToNotification(id, response); }
    catch (error: any) { return rejectWithValue(error.message); }
  }
);

// ── Notifications engin ────────────────────────────────────────────────────────

/** GET /api/engin/my-notifications */
export const fetchEnginNotifications = createAsyncThunk<
  EnginNotification[],
  void,
  { rejectValue: string }
>(
  'worker/fetchEnginNotifications',
  async (_, { rejectWithValue }) => {
    try { return await workerService.fetchEnginNotifications(); }
    catch (error: any) { return rejectWithValue(error.message || 'Erreur récupération notifications engin'); }
  }
);

/** PATCH /api/engin/notifications/{id}/respond */
export const respondToEnginNotification = createAsyncThunk<
  EnginNotification,
  { id: number; response: EnginNotificationResponse },
  { rejectValue: string }
>(
  'worker/respondToEnginNotification',
  async ({ id, response }, { rejectWithValue }) => {
    try { return await workerService.respondToEnginNotification(id, response); }
    catch (error: any) { return rejectWithValue(error.message || 'Erreur réponse notification engin'); }
  }
);

// ── Retrait worker (admin) ─────────────────────────────────────────────────────

/** DELETE /api/projects/{projectId}/workers/{userId} */
export const removeWorkerFromProject = createAsyncThunk(
  'worker/removeWorkerFromProject',
  async (
    { projectId, userId }: { projectId: number; userId: number },
    { rejectWithValue }
  ) => {
    try {
      await workerService.removeWorkerFromProject(projectId, userId);
      return { projectId, userId };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// ─── SLICE ────────────────────────────────────────────────────────────────────

const workerSlice = createSlice({
  name: 'worker',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {

    // fetchWorkerStats
    builder
      .addCase(fetchWorkerStats.pending,   (state) => { state.isLoadingStats = true; state.error = null; })
      .addCase(fetchWorkerStats.fulfilled,  (state, { payload }) => { state.isLoadingStats = false; state.stats = payload; })
      .addCase(fetchWorkerStats.rejected,   (state, { payload }) => { state.isLoadingStats = false; state.error = payload as string; });

    // fetchAcceptedProjects
    builder
      .addCase(fetchAcceptedProjects.pending,   (state) => { state.isLoadingProjects = true; state.error = null; })
      .addCase(fetchAcceptedProjects.fulfilled,  (state, { payload }) => { state.isLoadingProjects = false; state.acceptedProjects = payload; })
      .addCase(fetchAcceptedProjects.rejected,   (state, { payload }) => { state.isLoadingProjects = false; state.error = payload as string; });

    // fetchActiveProjects
    builder
      .addCase(fetchActiveProjects.pending,   (state) => { state.isLoadingProjects = true; state.error = null; })
      .addCase(fetchActiveProjects.fulfilled,  (state, { payload }) => { state.isLoadingProjects = false; state.activeProjects = payload; })
      .addCase(fetchActiveProjects.rejected,   (state) => { state.isLoadingProjects = false; state.activeProjects = []; });

    // fetchRecentProjects
    builder
      .addCase(fetchRecentProjects.pending,   (state) => { state.isLoadingProjects = true; state.error = null; })
      .addCase(fetchRecentProjects.fulfilled,  (state, { payload }) => { state.isLoadingProjects = false; state.recentProjects = payload; })
      .addCase(fetchRecentProjects.rejected,   (state) => { state.isLoadingProjects = false; state.recentProjects = []; });

    // fetchMyProjects
    builder
      .addCase(fetchMyProjects.pending,   (state) => { state.isLoadingMyProjects = true; state.error = null; })
      .addCase(fetchMyProjects.fulfilled,  (state, { payload }) => { state.isLoadingMyProjects = false; state.myProjects = payload; })
      .addCase(fetchMyProjects.rejected,   (state, { payload }) => { state.isLoadingMyProjects = false; state.error = payload as string; state.myProjects = []; });

    // fetchWorkerAvailabilities
    builder
      .addCase(fetchWorkerAvailabilities.pending,   (state) => { state.isLoadingAvailabilities = true; state.error = null; })
      .addCase(fetchWorkerAvailabilities.fulfilled,  (state, { payload }) => { state.isLoadingAvailabilities = false; state.availabilities = payload; })
      .addCase(fetchWorkerAvailabilities.rejected,   (state) => { state.isLoadingAvailabilities = false; state.availabilities = []; });

    // fetchMyNotifications (worker)
    builder
      .addCase(fetchMyNotifications.pending,   (state) => { state.isLoadingNotifications = true; state.error = null; })
      .addCase(fetchMyNotifications.fulfilled,  (state, { payload }) => { state.isLoadingNotifications = false; state.notifications = payload; })
      .addCase(fetchMyNotifications.rejected,   (state, { payload }) => { state.isLoadingNotifications = false; state.error = payload as string; state.notifications = []; });

    // respondToNotification (worker) — met à jour la notif localement
    builder
      .addCase(respondToNotification.pending, (state, { meta }) => {
        state.respondingId = meta.arg.id;
        state.error = null;
      })
      .addCase(respondToNotification.fulfilled, (state, { payload }) => {
        state.respondingId = null;
        const idx = state.notifications.findIndex((n) => n.id === payload.id);
        if (idx !== -1) state.notifications[idx] = payload;
      })
      .addCase(respondToNotification.rejected, (state, { payload }) => {
        state.respondingId = null;
        state.error = payload as string;
      });

    // fetchEnginNotifications
    builder
      .addCase(fetchEnginNotifications.pending,   (state) => { state.isLoadingEnginNotifications = true; state.error = null; })
      .addCase(fetchEnginNotifications.fulfilled,  (state, { payload }) => { state.isLoadingEnginNotifications = false; state.enginNotifications = payload; })
      .addCase(fetchEnginNotifications.rejected,   (state, { payload }) => { state.isLoadingEnginNotifications = false; state.error = payload as string; state.enginNotifications = []; });

    // respondToEnginNotification — met à jour la notif localement
    builder
      .addCase(respondToEnginNotification.pending, (state, { meta }) => {
        state.respondingEnginId = meta.arg.id;
        state.error = null;
      })
      .addCase(respondToEnginNotification.fulfilled, (state, { payload }) => {
        state.respondingEnginId = null;
        const idx = state.enginNotifications.findIndex((n) => n.id === payload.id);
        if (idx !== -1) state.enginNotifications[idx] = payload;
      })
      .addCase(respondToEnginNotification.rejected, (state, { payload }) => {
        state.respondingEnginId = null;
        state.error = payload as string;
      });

    // removeWorkerFromProject
    builder
      .addCase(removeWorkerFromProject.rejected, (state, { payload }) => {
        state.error = payload as string;
      });
  },
});

// ─── ACTIONS ──────────────────────────────────────────────────────────────────

export const { clearError } = workerSlice.actions;

// ─── SELECTORS ────────────────────────────────────────────────────────────────

export const selectWorkerStats               = (state: RootState) => state.worker.stats;
export const selectAcceptedProjects          = (state: RootState) => state.worker.acceptedProjects;
export const selectActiveProjects            = (state: RootState) => state.worker.activeProjects;
export const selectRecentProjects            = (state: RootState) => state.worker.recentProjects;
export const selectMyProjects                = (state: RootState) => state.worker.myProjects;
export const selectWorkerAvailabilities      = (state: RootState) => state.worker.availabilities;
export const selectWorkerNotifications       = (state: RootState) => state.worker.notifications;
export const selectEnginNotifications        = (state: RootState) => state.worker.enginNotifications;
export const selectIsLoadingStats            = (state: RootState) => state.worker.isLoadingStats;
export const selectIsLoadingProjects         = (state: RootState) => state.worker.isLoadingProjects;
export const selectIsLoadingMyProjects       = (state: RootState) => state.worker.isLoadingMyProjects;
export const selectIsLoadingAvailabilities   = (state: RootState) => state.worker.isLoadingAvailabilities;
export const selectIsLoadingNotifications    = (state: RootState) => state.worker.isLoadingNotifications;
export const selectIsLoadingEnginNotifications = (state: RootState) => state.worker.isLoadingEnginNotifications;
export const selectRespondingId              = (state: RootState) => state.worker.respondingId;
export const selectRespondingEnginId         = (state: RootState) => state.worker.respondingEnginId;
export const selectWorkerError               = (state: RootState) => state.worker.error;

/** Notifications worker en attente */
export const selectPendingNotificationsCount = (state: RootState) =>
  state.worker.notifications.filter((n) => n.status === 'pending').length;

/** Notifications engin en attente */
export const selectPendingEnginNotificationsCount = (state: RootState) =>
  state.worker.enginNotifications.filter((n) => n.status === 'pending').length;

export default workerSlice.reducer;