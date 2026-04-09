// src/components/layout/MainLayout.tsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiBell, FiUser, FiLogOut, FiMenu, FiX,
  FiGrid, FiUsers, FiBriefcase, FiFolder,
  FiCalendar, FiDollarSign, FiChevronRight,
  FiSettings, FiSearch,
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { ROUTES } from '../../utils/constants';
import { logout } from '../../features/auth/authSlice';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.notifications);

  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [mobileSidebar, setMobileSidebar] = React.useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  const role = user?.role;

  const dashboardRoute =
    role === 'admin' ? ROUTES.ADMIN_DASHBOARD
      : role === 'user' ? ROUTES.WORKER_DASHBOARD
        : role === 'commercial' ? '/commercial/dashboard'
          : ROUTES.ENGINEER_DASHBOARD;

  const iconMap: Record<string, React.ReactNode> = {
    'Dashboard': <FiGrid size={18} />,
    'Travailleurs': <FiUsers size={18} />,
    'Disponibilités': <FiCalendar size={18} />,
    'Jobs': <FiBriefcase size={18} />,
    'Projets': <FiFolder size={18} />,
    'Mes Projets': <FiFolder size={18} />,
    'Utilisateurs': <FiUsers size={18} />,
    'Commissions': <FiDollarSign size={18} />,
  };


  const workerLinks = [
    { to: ROUTES.WORKER_DASHBOARD, label: 'Dashboard' },
    { to: ROUTES.WORKER_AVAILABILITY, label: 'Disponibilités' },
  ];

  const correctorLinks = [
    { to: ROUTES.ENGINEER_DASHBOARD, label: 'Dashboard' },
    { to: ROUTES.ENGINEER_WORKERS, label: 'Travailleurs' },
    { to: ROUTES.ENGINEER_LIST_PROJECT, label: 'Mes Projets' },
  ];

  const validatorLinks = [
    { to: ROUTES.ENGINEER_DASHBOARD, label: 'Dashboard' },
    { to: ROUTES.ENGINEER_WORKERS, label: 'Travailleurs' },
    { to: ROUTES.ENGINEER_LIST_PROJECT, label: 'Projets' },
  ];

  const managerLinks = [
    { to: ROUTES.ENGINEER_DASHBOARD, label: 'Dashboard' },
    { to: ROUTES.ENGINEER_WORKERS, label: 'Travailleurs' },
    { to: ROUTES.WORKER_AVAILABILITY, label: 'Disponibilités' },
    { to: ROUTES.ADMIN_JOBS, label: 'Projets Lancés' },
  ];

  const adminLinks = [
    { to: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard' },
    { to: ROUTES.ADMIN_USER_MANAGEMENT, label: 'Utilisateurs' },
    { to: ROUTES.ADMIN_JOBS, label: 'Projets Lancés' },
    { to: ROUTES.ENGINEER_LIST_PROJECT, label: 'Projets' },
  ];

  const commercialLinks = [
    { to: '/commercial/dashboard', label: 'Dashboard' },
    { to: '/commercial/projects', label: 'Projets' },
    { to: '/commercial/commissions', label: 'Commissions' },
  ];

  const getLinks = () => {
    switch (role) {
      case 'admin': return adminLinks;
      case 'validator': return validatorLinks;
      case 'manager': return managerLinks;
      case 'corrector': return correctorLinks;
      case 'commercial': return commercialLinks;
      default: return workerLinks;
    }
  };

  const links = getLinks();


  const roleBadge: Record<string, { label: string; color: string }> = {
    admin: { label: 'Admin', color: 'bg-red-100 text-red-700' },
    validator: { label: 'Validator', color: 'bg-purple-100 text-purple-700' },
    manager: { label: 'Manager', color: 'bg-purple-100 text-purple-700' },
    corrector: { label: 'Corrector', color: 'bg-blue-100 text-blue-700' },
    commercial: { label: 'Commercial', color: 'bg-orange-100 text-orange-700' },
    user: { label: 'Technicien', color: 'bg-green-100 text-green-700' },
  };
  const badge = role ? roleBadge[role] : null;


  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(to + '/');

  // ── Sidebar component (shared desktop & mobile) ───────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-white font-bold text-sm">WP</span>
        </div>
        {sidebarOpen && (
          <span className="text-gray-900 font-bold text-base tracking-tight truncate">
            Worker Platform
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {sidebarOpen && (
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-3">
            Menu
          </p>
        )}
        {links.map((link) => {
          const active = isActive(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileSidebar(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150 group relative
                ${active
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
              `}
            >
              <span className={`flex-shrink-0 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`}>
                {iconMap[link.label] ?? <FiChevronRight size={18} />}
              </span>
              {sidebarOpen && <span className="truncate">{link.label}</span>}
              {!sidebarOpen && (
                <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded-md
                  opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {link.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom user card */}
      <div className="border-t border-gray-100 p-3">

        <Link
          to={`/engineer/workers/${user?.id}`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 transition-colors group"
        >
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
            {user?.contact?.firstName?.[0]}
            {user?.contact?.lastName?.[0]}
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {user?.contact?.firstName} {user?.contact?.lastName}
              </p>
              {badge && (
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${badge.color}`}>
                  {badge.label}
                </span>
              )}
            </div>
          )}
        </Link>

        {sidebarOpen && (
          <button
            onClick={handleLogout}
            className="mt-1 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              text-red-500 hover:bg-red-50 transition-colors"
          >
            <FiLogOut size={18} />
            <span>Déconnexion</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={`
          hidden md:flex flex-col bg-white border-r border-gray-100 flex-shrink-0
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-60' : 'w-[68px]'}
        `}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ──────────────────────────────────────── */}
      {mobileSidebar && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileSidebar(false)}
          />
          <aside className="relative z-10 w-64 bg-white flex flex-col shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main Area ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-100 flex-shrink-0 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16 gap-4">

            {/* Left : collapse btn + breadcrumb */}
            <div className="flex items-center gap-3">
              {/* Desktop collapse */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden md:flex p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <FiMenu size={20} />
              </button>
              {/* Mobile burger */}
              <button
                onClick={() => setMobileSidebar(true)}
                className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <FiMenu size={20} />
              </button>

              {/* Page title / breadcrumb */}
              <div className="hidden sm:block">
                <h1 className="text-base font-semibold text-gray-800">
                  {links.find((l) => isActive(l.to))?.label ?? 'Dashboard'}
                </h1>
              </div>
            </div>

            {/* Right : search + notifs + avatar */}
            <div className="flex items-center gap-2">

              {/* Search bar */}
              <div className="hidden lg:flex items-center gap-2 bg-gray-50 border border-gray-200
                rounded-xl px-3 py-2 text-sm text-gray-400 w-52 focus-within:border-blue-300
                focus-within:bg-white transition-all">
                <FiSearch size={15} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="bg-transparent outline-none text-gray-700 placeholder-gray-400 w-full text-sm"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2.5 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors">
                <FiBell size={19} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-white
                    text-[10px] rounded-full flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Settings shortcut */}
              <button className="p-2.5 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors">
                <FiSettings size={19} />
              </button>

              {/* Avatar dropdown */}
              <div className="relative group ml-1">
                <button className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center
                    text-white font-bold text-sm flex-shrink-0">
                    {user.profil ? (
                      <img
                        src={user.profil}
                        alt={user.contact.fullName}
                        className="object-cover h-full w-full rounded-2xl object-cover border-4 border-white shadow-lg"
                      />
                    ) : null}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">
                      {user?.contact?.firstName}
                    </p>
                    {badge && (
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                    )}
                  </div>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border
                  border-gray-100 py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100
                  transition-all duration-150 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-xs text-gray-400">Connecté en tant que</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {user?.contact?.firstName} {user?.contact?.lastName}
                    </p>
                  </div>
                  <Link
                    to={`/user/profil/${user?.id}`}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FiUser size={15} />
                    Mon Profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                  >
                    <FiLogOut size={15} />
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;