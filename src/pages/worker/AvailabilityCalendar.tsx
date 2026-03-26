// src/components/calendar/AvailabilityCalendar.tsx
import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import AvailabilityOffcanvas from '../../components/calendar/AvailabilityOffcanvas';
import availabilitiesService, { Availability } from '../../features/availabilitiesService';

const AvailabilityCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les disponibilités au montage
  useEffect(() => {
    fetchAvailabilities();
  }, []);

  const fetchAvailabilities = async () => {
    setIsLoading(true);
    try {
      const data = await availabilitiesService.fetchAvailabilities();
      setAvailabilities(data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des disponibilités');
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation mois
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Obtenir le nom du mois
  const getMonthName = () => {
    return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  // Générer les jours du calendrier
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days: (Date | null)[] = [];
    
    // Jours vides avant le début du mois
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // Vérifier si une date a des disponibilités
  const getAvailabilitiesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availabilities.filter(avail => {
      const start = new Date(avail.start_date).toISOString().split('T')[0];
      const end = new Date(avail.end_date).toISOString().split('T')[0];
      return dateStr >= start && dateStr <= end;
    });
  };

  // Gérer le clic sur une date
  const handleDateClick = (date: Date | null) => {
    if (!date) return;
    setSelectedDate(date);
    setIsOffcanvasOpen(true);
  };

  // Ajouter une disponibilité
  const handleAddAvailability = async (data: { startDate: string; endDate: string }) => {
    setIsSubmitting(true);
    try {
      const newAvailability = await availabilitiesService.createAvailability({
        start_date: data.startDate,
        end_date: data.endDate,
      });
      
      setAvailabilities([...availabilities, newAvailability]);
      setIsOffcanvasOpen(false);
      toast.success('Disponibilité ajoutée avec succès !');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'ajout de la disponibilité');
      console.error('Erreur:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Supprimer une disponibilité
  const handleDeleteAvailability = async (availabilityId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette disponibilité ?')) {
      return;
    }

    try {
      await availabilitiesService.deleteAvailability(availabilityId);
      setAvailabilities(availabilities.filter(a => a.id !== availabilityId));
      toast.success('Disponibilité supprimée avec succès !');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
      console.error('Erreur:', error);
    }
  };

  const days = generateCalendarDays();
  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement du calendrier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              
              <h2 className="text-2xl font-bold text-gray-900 capitalize">
                {getMonthName()}
              </h2>
              
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={goToToday}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
              >
                Aujourd'hui
              </button>
              
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Mois</option>
                <option>Semaine</option>
                <option>Jour</option>
              </select>
            </div>
          </div>
        </div>

        {/* Calendrier */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* En-tête des jours */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {weekDays.map((day) => (
              <div
                key={day}
                className="p-4 text-center font-semibold text-gray-700 bg-gray-50"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grille du calendrier */}
          <div className="grid grid-cols-7">
            {days.map((date, index) => {
              const dayAvailabilities = date ? getAvailabilitiesForDate(date) : [];
              const isToday = date && date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`min-h-[120px] border-r border-b border-gray-200 p-2 transition-colors ${
                    date ? 'cursor-pointer hover:bg-blue-50' : 'bg-gray-50'
                  }`}
                >
                  {date && (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-sm font-semibold ${
                            isToday
                              ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center'
                              : 'text-gray-700'
                          }`}
                        >
                          {date.getDate()}
                        </span>
                      </div>

                      {/* Afficher les disponibilités */}
                      <div className="space-y-1">
                        {dayAvailabilities.slice(0, 3).map((avail) => (
                          <div
                            key={avail.id}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded truncate flex items-center gap-1"
                          >
                            <FiClock className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">Disponible</span>
                          </div>
                        ))}
                        
                        {dayAvailabilities.length > 3 && (
                          <div className="text-xs text-gray-500 px-2">
                            +{dayAvailabilities.length - 3} autre(s)
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Légende */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Mes disponibilités</h3>
          <div className="space-y-2">
            {availabilities.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Aucune disponibilité enregistrée. Cliquez sur une date pour en ajouter.
              </p>
            ) : (
              availabilities.map((avail) => (
                <div
                  key={avail.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">Disponible</p>
                      <p className="text-sm text-gray-500">
                        Du {new Date(avail.start_date).toLocaleDateString('fr-FR')} au{' '}
                        {new Date(avail.end_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAvailability(avail.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Supprimer
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Offcanvas */}
      <AvailabilityOffcanvas
        isOpen={isOffcanvasOpen}
        onClose={() => setIsOffcanvasOpen(false)}
        onSubmit={handleAddAvailability}
        selectedDate={selectedDate}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default AvailabilityCalendar;