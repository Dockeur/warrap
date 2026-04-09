import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import RegisterStep1 from './RegisterStep1';
import RegisterStep2 from './RegisterStep2';
import RegisterStep3 from './RegisterStep3';
import { ROUTES } from '../../utils/constants';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<any>(() => {
        const saved = localStorage.getItem('registerFormData');
        return saved ? JSON.parse(saved) : { specialties: [], certifications: [], experience: 0 };
    });

    useEffect(() => {
        if (Object.keys(formData).length > 3) {
            localStorage.setItem('registerFormData', JSON.stringify(formData));
        }
    }, [formData]);

    const handleStep1Complete = (data: any) => {
        setFormData({ ...formData, ...data });
        setCurrentStep(2);
        toast.success('Étape 1 complétée !');
    };

    const handleStep2Complete = (data: any) => {
        setFormData({ ...formData, ...data });
        setCurrentStep(3);
        toast.success('Étape 2 complétée !');
    };

    const handleStep3Complete = async (data: any) => {
        setIsSubmitting(true);
        try {
            const finalData = { ...formData, ...data };
            const isCommercial = !!finalData.isCommercial;
            const isEnterprise = !isCommercial && finalData.entityType === 'entreprise';

            const fd = new FormData();
            fd.append('email',                 finalData.email || '');
            fd.append('password',              finalData.password || '');
            fd.append('password_confirmation', finalData.password || '');
            fd.append('privacy_policy',        finalData.privacy_policy ? '1' : '0');
            fd.append('phoneNumber',           finalData.phone || '');
            fd.append('firstName',             finalData.firstName || '');
            fd.append('lastName',              finalData.lastName || '');
            fd.append('is_enterprise',         isEnterprise ? '1' : '0');

            if (!finalData.accountType) throw new Error('Le type de compte est manquant');
            fd.append('worker', finalData.accountType);

            if (finalData.localisation_worker_id) {
                fd.append('localisation_worker_id', String(finalData.localisation_worker_id));
            } else if (finalData.localisation_name) {
                fd.append('localisation_name', finalData.localisation_name);
            }

            if (isCommercial || isEnterprise) {
                const ids: number[] = finalData.lot_ids || [];
                if (ids.length === 0) throw new Error('Veuillez sélectionner au moins un lot');
                ids.forEach((id) => fd.append('lot_ids[]', String(id)));
            } else {
                if (finalData.lot_id != null) fd.append('lot_id', String(finalData.lot_id));
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/registerWorker`, {
                method: 'POST',
                headers: { Accept: 'application/json' },
                body: fd,
            });

            const text = await response.text();
            if (!response.ok) {
                let err;
                try { err = JSON.parse(text); } catch { err = { message: text }; }
                throw new Error(err.message || "Erreur lors de l'inscription");
            }

            const result = JSON.parse(text);
            if (result.token) localStorage.setItem('token', result.token);
            if (result.user)  localStorage.setItem('user', JSON.stringify(result.user));
            localStorage.removeItem('registerFormData');

            toast.success('Compte créé ! Complétez maintenant votre profil 🎉');

            setTimeout(() => navigate('/complete-profile'), 1000);

        } catch (error: any) {
            toast.error(error.message || 'Une erreur est survenue');
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3].map((step) => (
                            <React.Fragment key={step}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold transition-all ${currentStep >= step ? 'bg-blue-600 shadow-lg' : 'bg-gray-300'}`}>
                                        {currentStep > step ? '✓' : step}
                                    </div>
                                    <span className={`mt-2 text-sm font-medium ${currentStep >= step ? 'text-blue-600' : 'text-gray-600'}`}>
                                        {step === 1 && 'Informations'}
                                        {step === 2 && 'Conditions'}
                                        {step === 3 && 'Type de compte'}
                                    </span>
                                </div>
                                {step < 3 && (
                                    <div className={`flex-1 h-1 mx-4 transition-all ${currentStep > step ? 'bg-blue-600' : 'bg-gray-300'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-xl p-8">
                    {currentStep === 1 && <RegisterStep1 onComplete={handleStep1Complete} initialData={formData} />}
                    {currentStep === 2 && <RegisterStep2 onComplete={handleStep2Complete} onBack={handleBack} initialData={formData} />}
                    {currentStep === 3 && <RegisterStep3 onComplete={handleStep3Complete} onBack={handleBack} initialData={formData} isSubmitting={isSubmitting} />}
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <div className="text-center flex-1">
                        <span className="text-gray-600">Vous avez déjà un compte ? </span>
                        <button onClick={() => navigate('/login')} className="text-blue-600 hover:text-blue-700 font-medium">
                            Se connecter
                        </button>
                    </div>
                    {import.meta.env.DEV && (
                        <button
                            onClick={() => {
                                if (window.confirm('Effacer toutes les données ?')) {
                                    localStorage.removeItem('registerFormData');
                                    setFormData({ specialties: [], certifications: [], experience: 0 });
                                    setCurrentStep(1);
                                    toast.info('Données effacées');
                                }
                            }}
                            className="text-xs text-gray-400 hover:text-red-600"
                        >
                            Effacer les données
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Register;