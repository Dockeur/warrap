// src/pages/auth/RegisterStep1.tsx
import React, { useState, useEffect } from 'react';
import { FiMail, FiLock, FiUser, FiPhone, FiMapPin, FiTool, FiTag, FiCalendar, FiHash } from 'react-icons/fi';

interface RegisterStep1Props {
  onComplete: (data: any) => void;
  initialData: any;
}

interface Localisation {
  id: number;
  name: string;
}

// ── Champs communs à tous les types ──────────────────────────────────────────
interface BaseForm {
  profileType: 'personne' | 'engin' | '';
  email: string;
  password: string;
  confirmPassword: string;
  localisation: string;
  phone: string;
}

// ── Champs spécifiques personne ───────────────────────────────────────────────
interface PersonneFields {
  firstName: string;
  lastName: string;
}

// ── Champs spécifiques engin ──────────────────────────────────────────────────
interface EnginFields {
  enginName: string;   // Nom de l'engin
  brand: string;       // Marque
  model: string;       // Modèle
  year: string;        // Année de fabrication
  serialNumber: string;// Numéro de série
}

type FormState = BaseForm & PersonneFields & EnginFields;

// ─── Composants internes ─────────────────────────────────────────────────────

const InputField = ({
  label, icon: Icon, type = 'text', value, onChange,
  placeholder, disabled, error, required,
}: {
  label: string; icon: React.ElementType; type?: string;
  value: string; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean; error?: string; required?: boolean;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full pl-10 pr-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
          ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      />
    </div>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

// ─── Composant principal ──────────────────────────────────────────────────────

const RegisterStep1: React.FC<RegisterStep1Props> = ({ onComplete, initialData }) => {

  const [form, setForm] = useState<FormState>({
    profileType:  initialData.profileType  || '',
    email:        initialData.email        || '',
    password:     '',
    confirmPassword: '',
    localisation: initialData.localisation || '',
    phone:        initialData.phone        || '',
    // personne
    firstName:    initialData.firstName    || '',
    lastName:     initialData.lastName     || '',
    // engin
    enginName:    initialData.enginName    || '',
    brand:        initialData.brand        || '',
    model:        initialData.model        || '',
    year:         initialData.year         || '',
    serialNumber: initialData.serialNumber || '',
  });

  const [errors, setErrors]                     = useState<Partial<Record<keyof FormState | string, string>>>({});
  const [localisations, setLocalisations]       = useState<Localisation[]>([]);
  const [loadingLocalisations, setLoadingLoc]   = useState(true);

  const isEngin    = form.profileType === 'engin';
  const isPersonne = form.profileType === 'personne';

  // ── Charger les localisations ───────────────────────────────────────────────
  useEffect(() => {
    const fetchLocalisations = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/localisation-workers`, {
          headers: { Accept: 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          setLocalisations(Array.isArray(data) ? data : data.data ?? []);
        } else {
          setLocalisations([]);
        }
      } catch {
        setLocalisations([]);
      } finally {
        setLoadingLoc(false);
      }
    };
    fetchLocalisations();
  }, []);

  // ── Helper : localisation ───────────────────────────────────────────────────
  const getLocalisationData = () => {
    const found = localisations.find(
      (l) => l.name.toLowerCase() === form.localisation.toLowerCase()
    );
    return found
      ? { localisation_worker_id: found.id }
      : { localisation_name: form.localisation };
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e: typeof errors = {};

    if (!form.profileType)
      e.profileType = 'Veuillez sélectionner un type de profil';

    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      e.email = form.email ? 'Email invalide' : 'Email requis';

    if (!form.password)
      e.password = 'Mot de passe requis';
    else if (form.password.length < 8)
      e.password = 'Minimum 8 caractères';

    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Les mots de passe ne correspondent pas';

    if (!form.phone)
      e.phone = 'Téléphone requis';

    if (!form.localisation?.trim())
      e.localisation = 'Localisation requise';

    if (isPersonne) {
      if (!form.firstName) e.firstName = 'Prénom requis';
      if (!form.lastName)  e.lastName  = 'Nom requis';
    }

    if (isEngin) {
      if (!form.enginName) e.enginName = "Nom de l'engin requis";
      if (!form.brand)     e.brand     = 'Marque requise';
      if (!form.model)     e.model     = 'Modèle requis';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const localisationData = getLocalisationData();
    const base = {
      profileType:  form.profileType,
      email:        form.email,
      password:     form.password,
      phone:        form.phone,
      ...localisationData,
    };

    const extra = isEngin
      ? {
          enginName:    form.enginName,
          brand:        form.brand,
          model:        form.model,
          year:         form.year,
          serialNumber: form.serialNumber,
        }
      : {
          firstName: form.firstName,
          lastName:  form.lastName,
        };

    onComplete({ ...base, ...extra });
  };

  const set = (key: keyof FormState) => (v: string) =>
    setForm((prev) => ({ ...prev, [key]: v }));

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-1">Créer un compte</h2>
        <p className="text-gray-500 text-sm">Commencez par choisir votre type de profil</p>
      </div>

      {/* ── SÉLECTION DU TYPE DE PROFIL ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Type de profil <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {([
            {
              value: 'personne',
              label: 'Personne',
              desc: 'Particulier ou professionnel',
              icon: FiUser,
            },
            {
              value: 'engin',
              label: 'Engin',
              desc: 'Machine, équipement, véhicule',
              icon: FiTool,
            },
          ] as const).map(({ value, label, desc, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setForm((prev) => ({ ...prev, profileType: value }));
                setErrors({});
              }}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all
                ${form.profileType === value
                  ? 'border-blue-600 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center
                ${form.profileType === value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className={`font-semibold text-sm ${form.profileType === value ? 'text-blue-700' : 'text-gray-700'}`}>
                  {label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              {form.profileType === value && (
                <span className="text-[10px] font-bold text-blue-600">✓ Sélectionné</span>
              )}
            </button>
          ))}
        </div>
        {errors.profileType && (
          <p className="mt-1 text-xs text-red-600">{errors.profileType}</p>
        )}
      </div>

      {/* ── CHAMPS CONDITIONNELS — affichés seulement si un type est choisi ── */}
      {form.profileType && (
        <>
          {/* ── CHAMPS PERSONNE ── */}
          {isPersonne && (
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Prénom" icon={FiUser} value={form.firstName}
                onChange={set('firstName')} placeholder="Jean"
                error={errors.firstName} required />
              <InputField label="Nom" icon={FiUser} value={form.lastName}
                onChange={set('lastName')} placeholder="Dupont"
                error={errors.lastName} required />
            </div>
          )}

          {/* ── CHAMPS ENGIN ── */}
          {isEngin && (
            <div className="space-y-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <FiTool className="text-orange-500 w-4 h-4" />
                <p className="text-sm font-semibold text-orange-700">Informations de l'engin</p>
              </div>
              <InputField label="Nom de l'engin" icon={FiTag} value={form.enginName}
                onChange={set('enginName')} placeholder="Ex : Grue mobile, Bulldozer…"
                error={errors.enginName} required />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Marque" icon={FiTag} value={form.brand}
                  onChange={set('brand')} placeholder="Ex : Caterpillar"
                  error={errors.brand} required />
                <InputField label="Modèle" icon={FiTag} value={form.model}
                  onChange={set('model')} placeholder="Ex : 320D"
                  error={errors.model} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Année de fabrication" icon={FiCalendar} type="number"
                  value={form.year} onChange={set('year')} placeholder="Ex : 2020"
                  error={errors.year} />
                <InputField label="Numéro de série" icon={FiHash} value={form.serialNumber}
                  onChange={set('serialNumber')} placeholder="Ex : CAT-2020-XXXXX"
                  error={errors.serialNumber} />
              </div>
            </div>
          )}

          {/* ── EMAIL ── */}
          <InputField label="Email" icon={FiMail} type="email" value={form.email}
            onChange={set('email')} placeholder="votre@email.com"
            error={errors.email} required />

          {/* ── MOTS DE PASSE ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Mot de passe" icon={FiLock} type="password"
              value={form.password} onChange={set('password')} placeholder="••••••••"
              error={errors.password} required />
            <InputField label="Confirmer le mot de passe" icon={FiLock} type="password"
              value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="••••••••"
              error={errors.confirmPassword} required />
          </div>

          {/* ── LOCALISATION ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Localisation <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                list="localisations-list"
                value={form.localisation}
                onChange={(e) => set('localisation')(e.target.value)}
                disabled={loadingLocalisations}
                placeholder={loadingLocalisations ? 'Chargement…' : 'Sélectionnez ou saisissez'}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${errors.localisation ? 'border-red-400 bg-red-50' : 'border-gray-300'}
                  ${loadingLocalisations ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              <datalist id="localisations-list">
                {localisations.map((loc) => (
                  <option key={loc.id} value={loc.name} />
                ))}
              </datalist>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              💡 Sélectionnez dans la liste ou entrez une nouvelle localisation
            </p>
            {errors.localisation && (
              <p className="mt-1 text-xs text-red-600">{errors.localisation}</p>
            )}
          </div>

          
          <InputField label="Téléphone" icon={FiPhone} type="tel" value={form.phone}
            onChange={set('phone')} placeholder="+237 6 XX XX XX XX"
            error={errors.phone} required />
        </>
      )}

     
      <button
        type="submit"
        disabled={!form.profileType}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700
          transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        Continuer →
      </button>
    </form>
  );
};

export default RegisterStep1;