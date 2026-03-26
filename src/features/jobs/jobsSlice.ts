// src/features/jobs/jobsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import jobsService, {
  Job,
  LaunchInfo,
  ManagerLaunchInfo,
  ManagerProjectsParams,
  ProjectUser,
  AssignUserData,
  AssignEnginData,
  AssignedEngin,
  AvailableEngin,
  UpdateAssignmentData,
  extractErrorMessage,
} from './jobsService';

interface JobsState {
  jobs: Job[];
  selectedJob: Job | null;
  assignedUsers: ProjectUser[];
  assignedEngins: AssignedEngin[];
  availableEngins: AvailableEngin[];
  isLoading: boolean;
  isLoadingUsers: boolean;
  isLoadingEngins: boolean;
  isLoadingAvailableEngins: boolean;
  error: string | null;
  managerPagination: {
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
  };
}

const initialState: JobsState = {
  jobs: [],
  selectedJob: null,
  assignedUsers: [],
  assignedEngins: [],
  availableEngins: [],
  isLoading: false,
  isLoadingUsers: false,
  isLoadingEngins: false,
  isLoadingAvailableEngins: false,
  error: null,
  managerPagination: { total: 0, current_page: 1, last_page: 1, per_page: 10 },
};



export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async (_, { rejectWithValue }) => {
  try { return await jobsService.fetchJobs(); }
  catch (e: any) {
    const msg = extractErrorMessage(e, 'Erreur lors du chargement des projets');
    toast.error(msg);
    return rejectWithValue(msg);
  }
});

export const fetchJob = createAsyncThunk('jobs/fetchJob', async (id: number, { rejectWithValue }) => {
  try { return await jobsService.fetchJob(id); }
  catch (e: any) {
    const msg = extractErrorMessage(e, 'Erreur lors du chargement du projet');
    return rejectWithValue(msg);
  }
});

export const fetchManagerJob = createAsyncThunk('jobs/fetchManagerJob', async (id: number, { rejectWithValue }) => {
  try { return await jobsService.fetchManagerJob(id); }
  catch (e: any) {
    const msg = extractErrorMessage(e, 'Erreur lors du chargement du projet');
    return rejectWithValue(msg);
  }
});



