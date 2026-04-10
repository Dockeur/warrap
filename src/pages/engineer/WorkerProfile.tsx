import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FiUpload, FiUser, FiFileText, FiCheck, FiArrowRight,
    FiEdit2, FiMail, FiPhone, FiMapPin, FiBriefcase,
    FiStar, FiClock, FiShield, FiLoader, FiCreditCard,
    FiExternalLink, FiX, FiTool, FiUsers, FiChevronDown,
} from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import { AppDispatch, RootState } from '../../store/store';
import { fetchWorkers } from '../../features/users/usersSlice';
import workerService, { UserProfile, EnterpriseWorkerEntry } from '../../features/worker/workerService';

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
    pending:  { label: 'En attente',  cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    approved: { label: 'Approuvé',    cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Rejeté',      cls: 'bg-red-100 text-red-700 border-red-200' },
    active:   { label: 'Actif',       cls: 'bg-blue-100 text-blue-700 border-blue-200' },
};

const FileUploadField = ({
    label, id, file, onChange, accept = '.pdf', required = false, error, hint,
}: {
    label: string; id: string; file: File | null;
    onChange: (f: File | null) => void;
    accept?: string; required?: boolean; error?: string; hint?: string;
}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input type="file" id={id} accept={accept} className="hidden"
            onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                if (f && accept === '.pdf' && f.type !== 'application/pdf') {
                    toast.error('Seuls les fichiers PDF sont acceptés');
                    return;
                }
                onChange(f);
            }}
        />
        <label htmlFor={id}
            className={`flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                error ? 'border-red-400 bg-red-50'
                    : file ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
        >
            {file ? <FiCheck className="w-5 h-5 text-green-500 shrink-0" />
                  : <FiUpload className="w-5 h-5 text-gray-400 shrink-0" />}
            <span className={`text-sm truncate ${file ? 'text-green-700 font-medium' : 'text-gray-400'}`}>
                {file ? file.name : 'Choisir un fichier'}
            </span>
        </label>
        {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

const InfoRow = ({ icon: Icon, label, value }: {
    icon: React.ElementType; label: string; value?: string | number | null;
}) => (
    value != null && value !== '' ? (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-blue-500" />
            </div>
            <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-semibold text-gray-900">{value}</p>
            </div>
        </div>
    ) : null
);

const DocRow = ({ label, url }: { label: string; url?: string | null }) => (
    url ? (
        <a href={url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors group"
        >
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                    <FiFileText className="w-4 h-4 text-white" />
                </div>
                <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <MdVerified className="w-3 h-3" /> Fourni · Voir le document
                    </p>
                </div>
            </div>
            <FiExternalLink className="w-4 h-4 text-emerald-500 group-hover:text-emerald-700 shrink-0" />
        </a>
    ) : (
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
                <FiFileText className="w-4 h-4 text-gray-400" />
            </div>
            <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-xs text-gray-400 italic">Non fourni</p>
            </div>
        </div>
    )
);

const SectionTitle = ({ icon: Icon, title, color = 'text-gray-400' }: {
    icon: React.ElementType; title: string; color?: string;
}) => (
    <p className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-3 ${color}`}>
        <Icon className="w-3.5 h-3.5" /> {title}
    </p>
);

const WorkerCard = ({ worker }: { worker: EnterpriseWorkerEntry }) => (
    <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl">
        {worker.worker_profil ? (
            <img src={worker.worker_profil} alt={worker.worker_name ?? ''}
                className="w-10 h-10 rounded-xl object-cover shrink-0" />
        ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <FiUser className="w-5 h-5 text-blue-400" />
            </div>
        )}
        <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">
                {worker.worker_name ?? 'Sans nom'}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                {worker.worker_email && (
                    <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                        <FiMail className="w-3 h-3 shrink-0" /> {worker.worker_email}
                    </p>
                )}
                {worker.worker_phone && (
                    <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                        <FiPhone className="w-3 h-3 shrink-0" /> {worker.worker_phone}
                    </p>
                )}
                {worker.worker_lot && (
                    <p className="text-xs text-blue-500 capitalize truncate">{worker.worker_lot}</p>
                )}
            </div>
        </div>
    </div>
);

const WorkerProfile: React.FC = () => {
    const navigate  = useNavigate();
    const dispatch  = useDispatch<AppDispatch>();

    const workers        = useSelector((state: RootState) => state.users.workers);
    const loadingWorkers = useSelector((state: RootState) => state.users.isLoading);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [editMode, setEditMode] = useState(false);

    const [profil, setProfil] = useState<File | null>(null);
    const [nationalIDCard, setNationalIDCard] = useState<File | null>(null);
    const [yearsOfExperience, setYearsOfExperience] = useState(0);
    const [presentation, setPresentation] = useState('');

    const [commercialRegister, setCommercialRegister] = useState<File | null>(null);
    const [immigrationCertificate, setImmigrationCertificate] = useState<File | null>(null);
    const [certificateOfCompliance, setCertificateOfCompliance] = useState<File | null>(null);
    const [approval, setApproval] = useState<File | null>(null);
    const [patent, setPatent] = useState<File | null>(null);

    const [registrationDocument, setRegistrationDocument] = useState<File | null>(null);
    const [purchaseInvoice, setPurchaseInvoice] = useState<File | null>(null);
    const [lastGearReport, setLastGearReport] = useState<File | null>(null);

    const [selectedWorkerIds, setSelectedWorkerIds] = useState<number[]>([]);
    const [workerSearchQuery, setWorkerSearchQuery] = useState('');
    const [workerDropdownOpen, setWorkerDropdownOpen] = useState(false);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const isEngin      = profile?.user_type === 'engin';
    const isEnterprise = !isEngin && !!profile?.account?.is_enterprise;

    const loadProfile = async () => {
        setLoadingProfile(true);
        try {
            const data = await workerService.getUserProfile();
            setProfile(data);
            setYearsOfExperience(data.account?.years_of_experience ?? 0);
            setPresentation(data.account?.presentation ?? '');
        } catch (err: any) {
            toast.error(err.message || 'Erreur lors du chargement du profil');
        } finally {
            setLoadingProfile(false);
        }
    };

    useEffect(() => { loadProfile(); }, []);

    useEffect(() => {
        if (profile && !profile.profil) setEditMode(true);
    }, [profile]);

    useEffect(() => {
        if (editMode && isEnterprise) dispatch(fetchWorkers());
    }, [editMode, isEnterprise, dispatch]);

    const openEdit = () => {
        setYearsOfExperience(profile?.account?.years_of_experience ?? 0);
        setPresentation(profile?.account?.presentation ?? '');
        setProfil(null);
        setNationalIDCard(null);
        setSelectedWorkerIds([]);
        setWorkerSearchQuery('');
        setErrors({});
        setEditMode(true);
    };

    const closeEdit = () => {
        setEditMode(false);
        setErrors({});
        setProfil(null);
        setNationalIDCard(null);
        setSelectedWorkerIds([]);
        setWorkerSearchQuery('');
        setWorkerDropdownOpen(false);
    };

    const toggleWorker = (id: number) => {
        setSelectedWorkerIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
        setErrors((prev) => { const n = { ...prev }; delete n.selectedWorkerIds; return n; });
    };

    const removeWorker = (id: number) => {
        setSelectedWorkerIds((prev) => prev.filter((x) => x !== id));
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!profil && !profile?.profil) e.profil = 'La photo de profil est requise';
        if (!nationalIDCard) e.nationalIDCard = "La carte d'identité nationale est requise";
        if (isEnterprise && selectedWorkerIds.length === 0) e.selectedWorkerIds = 'Veuillez sélectionner au moins un travailleur';
        if (isEngin) {
            if (!registrationDocument) e.registrationDocument = "Document d'immatriculation requis";
            if (!purchaseInvoice) e.purchaseInvoice = "Facture d'achat requise";
            if (!lastGearReport) e.lastGearReport = 'Dernier rapport de contrôle requis';
        }
        if (isEnterprise) {
            if (!commercialRegister) e.commercialRegister = 'Registre de commerce requis';
            if (!immigrationCertificate) e.immigrationCertificate = "Certificat d'immigration requis";
            if (!certificateOfCompliance) e.certificateOfCompliance = 'Certificat de conformité requis';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            if (isEngin) {
                await workerService.completeEnginProfile({
                    profil: profil ?? profile?.profil as any,
                    nationalIDCard: nationalIDCard!,
                    registration_document: registrationDocument!,
                    purchase_invoice: purchaseInvoice!,
                    last_gear_report: lastGearReport!,
                });
            } else {
                await workerService.completeWorkerProfile({
                    profil: profil ?? profile?.profil as any,
                    nationalIDCard: nationalIDCard!,
                    years_of_experience: yearsOfExperience,
                    presentation,
                    ...(isEnterprise && {
                        worker_user_ids: selectedWorkerIds.join(','),
                        commercial_register: commercialRegister,
                        immigration_certificate: immigrationCertificate,
                        certificate_of_compliance: certificateOfCompliance,
                    }),
                    ...(approval && { approval }),
                    ...(patent && { patent }),
                });
            }
            toast.success('Profil mis à jour avec succès !');
            await loadProfile();
            setEditMode(false);
            setNationalIDCard(null);
            setProfil(null);
            setSelectedWorkerIds([]);
            setWorkerSearchQuery('');
        } catch (err: any) {
            toast.error(err.message || 'Erreur lors de la mise à jour');
        } finally {
            setSubmitting(false);
        }
    };

    const selectedWorkersInDropdown = workers.filter((w) => selectedWorkerIds.includes(w.id));

    const filteredWorkers = workers.filter((w) => {
        const fullName = `${w.firstName ?? ''} ${w.lastName ?? ''}`.toLowerCase();
        const email    = (w.email ?? '').toLowerCase();
        const q        = workerSearchQuery.toLowerCase();
        return fullName.includes(q) || email.includes(q);
    });

    const inputCls = "w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
    const labelCls = "block text-sm font-medium text-gray-700 mb-1";

    if (loadingProfile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <FiLoader className="animate-spin w-10 h-10 text-blue-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Chargement du profil...</p>
                </div>
            </div>
        );
    }

    const status   = STATUS_STYLE[profile?.account?.account_status ?? ''] ?? STATUS_STYLE['pending'];
    const fullName = `${profile?.contact?.firstName ?? ''} ${profile?.contact?.lastName ?? ''}`.trim();
    const acc      = profile?.account;
    const ed       = profile?.enterprise_documents;
    const engD     = profile?.engin_documents;
    const enterpriseWorkers = profile?.workers ?? [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4">
            <div className="max-w-3xl mx-auto space-y-5">

                {!editMode && profile && (
                    <>
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                                {isEngin && (
                                    <div className="absolute top-4 left-5 flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                                        <FiTool className="w-3.5 h-3.5" /> Engin
                                    </div>
                                )}
                                {isEnterprise && (
                                    <div className="absolute top-4 left-5 flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                                        <FiBriefcase className="w-3.5 h-3.5" /> Entreprise
                                    </div>
                                )}
                            </div>
                            <div className="px-8 pb-8">
                                <div className="flex items-end justify-between -mt-14 mb-5">
                                    <div className="relative">
                                        {profile.profil ? (
                                            <img src={profile.profil} alt={fullName}
                                                className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-lg" />
                                        ) : (
                                            <div className="w-28 h-28 rounded-2xl bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center">
                                                <FiUser className="w-12 h-12 text-gray-400" />
                                            </div>
                                        )}
                                        {!profile.profil && (
                                            <span className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white">
                                                <span className="text-white text-xs font-bold">!</span>
                                            </span>
                                        )}
                                    </div>
                                    <button onClick={openEdit}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                                    >
                                        <FiEdit2 className="w-4 h-4" /> Modifier le profil
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 mb-1 flex-wrap">
                                    <h1 className="text-2xl font-black text-gray-900">
                                        {fullName || 'Nom non renseigné'}
                                    </h1>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${status.cls}`}>
                                        {status.label}
                                    </span>
                                    {profile.roles?.map((role) => (
                                        <span key={role} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 capitalize">
                                            {role}
                                        </span>
                                    ))}
                                </div>

                                {acc?.child_lot_name && (
                                    <p className="text-sm text-gray-500 mb-0 capitalize">
                                        {acc.child_lot_name}{acc.parent_lot_name ? ` · ${acc.parent_lot_name}` : ''}
                                    </p>
                                )}

                                {!profile.profil && (
                                    <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                                        <p className="text-sm text-orange-800 font-medium">
                                            ⚠️ Profil incomplet — cliquez sur "Modifier le profil" pour ajouter vos documents.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <SectionTitle icon={FiUser} title="Coordonnées" />
                            <div className="grid sm:grid-cols-2 gap-4">
                                <InfoRow icon={FiMail}   label="Email"         value={profile.contact?.email ?? profile.email} />
                                <InfoRow icon={FiPhone}  label="Téléphone"     value={profile.contact?.phoneNumber} />
                                <InfoRow icon={FiMapPin} label="Localisation"  value={profile.contact?.localisation} />
                                <InfoRow icon={FiClock}  label="Membre depuis" value={profile.created_at ? new Intl.DateTimeFormat('fr', { dateStyle: 'long' }).format(new Date(profile.created_at)) : null} />
                            </div>
                        </div>

                        {!isEngin && acc && (
                            <div className={`bg-white rounded-2xl shadow-sm border p-6 ${isEnterprise ? 'border-blue-200' : 'border-gray-100'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <SectionTitle icon={FiBriefcase} title={isEnterprise ? "Entreprise" : "Profil professionnel"} color={isEnterprise ? 'text-blue-600' : 'text-gray-400'} />
                                    {isEnterprise && (
                                        <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                                            Compte entreprise
                                        </span>
                                    )}
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                    <InfoRow icon={FiBriefcase} label="Expérience"
                                        value={acc.years_of_experience ? `${acc.years_of_experience} an${acc.years_of_experience > 1 ? 's' : ''}` : null} />
                                    <InfoRow icon={FiShield} label="Type de compte"
                                        value={acc.is_enterprise ? 'Entreprise' : 'Individuel'} />
                                </div>
                                {acc.presentation && (
                                    <div className="pt-4 border-t border-gray-100">
                                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2">
                                            <FiStar className="w-3.5 h-3.5" /> Présentation
                                        </p>
                                        <p className="text-sm text-gray-700 leading-relaxed">{acc.presentation}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {isEnterprise && (
                            <div className="bg-white rounded-2xl shadow-sm border border-blue-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <SectionTitle icon={FiUsers} title="Travailleurs" color="text-blue-600" />
                                    <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                                        {enterpriseWorkers.length} travailleur{enterpriseWorkers.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                {enterpriseWorkers.length === 0 ? (
                                    <div className="flex items-center gap-3 px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl">
                                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
                                            <FiUsers className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <p className="text-sm text-gray-400 italic">Aucun travailleur associé</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {enterpriseWorkers.map((w) => (
                                            <WorkerCard key={w.id} worker={w} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <SectionTitle icon={FiCreditCard} title="Identité" />
                            <DocRow label="Carte d'identité nationale" url={profile.nationalIDCard} />
                        </div>

                        {isEngin && (
                            <div className="bg-white rounded-2xl shadow-sm border border-orange-200 p-6">
                                <SectionTitle icon={FiTool} title="Documents de l'engin" color="text-orange-500" />
                                <div className="space-y-3">
                                    <DocRow label="Document d'immatriculation"  url={engD?.registration_document} />
                                    <DocRow label="Facture d'achat"             url={engD?.purchase_invoice} />
                                    <DocRow label="Dernier rapport de contrôle" url={engD?.last_gear_report} />
                                </div>
                            </div>
                        )}

                        {isEnterprise && ed && (
                            <div className="bg-white rounded-2xl shadow-sm border border-blue-200 p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <SectionTitle icon={FiFileText} title="Documents entreprise" color="text-blue-600" />
                                    <span className="text-xs text-blue-500 font-medium">Requis</span>
                                </div>
                                <div className="space-y-3">
                                    <DocRow label="Registre de commerce"      url={ed.commercial_register} />
                                    <DocRow label="Certificat d'immigration"  url={ed.immigration_certificate} />
                                    <DocRow label="Certificat de conformité"  url={ed.certificate_of_compliance} />
                                    <DocRow label="Agrément"                  url={ed.approval} />
                                    <DocRow label="Brevet"                    url={ed.patent} />
                                </div>
                            </div>
                        )}

                        {!isEngin && !isEnterprise && ed && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <SectionTitle icon={FiFileText} title="Documents optionnels" />
                                <div className="space-y-3">
                                    <DocRow label="Agrément" url={ed.approval} />
                                    <DocRow label="Brevet"   url={ed.patent} />
                                </div>
                            </div>
                        )}
                    </>
                )}

                {editMode && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {profile?.profil ? 'Modifier le profil' : 'Compléter le profil'}
                                </h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {isEngin ? 'Documents requis pour votre engin'
                                        : isEnterprise ? 'Informations et documents entreprise'
                                        : 'Informations et documents professionnels'}
                                </p>
                            </div>
                            {profile?.profil && (
                                <button onClick={closeEdit} className="p-2 hover:bg-gray-200 rounded-xl transition-colors" title="Fermer">
                                    <FiX className="w-5 h-5 text-gray-500" />
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-7">

                            {isEnterprise && (
                                <div>
                                    <SectionTitle icon={FiUsers} title="Travailleurs concernés" color="text-blue-600" />
                                    <label className={labelCls}>
                                        Sélectionner les travailleurs <span className="text-red-500">*</span>
                                    </label>

                                    {selectedWorkersInDropdown.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {selectedWorkersInDropdown.map((w) => (
                                                <span key={w.id}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-lg border border-blue-200"
                                                >
                                                    {w.avatar ? (
                                                        <img src={w.avatar} alt="" className="w-4 h-4 rounded object-cover" />
                                                    ) : (
                                                        <FiUser className="w-3 h-3" />
                                                    )}
                                                    {`${w.firstName ?? ''} ${w.lastName ?? ''}`.trim() || 'Sans nom'}
                                                    <button type="button" onClick={() => removeWorker(w.id)}
                                                        className="ml-0.5 hover:text-red-600 transition-colors"
                                                    >
                                                        <FiX className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {loadingWorkers ? (
                                        <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50">
                                            <FiLoader className="animate-spin w-4 h-4 text-blue-500 shrink-0" />
                                            <span className="text-sm text-gray-400">Chargement des travailleurs...</span>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setWorkerDropdownOpen((v) => !v)}
                                                className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-sm transition-colors text-left ${
                                                    errors.selectedWorkerIds
                                                        ? 'border-red-400 bg-red-50'
                                                        : selectedWorkersInDropdown.length > 0
                                                        ? 'border-blue-400 bg-blue-50'
                                                        : 'border-gray-300 hover:border-blue-400'
                                                }`}
                                            >
                                                <span className={selectedWorkersInDropdown.length > 0 ? 'text-blue-700 font-medium text-sm' : 'text-gray-400 text-sm'}>
                                                    {selectedWorkersInDropdown.length > 0
                                                        ? `${selectedWorkersInDropdown.length} travailleur${selectedWorkersInDropdown.length > 1 ? 's' : ''} sélectionné${selectedWorkersInDropdown.length > 1 ? 's' : ''}`
                                                        : 'Choisir des travailleurs'}
                                                </span>
                                                <FiChevronDown className={`w-4 h-4 text-gray-400 shrink-0 ml-2 transition-transform ${workerDropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            {workerDropdownOpen && (
                                                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                                                    <div className="p-2 border-b border-gray-100">
                                                        <input
                                                            type="text"
                                                            autoFocus
                                                            value={workerSearchQuery}
                                                            onChange={(e) => setWorkerSearchQuery(e.target.value)}
                                                            placeholder="Rechercher par nom ou email..."
                                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        />
                                                    </div>
                                                    <div className="max-h-56 overflow-y-auto">
                                                        {filteredWorkers.length === 0 ? (
                                                            <div className="px-4 py-6 text-center text-sm text-gray-400">
                                                                Aucun travailleur trouvé
                                                            </div>
                                                        ) : (
                                                            filteredWorkers.map((w) => {
                                                                const wName    = `${w.firstName ?? ''} ${w.lastName ?? ''}`.trim() || 'Sans nom';
                                                                const isChecked = selectedWorkerIds.includes(w.id);
                                                                return (
                                                                    <button
                                                                        key={w.id}
                                                                        type="button"
                                                                        onClick={() => toggleWorker(w.id)}
                                                                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 transition-colors ${isChecked ? 'bg-blue-50' : ''}`}
                                                                    >
                                                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${isChecked ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                                                            {isChecked && <FiCheck className="w-2.5 h-2.5 text-white" />}
                                                                        </div>
                                                                        {w.avatar ? (
                                                                            <img src={w.avatar} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                                                                        ) : (
                                                                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                                                                <FiUser className="w-4 h-4 text-gray-400" />
                                                                            </div>
                                                                        )}
                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="text-sm font-semibold text-gray-900 truncate">{wName}</p>
                                                                            {w.email && <p className="text-xs text-gray-400 truncate">{w.email}</p>}
                                                                            {w.profession && <p className="text-xs text-blue-500 capitalize truncate">{w.profession}</p>}
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                    {selectedWorkersInDropdown.length > 0 && (
                                                        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                                                            <span className="text-xs text-gray-500">
                                                                {selectedWorkersInDropdown.length} sélectionné{selectedWorkersInDropdown.length > 1 ? 's' : ''}
                                                            </span>
                                                            <button type="button"
                                                                onClick={() => setWorkerDropdownOpen(false)}
                                                                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                                                            >
                                                                Confirmer
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {errors.selectedWorkerIds && (
                                        <p className="mt-1 text-xs text-red-600">{errors.selectedWorkerIds}</p>
                                    )}
                                </div>
                            )}

                            <div>
                                <SectionTitle icon={FiUser} title="Photo de profil" />
                                <FileUploadField label="Photo de profil" id="profil" file={profil} onChange={setProfil}
                                    accept="image/*" required={!profile?.profil} error={errors.profil} />
                                {profile?.profil && !profil && (
                                    <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                        <img src={profile.profil} alt="actuelle" className="w-12 h-12 rounded-lg object-cover" />
                                        <p className="text-xs text-gray-500">Photo actuelle — laissez vide pour la conserver</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <SectionTitle icon={FiCreditCard} title="Identité" />
                                <FileUploadField label="Carte d'identité nationale" id="nationalIDCard" file={nationalIDCard}
                                    onChange={setNationalIDCard} accept="image/*,application/pdf" required
                                    error={errors.nationalIDCard} hint="Image ou PDF acceptés" />
                            </div>

                            {!isEngin && (
                                <div className="space-y-4">
                                    <SectionTitle icon={FiBriefcase} title={isEnterprise ? "Informations entreprise" : "Informations professionnelles"} color={isEnterprise ? 'text-blue-600' : 'text-gray-400'} />
                                    <div>
                                        <label className={labelCls}>Années d'expérience</label>
                                        <input type="number" min="0" max="50" value={yearsOfExperience}
                                            onChange={(e) => setYearsOfExperience(parseInt(e.target.value) || 0)} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Présentation</label>
                                        <textarea value={presentation} onChange={(e) => setPresentation(e.target.value)}
                                            rows={4} className={inputCls + ' resize-none'}
                                            placeholder="Parlez de votre expérience, vos compétences..." />
                                        <p className="mt-1 text-xs text-gray-400">{presentation.length} caractère{presentation.length !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                            )}

                            {isEngin && (
                                <div className="space-y-3">
                                    <SectionTitle icon={FiTool} title="Documents de l'engin (PDF)" color="text-orange-500" />
                                    <div className="p-5 bg-orange-50 border border-orange-200 rounded-xl space-y-4">
                                        <FileUploadField label="Document d'immatriculation" id="registration_document" file={registrationDocument} onChange={setRegistrationDocument} required error={errors.registrationDocument} />
                                        <FileUploadField label="Facture d'achat"             id="purchase_invoice"       file={purchaseInvoice}        onChange={setPurchaseInvoice}        required error={errors.purchaseInvoice} />
                                        <FileUploadField label="Dernier rapport de contrôle" id="last_gear_report"        file={lastGearReport}         onChange={setLastGearReport}         required error={errors.lastGearReport} />
                                    </div>
                                </div>
                            )}

                            {isEnterprise && (
                                <div className="space-y-3">
                                    <SectionTitle icon={FiFileText} title="Documents entreprise (PDF)" color="text-blue-600" />
                                    <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl space-y-4">
                                        <FileUploadField label="Registre de commerce"     id="commercial_register"       file={commercialRegister}      onChange={setCommercialRegister}      required error={errors.commercialRegister} />
                                        <FileUploadField label="Certificat d'immigration" id="immigration_certificate"   file={immigrationCertificate}  onChange={setImmigrationCertificate}  required error={errors.immigrationCertificate} />
                                        <FileUploadField label="Certificat de conformité" id="certificate_of_compliance" file={certificateOfCompliance} onChange={setCertificateOfCompliance} required error={errors.certificateOfCompliance} />
                                        <FileUploadField label="Agrément (optionnel)"     id="approval"                  file={approval}                onChange={setApproval} />
                                        <FileUploadField label="Brevet (optionnel)"       id="patent"                    file={patent}                  onChange={setPatent} />
                                    </div>
                                </div>
                            )}

                            {!isEngin && !isEnterprise && (
                                <div className="space-y-3">
                                    <SectionTitle icon={FiFileText} title="Documents optionnels" />
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <FileUploadField label="Agrément" id="approval" file={approval} onChange={setApproval} />
                                        <FileUploadField label="Brevet"   id="patent"   file={patent}   onChange={setPatent} />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2 border-t border-gray-100">
                                {!profile?.profil && (
                                    <button type="button" onClick={() => navigate('/dashboard')}
                                        className="flex-1 py-3 text-sm font-semibold text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                        Passer pour l'instant
                                    </button>
                                )}
                                <button type="submit" disabled={submitting}
                                    className="flex-1 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {submitting ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Envoi en cours...
                                        </>
                                    ) : (
                                        <>{profile?.profil ? 'Enregistrer les modifications' : 'Compléter mon profil'} <FiArrowRight className="w-4 h-4" /></>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkerProfile;