// src/pages/auth/RegisterStep3.tsx
import React, { useState, useEffect } from 'react';
import { FiUpload, FiLoader, FiTool } from 'react-icons/fi';
import LotsSelect from './register/LotsSelect';
import lotsService, { Lot } from '../../features/auth/lotsService';

interface RegisterStep3Props {
  onComplete: (data: any) => void;
  onBack: () => void;
  initialData: any;
  isSubmitting?: boolean;
}

const MULTI_LOT_MAINS = ['commercial'];
type ProfileType = 'personne' | 'engin' | '';

const RegisterStep3: React.FC<RegisterStep3Props> = ({
  onComplete,
  onBack,
  initialData,
  isSubmitting = false,
}) => {
  const profileType: ProfileType = initialData.profileType || 'personne';
  const isEnginProfile = profileType === 'engin';

  const [allLots, setAllLots]                     = useState<Lot[]>([]);
  const [isLoadingLots, setIsLoadingLots]          = useState(true);
  const [lotsError, setLotsError]                 = useState<string | null>(null);

  // Pour engin : lot principal auto-sélectionné (celui dont le nom = "engin")
  const [selectedMainLot, setSelectedMainLot]     = useState<Lot | null>(
    initialData.selectedMainLot || null
  );

  const [lotId,  setLotId]  = useState<number | null>(initialData.lotId  || null);
  const [lotIds, setLotIds] = useState<number[]>(initialData.lotIds || []);

  // entityType uniquement pour personne
  const [entityType, setEntityType] = useState(
    isEnginProfile ? 'engin' : initialData.entityType || ''
  );

  const [experience, setExperience] = useState(initialData.experience || 0);
  const [bio, setBio]               = useState(initialData.bio || '');

  const [commercialRegister,      setCommercialRegister]      = useState<File | null>(null);
  const [immigrationCertificate,  setImmigrationCertificate]  = useState<File | null>(null);
  const [certificateOfCompliance, setCertificateOfCompliance] = useState<File | null>(null);

  const [errors, setErrors] = useState<any>({});

  // ── Dérivés ────────────────────────────────────────────────────────────────
  const isCommercial    = MULTI_LOT_MAINS.includes(selectedMainLot?.name?.toLowerCase() ?? '');
  const isEnterprise    = !isEnginProfile && entityType === 'entreprise';
  const showCompanyForm = !isCommercial && isEnterprise;
  const useMultiLots    = isCommercial || isEnterprise || isEnginProfile;

  // ── Fetch tous les lots principaux ─────────────────────────────────────────
  useEffect(() => {
    const fetchLots = async () => {
      setIsLoadingLots(true);
      setLotsError(null);
      try {
        const data = await lotsService.getMainLots();
        setAllLots(data);

        if (isEnginProfile) {
          // Auto-sélectionner le lot "engin"
          const enginLot = data.find((l: Lot) =>
            l.name.toLowerCase() === 'engin'
          );
          if (enginLot) {
            setSelectedMainLot(enginLot);
          }
        }
      } catch (err: any) {
        setLotsError(err.message || 'Impossible de charger les catégories');
      } finally {
        setIsLoadingLots(false);
      }
    };
    fetchLots();
  }, []);

  // Reset lots à chaque changement de catégorie ou entityType
  useEffect(() => {
    setLotId(null);
    setLotIds([]);
  }, [selectedMainLot, entityType]);

  // Lots filtrés pour personne = tout sauf "engin"
  const personneMainLots = allLots.filter(
    (l) => l.name.toLowerCase() !== 'engin'
  );

  const handleMainLotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id  = Number(e.target.value);
    const lot = allLots.find((l) => l.id === id) || null;
    setSelectedMainLot(lot);
    setEntityType('');
    setLotId(null);
    setLotIds([]);
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e: any = {};

    if (!isEnginProfile && !selectedMainLot)
      e.accountType = 'Veuillez choisir une catégorie';

    if (!isEnginProfile && !isCommercial && !entityType)
      e.entityType = 'Veuillez choisir personnel ou entreprise';

    if (showCompanyForm) {
      if (!commercialRegister)      e.commercialRegister      = 'Le registre de commerce est requis';
      if (!immigrationCertificate)  e.immigrationCertificate  = "Le certificat d'immigration est requis";
      if (!certificateOfCompliance) e.certificateOfCompliance = 'Le certificat de conformité est requis';
    }

    if (useMultiLots) {
      if (lotIds.length === 0) e.lotId = 'Veuillez sélectionner au moins un lot';
    } else {
      if (lotId === null) e.lotId = 'Veuillez choisir un lot';
    }

    if (!bio || bio.trim().length < 10)
      e.bio = 'Veuillez ajouter une description (minimum 10 caractères)';

    // Pour engin : vérifier que le lot engin a bien été trouvé
    if (isEnginProfile && !selectedMainLot)
      e.accountType = 'La catégorie "engin" est introuvable. Contactez un administrateur.';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onComplete({
        accountType:    selectedMainLot?.name,
        selectedMainLot,
        entityType:     isEnginProfile ? 'engin' : isCommercial ? 'personnel' : entityType,
        isCommercial,
        isEnginProfile,
        lot_id:  useMultiLots ? null   : lotId,
        lot_ids: useMultiLots ? lotIds : [],
        experience,
        bio,
        commercialRegister,
        immigrationCertificate,
        certificateOfCompliance,
      });
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { alert('Seuls les fichiers PDF sont acceptés'); return; }
    setter(file);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ── TITRE ── */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-1">
          {isEnginProfile ? "Spécialités de l'engin" : 'Type de compte'}
        </h2>
        <p className="text-gray-500 text-sm flex items-center gap-2">
          {isEnginProfile
            ? <><FiTool className="text-orange-500 flex-shrink-0" /> Sélectionnez les lots correspondant à votre engin</>
            : 'Sélectionnez le type qui correspond à votre profil'}
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          CAS ENGIN — catégorie auto, on passe directement aux lots
      ══════════════════════════════════════════════════════════════════════ */}
      {isEnginProfile && (
        <>
          {isLoadingLots ? (
            <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <FiLoader className="animate-spin h-5 w-5 text-orange-500" />
              <span className="text-sm text-orange-700">Chargement des lots engin…</span>
            </div>
          ) : lotsError ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{lotsError}</p>
              <button type="button" onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-600 font-medium">Réessayer</button>
            </div>
          ) : !selectedMainLot ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                La catégorie "engin" est introuvable dans le système. Contactez un administrateur.
              </p>
            </div>
          ) : (
            <>
              {/* Badge catégorie auto */}
              <div className="flex items-center gap-3 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                  <FiTool className="text-white w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-orange-700">
                    Catégorie : {selectedMainLot.name.charAt(0).toUpperCase() + selectedMainLot.name.slice(1)}
                  </p>
                  <p className="text-xs text-orange-500">Sélectionnée automatiquement</p>
                </div>
              </div>

              {/* Lots multi engin */}
              <LotsSelect
                multiple
                selectedMainLotName={selectedMainLot.name}
                selected={lotIds}
                onChange={setLotIds}
                error={errors.lotId}
              />
            </>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          CAS PERSONNE — select filtré (sans engin) + entityType + lots
      ══════════════════════════════════════════════════════════════════════ */}
      {!isEnginProfile && (
        <>
          {/* Catégorie */}
          <div>
            {isLoadingLots ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <FiLoader className="animate-spin h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-600">Chargement des catégories...</span>
              </div>
            ) : lotsError ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{lotsError}</p>
                <button type="button" onClick={() => window.location.reload()}
                  className="mt-2 text-sm text-red-600 font-medium">Réessayer</button>
              </div>
            ) : (
              <div>
                <label htmlFor="mainLotSelect" className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <select
                  id="mainLotSelect"
                  value={selectedMainLot?.id ?? ''}
                  onChange={handleMainLotChange}
                  className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-gray-800 ${
                    errors.accountType ? 'border-red-400' : 'border-gray-300'
                  }`}
                >
                  <option value="">-- Sélectionnez une catégorie --</option>
                  {personneMainLots.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.name.charAt(0).toUpperCase() + lot.name.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.accountType && (
                  <p className="mt-1 text-sm text-red-600">{errors.accountType}</p>
                )}
              </div>
            )}
          </div>

          {/* Personnel ou Entreprise — masqué pour Commercial */}
          {selectedMainLot && !isCommercial && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vous êtes <span className="text-red-500">*</span>
              </label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-gray-800 ${
                  errors.entityType ? 'border-red-400' : 'border-gray-300'
                }`}
              >
                <option value="">-- Sélectionnez votre statut --</option>
                <option value="personnel">Personnel — Freelance / Indépendant</option>
                <option value="entreprise">Entreprise — Société / Cabinet</option>
              </select>
              {errors.entityType && (
                <p className="mt-1 text-sm text-red-600">{errors.entityType}</p>
              )}
            </div>
          )}

          {/* Documents entreprise */}
          {showCompanyForm && (
            <div className="space-y-5 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Documents de l'entreprise</h3>
                <p className="text-sm text-gray-500">Fichiers PDF requis</p>
              </div>
              {[
                { label: 'Registre de commerce',      id: 'commercialRegister',      state: commercialRegister,      setter: setCommercialRegister,      error: errors.commercialRegister      },
                { label: "Certificat d'immigration",   id: 'immigrationCertificate',  state: immigrationCertificate,  setter: setImmigrationCertificate,  error: errors.immigrationCertificate  },
                { label: 'Certificat de conformité',   id: 'certificateOfCompliance', state: certificateOfCompliance, setter: setCertificateOfCompliance, error: errors.certificateOfCompliance },
              ].map(({ label, id, state, setter, error }) => (
                <div key={id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} <span className="text-red-500">*</span>
                  </label>
                  <input type="file" accept=".pdf"
                    onChange={(e) => handleFileChange(e, setter)}
                    className="hidden" id={id} />
                  <label htmlFor={id}
                    className={`flex items-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer bg-white transition-colors ${
                      error ? 'border-red-400' : 'border-gray-300 hover:border-blue-400'
                    }`}>
                    <FiUpload className="text-gray-400 flex-shrink-0" />
                    <span className={`text-sm truncate ${state ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                      {state ? state.name : 'Choisir un fichier PDF'}
                    </span>
                  </label>
                  {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Lots personne */}
          {selectedMainLot && (isCommercial || entityType) && (
            useMultiLots ? (
              <LotsSelect
                multiple
                selectedMainLotName={selectedMainLot.name}
                selected={lotIds}
                onChange={setLotIds}
                error={errors.lotId}
              />
            ) : (
              <LotsSelect
                selectedMainLotName={selectedMainLot.name}
                selected={lotId}
                onChange={setLotId}
                error={errors.lotId}
              />
            )
          )}
        </>
      )}

      {/* ── EXPÉRIENCE ── */}
      <div>
        <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
          {isEnginProfile ? "Années d'utilisation de l'engin" : "Années d'expérience"}
        </label>
        <input
          id="experience"
          type="number"
          min="0"
          max="50"
          value={experience}
          onChange={(e) => setExperience(parseInt(e.target.value) || 0)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0"
        />
        <p className="mt-1 text-xs text-gray-500">
          {isEnginProfile
            ? "Nombre d'années d'utilisation de ce type d'engin"
            : "Nombre d'années d'expérience dans votre domaine"}
        </p>
      </div>

      {/* ── BIO ── */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
          {isEnginProfile ? "Description de l'engin" : 'Présentation professionnelle'}{' '}
          <span className="text-red-500">*</span>
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
            errors.bio ? 'border-red-400' : 'border-gray-300'
          }`}
          placeholder={
            isEnginProfile
              ? "Décrivez l'engin : capacités, état, disponibilité, zone d'intervention..."
              : "Parlez de votre expérience, vos compétences, vos réalisations..."
          }
        />
        <p className="mt-1 text-xs text-gray-500">
          {bio.length} caractère{bio.length !== 1 ? 's' : ''}
          {bio.length < 10 && ' — minimum 10 requis'}
        </p>
        {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio}</p>}
      </div>

      {/* ── BOUTONS ── */}
      <div className="flex gap-4">
        <button type="button" onClick={onBack} disabled={isSubmitting}
          className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          ← Retour
        </button>
        <button type="submit" disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Inscription en cours...
            </>
          ) : "Terminer l'inscription"}
        </button>
      </div>
    </form>
  );
};

export default RegisterStep3;