export const fetchManagerProjects = createAsyncThunk(
  'jobs/fetchManagerProjects',
  async (params: ManagerProjectsParams, { rejectWithValue }) => {
    try { return await jobsService.fetchManagerProjects(params); }
    catch (e: any) {
      const msg = extractErrorMessage(e, 'Erreur lors du chargement des projets');
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const managerUpdateLaunch = createAsyncThunk(
  'jobs/managerUpdateLaunch',
  async ({ projectId, data }: { projectId: number; data: ManagerLaunchInfo }, { rejectWithValue, dispatch }) => {
    try {
      const msg = await jobsService.managerUpdateLaunch(projectId, data);
      toast.success(msg);
      dispatch(fetchJob(projectId));
    } catch (e: any) {
      const msg = extractErrorMessage(e, 'Erreur lors de la configuration du lancement');
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const managerRateWorker = createAsyncThunk(
  'jobs/managerRateWorker',
  async ({ projectUserId, note }: { projectUserId: number; note: number }, { rejectWithValue }) => {
    try {
      const msg = await jobsService.managerRateWorker(projectUserId, note);
      toast.success(msg);
    } catch (e: any) {
      const msg = extractErrorMessage(e, 'Erreur lors de la notation');
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);



export const setLaunchInfo = createAsyncThunk(
  'jobs/setLaunchInfo',
  async ({ projectId, data }: { projectId: number; data: LaunchInfo }, { rejectWithValue, dispatch }) => {
    try {
      const msg = await jobsService.setLaunchInfo(projectId, data);
      toast.success(msg);
      dispatch(fetchJob(projectId));
    } catch (e: any) {
      const msg = extractErrorMessage(e, 'Erreur lors de la configuration du lancement');
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const updateLaunchInfo = createAsyncThunk(
  'jobs/updateLaunchInfo',
  async ({ projectId, data }: { projectId: number; data: Partial<LaunchInfo> }, { rejectWithValue, dispatch }) => {
    try {
      const msg = await jobsService.updateLaunchInfo(projectId, data);
      toast.success(msg);
      dispatch(fetchJob(projectId));
    } catch (e: any) {
      const msg = extractErrorMessage(e, 'Erreur lors de la mise à jour du lancement');
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const deleteLaunchInfo = createAsyncThunk(
  'jobs/deleteLaunchInfo',
  async (projectId: number, { rejectWithValue, dispatch }) => {
    try {
      const msg = await jobsService.deleteLaunchInfo(projectId);
      toast.success(msg);
      dispatch(fetchJob(projectId));
    } catch (e: any) {
      const msg = extractErrorMessage(e, 'Erreur lors de la suppression du lancement');
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const setEndDate = createAsyncThunk(
  'jobs/setEndDate',
  async ({ projectId, endDate }: { projectId: number; endDate: string }, { rejectWithValue, dispatch }) => {
    try {
      const msg = await jobsService.setEndDate(projectId, endDate);
      toast.success(msg);
      dispatch(fetchJob(projectId));
    } catch (e: any) {
      const msg = extractErrorMessage(e, 'Erreur lors de la définition de la date de fin');
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);



export const fetchAssignedUsers = createAsyncThunk(
  'jobs/fetchAssignedUsers',
  async (projectId: number, { rejectWithValue }) => {
    try { return await jobsService.fetchAssignedUsers(projectId); }
    catch (e: any) { return rejectWithValue(extractErrorMessage(e, 'Erreur')); }
  }
);

export const assignUser = createAsyncThunk(
  'jobs/assignUser',
  async ({ projectId, data }: { projectId: number; data: AssignUserData }, { rejectWithValue, dispatch }) => {
    try {
      const msg = await jobsService.assignUser(projectId, data);
      toast.success(msg);
      dispatch(fetchJob(projectId));
    } catch (e: any) {
      const msg = extractErrorMessage(e, "Erreur lors de l'assignation");
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const removeAssignedUser = createAsyncThunk(
  'jobs/removeAssignedUser',
  async ({ assignmentId, projectId }: { assignmentId: number; projectId: number }, { rejectWithValue, dispatch }) => {
    try {
      const msg = await jobsService.removeAssignedUser(assignmentId);
      toast.success(msg);
      dispatch(fetchJob(projectId));
    } catch (e: any) {
      const msg = extractErrorMessage(e, 'Erreur lors du retrait');
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const updateAssignedUser = createAsyncThunk(
  'jobs/updateAssignedUser',
  async (
    { assignmentId, projectId, data }: { assignmentId: number; projectId: number; data: UpdateAssignmentData },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const msg = await jobsService.updateAssignedUser(assignmentId, data);
      toast.success(msg);
      dispatch(fetchAssignedUsers(projectId));
    } catch (e: any) {
      const msg = extractErrorMessage(e, 'Erreur lors de la mise à jour');
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);



export const addWorkerToJob = createAsyncThunk(
  'jobs/addWorker',
  async ({ jobId, userId }: { jobId: number; userId: number }, { rejectWithValue, dispatch }) => {
    try {
      const msg = await jobsService.addWorkerToJob(jobId, userId);
      toast.success(msg);
      dispatch(fetchJob(jobId));
    } catch (e: any) {
      const msg = extractErrorMessage(e, "Erreur lors de l'ajout");
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const removeWorkerFromJob = createAsyncThunk(
  'jobs/removeWorker',
  async ({ jobId, userId }: { jobId: number; userId: number }, { rejectWithValue, dispatch }) => {
    try {
      const msg = await jobsService.removeWorkerFromJob(jobId, userId);
      toast.success(msg);
      dispatch(fetchJob(jobId));
    } catch (e: any) {
      const msg = extractErrorMessage(e, 'Erreur lors du retrait');
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const rateWorker = createAsyncThunk(
  'jobs/rateWorker',
  async ({ jobId, workerId, note }: { jobId: number; workerId: number; note: string }, { rejectWithValue }) => {
    try {
      const msg = await jobsService.rateWorker(jobId, workerId, note);
      toast.success(msg);
    } catch (e: any) {
      const msg = extractErrorMessage(e, 'Erreur lors de la notation');
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);




export const fetchAvailableEngins = createAsyncThunk(
  'jobs/fetchAvailableEngins',
  async (projectId: number, { rejectWithValue }) => {
    try { return await jobsService.fetchAvailableEngins(projectId); }
    catch (e: any) { return rejectWithValue(extractErrorMessage(e, 'Erreur chargement engins disponibles')); }
  }
);


export const fetchAssignedEngins = createAsyncThunk(
  'jobs/fetchAssignedEngins',
  async (projectId: number, { rejectWithValue }) => {
    try { return await jobsService.fetchAssignedEngins(projectId); }
    catch (e: any) { return rejectWithValue(extractErrorMessage(e, 'Erreur')); }
  }
);

export const assignEngin = createAsyncThunk(
  'jobs/assignEngin',
  async (
    { projectId, data }: { projectId: number; data: AssignEnginData },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const msg = await jobsService.assignEngin(projectId, data);
      toast.success(msg);
      dispatch(fetchAssignedEngins(projectId));
    } catch (e: any) {
      const msg = extractErrorMessage(e, "Erreur lors de l'assignation de l'engin");
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const removeEnginFromJob = createAsyncThunk(
  'jobs/removeEngin',
  async ({ jobId, pivotId }: { jobId: number; pivotId: number }, { rejectWithValue, dispatch }) => {
    try {
      const msg = await jobsService.removeEnginFromJob(pivotId);
      toast.success(msg);
      dispatch(fetchAssignedEngins(jobId));
    } catch (e: any) {
      const msg = extractErrorMessage(e, "Erreur lors du retrait de l'engin");
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);



const p = (state: JobsState) => { state.isLoading = true; state.error = null; };
const d = (state: JobsState) => { state.isLoading = false; };
const r = (state: JobsState, action: any) => { state.isLoading = false; state.error = action.payload as string; };

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearError:       (state) => { state.error = null; },
    clearSelectedJob: (state) => {
      state.selectedJob      = null;
      state.assignedUsers    = [];
      state.assignedEngins   = [];
      state.availableEngins  = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, p)
      .addCase(fetchJobs.fulfilled, (state, action) => { state.isLoading = false; state.jobs = action.payload; })
      .addCase(fetchJobs.rejected, r);

    builder
      .addCase(fetchJob.pending, p)
      .addCase(fetchJob.fulfilled, (state, action) => { state.isLoading = false; state.selectedJob = action.payload; })
      .addCase(fetchJob.rejected, r);

    builder
      .addCase(fetchManagerJob.pending, p)
      .addCase(fetchManagerJob.fulfilled, (state, action) => { state.isLoading = false; state.selectedJob = action.payload; })
      .addCase(fetchManagerJob.rejected, r);

    builder
      .addCase(fetchManagerProjects.pending, p)
      .addCase(fetchManagerProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload.data;
        state.managerPagination = {
          total:        action.payload.total,
          current_page: action.payload.current_page,
          last_page:    action.payload.last_page,
          per_page:     action.payload.per_page,
        };
      })
      .addCase(fetchManagerProjects.rejected, r);

    builder
      .addCase(fetchAssignedUsers.pending,   (state) => { state.isLoadingUsers = true; })
      .addCase(fetchAssignedUsers.fulfilled, (state, action) => { state.isLoadingUsers = false; state.assignedUsers = action.payload; })
      .addCase(fetchAssignedUsers.rejected,  (state) => { state.isLoadingUsers = false; });

    builder
      .addCase(fetchAssignedEngins.pending,   (state) => { state.isLoadingEngins = true; })
      .addCase(fetchAssignedEngins.fulfilled, (state, action) => { state.isLoadingEngins = false; state.assignedEngins = action.payload; })
      .addCase(fetchAssignedEngins.rejected,  (state) => { state.isLoadingEngins = false; });

    builder
      .addCase(fetchAvailableEngins.pending,   (state) => { state.isLoadingAvailableEngins = true; })
      .addCase(fetchAvailableEngins.fulfilled, (state, action) => { state.isLoadingAvailableEngins = false; state.availableEngins = action.payload; })
      .addCase(fetchAvailableEngins.rejected,  (state) => { state.isLoadingAvailableEngins = false; });

    const simpleThunks = [
      setLaunchInfo, updateLaunchInfo, deleteLaunchInfo, setEndDate,
      managerUpdateLaunch, managerRateWorker,
      assignUser, removeAssignedUser, updateAssignedUser,
      addWorkerToJob, removeWorkerFromJob, rateWorker,
      assignEngin, removeEnginFromJob,
    ];
    simpleThunks.forEach((thunk) => {
      builder.addCase(thunk.pending, p).addCase(thunk.fulfilled, d).addCase(thunk.rejected, r);
    });
  },
});

export const { clearError, clearSelectedJob } = jobsSlice.actions;
export default jobsSlice.reducer;