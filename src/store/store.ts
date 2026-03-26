// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from '../features/auth/authSlice';
import usersReducer from '../features/users/usersSlice';
import projectsReducer from '../features/projects/projectsSlice';
import applicationsReducer from '../features/applications/applicationsSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import observationsReducer from '../features/observations/observationsSlice';
import workerReducer from '../features/worker/workerSlice';
import jobsReducer from '../features/jobs/jobsSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    projects: projectsReducer,
    applications: applicationsReducer,
    worker: workerReducer,
    notifications: notificationsReducer,
    observations: observationsReducer,
    jobs:jobsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks typés pour utiliser dans les composants
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;