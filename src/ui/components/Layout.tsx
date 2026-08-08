import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../i18n';
import { NotificationsDropdown } from './NotificationsDropdown';

export const Layout: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout, currentOrganization, currentShop, role } = useAuth();
  const location = useLocation();

  const getNavClass = (path: string, isMobile: boolean = false) => {
    const isActive = path === '/app' ? location.pathname === '/app' || location.pathname === '/app/' : location.pathname.startsWith(path);
    if (isMobile) {
      return `flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`;
    }
    return `flex flex-row items-center gap-md px-sm py-xs rounded font-label-md text-label-md transition-colors ${isActive ? 'bg-surface-container-low text-primary font-bold' : 'hover:bg-surface-container-low text-secondary'}`;
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center font-body-md text-primary">{t('common.loading')}</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen flex flex-col pb-[80px] md:pb-0">
      <header className="w-full top-0 sticky bg-surface-bright border-b border-outline-variant z-40 shrink-0">
        <div className="flex items-center justify-between px-lg h-16 w-full max-w-container-max mx-auto">
          <Link to="/" className="flex items-center gap-sm cursor-pointer hover:opacity-80 transition-opacity">
            <div className="font-headline-md text-headline-md text-primary">Boutika</div>
          </Link>
          <div className="flex items-center gap-sm bg-surface-container-low border border-outline-variant rounded px-sm py-xs cursor-pointer hover:bg-surface-variant transition-colors" data-testid="shop-selector">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">storefront</span>
            <span className="font-label-md text-label-md text-on-surface">
              {currentShop ? currentShop.name : (currentOrganization ? currentOrganization.name : t('dashboard.selectOrganization'))}
            </span>
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">arrow_drop_down</span>
          </div>
          <div className="flex items-center gap-sm">
            <NotificationsDropdown />
            <div 
              className="w-8 h-8 rounded bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md ml-xs cursor-pointer"
              title={t('layout.logout')}
              onClick={logout}
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1 max-w-container-max mx-auto w-full">
        <nav className="hidden md:flex flex-col w-[240px] border-r border-outline-variant bg-surface-bright py-lg px-md gap-sm shrink-0">
          <Link to="/app" className={getNavClass('/app')}>
            <span className="material-symbols-outlined">dashboard</span>
            {t('layout.navDashboard')}
          </Link>
          <Link to="/app/shops" className={getNavClass('/app/shops')}>
            <span className="material-symbols-outlined">storefront</span>
            Boutiques
          </Link>
          <Link to="/app/catalog" className={getNavClass('/app/catalog')}>
            <span className="material-symbols-outlined">category</span>
            Catalogue
          </Link>
          <Link to="/app/inventory" className={getNavClass('/app/inventory')}>
            <span className="material-symbols-outlined">inventory_2</span>
            {t('layout.navInventory')}
          </Link>
          <Link to="/app/pos" className={getNavClass('/app/pos')}>
            <span className="material-symbols-outlined">point_of_sale</span>
            {t('layout.navSales')}
          </Link>
          <Link to="/app/subscription" className={getNavClass('/app/subscription')}>
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>payments</span>
            Abonnement
          </Link>
          <Link to="/app/team" className={getNavClass('/app/team')}>
            <span className="material-symbols-outlined">group</span>
            Équipe
          </Link>
          <Link to="/app/compliance" className={getNavClass('/app/compliance')}>
            <span className="material-symbols-outlined">gavel</span>
            Conformité
          </Link>
          <Link to="#" className={`${getNavClass('#')} mt-auto`}>
            <span className="material-symbols-outlined">person</span>
            {t('layout.navAccount')}
          </Link>
        </nav>
        <main className="flex-1 px-sm md:px-lg py-md md:py-lg w-full flex flex-col gap-lg overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-bright border-t border-outline-variant flex items-center justify-around h-[80px] px-xs pb-safe z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Link to="/app" className={getNavClass('/app', true)}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-medium">{t('layout.navDashboard')}</span>
        </Link>
        <Link to="/app/shops" className={getNavClass('/app/shops', true)}>
          <span className="material-symbols-outlined">storefront</span>
          <span className="text-[10px] font-medium">Boutiques</span>
        </Link>
        <Link to="/app/catalog" className={getNavClass('/app/catalog', true)}>
          <span className="material-symbols-outlined">category</span>
          <span className="text-[10px] font-medium">Catalogue</span>
        </Link>
        <Link to="/app/inventory" className={getNavClass('/app/inventory', true)}>
          <span className="material-symbols-outlined">inventory_2</span>
          <span className="text-[10px] font-medium">{t('layout.navInventory')}</span>
        </Link>
        <Link to="/app/pos" className={getNavClass('/app/pos', true)}>
          <span className="material-symbols-outlined">point_of_sale</span>
          <span className="text-[10px] font-medium">{t('layout.navSales')}</span>
        </Link>
        <Link to="/app/subscription" className={getNavClass('/app/subscription', true)}>
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>payments</span>
          <span className="text-[10px] font-medium">Abonnement</span>
        </Link>
        <Link to="/app/team" className={getNavClass('/app/team', true)}>
          <span className="material-symbols-outlined">group</span>
          <span className="text-[10px] font-medium">Équipe</span>
        </Link>
        <Link to="/app/compliance" className={getNavClass('/app/compliance', true)}>
          <span className="material-symbols-outlined">gavel</span>
          <span className="text-[10px] font-medium">Conformité</span>
        </Link>
        <Link to="#" className={getNavClass('#', true)}>
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-medium">{t('layout.navAccount')}</span>
        </Link>
      </nav>
    </div>
  );
};
