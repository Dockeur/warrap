// src/components/common/Pagination.tsx
import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  lastPage,
  total,
  perPage,
  onPageChange,
  isLoading = false,
}) => {
  // Ne rien afficher s'il n'y a qu'une seule page
  if (lastPage <= 1) return null;

  // Calculer les numéros de page à afficher
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 2; // Nombre de pages à afficher de chaque côté de la page actuelle

    // Toujours afficher la première page
    pages.push(1);

    // Calculer la plage de pages à afficher
    let start = Math.max(2, currentPage - delta);
    let end = Math.min(lastPage - 1, currentPage + delta);

    // Ajouter "..." si nécessaire
    if (start > 2) {
      pages.push('...');
    }

    // Ajouter les pages de la plage
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Ajouter "..." si nécessaire
    if (end < lastPage - 1) {
      pages.push('...');
    }

    // Toujours afficher la dernière page
    if (lastPage > 1) {
      pages.push(lastPage);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Calculer les indices de début et fin
  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      {/* Info */}
      <div className="text-sm text-gray-600">
        Affichage de <span className="font-semibold text-gray-900">{from}</span> à{' '}
        <span className="font-semibold text-gray-900">{to}</span> sur{' '}
        <span className="font-semibold text-gray-900">{total}</span> résultat
        {total > 1 ? 's' : ''}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        {/* Bouton Précédent */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FiChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Précédent</span>
        </button>

        {/* Numéros de page */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((page, index) =>
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                disabled={isLoading}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Indicateur mobile */}
        <div className="sm:hidden px-3 py-2 text-sm font-medium text-gray-700">
          Page {currentPage} / {lastPage}
        </div>

        {/* Bouton Suivant */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage || isLoading}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="hidden sm:inline">Suivant</span>
          <FiChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;