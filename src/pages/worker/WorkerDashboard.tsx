// src/pages/worker/WorkerDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBriefcase, FiCalendar, FiAlertCircle, FiClock,
  FiMapPin, FiActivity, FiArrowRight, FiBell,
  FiCheckCircle, FiXCircle, FiLoader, FiX,
  FiHash, FiClipboard, FiDollarSign, FiTruck,
} from 'react-icons/fi';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../store/store';
import {
  fetchWorkerAvailabilities,
  fetchMyNotifications,
  fetchMyProjects,
  fetchEnginNotifications,
  respondToNotification,
  respondToEnginNotification,
  selectWorkerNotifications,
  selectIsLoadingNotifications,
  selectRespondingId,
  selectIsLoadingProjects,
  selectActiveProjects,
  selectRecentProjects,
  selectMyProjects,
  selectIsLoadingMyProjects,
  selectEnginNotifications,
  selectIsLoadingEnginNotifications,
  selectRespondingEnginId,
  selectWorkerError,
} from '../../features/worker/workerSlice';
import {
  WorkerNotification,
  EnginNotification,
  MyProject,
} from '../../features/worker/workerService';
import { ROUTES } from '../../utils/constants';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmtXAF = (n: number | string) =>
  new Intl.NumberFormat('fr', {
    style: 'currency', currency: 'XAF',
    minimumFractionDigits: 0, notation: 'compact',
  }).format(Number(n));

const fmtXAFFull = (n: number | string) =>
  new Intl.NumberFormat('fr', {
    style: 'currency', currency: 'XAF', minimumFractionDigits: 0,
  }).format(Number(n));

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  in_progress: { label: 'En cours',  classes: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  completed:   { label: 'Terminé',   classes: 'bg-green-100  text-green-800  border border-green-200'  },
  open:        { label: 'Ouvert',    classes: 'bg-blue-100   text-blue-800   border border-blue-200'   },
  published:   { label: 'Publié',    classes: 'bg-indigo-100 text-indigo-800 border border-indigo-200' },
  cancelled:   { label: 'Annulé',    classes: 'bg-red-100    text-red-800    border border-red-200'    },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const c = STATUS_CONFIG[status] || { label: status, classes: 'bg-gray-100 text-gray-700 border border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.classes}`}>
      {c.label}
    </span>
  );
};

const SkeletonRow: React.FC = () => (
  <div className="flex items-center gap-3 p-3 animate-pulse">
    <div className="h-10 w-10 bg-gray-200 rounded-lg flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-2.5 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

const EmptyState: React.FC<{ icon: React.ReactNode; message: string; sub: string }> = ({ icon, message, sub }) => (
  <div className="text-center py-10">
    <div className="flex justify-center mb-3">{icon}</div>
    <p className="text-sm font-medium text-gray-600 mb-1">{message}</p>
    <p className="text-xs text-gray-400">{sub}</p>
  </div>
);

// ─── MODAL DÉTAIL PROJET ──────────────────────────────────────────────────────

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
    <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
      <span className="text-gray-400 flex items-center">{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
      <div className="text-sm font-semibold text-gray-900 break-words">{value}</div>
    </div>
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 mt-4 first:mt-0">
    {children}
  </p>
);

const ProjectDetailModal: React.FC<{ project: MyProject; onClose: () => void }> = ({ project, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const proj   = (project as any).project;
  const name   = proj?.name   || project.name   || project.title || `Projet #${project.id}`;
  const status = proj?.status || project.status;
  const amount = proj?.amount || project.amount_to_perceive;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 px-6 py-5 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiBriefcase className="text-white w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-white/60 font-medium mb-0.5">Détails du projet</p>
                <h2 className="text-lg font-black text-white leading-tight line-clamp-2">{name}</h2>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
              <FiX className="text-white w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <StatusBadge status={status} />
            {proj?.uuid && (
              <span className="inline-flex items-center gap-1 bg-white/15 text-white/90 text-xs font-semibold px-2.5 py-0.5 rounded-full font-mono">
                {proj.uuid}
              </span>
            )}
          </div>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1">
          <SectionTitle>Projet</SectionTitle>
          <div className="bg-gray-50 rounded-xl px-4 py-1 mb-1">
            {proj?.id && <DetailRow icon={<FiHash className="w-3.5 h-3.5" />} label="ID" value={`#${proj.id}`} />}
            {amount && Number(amount) > 0 && (
              <DetailRow icon={<FiDollarSign className="w-3.5 h-3.5" />} label="Montant du projet"
                value={<span className="text-emerald-700">{fmtXAFFull(amount)}</span>} />
            )}
            {proj?.started_at && (
              <DetailRow icon={<FiCalendar className="w-3.5 h-3.5" />} label="Début du projet"
                value={format(new Date(proj.started_at), "d MMMM yyyy", { locale: fr })} />
            )}
            <DetailRow icon={<FiCalendar className="w-3.5 h-3.5" />} label="Fin du projet"
              value={proj?.ended_at
                ? format(new Date(proj.ended_at), "d MMMM yyyy", { locale: fr })
                : <span className="text-gray-400 italic font-normal">Non définie</span>}
            />
          </div>

          <SectionTitle>Mon assignation</SectionTitle>
          <div className="bg-gray-50 rounded-xl px-4 py-1 mb-1">
            {(project as any).task && (
              <DetailRow icon={<FiClipboard className="w-3.5 h-3.5" />} label="Tâche assignée" value={(project as any).task} />
            )}
            {(project as any).note && (
              <DetailRow icon={<FiClipboard className="w-3.5 h-3.5" />} label="Note"
                value={<span className="font-normal text-gray-600">{(project as any).note}</span>} />
            )}
            {(project as any).assigned_at && (
              <DetailRow icon={<FiCalendar className="w-3.5 h-3.5" />} label="Assigné le"
                value={format(new Date((project as any).assigned_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })} />
            )}
            {(project as any).start_at && (
              <DetailRow icon={<FiClock className="w-3.5 h-3.5" />} label="Début prévu"
                value={format(new Date((project as any).start_at), "d MMMM yyyy", { locale: fr })} />
            )}
            {(project as any).end_at && (
              <DetailRow icon={<FiClock className="w-3.5 h-3.5" />} label="Fin prévue"
                value={format(new Date((project as any).end_at), "d MMMM yyyy", { locale: fr })} />
            )}
          </div>

          {(project.amount_to_perceive || project.amount_received) && (
            <>
              <SectionTitle>Rémunération</SectionTitle>
              <div className="bg-gray-50 rounded-xl px-4 py-1 mb-1">
                {project.amount_to_perceive && Number(project.amount_to_perceive) > 0 && (
                  <DetailRow icon={<FiDollarSign className="w-3.5 h-3.5" />} label="Montant à percevoir"
                    value={<span className="text-emerald-700">{fmtXAFFull(project.amount_to_perceive)}</span>} />
                )}
                {project.amount_received && Number(project.amount_received) > 0 && (
                  <DetailRow icon={<FiCheckCircle className="w-3.5 h-3.5" />} label="Montant reçu"
                    value={<span className="text-blue-700">{fmtXAFFull(project.amount_received)}</span>} />
                )}
              </div>
            </>
          )}

          {project.location && (
            <>
              <SectionTitle>Localisation</SectionTitle>
              <div className="bg-gray-50 rounded-xl px-4 py-1">
                <DetailRow icon={<FiMapPin className="w-3.5 h-3.5" />} label="Lieu" value={project.location} />
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 flex justify-end">
          <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── NOTIFICATION CARD (Worker) ───────────────────────────────────────────────

const NOTIF_STATUS: Record<string, { label: string; badge: string; dot: string }> = {
  pending:  { label: 'En attente', badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  accepted: { label: 'Acceptée',   badge: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
  rejected: { label: 'Refusée',    badge: 'bg-red-50 text-red-600 border-red-200',       dot: 'bg-red-400'   },
};

const NotificationCard: React.FC<{
  notification: WorkerNotification;
  respondingId: number | null;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}> = ({ notification, respondingId, onAccept, onReject }) => {
  const sc   = NOTIF_STATUS[notification.status] ?? NOTIF_STATUS.pending;
  const busy = respondingId === notification.id;
  const projectName = notification.project?.name ?? notification.project_name ?? `Projet #${notification.project_id}`;

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      notification.status === 'pending' ? 'border-amber-200 bg-amber-50/40 hover:shadow-sm' : 'border-gray-100 bg-white opacity-70'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${notification.status === 'pending' ? 'bg-amber-100' : 'bg-gray-100'}`}>
          <FiBell className={`w-4 h-4 ${notification.status === 'pending' ? 'text-amber-600' : 'text-gray-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-sm font-bold text-gray-900 truncate">{projectName}</p>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${sc.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {sc.label}
            </span>
          </div>
          {notification.message && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{notification.message}</p>}
          <p className="text-[11px] text-gray-400">
            {format(new Date(notification.created_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
          </p>
        </div>
      </div>
      {notification.status === 'pending' && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-amber-100">
          <button onClick={() => onReject(notification.id)} disabled={busy}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-red-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50">
            {busy ? <FiLoader className="animate-spin w-3.5 h-3.5" /> : <FiXCircle className="w-3.5 h-3.5" />}
            Refuser
          </button>
          <button onClick={() => onAccept(notification.id)} disabled={busy}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white text-xs font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50">
            {busy ? <FiLoader className="animate-spin w-3.5 h-3.5" /> : <FiCheckCircle className="w-3.5 h-3.5" />}
            Accepter
          </button>
        </div>
      )}
    </div>
  );
};

// ─── NOTIFICATION CARD (Engin) ────────────────────────────────────────────────

const ENGIN_NOTIF_STATUS: Record<string, { label: string; badge: string; dot: string }> = {
  pending:  { label: 'En attente', badge: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-400' },
  accepted: { label: 'Acceptée',   badge: 'bg-green-50 text-green-700 border-green-200',   dot: 'bg-green-500'  },
  refused:  { label: 'Refusée',    badge: 'bg-red-50 text-red-600 border-red-200',         dot: 'bg-red-400'    },
};

const EnginNotificationCard: React.FC<{
  notification: EnginNotification;
  respondingId: number | null;
  onAccept: (id: number) => void;
  onRefuse: (id: number) => void;
}> = ({ notification, respondingId, onAccept, onRefuse }) => {
  const sc   = ENGIN_NOTIF_STATUS[notification.status] ?? ENGIN_NOTIF_STATUS.pending;
  const busy = respondingId === notification.id;
  const projectName = notification.project?.name ?? notification.project_name ?? `Projet #${notification.project_id}`;

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      notification.status === 'pending' ? 'border-orange-200 bg-orange-50/40 hover:shadow-sm' : 'border-gray-100 bg-white opacity-70'
    }`}>
      <div className="flex items-start gap-3">
        {/* Icône engin */}
        <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${notification.status === 'pending' ? 'bg-orange-100' : 'bg-gray-100'}`}>
          <FiTruck className={`w-4 h-4 ${notification.status === 'pending' ? 'text-orange-600' : 'text-gray-400'}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-sm font-bold text-gray-900 truncate">{projectName}</p>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${sc.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {sc.label}
            </span>
          </div>

          {/* Tâche + dates si présentes */}
          {notification.task && (
            <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
              <FiClipboard className="w-3 h-3 flex-shrink-0" />
              {notification.task}
            </p>
          )}
          {notification.start_at && (
            <p className="text-xs text-gray-400 mb-1">
              {format(new Date(notification.start_at), "dd MMM", { locale: fr })}
              {notification.end_at && ` → ${format(new Date(notification.end_at), "dd MMM yyyy", { locale: fr })}`}
            </p>
          )}
          {notification.message && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{notification.message}</p>}

          <p className="text-[11px] text-gray-400">
            {format(new Date(notification.created_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
          </p>
        </div>
      </div>

      {notification.status === 'pending' && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-orange-100">
          <button onClick={() => onRefuse(notification.id)} disabled={busy}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-red-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50">
            {busy ? <FiLoader className="animate-spin w-3.5 h-3.5" /> : <FiXCircle className="w-3.5 h-3.5" />}
            Refuser
          </button>
          <button onClick={() => onAccept(notification.id)} disabled={busy}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-500 text-white text-xs font-semibold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50">
            {busy ? <FiLoader className="animate-spin w-3.5 h-3.5" /> : <FiCheckCircle className="w-3.5 h-3.5" />}
            Accepter
          </button>
        </div>
      )}
    </div>
  );
};

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

const WorkerDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const activeProjects            = useAppSelector(selectActiveProjects);
  const recentProjects            = useAppSelector(selectRecentProjects);
  const myProjects                = useAppSelector(selectMyProjects);
  const notifications             = useAppSelector(selectWorkerNotifications);
  const enginNotifications        = useAppSelector(selectEnginNotifications);
  const isLoadingProjects         = useAppSelector(selectIsLoadingProjects);
  const isLoadingNotifs           = useAppSelector(selectIsLoadingNotifications);
  const isLoadingMyProjects       = useAppSelector(selectIsLoadingMyProjects);
  const isLoadingEnginNotifs      = useAppSelector(selectIsLoadingEnginNotifications);
  const respondingId              = useAppSelector(selectRespondingId);
  const respondingEnginId         = useAppSelector(selectRespondingEnginId);
  const error                     = useAppSelector(selectWorkerError);

  const [selectedProject, setSelectedProject] = useState<MyProject | null>(null);

  // Détecter si l'utilisateur est un engin
  const isEngin = user?.role === 'engin';
  console.log("role:", user);
  

  useEffect(() => {
    dispatch(fetchWorkerAvailabilities());
    dispatch(fetchMyProjects());
    if (isEngin) {
      dispatch(fetchEnginNotifications());
    } else {
      dispatch(fetchMyNotifications());
    }
  }, [dispatch, isEngin]);

  // ── Tris ────────────────────────────────────────────────────────────────────
  const sortedNotifications = [...notifications].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const sortedEnginNotifications = [...enginNotifications].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const pendingCount      = notifications.filter((n) => n.status === 'pending').length;
  const pendingEnginCount = enginNotifications.filter((n) => n.status === 'pending').length;

  // ── Handlers worker ─────────────────────────────────────────────────────────
  const handleAccept = async (id: number) => {
    const result = await dispatch(respondToNotification({ id, response: 'accepted' }));
    if (respondToNotification.fulfilled.match(result)) {
      toast.success('Assignation acceptée !');
      dispatch(fetchMyProjects());
    } else {
      toast.error((result.payload as string) || 'Erreur');
    }
  };

  const handleReject = async (id: number) => {
    const result = await dispatch(respondToNotification({ id, response: 'rejected' }));
    if (respondToNotification.fulfilled.match(result)) {
      toast.info('Assignation refusée.');
    } else {
      toast.error((result.payload as string) || 'Erreur');
    }
  };

  // ── Handlers engin ──────────────────────────────────────────────────────────
  const handleEnginAccept = async (id: number) => {
    const result = await dispatch(respondToEnginNotification({ id, response: 'accepted' }));
    if (respondToEnginNotification.fulfilled.match(result)) {
      toast.success('Assignation engin acceptée !');
    } else {
      toast.error((result.payload as string) || 'Erreur');
    }
  };

  const handleEnginRefuse = async (id: number) => {
    const result = await dispatch(respondToEnginNotification({ id, response: 'refused' }));
    if (respondToEnginNotification.fulfilled.match(result)) {
      toast.info('Assignation engin refusée.');
    } else {
      toast.error((result.payload as string) || 'Erreur');
    }
  };

  const firstName = user?.contact?.firstName || user?.name || (isEngin ? 'Enginiste' : 'Technicien');

  // Bandeau : nb de notifications en attente (tout confondu)
  const totalPending = isEngin ? pendingEnginCount : pendingCount;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── HEADER ── */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Bonjour, {firstName}</h1>
            <p className="text-gray-500 text-sm capitalize">
              {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {!isEngin && (
              <Link to={ROUTES.WORKER_AVAILABILITY}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                <FiCalendar className="h-4 w-4" /> Mes disponibilités
              </Link>
            )}
          </div>
        </div>

       
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <FiAlertCircle className="text-red-600 text-xl flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Erreur</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        
        {totalPending > 0 && (
          <div className={`mb-6 flex items-center gap-3 border rounded-xl px-5 py-3.5 ${
            isEngin ? 'bg-orange-50 border-orange-200' : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="relative flex-shrink-0">
              {isEngin
                ? <FiTruck className={`w-5 h-5 ${isEngin ? 'text-orange-600' : 'text-amber-600'}`} />
                : <FiBell className="text-amber-600 w-5 h-5" />
              }
              <span className={`absolute -top-1.5 -right-1.5 h-4 w-4 text-white text-[9px] font-bold rounded-full flex items-center justify-center ${
                isEngin ? 'bg-orange-500' : 'bg-amber-500'
              }`}>
                {totalPending}
              </span>
            </div>
            <p className={`text-sm font-semibold ${isEngin ? 'text-orange-800' : 'text-amber-800'}`}>
              {totalPending} assignation{totalPending > 1 ? 's' : ''} en attente de votre réponse
            </p>
          </div>
        )}

      
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          
          {isEngin ? (
            
            <section className="bg-white rounded-xl shadow border border-gray-200">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg relative">
                    <FiTruck className="text-orange-600 text-lg" />
                    {pendingEnginCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {pendingEnginCount}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Mes assignations engin</h2>
                    <p className="text-xs text-gray-500">Invitations à intervenir sur des projets</p>
                  </div>
                </div>
                <button onClick={() => dispatch(fetchEnginNotifications())} disabled={isLoadingEnginNotifs}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50">
                  {isLoadingEnginNotifs ? <FiLoader className="animate-spin w-4 h-4" /> : '↺ Rafraîchir'}
                </button>
              </div>
              <div className="p-4">
                {isLoadingEnginNotifs ? (
                  <div className="space-y-3">{[1, 2].map(i => <SkeletonRow key={i} />)}</div>
                ) : sortedEnginNotifications.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {sortedEnginNotifications.map((n) => (
                      <EnginNotificationCard
                        key={n.id}
                        notification={n}
                        respondingId={respondingEnginId}
                        onAccept={handleEnginAccept}
                        onRefuse={handleEnginRefuse}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<FiTruck className="h-10 w-10 text-gray-300" />}
                    message="Aucune notification"
                    sub="Les invitations à intervenir sur des projets apparaîtront ici"
                  />
                )}
              </div>
            </section>
          ) : (
           
            <section className="bg-white rounded-xl shadow border border-gray-200">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg relative">
                    <FiBell className="text-amber-600 text-lg" />
                    {pendingCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {pendingCount}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Notifications d'assignation</h2>
                    <p className="text-xs text-gray-500">Invitations à rejoindre des projets</p>
                  </div>
                </div>
                <button onClick={() => dispatch(fetchMyNotifications())} disabled={isLoadingNotifs}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50">
                  {isLoadingNotifs ? <FiLoader className="animate-spin w-4 h-4" /> : '↺ Rafraîchir'}
                </button>
              </div>
              <div className="p-4">
                {isLoadingNotifs ? (
                  <div className="space-y-3">{[1, 2].map(i => <SkeletonRow key={i} />)}</div>
                ) : sortedNotifications.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {sortedNotifications.map((n) => (
                      <NotificationCard
                        key={n.id}
                        notification={n}
                        respondingId={respondingId}
                        onAccept={handleAccept}
                        onReject={handleReject}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<FiBell className="h-10 w-10 text-gray-300" />}
                    message="Aucune notification"
                    sub="Les invitations à rejoindre des projets apparaîtront ici"
                  />
                )}
              </div>
            </section>
          )}

          {/* MES PROJETS ACCEPTÉS */}
          <section className="bg-white rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiCheckCircle className="text-green-600 text-lg" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Mes projets acceptés</h2>
                  <p className="text-xs text-gray-500">Cliquez sur un projet pour voir les détails</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                  {myProjects?.length ?? 0} projet{(myProjects?.length ?? 0) !== 1 ? 's' : ''}
                </span>
                <button onClick={() => dispatch(fetchMyProjects())} disabled={isLoadingMyProjects}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 ml-1">
                  {isLoadingMyProjects ? <FiLoader className="animate-spin w-4 h-4" /> : '↺'}
                </button>
              </div>
            </div>
            <div className="p-4">
              {isLoadingMyProjects ? (
                <div className="space-y-3">{[1, 2, 3].map(i => <SkeletonRow key={i} />)}</div>
              ) : myProjects && myProjects.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {myProjects.map((project) => {
                    const proj   = (project as any).project;
                    const name   = proj?.name   || project.name   || project.title || `Projet #${project.id}`;
                    const status = proj?.status || project.status;
                    const amount = proj?.amount || project.amount_to_perceive;
                    return (
                      <button key={project.id} onClick={() => setSelectedProject(project)}
                        className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-green-300 hover:bg-green-50/40 hover:shadow-sm transition-all group">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                          <FiBriefcase className="text-white h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-green-700 transition-colors">{name}</p>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            {proj?.uuid && <span className="text-[11px] text-gray-400 font-mono">{proj.uuid}</span>}
                            {(project as any).task && (
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <FiClipboard className="h-3 w-3" />{(project as any).task}
                              </span>
                            )}
                            {proj?.started_at && (
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <FiCalendar className="h-3 w-3" />
                                {format(new Date(proj.started_at), 'dd MMM yyyy', { locale: fr })}
                              </span>
                            )}
                          </div>
                          {amount && Number(amount) > 0 && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[11px] text-gray-400">Montant :</span>
                              <span className="text-xs font-bold text-emerald-700">{fmtXAF(amount)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <StatusBadge status={status} />
                          <FiArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-green-500 transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={<FiCheckCircle className="h-10 w-10 text-gray-300" />}
                  message="Aucun projet accepté"
                  sub="Les projets que vous avez acceptés apparaîtront ici"
                />
              )}
            </div>
          </section>
        </div>

        {/* ── LIGNE 2 : Projets actifs + Dernières interventions (worker only) ── */}
        {!isEngin && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <section className="bg-white rounded-xl shadow border border-gray-200">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FiActivity className="text-yellow-600 text-lg" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Projets sur lesquels j'interviens</h2>
                    <p className="text-xs text-gray-500">Interventions actives</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2.5 py-1 rounded-full">
                  {activeProjects?.length ?? 0} actif{(activeProjects?.length ?? 0) !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="p-5">
                {isLoadingProjects ? (
                  <div className="space-y-3">{[1, 2].map(i => <SkeletonRow key={i} />)}</div>
                ) : activeProjects && activeProjects.length > 0 ? (
                  <div className="space-y-3">
                    {activeProjects.map((project: any) => (
                      <div key={project.id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                          <FiBriefcase className="text-white h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{project.name || project.title}</p>
                          <div className="flex items-center gap-3 mt-1">
                            {project.location && <span className="flex items-center gap-1 text-xs text-gray-500"><FiMapPin className="h-3 w-3" />{project.location}</span>}
                            {project.start_date && <span className="flex items-center gap-1 text-xs text-gray-500"><FiCalendar className="h-3 w-3" />{format(new Date(project.start_date), 'dd MMM', { locale: fr })}</span>}
                          </div>
                        </div>
                        <StatusBadge status={project.status} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<FiActivity className="h-10 w-10 text-gray-300" />} message="Aucun projet en cours" sub="Vos interventions actives apparaîtront ici" />
                )}
              </div>
            </section>

            <section className="bg-white rounded-xl shadow border border-gray-200">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <FiClock className="text-indigo-600 text-lg" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Dernières interventions</h2>
                    <p className="text-xs text-gray-500">5 projets les plus récents</p>
                  </div>
                </div>
                <Link to={ROUTES.WORKER_APPLICATIONS} className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  Voir tout <FiArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="p-5">
                {isLoadingProjects ? (
                  <div className="space-y-3">{[1, 2, 3].map(i => <SkeletonRow key={i} />)}</div>
                ) : recentProjects && recentProjects.length > 0 ? (
                  <div className="space-y-2">
                    {recentProjects.slice(0, 5).map((project: any) => (
                      <div key={project.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{(project.name || project.title || '?')[0].toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{project.name || project.title}</p>
                          {project.created_at && <p className="text-xs text-gray-400">{format(new Date(project.created_at), 'dd MMM yyyy', { locale: fr })}</p>}
                        </div>
                        <StatusBadge status={project.status} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<FiClock className="h-10 w-10 text-gray-300" />} message="Aucune intervention récente" sub="Vos 5 derniers projets apparaîtront ici" />
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* ── MODAL DÉTAIL PROJET ── */}
      {selectedProject && (
        <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
};

export default WorkerDashboard;