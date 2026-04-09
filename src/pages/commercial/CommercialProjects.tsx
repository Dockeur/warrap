import React, { useEffect, useState } from 'react';
import {
    FiSearch, FiMapPin, FiClock, FiDollarSign,
    FiTrendingUp, FiCheckCircle, FiAlertCircle, FiCalendar,
    FiBriefcase,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import commercialService from '../../features/commercial/commercialService';

const fmt = (n: number) =>
    new Intl.NumberFormat('fr', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(n);

const fmtCompact = (n: number) =>
    new Intl.NumberFormat('fr', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0, notation: 'compact' }).format(n);

const fmtDate = (d: string | null) =>
    d ? new Intl.DateTimeFormat('fr', { dateStyle: 'medium' }).format(new Date(d)) : '—';

const LAUNCH_STATUS: Record<string, { label: string; color: string }> = {
    pending:   { label: 'En attente',  color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    active:    { label: 'Actif',       color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    completed: { label: 'Terminé',     color: 'bg-blue-100 text-blue-700 border-blue-200' },
    cancelled: { label: 'Annulé',      color: 'bg-red-100 text-red-700 border-red-200' },
};

const ProgressBar = ({ percent }: { percent: number }) => (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
    </div>
);

const StatCard = ({ icon, label, value, color = 'text-Cprimary', bg = 'bg-Cprimary/10' }: {
    icon: React.ReactNode; label: string; value: string; color?: string; bg?: string;
}) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center shrink-0 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <p className="text-lg font-black text-gray-900">{value}</p>
        </div>
    </div>
);

const ProjectCard = ({ project }: { project: any }) => {
    const status = LAUNCH_STATUS[project.launch_status] ?? { label: project.launch_status, color: 'bg-gray-100 text-gray-600 border-gray-200' };
    const paidPercent = project.my_total_commission > 0
        ? (project.my_total_paid / project.my_total_commission) * 100
        : 0;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-mono mb-1">#{project.project_id}</p>
                    <h3 className="text-sm font-bold text-gray-900 leading-snug">{project.project_name}</h3>
                </div>
                <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.color}`}>
                    {status.label}
                </span>
            </div>

            <div className="p-5 space-y-4">
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {project.localisation && (
                        <span className="flex items-center gap-1.5">
                            <FiMapPin className="w-3.5 h-3.5 text-Cprimary shrink-0" />
                            {project.localisation}
                        </span>
                    )}
                    {project.deadline && (
                        <span className="flex items-center gap-1.5">
                            <FiClock className="w-3.5 h-3.5 text-Cprimary shrink-0" />
                            {project.deadline} jour{project.deadline > 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {(project.started_at || project.ended_at) && (
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-400 flex items-center gap-1 mb-0.5">
                                <FiCalendar className="w-3 h-3" /> Début
                            </p>
                            <p className="text-xs font-semibold text-gray-800">{fmtDate(project.started_at)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-400 flex items-center gap-1 mb-0.5">
                                <FiCalendar className="w-3 h-3" /> Fin
                            </p>
                            <p className="text-xs font-semibold text-gray-800">{fmtDate(project.ended_at)}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Commission totale</span>
                        <span className="font-bold text-gray-900">{fmt(project.my_total_commission)}</span>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                <FiCheckCircle className="w-3.5 h-3.5" /> Payé
                            </span>
                            <span className="font-bold text-emerald-700">{fmt(project.my_total_paid)}</span>
                        </div>
                        <ProgressBar percent={paidPercent} />
                        <p className="text-right text-xs text-gray-400">{paidPercent.toFixed(0)}% encaissé</p>
                    </div>

                    <div className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-orange-600">
                            <FiAlertCircle className="w-3.5 h-3.5" /> Restant dû
                        </span>
                        <span className="text-sm font-black text-orange-700">{fmt(project.my_remaining)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CommercialProjects: React.FC = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => { fetchProjects(); }, []);

    useEffect(() => {
        let result = [...projects];
        if (statusFilter !== 'all') result = result.filter(p => p.launch_status === statusFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(p =>
                p.project_name.toLowerCase().includes(q) ||
                (p.localisation ?? '').toLowerCase().includes(q)
            );
        }
        setFiltered(result);
    }, [search, statusFilter, projects]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await commercialService.getPublishedProjects();
            setProjects(res ?? []);
            setStats(res.statistics ?? null);
        } catch {
            toast.error('Erreur lors du chargement des projets');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto space-y-6">

                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-Cprimary/10 rounded-xl flex items-center justify-center">
                        <FiBriefcase className="w-5 h-5 text-Cprimary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Mes projets</h1>
                        <p className="text-xs text-gray-400 mt-0.5">Projets qui vous ont été attribués</p>
                    </div>
                </div>

                {stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            icon={<FiBriefcase className="w-5 h-5" />}
                            label="Total projets"
                            value={String(stats.total_projects)}
                        />
                        <StatCard
                            icon={<FiDollarSign className="w-5 h-5" />}
                            label="Commissions"
                            value={fmtCompact(stats.total_commissions)}
                            color="text-blue-600"
                            bg="bg-blue-50"
                        />
                        <StatCard
                            icon={<FiCheckCircle className="w-5 h-5" />}
                            label="Total encaissé"
                            value={fmtCompact(stats.total_paid)}
                            color="text-emerald-600"
                            bg="bg-emerald-50"
                        />
                        <StatCard
                            icon={<FiAlertCircle className="w-5 h-5" />}
                            label="Restant dû"
                            value={fmtCompact(stats.total_remaining)}
                            color="text-orange-600"
                            bg="bg-orange-50"
                        />
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou localisation..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-Cprimary/30 shadow-sm"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none shadow-sm"
                    >
                        <option value="all">Tous les statuts</option>
                        {Object.entries(LAUNCH_STATUS).map(([v, { label }]) => (
                            <option key={v} value={v}>{label}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-64 bg-white rounded-2xl animate-pulse" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
                        <FiBriefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-sm font-semibold text-gray-500 mb-1">
                            {search || statusFilter !== 'all' ? 'Aucun résultat' : 'Aucun projet attribué'}
                        </p>
                        <p className="text-xs text-gray-400">
                            {search ? `Aucun projet ne correspond à "${search}"` : 'Vous n\'avez pas encore de projet assigné'}
                        </p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map(p => <ProjectCard key={p.project_id} project={p} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommercialProjects;