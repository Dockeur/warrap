import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiUpload, FiUser, FiFileText, FiCheck, FiArrowRight,
    FiEdit2, FiMail, FiPhone, FiMapPin, FiBriefcase,
    FiStar, FiClock, FiShield, FiLoader, FiCreditCard,
    FiExternalLink, FiX, FiTool,
} from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import workerService, { UserProfile } from '../../features/worker/workerService';

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

const WorkerProfile: React.FC = () => {
    const navigate = useNavigate();

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

    const openEdit = () => {
        setYearsOfExperience(profile?.account?.years_of_experience ?? 0);
        setPresentation(profile?.account?.presentation ?? '');
        setProfil(null);
        setNationalIDCard(null);
        setErrors({});
        setEditMode(true);
    };

    const closeEdit = () => {
        setEditMode(false);
        setErrors({});
        setProfil(null);
        setNationalIDCard(null);
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!profil && !profile?.profil) e.profil = 'La photo de profil est requise';
        if (!nationalIDCard) e.nationalIDCard = "La carte d'identité nationale est requise";
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
        } catch (err: any) {
            toast.error(err.message || 'Erreur lors de la mise à jour');
        } finally {
            setSubmitting(false);
        }
    };

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4">
            <div className="max-w-3xl mx-auto space-y-5">

                {/* ══════════════════════════════════════
                    VUE PROFIL
                ══════════════════════════════════════ */}
                {!editMode && profile && (
                    <>
                        {/* ── HEADER ── */}
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

                        {/* ── COORDONNÉES ── */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <SectionTitle icon={FiUser} title="Coordonnées" />
                            <div className="grid sm:grid-cols-2 gap-4">
                                <InfoRow icon={FiMail}   label="Email"         value={profile.contact?.email ?? profile.email} />
                                <InfoRow icon={FiPhone}  label="Téléphone"     value={profile.contact?.phoneNumber} />
                                <InfoRow icon={FiMapPin} label="Localisation"  value={profile.contact?.localisation} />
                                <InfoRow icon={FiClock}  label="Membre depuis" value={profile.created_at ? new Intl.DateTimeFormat('fr', { dateStyle: 'long' }).format(new Date(profile.created_at)) : null} />
                            </div>
                        </div>

                        {/* ── PROFIL PRO (worker individuel ou entreprise) ── */}
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

                        {/* ── DOCUMENTS D'IDENTITÉ ── */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <SectionTitle icon={FiCreditCard} title="Identité" />
                            <DocRow label="Carte d'identité nationale" url={profile.nationalIDCard} />
                        </div>

                        {/* ── DOCUMENTS ENGIN ── */}
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

                        {/* ── DOCUMENTS ENTREPRISE ── */}
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

                        {/* ── DOCUMENTS OPTIONNELS (worker individuel) ── */}
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

                {/* ══════════════════════════════════════
                    FORMULAIRE DE MODIFICATION
                ══════════════════════════════════════ */}
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