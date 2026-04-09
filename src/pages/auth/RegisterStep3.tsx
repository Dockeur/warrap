import React, { useEffect, useState } from 'react';
import { FiLoader, FiTool } from 'react-icons/fi';
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

    const [allLots, setAllLots] = useState<Lot[]>([]);
    const [isLoadingLots, setIsLoadingLots] = useState(true);
    const [lotsError, setLotsError] = useState<string | null>(null);

    const [selectedMainLot, setSelectedMainLot] = useState<Lot | null>(initialData.selectedMainLot || null);
    const [lotId, setLotId] = useState<number | null>(initialData.lotId || null);
    const [lotIds, setLotIds] = useState<number[]>(initialData.lotIds || []);
    const [entityType, setEntityType] = useState(isEnginProfile ? 'engin' : initialData.entityType || '');

    const [errors, setErrors] = useState<any>({});

    const isCommercial = MULTI_LOT_MAINS.includes(selectedMainLot?.name?.toLowerCase() ?? '');
    const isEnterprise = !isEnginProfile && entityType === 'entreprise';
    const useMultiLots = isCommercial || isEnterprise || isEnginProfile;

    useEffect(() => {
        const fetchLots = async () => {
            setIsLoadingLots(true);
            setLotsError(null);
            try {
                const data = await lotsService.getMainLots();
                setAllLots(data);
                if (isEnginProfile) {
                    const enginLot = data.find((l: Lot) => l.name.toLowerCase() === 'engin');
                    if (enginLot) setSelectedMainLot(enginLot);
                }
            } catch (err: any) {
                setLotsError(err.message || 'Impossible de charger les catégories');
            } finally {
                setIsLoadingLots(false);
            }
        };
        fetchLots();
    }, []);

    useEffect(() => {
        setLotId(null);
        setLotIds([]);
    }, [selectedMainLot, entityType]);

    const personneMainLots = allLots.filter((l) => l.name.toLowerCase() !== 'engin');

    const handleMainLotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = Number(e.target.value);
        const lot = allLots.find((l) => l.id === id) || null;
        setSelectedMainLot(lot);
        setEntityType('');
        setLotId(null);
        setLotIds([]);
    };

    const validate = () => {
        const e: any = {};
        if (!isEnginProfile && !selectedMainLot) e.accountType = 'Veuillez choisir une catégorie';
        if (!isEnginProfile && !isCommercial && !entityType) e.entityType = 'Veuillez choisir personnel ou entreprise';
        if (useMultiLots) {
            if (lotIds.length === 0) e.lotId = 'Veuillez sélectionner au moins un lot';
        } else {
            if (lotId === null) e.lotId = 'Veuillez choisir un lot';
        }
        if (isEnginProfile && !selectedMainLot) e.accountType = 'La catégorie "engin" est introuvable. Contactez un administrateur.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onComplete({
                accountType: selectedMainLot?.name,
                selectedMainLot,
                entityType: isEnginProfile ? 'engin' : isCommercial ? 'personnel' : entityType,
                isCommercial,
                isEnginProfile,
                lot_id: useMultiLots ? null : lotId,
                lot_ids: useMultiLots ? lotIds : [],
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
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
                            <button type="button" onClick={() => window.location.reload()} className="mt-2 text-sm text-red-600 font-medium">Réessayer</button>
                        </div>
                    ) : !selectedMainLot ? (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">La catégorie "engin" est introuvable. Contactez un administrateur.</p>
                        </div>
                    ) : (
                        <>
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

            {!isEnginProfile && (
                <>
                    <div>
                        {isLoadingLots ? (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <FiLoader className="animate-spin h-5 w-5 text-blue-600" />
                                <span className="text-sm text-gray-600">Chargement des catégories...</span>
                            </div>
                        ) : lotsError ? (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-800">{lotsError}</p>
                                <button type="button" onClick={() => window.location.reload()} className="mt-2 text-sm text-red-600 font-medium">Réessayer</button>
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
                                    className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 ${errors.accountType ? 'border-red-400' : 'border-gray-300'}`}
                                >
                                    <option value="">-- Sélectionnez une catégorie --</option>
                                    {personneMainLots.map((lot) => (
                                        <option key={lot.id} value={lot.id}>
                                            {lot.name.charAt(0).toUpperCase() + lot.name.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                {errors.accountType && <p className="mt-1 text-sm text-red-600">{errors.accountType}</p>}
                            </div>
                        )}
                    </div>

                    {selectedMainLot && !isCommercial && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vous êtes <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={entityType}
                                onChange={(e) => setEntityType(e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 ${errors.entityType ? 'border-red-400' : 'border-gray-300'}`}
                            >
                                <option value="">-- Sélectionnez votre statut --</option>
                                <option value="personnel">Personnel — Freelance / Indépendant</option>
                                <option value="entreprise">Entreprise — Société / Cabinet</option>
                            </select>
                            {errors.entityType && <p className="mt-1 text-sm text-red-600">{errors.entityType}</p>}
                        </div>
                    )}

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

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                    ℹ️ Vous pourrez compléter votre profil (photo, expérience, documents) après la création de votre compte.
                </p>
            </div>

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
                    ) : "Créer mon compte →"}
                </button>
            </div>
        </form>
    );
};

export default RegisterStep3;