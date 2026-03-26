// src/components/calendar/AvailabilityOffcanvas.tsx
import React, { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiClock, FiSave } from 'react-icons/fi';

interface AvailabilityOffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { startDate: string; endDate: string }) => void;
  selectedDate: Date | null;
  isSubmitting?: boolean;
}

const AvailabilityOffcanvas: React.FC<AvailabilityOffcanvasProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedDate,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (selectedDate && isOpen) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setFormData({
        startDate: dateStr,
        endDate: dateStr,
      });
    }
  }, [selectedDate, isOpen]);

  const validate = () => {
    const newErrors: any = {};

    if (!formData.startDate) {
      newErrors.startDate = 'Date de début requise';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Date de fin requise';
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = 'La date de fin doit être après la date de début';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      setFormData({ startDate: '', endDate: '' });
      setErrors({});
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ startDate: '', endDate: '' });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Offcanvas */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FiCalendar className="h-6 w-6 text-blue-600" />
              Ajouter une disponibilité
            </h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <FiX className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Date de début */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date de début *
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    disabled={isSubmitting}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 ${
                      errors.startDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                )}
              </div>

              {/* Date de fin */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date de fin *
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    disabled={isSubmitting}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 ${
                      errors.endDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                )}
              </div>

              {/* Info box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FiClock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Information</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Cette disponibilité sera affichée sur le calendrier pour la période
                      sélectionnée.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="h-4 w-4" />
                    <span>Enregistrer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AvailabilityOffcanvas;