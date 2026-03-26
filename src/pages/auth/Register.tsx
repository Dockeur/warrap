// src/pages/auth/Register.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import RegisterStep1 from './RegisterStep1';
import RegisterStep2 from './RegisterStep2';
import RegisterStep3 from './RegisterStep3';
import { ROUTES } from '../../utils/constants';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  privacy_policy: boolean;
  accountType: string;
  entityType?: string;
  isCommercial?: boolean;
  specialties: string[];
  experience: number;
  certifications: string[];
  bio: string;
  lot_id?: number | null;
  lot_ids?: number[];
  commercialRegister?: File | null;
  immigrationCertificate?: File | null;
  certificateOfCompliance?: File | null;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Partial<RegisterData>>(() => {
    const savedData = localStorage.getItem('registerFormData');
    return savedData ? JSON.parse(savedData) : {
      specialties: [],
      certifications: [],
      experience: 0,
    };
  });

  useEffect(() => {
    if (Object.keys(formData).length > 3) {
      const { commercialRegister, immigrationCertificate, certificateOfCompliance, ...dataToSave } = formData;
      localStorage.setItem('registerFormData', JSON.stringify(dataToSave));
    }
  }, [formData]);

  const handleStep1Complete = async (data: any) => {
    try {
      setFormData({ ...formData, ...data });
      setCurrentStep(2);
      toast.success('Étape 1 complétée !');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleStep2Complete = async (data: any) => {
    try {
      setFormData({ ...formData, ...data });
      setCurrentStep(3);
      toast.success('Étape 2 complétée !');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleStep3Complete = async (data: any) => {
    setIsSubmitting(true);

    try {
      const finalData = { ...formData, ...data };

      const isCommercial = !!finalData.isCommercial;
      const isEnterprise = !isCommercial && finalData.entityType === 'entreprise';

      console.log('🔍 accountType:', finalData.accountType);
      console.log('🔍 isCommercial:', isCommercial);
      console.log('🔍 isEnterprise:', isEnterprise);
      console.log('🔍 lot_id:', finalData.lot_id);
      console.log('🔍 lot_ids:', finalData.lot_ids);

      const formDataToSend = new FormData();

      // ── Champs communs ──────────────────────────────────────────────────────
      formDataToSend.append('email',                 finalData.email || '');
      formDataToSend.append('password',              finalData.password || '');
      formDataToSend.append('password_confirmation', finalData.password || '');
      formDataToSend.append('privacy_policy',        finalData.privacy_policy ? '1' : '0');
      formDataToSend.append('phoneNumber',           finalData.phone || '');
      formDataToSend.append('firstName',             finalData.firstName || '');
      formDataToSend.append('lastName',              finalData.lastName || '');
      formDataToSend.append('years_of_experience',   String(finalData.experience || 0));
      formDataToSend.append('presentation',          finalData.bio || '');
      formDataToSend.append('is_enterprise',         isEnterprise ? '1' : '0');

      // ── Worker ──────────────────────────────────────────────────────────────
      const workerValue = finalData.accountType;
      if (!workerValue) throw new Error('Le type de compte est manquant');
      formDataToSend.append('worker', workerValue);

      // ── Localisation ────────────────────────────────────────────────────────
      if (finalData.localisation_worker_id) {
        formDataToSend.append('localisation_worker_id', String(finalData.localisation_worker_id));
      } else if (finalData.localisation_name) {
        formDataToSend.append('localisation_name', finalData.localisation_name);
      }

      // ── Lots ────────────────────────────────────────────────────────────────
      if (isCommercial) {
        // Commercial → lot_ids[] + is_enterprise=0
        const ids: number[] = finalData.lot_ids || [];
        if (ids.length === 0) throw new Error('Veuillez sélectionner au moins un lot');
        ids.forEach((id) => formDataToSend.append('lot_ids[]', String(id)));
        console.log('✅ [Commercial] lot_ids[] envoyés:', ids);

      } else if (isEnterprise) {
        // Entreprise → lot_ids[] + is_enterprise=1 + documents
        const ids: number[] = finalData.lot_ids || [];
        if (ids.length === 0) throw new Error('Veuillez sélectionner au moins un lot');
        ids.forEach((id) => formDataToSend.append('lot_ids[]', String(id)));
        console.log('✅ [Entreprise] lot_ids[] envoyés:', ids);

        if (finalData.commercialRegister)
          formDataToSend.append('commercial_register',       finalData.commercialRegister);
        if (finalData.immigrationCertificate)
          formDataToSend.append('immigration_certificate',   finalData.immigrationCertificate);
        if (finalData.certificateOfCompliance)
          formDataToSend.append('certificate_of_compliance', finalData.certificateOfCompliance);

      } else {
        // Personnel (non-commercial) → lot_id unique
        if (finalData.lot_id != null) {
          formDataToSend.append('lot_id', String(finalData.lot_id));
          console.log('✅ [Personnel] lot_id envoyé:', finalData.lot_id);
        }
      }

      // ── Debug ───────────────────────────────────────────────────────────────
      console.log('📤 === FORMDATA FINAL ===');
      for (const [k, v] of formDataToSend.entries()) console.log(` ${k}:`, v);
      console.log('📤 =======================');

      // ── Requête ─────────────────────────────────────────────────────────────
      const response = await fetch(`${import.meta.env.VITE_API_URL}/registerWorker`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formDataToSend,
      });

      const responseText = await response.text();
      console.log('📥 Réponse:', responseText);

      if (!response.ok) {
        let error;
        try { error = JSON.parse(responseText); }
        catch { error = { message: responseText }; }
        throw new Error(error.message || "Erreur lors de l'inscription");
      }

      const result = JSON.parse(responseText);

      if (result.token) localStorage.setItem('token', result.token);
      if (result.user)  localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.removeItem('registerFormData');

      toast.success('Inscription réussie ! Bienvenue 🎉');

      const redirectPaths: Record<string, string> = {
        technicien:          '/technicien/dashboard',
        architect:           ROUTES.ENGINEER_DASHBOARD,
        engineer:            ROUTES.ENGINEER_DASHBOARD,
        site_supervisor:     ROUTES.ENGINEER_DASHBOARD,
        technical_director:  ROUTES.ENGINEER_DASHBOARD,
        conducteur_travaux:  ROUTES.ENGINEER_DASHBOARD,
      };
      setTimeout(() => navigate(redirectPaths[finalData.accountType] || '/dashboard'), 1000);

    } catch (error: any) {
      console.error('❌ Erreur:', error);
      toast.error(error.message || 'Une erreur est survenue');
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleClearData = () => {
    if (window.confirm('Effacer toutes les données ?')) {
      localStorage.removeItem('registerFormData');
      setFormData({ specialties: [], certifications: [], experience: 0 });
      setCurrentStep(1);
      toast.info('Données effacées');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold transition-all ${
                    currentStep >= step ? 'bg-blue-600 shadow-lg' : 'bg-gray-300'
                  }`}>
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

        {/* Content */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          {currentStep === 1 && (
            <RegisterStep1 onComplete={handleStep1Complete} initialData={formData} />
          )}
          {currentStep === 2 && (
            <RegisterStep2 onComplete={handleStep2Complete} onBack={handleBack} initialData={formData} />
          )}
          {currentStep === 3 && (
            <RegisterStep3
              onComplete={handleStep3Complete}
              onBack={handleBack}
              initialData={formData}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-center flex-1">
            <span className="text-gray-600">Vous avez déjà un compte ? </span>
            <button onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700 font-medium">
              Se connecter
            </button>
          </div>
          {import.meta.env.DEV && (
            <button onClick={handleClearData}
              className="text-xs text-gray-400 hover:text-red-600"
              title="Effacer les données sauvegardées">
              Effacer les données
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;