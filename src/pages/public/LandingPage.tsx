// src/pages/public/LandingPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiUsers, FiTrendingUp, FiShield, FiZap, FiAward } from 'react-icons/fi';
import { ROUTES } from '../../utils/constants';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FiUsers,
      title: 'Réseau de Professionnels',
      description: 'Accédez à un réseau d\'ingénieurs qualifiés et de techniciens expérimentés',
    },
    {
      icon: FiShield,
      title: 'Projets Vérifiés',
      description: 'Tous les projets sont validés par des experts avant publication',
    },
    {
      icon: FiTrendingUp,
      title: 'Gestion Simplifiée',
      description: 'Gérez vos projets et équipes depuis une plateforme unique',
    },
    {
      icon: FiZap,
      title: 'Rapide et Efficace',
      description: 'Trouvez rapidement les bonnes personnes pour vos projets',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Inscription',
      description: 'Créez votre compte en quelques minutes',
    },
    {
      number: '02',
      title: 'Parcourez',
      description: 'Explorez notre catalogue de projets validés',
    },
    {
      number: '03',
      title: 'Achetez',
      description: 'Achetez les projets qui correspondent à vos besoins',
    },
    {
      number: '04',
      title: 'Réalisez',
      description: 'Mettez en œuvre vos projets avec succès',
    },
  ];

  const stats = [
    { number: '500+', label: 'Projets Validés' },
    { number: '1000+', label: 'Professionnels' },
    { number: '98%', label: 'Satisfaction' },
    { number: '24/7', label: 'Support' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">EFFICACE</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/marketplace')}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Marketplace
              </button>
              <button
                onClick={() => navigate(ROUTES.LOGIN)}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Connexion
              </button>
              <button
                onClick={() => navigate(ROUTES.REGISTER)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Inscription
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                <FiAward className="mr-2" />
                Plateforme de Gestion de Projets
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Trouvez et Achetez des{' '}
                <span className="text-blue-600">Projets Validés</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Plateforme de référence pour les ingénieurs, techniciens et entrepreneurs. 
                Accédez à des projets vérifiés et prêts à l'emploi.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/marketplace')}
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center gap-2"
                >
                  Voir les Projets
                  <FiArrowRight />
                </button>
                <button
                  onClick={() => navigate(ROUTES.REGISTER)}
                  className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all font-semibold"
                >
                  Commencer Gratuitement
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 shadow-2xl"></div>
              <div className="absolute -bottom-6 -left-6 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -top-6 -right-6 w-64 h-64 bg-indigo-200 rounded-full blur-3xl opacity-50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi Choisir EFFICACE ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une plateforme complète pour gérer vos projets et collaborer avec des professionnels
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comment Ça Marche ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Quatre étapes simples pour commencer
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-5xl font-bold text-blue-100 mb-4">{step.number}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-blue-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à Démarrer Votre Projet ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez des milliers de professionnels qui font confiance à EFFICACE
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate(ROUTES.REGISTER)}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all shadow-lg font-semibold"
            >
              Créer un Compte
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="px-8 py-4 bg-blue-500 text-white border-2 border-white rounded-xl hover:bg-blue-400 transition-all font-semibold"
            >
              Explorer les Projets
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-blue-400 mb-4">EFFICACE</h3>
              <p className="text-gray-400">
                Plateforme de gestion de projets pour les professionnels
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/marketplace" className="hover:text-white transition-colors">Marketplace</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tarifs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CGU</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 EFFICACE. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;