import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/store';
import {
  fetchJob,
  setLaunchInfo,
  updateLaunchInfo,
  deleteLaunchInfo,
  setEndDate,
  addWorkerToJob,
  fetchManagerJob,
  fetchAssignedEngins,
  fetchAvailableEngins,
  assignEngin,
} from '../../features/jobs/jobsSlice';
import { fetchWorkersDis } from '../../features/users/usersSlice';
import {
  LaunchInfo,
  ManagerLaunchInfo,
  AssignedWorker,
  AssignedEngin,
  AvailableEngin,
} from '../../features/jobs/jobsService';
import workerService from '../../features/worker/workerService';
import jobsService from '../../features/jobs/jobsService';
import { toast } from 'react-toastify';

const getLocName = (loc: any): string | null => {
  if (!loc) return null;
  if (typeof loc === 'string') return loc;
  if (typeof loc === 'object' && loc.name) return loc.name;
  return null;
};

const isAvailableDuring = (worker: any, jobStart: string, jobEnd: string): boolean => {
  const avails: any[] = worker.availabilities ?? worker.availability ?? [];
  if (!avails.length) return true;
  const jS = new Date(jobStart).getTime();
  const jE = new Date(jobEnd).getTime();
  return avails.some((a: any) => {
    const aS = new Date(a.start_date ?? a.startDate ?? a.from).getTime();
    const aE = new Date(a.end_date   ?? a.endDate   ?? a.to).getTime();
    return aS <= jS && aE >= jE;
  });
};

const LAUNCH_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'En attente', color: 'bg-orange-100 text-orange-600' },
  ongoing:   { label: 'En cours',   color: 'bg-green-100 text-green-700'   },
  completed: { label: 'Terminé',    color: 'bg-gray-100 text-gray-600'     },
};

const ENGIN_STATUS: Record<string, { label: string; color: string }> = {
  pending:  { label: 'En attente', color: 'bg-orange-100 text-orange-600' },
  accepted: { label: 'Accepté',    color: 'bg-green-100 text-green-700'   },
  refused:  { label: 'Refusé',     color: 'bg-red-100 text-red-600'       },
};

const Spinner = () => (
  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
);

const ConfirmRemoveWorkerModal: React.FC<{
  workerName: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ workerName, loading, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] px-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[popIn_0.18s_ease-out]">
      <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mx-auto mb-4">
        <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h16v-1a6 6 0 00-6-6H9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2 2 4-4" />
        </svg>
      </div>
      <h3 className="text-center text-gray-800 font-bold text-base mb-1.5">Retirer ce travailleur ?</h3>
      <p className="text-center text-gray-500 text-sm mb-1 leading-relaxed">Vous allez retirer</p>
      <p className="text-center text-gray-800 font-semibold text-sm mb-2 truncate px-2">« {workerName} »</p>
      <p className="text-center text-gray-400 text-xs mb-6">Ce travailleur ne sera plus assigné à ce projet.</p>
      <div className="flex gap-3">
        <button onClick={onCancel} disabled={loading}
          className="flex-1 border border-gray-200 text-gray-600 font-semibold text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
          Annuler
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-60">
          {loading ? <Spinner /> : 'Retirer'}
        </button>
      </div>
    </div>
    <style>{`@keyframes popIn { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }`}</style>
  </div>
);

const ConfirmRemoveEnginModal: React.FC<{
  enginName: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ enginName, loading, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] px-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[popIn_0.18s_ease-out]">
      <div className="flex items-center justify-center w-14 h-14 bg-orange-100 rounded-full mx-auto mb-4">
        <span className="text-2xl">🚜</span>
      </div>
      <h3 className="text-center text-gray-800 font-bold text-base mb-1.5">Retirer cet engin ?</h3>
      <p className="text-center text-gray-500 text-sm mb-1 leading-relaxed">Vous allez retirer</p>
      <p className="text-center text-gray-800 font-semibold text-sm mb-2 truncate px-2">« {enginName} »</p>
      <p className="text-center text-gray-400 text-xs mb-6">Cet engin ne sera plus assigné à ce projet.</p>
      <div className="flex gap-3">
        <button onClick={onCancel} disabled={loading}
          className="flex-1 border border-gray-200 text-gray-600 font-semibold text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
          Annuler
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-60">
          {loading ? <Spinner /> : 'Retirer'}
        </button>
      </div>
    </div>
    <style>{`@keyframes popIn { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }`}</style>
  </div>
);

const NoteStars: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
          n <= value
            ? 'bg-amber-400 text-white shadow-sm scale-105'
            : 'bg-gray-100 text-gray-400 hover:bg-amber-100 hover:text-amber-600'
        }`}
      >
        {n}
      </button>
    ))}
  </div>
);

const JobDetail: React.FC = () => {
  const { id }   = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    selectedJob,
    isLoading,
    assignedEngins,
    availableEngins,
    isLoadingAvailableEngins,
  } = useAppSelector((s) => s.jobs);
  const { workers } = useAppSelector((s) => s.users);
  const { user }    = useAppSelector((s) => s.auth);

  const isAdmin     = user?.role === 'admin';
  const isValidator = user?.role === 'validator';
  const isManager   = user?.role === 'manager';
  const canManage   = isAdmin || isValidator || isManager;

  const [showLaunchModal,   setShowLaunchModal]   = useState(false);
  const [isEditingLaunch,   setIsEditingLaunch]   = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEndDateModal,  setShowEndDateModal]  = useState(false);
  const [showAddWorker,     setShowAddWorker]     = useState(false);
  const [showAddEngin,      setShowAddEngin]      = useState(false);

  const [removeWorkerTarget, setRemoveWorkerTarget] = useState<{ worker: AssignedWorker; name: string } | null>(null);
  const [isRemovingWorker,   setIsRemovingWorker]   = useState(false);
  const [removeEnginTarget,  setRemoveEnginTarget]  = useState<{ engin: AssignedEngin; name: string } | null>(null);
  const [isRemovingEngin,    setIsRemovingEngin]    = useState(false);

  const [rateTarget,    setRateTarget]    = useState<{ projectUserId: number; name: string; currentNote: number | null } | null>(null);
  const [noteValue,     setNoteValue]     = useState<number>(0);
  const [isRating,      setIsRating]      = useState(false);

  const [launchForm, setLaunchForm] = useState<{
    deadline: string; started_at: string;
    launch_status: LaunchInfo['launch_status'];
    localisation_worker_id: number | '';
  }>({ deadline: '', started_at: '', launch_status: 'pending', localisation_worker_id: '' });

  const [managerLaunchForm, setManagerLaunchForm] = useState<{
    deadline: string; started_at: string;
    launch_status: ManagerLaunchInfo['launch_status'];
  }>({ deadline: '', started_at: '', launch_status: 'pending' });

  const [endDateValue,       setEndDateValue]       = useState('');
  const [selectedUserId,     setSelectedUserId]     = useState<number | ''>('');
  const [searchWorker,       setSearchWorker]       = useState('');
  const [ignoreLocalisation, setIgnoreLocalisation] = useState(false);
  const [ignoreAvailability, setIgnoreAvailability] = useState(false);
  const [localisations,      setLocalisations]      = useState<{ id: number; name: string }[]>([]);

  const [selectedEnginId, setSelectedEnginId] = useState<number | ''>('');
  const [searchEngin,     setSearchEngin]     = useState('');
  const [enginTask,       setEnginTask]       = useState('');
  const [enginStartAt,    setEnginStartAt]    = useState('');
  const [enginEndAt,      setEnginEndAt]      = useState('');

  useEffect(() => {
    if (id) {
      if (isManager) {
        dispatch(fetchManagerJob(Number(id)));
      } else {
        dispatch(fetchJob(Number(id)));
      }
      dispatch(fetchWorkersDis(Number(id)));
      dispatch(fetchAssignedEngins(Number(id)));
    }
  }, [dispatch, id, isManager]);

  useEffect(() => {
    if (isManager) return;
    const fetchLocs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/localisation-workers`, {
          headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (res.ok) {
          const data = await res.json();
          setLocalisations(Array.isArray(data) ? data : data.data ?? []);
        }
      } catch { setLocalisations([]); }
    };
    fetchLocs();
  }, [isManager]);

  useEffect(() => {
    if (showAddEngin && id) dispatch(fetchAvailableEngins(Number(id)));
  }, [showAddEngin, id, dispatch]);

  const jobStart        = selectedJob?.started_at ?? null;
  const jobEnd          = selectedJob?.ended_at   ?? null;
  const jobStatus       = selectedJob?.launch_status ?? null;
  const jobDeadline     = selectedJob?.deadline   ?? null;
  const jobLocId        = selectedJob?.localisation_worker_id ?? null;
  const jobLocalisation = getLocName((selectedJob as any)?.localisation);
  const hasLaunchInfo   = !!jobStart;

  const assignedWorkers: AssignedWorker[] = (selectedJob as any)?.assigned_workers ?? [];
  const assignedWorkerUserIds = new Set(assignedWorkers.map((w) => w.user_id));
  const assignedEnginUserIds  = new Set(assignedEngins.map((e) => e.user_id));

  const isJobFinished = jobStatus === 'completed' || (!!jobEnd && new Date() > new Date(jobEnd));
  const isJobActive   = jobStatus === 'ongoing' ||
    (!!jobStart && !!jobEnd && new Date() >= new Date(jobStart) && new Date() <= new Date(jobEnd));

  const getStatusBadge = () => {
    if (!selectedJob)   return null;
    if (!hasLaunchInfo) return { label: 'Non planifié', color: 'bg-orange-100 text-orange-600' };
    if (jobStatus && LAUNCH_STATUS_LABELS[jobStatus]) return LAUNCH_STATUS_LABELS[jobStatus];
    if (isJobFinished)  return LAUNCH_STATUS_LABELS.completed;
    if (isJobActive)    return LAUNCH_STATUS_LABELS.ongoing;
    return { label: 'À venir', color: 'bg-blue-100 text-blue-700' };
  };

  const formatDate = (d?: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatDateShort = (d?: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  const toInputDate = (d?: string | null) => {
    if (!d) return '';
    return new Date(d).toISOString().split('T')[0];
  };

  const filteredWorkers = workers.filter((w) => {
    if (assignedWorkerUserIds.has(w.id)) return false;
    const matchesSearch = `${w.firstName} ${w.lastName}`.toLowerCase().includes(searchWorker.toLowerCase());
    const workerLoc     = getLocName((w as any).localisation);
    const matchesLoc    = ignoreLocalisation || !jobLocalisation ? true : workerLoc === jobLocalisation;
    const matchesAvail  = ignoreAvailability || !jobStart || !jobEnd ? true : isAvailableDuring(w, jobStart, jobEnd);
    return matchesSearch && matchesLoc && matchesAvail;
  });

  const workersInCity    = jobLocalisation ? workers.filter((w) => getLocName((w as any).localisation) === jobLocalisation).length : workers.length;
  const workersAvailable = jobStart && jobEnd ? workers.filter((w) => isAvailableDuring(w, jobStart, jobEnd)).length : workers.length;
  const workersMatchBoth = workers.filter((w) => {
    if (assignedWorkerUserIds.has(w.id)) return false;
    const locOk   = !jobLocalisation || getLocName((w as any).localisation) === jobLocalisation;
    const availOk = !jobStart || !jobEnd || isAvailableDuring(w, jobStart, jobEnd);
    return locOk && availOk;
  }).length;

  const filteredAvailableEngins: AvailableEngin[] = availableEngins.filter((e) => {
    if (!e || !e.engin) return false;
    if (assignedEnginUserIds.has(e.user_id)) return false;
    const name = `${e.engin.nameOfTheEngin ?? ''} ${e.engin.brandOfTheDevice ?? ''}`.toLowerCase();
    const city = (e.city ?? '').toLowerCase();
    const q    = searchEngin.toLowerCase();
    return q === '' || name.includes(q) || city.includes(q);
  });

  const openLaunchModal = (edit = false) => {
    setIsEditingLaunch(edit);
    if (isManager) {
      setManagerLaunchForm(edit && hasLaunchInfo
        ? { deadline: String(jobDeadline ?? ''), started_at: toInputDate(jobStart), launch_status: (jobStatus as ManagerLaunchInfo['launch_status']) ?? 'pending' }
        : { deadline: '', started_at: '', launch_status: 'pending' }
      );
    } else {
      setLaunchForm(edit && hasLaunchInfo
        ? { deadline: String(jobDeadline ?? ''), started_at: toInputDate(jobStart), launch_status: (jobStatus as LaunchInfo['launch_status']) ?? 'pending', localisation_worker_id: jobLocId ?? '' }
        : { deadline: '', started_at: '', launch_status: 'pending', localisation_worker_id: '' }
      );
    }
    setShowLaunchModal(true);
  };

  const handleLaunchSubmit = async () => {
    if (isManager) {
      if (!managerLaunchForm.started_at || !managerLaunchForm.deadline) return;
      await dispatch((async (dispatch: any) => {
        const { managerUpdateLaunch } = await import('../../features/jobs/jobsSlice');
        await dispatch(managerUpdateLaunch({
          projectId: Number(id),
          data: { deadline: Number(managerLaunchForm.deadline), started_at: managerLaunchForm.started_at, launch_status: managerLaunchForm.launch_status },
        }));
      }) as any);
    } else {
      if (!launchForm.started_at || !launchForm.deadline || !launchForm.localisation_worker_id) return;
      const payload: LaunchInfo = {
        deadline: Number(launchForm.deadline),
        started_at: launchForm.started_at,
        launch_status: launchForm.launch_status,
        localisation_worker_id: Number(launchForm.localisation_worker_id),
      };
      isEditingLaunch
        ? await dispatch(updateLaunchInfo({ projectId: Number(id), data: payload }))
        : await dispatch(setLaunchInfo({ projectId: Number(id), data: payload }));
    }
    setShowLaunchModal(false);
  };

  const handleConfirmDelete = async () => {
    await dispatch(deleteLaunchInfo(Number(id)));
    setShowDeleteConfirm(false);
  };

  const handleSetEndDate = async () => {
    if (!endDateValue || !id) return;
    await dispatch(setEndDate({ projectId: Number(id), endDate: endDateValue }));
    setShowEndDateModal(false);
    setEndDateValue('');
  };

  const handleAddWorker = async () => {
    if (!selectedUserId || !id) return;
    await dispatch(addWorkerToJob({ jobId: Number(id), userId: Number(selectedUserId) }));
    setSelectedUserId('');
    setShowAddWorker(false);
  };

  const closeAddWorker = () => {
    setShowAddWorker(false);
    setSelectedUserId('');
    setSearchWorker('');
    setIgnoreLocalisation(false);
    setIgnoreAvailability(false);
  };

  const handleRemoveWorkerClick = (w: AssignedWorker) =>
    setRemoveWorkerTarget({ worker: w, name: `${w.firstName} ${w.lastName}` });

  const handleConfirmRemoveWorker = async () => {
    if (!removeWorkerTarget || !id) return;
    setIsRemovingWorker(true);
    try {
      await workerService.removeWorkerFromProject(Number(id), removeWorkerTarget.worker.user_id);
      toast.success(`${removeWorkerTarget.name} a été retiré du projet.`);
      isManager ? await dispatch(fetchManagerJob(Number(id))) : await dispatch(fetchJob(Number(id)));
      setRemoveWorkerTarget(null);
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors du retrait du travailleur.');
    } finally { setIsRemovingWorker(false); }
  };

  const handleRemoveEnginClick = (engin: AssignedEngin) =>
    setRemoveEnginTarget({ engin, name: `${engin.firstName} ${engin.lastName}` });

  const handleConfirmRemoveEngin = async () => {
    if (!removeEnginTarget || !id) return;
    setIsRemovingEngin(true);
    try {
      await jobsService.removeEnginFromJob(Number(id), removeEnginTarget.engin.user_id);
      toast.success(`${removeEnginTarget.name} a été retiré du projet.`);
      await dispatch(fetchAssignedEngins(Number(id)));
      setRemoveEnginTarget(null);
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors du retrait de l'engin.");
    } finally { setIsRemovingEngin(false); }
  };

  const openRateModal = (w: AssignedWorker) => {
    setRateTarget({
      projectUserId: w.id,
      name: `${w.firstName} ${w.lastName}`,
      currentNote: w.note,
    });
    setNoteValue(w.note ?? 0);
  };

  const handleRate = async () => {
    if (!rateTarget || noteValue < 1 || noteValue > 10) return;
    setIsRating(true);
    try {
      const msg = await jobsService.managerRateWorker(rateTarget.projectUserId, noteValue);
      toast.success(msg || 'Note ajoutée avec succès');
      isManager ? await dispatch(fetchManagerJob(Number(id))) : await dispatch(fetchJob(Number(id)));
      setRateTarget(null);
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la notation.');
    } finally { setIsRating(false); }
  };

  const handleAssignEngin = async () => {
    if (selectedEnginId === '' || !id) return;
    await dispatch(assignEngin({
      projectId: Number(id),
      data: {
        user_id:  Number(selectedEnginId),
        task:     enginTask    || undefined,
        start_at: enginStartAt || undefined,
        end_at:   enginEndAt   || undefined,
      },
    }));
    closeAddEngin();
  };

  const closeAddEngin = () => {
    setShowAddEngin(false);
    setSelectedEnginId('');
    setSearchEngin('');
    setEnginTask('');
    setEnginStartAt('');
    setEnginEndAt('');
  };

  const badge = getStatusBadge();

  if (isLoading && !selectedJob) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }
  if (!selectedJob) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-lg">Projet introuvable</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">← Retour</button>
      </div>
    );
  }

  const launchFormValid = isManager
    ? !!managerLaunchForm.started_at && !!managerLaunchForm.deadline
    : !!launchForm.started_at && !!launchForm.deadline && !!launchForm.localisation_worker_id;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      <button onClick={() => navigate(-1)}
        className="text-gray-500 hover:text-gray-700 mb-6 transition-colors text-sm flex items-center gap-1">
        ← Retour aux projets
      </button>

      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {badge && <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>{badge.label}</span>}
              <span className="text-xs text-gray-400">Projet #{selectedJob.id}</span>
              {isManager && (
                <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs font-medium border border-purple-100">
                  Mon projet
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedJob.name}</h1>
          </div>

          {canManage && (
            <div className="flex flex-wrap gap-2">
              {!hasLaunchInfo && (
                <button onClick={() => openLaunchModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Configurer le lancement
                </button>
              )}
              {hasLaunchInfo && !isManager && (
                <button onClick={() => { setEndDateValue(toInputDate(jobEnd)); setShowEndDateModal(true); }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                  {jobEnd ? 'Modifier la date de fin' : 'Définir la date de fin'}
                </button>
              )}
              {!isJobFinished && (
                <>
                  <button onClick={() => setShowAddWorker(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                    + Travailleur
                  </button>
                  <button onClick={() => setShowAddEngin(true)} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium">
                    + Engin
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {hasLaunchInfo ? (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Informations de lancement</h2>
              {canManage && (
                <div className="flex gap-2">
                  <button onClick={() => openLaunchModal(true)} className="text-xs px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 font-medium">Modifier</button>
                  {!isManager && (
                    <button onClick={() => setShowDeleteConfirm(true)} className="text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 font-medium">Supprimer</button>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Date de début</p>
                <p className="font-semibold text-gray-800 text-sm">{formatDate(jobStart)}</p>
              </div>
              <div className={`rounded-xl p-4 ${jobEnd ? 'bg-gray-50' : 'bg-orange-50'}`}>
                <p className={`text-xs mb-1 ${jobEnd ? 'text-gray-400' : 'text-orange-400'}`}>Date de fin</p>
                {jobEnd
                  ? <p className="font-semibold text-gray-800 text-sm">{formatDate(jobEnd)}</p>
                  : <p className="font-semibold text-orange-500 text-sm">Non définie</p>}
              </div>
              {jobDeadline !== null && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Durée prévue</p>
                  <p className="font-semibold text-gray-800 text-sm">{jobDeadline} jours</p>
                </div>
              )}
              {jobStatus && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Statut</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${LAUNCH_STATUS_LABELS[jobStatus]?.color ?? ''}`}>
                    {LAUNCH_STATUS_LABELS[jobStatus]?.label ?? jobStatus}
                  </span>
                </div>
              )}
              {jobLocalisation && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs text-blue-400 mb-1">Localisation</p>
                  <p className="font-semibold text-blue-800 text-sm">{jobLocalisation}</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Travailleurs</p>
                <p className="font-semibold text-gray-800 text-sm">{assignedWorkers.length} assigné{assignedWorkers.length > 1 ? 's' : ''}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <p className="text-xs text-orange-400 mb-1">Engins</p>
                <p className="font-semibold text-orange-700 text-sm">{assignedEngins.length} assigné{assignedEngins.length > 1 ? 's' : ''}</p>
              </div>
            </div>
            {(isJobActive || isJobFinished) && jobStart && jobEnd && (
              <div className="mt-5">
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span>{formatDate(jobStart)}</span>
                  <span>{formatDate(jobEnd)}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{
                    width: `${Math.min(100, Math.max(0,
                      ((Date.now() - new Date(jobStart).getTime()) /
                       (new Date(jobEnd).getTime() - new Date(jobStart).getTime())) * 100
                    ))}%`,
                  }} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-100 rounded-xl">
              <div>
                <p className="font-medium text-orange-700 text-sm">Lancement non configuré</p>
                <p className="text-xs text-orange-400 mt-0.5">
                  {isManager ? 'Définissez la date de début, la durée et le statut.' : 'Définissez les informations de lancement pour planifier ce projet.'}
                </p>
              </div>
              {canManage && (
                <button onClick={() => openLaunchModal(false)} className="ml-4 px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium whitespace-nowrap">
                  Configurer
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            Travailleurs assignés
            <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
              {assignedWorkers.length}
            </span>
          </h2>
          {isJobFinished && canManage && (
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full">
              Projet terminé — notation disponible
            </span>
          )}
        </div>

        {assignedWorkers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-base mb-2">Aucun travailleur assigné</p>
            {canManage && !isJobFinished && (
              <button onClick={() => setShowAddWorker(true)} className="mt-1 text-blue-600 hover:underline text-sm">
                Ajouter le premier travailleur
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {assignedWorkers.map((w) => (
              <div key={w.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                    {w.firstName?.[0]}{w.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{w.firstName} {w.lastName}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {w.lot  && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium">{w.lot}</span>}
                      {w.task && <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{w.task}</span>}
                      {w.note != null
                        ? <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded text-xs font-semibold">⭐ {w.note}/10</span>
                        : isJobFinished && <span className="text-xs text-gray-400 italic">Non noté</span>}
                      {w.start_at && (
                        <span className="text-xs text-gray-400">
                          {formatDate(w.start_at)}{w.end_at ? ` → ${formatDate(w.end_at)}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isJobFinished && canManage && (
                    <button
                      onClick={() => openRateModal(w)}
                      className="px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-xs font-medium transition-colors">
                      {w.note != null ? 'Modifier la note' : 'Noter'}
                    </button>
                  )}
                  {canManage && !isJobFinished && (
                    <button
                      onClick={() => handleRemoveWorkerClick(w)}
                      className="px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 text-xs font-medium transition-colors">
                      Retirer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            Engins assignés
            <span className="ml-2 px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full text-sm font-medium">
              {assignedEngins.length}
            </span>
          </h2>
          {canManage && !isJobFinished && (
            <button onClick={() => setShowAddEngin(true)} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium">
              + Ajouter un engin
            </button>
          )}
        </div>

        {assignedEngins.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-base mb-2">Aucun engin assigné</p>
            {canManage && !isJobFinished && (
              <button onClick={() => setShowAddEngin(true)} className="mt-1 text-orange-500 hover:underline text-sm">
                Ajouter le premier engin
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {assignedEngins.map((engin) => {
              const st = ENGIN_STATUS[engin.status ?? 'pending'] ?? ENGIN_STATUS.pending;
              return (
                <div key={engin.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-lg flex-shrink-0">🚜</div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{engin.firstName} {engin.lastName}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${st.color}`}>{st.label}</span>
                        {engin.task && <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{engin.task}</span>}
                        {engin.start_at && <span className="text-xs text-gray-400">{formatDate(engin.start_at)}{engin.end_at ? ` → ${formatDate(engin.end_at)}` : ''}</span>}
                      </div>
                    </div>
                  </div>
                  {canManage && !isJobFinished && (
                    <button onClick={() => handleRemoveEnginClick(engin)}
                      className="px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 text-xs font-medium transition-colors">
                      Retirer
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showLaunchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{isEditingLaunch ? 'Modifier le lancement' : 'Configurer le lancement'}</h2>
                {isManager && <p className="text-xs text-gray-400 mt-0.5">Via votre espace manager</p>}
              </div>
              <button onClick={() => setShowLaunchModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date de début <span className="text-red-500">*</span></label>
                {isManager
                  ? <input type="date" value={managerLaunchForm.started_at} onChange={(e) => setManagerLaunchForm({ ...managerLaunchForm, started_at: e.target.value })} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  : <input type="date" value={launchForm.started_at} onChange={(e) => setLaunchForm({ ...launchForm, started_at: e.target.value })} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                }
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Durée (jours) <span className="text-red-500">*</span></label>
                {isManager
                  ? <input type="number" min={1} value={managerLaunchForm.deadline} onChange={(e) => setManagerLaunchForm({ ...managerLaunchForm, deadline: e.target.value })} placeholder="Ex : 30" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  : <input type="number" min={1} value={launchForm.deadline} onChange={(e) => setLaunchForm({ ...launchForm, deadline: e.target.value })} placeholder="Ex : 30" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                }
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Statut <span className="text-red-500">*</span></label>
                {isManager
                  ? <select value={managerLaunchForm.launch_status} onChange={(e) => setManagerLaunchForm({ ...managerLaunchForm, launch_status: e.target.value as ManagerLaunchInfo['launch_status'] })} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                      <option value="pending">En attente</option>
                      <option value="ongoing">En cours</option>
                      <option value="completed">Terminé</option>
                    </select>
                  : <select value={launchForm.launch_status} onChange={(e) => setLaunchForm({ ...launchForm, launch_status: e.target.value as LaunchInfo['launch_status'] })} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                      <option value="pending">En attente</option>
                      <option value="ongoing">En cours</option>
                      <option value="completed">Terminé</option>
                    </select>
                }
              </div>
              {!isManager && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Localisation <span className="text-red-500">*</span></label>
                  {localisations.length === 0
                    ? <div className="w-full px-3 py-2.5 border border-orange-200 rounded-lg bg-orange-50 text-orange-600 text-sm">Aucune localisation disponible</div>
                    : <select value={launchForm.localisation_worker_id} onChange={(e) => setLaunchForm({ ...launchForm, localisation_worker_id: e.target.value === '' ? '' : Number(e.target.value) })} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                        <option value="">Sélectionner une localisation</option>
                        {localisations.map((loc) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                      </select>
                  }
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowLaunchModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Annuler</button>
              <button onClick={handleLaunchSubmit} disabled={!launchFormValid || isLoading} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? 'Enregistrement...' : isEditingLaunch ? 'Mettre à jour' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && !isManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 text-center mb-1">Supprimer le lancement</h2>
            <p className="text-sm text-gray-500 text-center mb-6">Cette action supprimera toutes les informations de lancement. Elle est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">Annuler</button>
              <button onClick={handleConfirmDelete} disabled={isLoading} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium text-sm disabled:opacity-50">
                {isLoading ? 'Suppression...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEndDateModal && !isManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{jobEnd ? 'Modifier la date de fin' : 'Définir la date de fin'}</h2>
              <button onClick={() => setShowEndDateModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date de fin <span className="text-red-500">*</span></label>
              <input type="date" value={endDateValue} onChange={(e) => setEndDateValue(e.target.value)} min={toInputDate(jobStart) || undefined} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              {jobStart && <p className="text-xs text-gray-400 mt-1.5">Date de début : {formatDate(jobStart)}</p>}
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowEndDateModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Annuler</button>
              <button onClick={handleSetEndDate} disabled={!endDateValue || isLoading} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? 'Enregistrement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddWorker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Ajouter un travailleur</h2>
                <p className="text-sm text-gray-400 mt-0.5">{workersMatchBoth} compatible{workersMatchBoth > 1 ? 's' : ''} trouvé{workersMatchBoth > 1 ? 's' : ''}</p>
              </div>
              <button onClick={closeAddWorker} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="p-6">
              <div className="space-y-2 mb-4">
                {jobLocalisation && (
                  <div className="flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                    <span className="text-sm text-blue-700">{ignoreLocalisation ? 'Toutes les villes' : `Ville : ${jobLocalisation} (${workersInCity})`}</span>
                    <button onClick={() => { setIgnoreLocalisation(!ignoreLocalisation); setSelectedUserId(''); }} className="text-xs text-blue-600 hover:underline font-medium ml-2">{ignoreLocalisation ? 'Filtrer' : 'Ignorer'}</button>
                  </div>
                )}
                {jobStart && jobEnd && (
                  <div className="flex items-center justify-between px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
                    <span className="text-sm text-green-700">{ignoreAvailability ? 'Toutes les disponibilités' : `Disponibles sur la période (${workersAvailable})`}</span>
                    <button onClick={() => { setIgnoreAvailability(!ignoreAvailability); setSelectedUserId(''); }} className="text-xs text-green-600 hover:underline font-medium ml-2">{ignoreAvailability ? 'Filtrer' : 'Ignorer'}</button>
                  </div>
                )}
              </div>
              <input type="text" value={searchWorker} onChange={(e) => setSearchWorker(e.target.value)} placeholder="Rechercher un travailleur..." className="w-full px-3 py-2.5 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-50">
                {filteredWorkers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm mb-2">Aucun travailleur correspondant</p>
                    <div className="flex flex-col gap-1">
                      {!ignoreLocalisation && jobLocalisation && <button onClick={() => setIgnoreLocalisation(true)} className="text-blue-600 text-xs hover:underline">Ignorer le filtre de ville</button>}
                      {!ignoreAvailability && jobStart && jobEnd && <button onClick={() => setIgnoreAvailability(true)} className="text-green-600 text-xs hover:underline">Ignorer le filtre de disponibilité</button>}
                    </div>
                  </div>
                ) : (
                  filteredWorkers.map((w) => {
                    const workerLoc = getLocName((w as any).localisation);
                    const sameCity  = !!jobLocalisation && workerLoc === jobLocalisation;
                    const available = jobStart && jobEnd ? isAvailableDuring(w, jobStart, jobEnd) : true;
                    return (
                      <label key={w.id} className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${selectedUserId === w.id ? 'bg-blue-50' : ''}`}>
                        <input type="radio" name="worker" value={w.id} checked={selectedUserId === w.id} onChange={() => setSelectedUserId(w.id)} className="text-blue-600" />
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold flex-shrink-0">{w.firstName[0]}{w.lastName[0]}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm">{w.firstName} {w.lastName}</p>
                          <p className="text-xs text-gray-400">{w.profession || (w as any).lot || 'Travailleur'}{workerLoc && ` · ${workerLoc}`}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {sameCity  && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-xs font-medium">Ville</span>}
                          {available && <span className="px-1.5 py-0.5 bg-green-100 text-green-600 rounded text-xs font-medium">Dispo</span>}
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button onClick={closeAddWorker} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Annuler</button>
              <button onClick={handleAddWorker} disabled={!selectedUserId || isLoading} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddEngin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Assigner un engin</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {filteredAvailableEngins.length} engin{filteredAvailableEngins.length > 1 ? 's' : ''} disponible{filteredAvailableEngins.length > 1 ? 's' : ''} · Une notification sera envoyée
                </p>
              </div>
              <button onClick={closeAddEngin} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <input type="text" value={searchEngin} onChange={(e) => { setSearchEngin(e.target.value); setSelectedEnginId(''); }} placeholder="Rechercher par nom, marque ou ville..." className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                {isLoadingAvailableEngins ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                  </div>
                ) : filteredAvailableEngins.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <p className="text-3xl mb-2">🚜</p>
                    <p className="text-sm font-medium text-gray-500">Aucun engin disponible</p>
                    <p className="text-xs text-gray-400 mt-1">Modifiez votre recherche ou vérifiez les disponibilités</p>
                  </div>
                ) : (
                  filteredAvailableEngins.map((engin) => {
                    const isSelected = selectedEnginId === engin.user_id;
                    const sameCity   = jobLocalisation && engin.city ? engin.city.toLowerCase() === jobLocalisation.toLowerCase() : false;
                    const daysLeft   = (engin.latest_availability as any)?.days_remaining ?? null;
                    return (
                      <div key={engin.user_id} onClick={() => setSelectedEnginId(engin.user_id)}
                        className={`flex items-start gap-3 p-4 cursor-pointer transition-all select-none ${isSelected ? 'bg-orange-50 border-l-4 border-orange-500' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}>
                        <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${isSelected ? 'bg-orange-100' : 'bg-gray-100'}`}>🚜</div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${isSelected ? 'text-orange-800' : 'text-gray-800'}`}>{engin.engin.nameOfTheEngin}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{engin.engin.brandOfTheDevice}</p>
                          {engin.engin.feature && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{engin.engin.feature}</p>}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            {engin.city && (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sameCity ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                📍 {engin.city}{sameCity && <span className="font-bold">· Même ville</span>}
                              </span>
                            )}
                            {engin.latest_availability?.end_date && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                                ✓ Dispo jusqu'au {formatDateShort(engin.latest_availability.end_date)}
                                {daysLeft !== null && <span className="text-green-500 ml-0.5">({daysLeft}j)</span>}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {selectedEnginId !== '' && (() => {
                const sel = filteredAvailableEngins.find((e) => e.user_id === selectedEnginId);
                if (!sel) return null;
                return (
                  <div className="flex items-center gap-3 px-3 py-2.5 bg-orange-50 border border-orange-200 rounded-lg">
                    <span className="text-orange-500 text-lg flex-shrink-0">🚜</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-orange-800 truncate">{sel.engin.nameOfTheEngin}</p>
                      <p className="text-xs text-orange-500">{sel.engin.brandOfTheDevice} · {sel.city}</p>
                    </div>
                    <button onClick={() => setSelectedEnginId('')} className="text-orange-400 hover:text-orange-600 text-xl leading-none flex-shrink-0">×</button>
                  </div>
                );
              })()}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tâche assignée</label>
                <input type="text" value={enginTask} onChange={(e) => setEnginTask(e.target.value)} placeholder="Ex : Terrassement, Nivellement..." className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Début d'intervention</label>
                  <input type="date" value={enginStartAt} min={toInputDate(jobStart) || undefined} onChange={(e) => { setEnginStartAt(e.target.value); if (enginEndAt && e.target.value > enginEndAt) setEnginEndAt(''); }} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Fin d'intervention</label>
                  <input type="date" value={enginEndAt} min={enginStartAt || toInputDate(jobStart) || undefined} max={toInputDate(jobEnd) || undefined} onChange={(e) => setEnginEndAt(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                </div>
              </div>
              {(jobStart || jobEnd) && <p className="text-xs text-gray-400 -mt-2">Période du projet : {formatDate(jobStart)} → {jobEnd ? formatDate(jobEnd) : 'non définie'}</p>}
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button onClick={closeAddEngin} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Annuler</button>
              <button onClick={handleAssignEngin} disabled={selectedEnginId === '' || isLoading} className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? 'Assignation...' : 'Assigner et notifier'}
              </button>
            </div>
          </div>
        </div>
      )}

      {rateTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Noter le travailleur</h2>
                <p className="text-sm text-gray-400 mt-0.5">{rateTarget.name}</p>
              </div>
              <button onClick={() => setRateTarget(null)} disabled={isRating} className="text-gray-400 hover:text-gray-600 text-2xl leading-none disabled:opacity-40">×</button>
            </div>
            <div className="p-6">
              {rateTarget.currentNote != null && (
                <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2">
                  <span className="text-amber-500">⭐</span>
                  <span className="text-sm text-amber-700 font-medium">Note actuelle : <strong>{rateTarget.currentNote}/10</strong></span>
                </div>
              )}
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Nouvelle note <span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-gray-400">(champ : <code className="bg-gray-100 px-1 py-0.5 rounded">note</code> — valeur de 1 à 10)</span>
              </label>
              <NoteStars value={noteValue} onChange={setNoteValue} />
              {noteValue > 0 && (
                <p className="mt-3 text-sm font-semibold text-center text-amber-600">
                  {noteValue}/10 — {
                    noteValue <= 3 ? 'Insuffisant' :
                    noteValue <= 5 ? 'Passable' :
                    noteValue <= 7 ? 'Bien' :
                    noteValue <= 9 ? 'Très bien' : 'Excellent'
                  }
                </p>
              )}
              <p className="mt-4 text-xs text-gray-400 text-center">
                Envoyé vers <code className="bg-gray-100 px-1 py-0.5 rounded">PATCH /manager/project-users/{rateTarget.projectUserId}/note</code>
              </p>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button onClick={() => setRateTarget(null)} disabled={isRating} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50">Annuler</button>
              <button onClick={handleRate} disabled={noteValue < 1 || isRating} className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isRating ? <Spinner /> : `Enregistrer ${noteValue > 0 ? `(${noteValue}/10)` : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {removeWorkerTarget && (
        <ConfirmRemoveWorkerModal
          workerName={removeWorkerTarget.name}
          loading={isRemovingWorker}
          onConfirm={handleConfirmRemoveWorker}
          onCancel={() => { if (!isRemovingWorker) setRemoveWorkerTarget(null); }}
        />
      )}

      {removeEnginTarget && (
        <ConfirmRemoveEnginModal
          enginName={removeEnginTarget.name}
          loading={isRemovingEngin}
          onConfirm={handleConfirmRemoveEngin}
          onCancel={() => { if (!isRemovingEngin) setRemoveEnginTarget(null); }}
        />
      )}
    </div>
  );
};

export default JobDetail;