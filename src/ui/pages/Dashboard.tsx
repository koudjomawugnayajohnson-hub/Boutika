import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../i18n';
import { getRepositories } from '../../infrastructure/config';
import { Organization, Shop } from '../../core/types';
import { OnboardingWizard } from '../components/OnboardingWizard';

export const Dashboard: React.FC = () => {
  const { user, currentOrganization, currentShop, selectOrganization, selectShop, role, logout, signInWithPhone } = useAuth();
  const [myOrgs, setMyOrgs] = useState<Organization[]>([]);
  const [myShops, setMyShops] = useState<Shop[]>([]);
  const [revenue, setRevenue] = useState(0);
  const [transactions, setTransactions] = useState(0);
  const [consolidatedRevenue, setConsolidatedRevenue] = useState(0);
  const [consolidatedTransactions, setConsolidatedTransactions] = useState(0);

  // Shop Lock Screen states
  const [shopToUnlock, setShopToUnlock] = useState<string | null>(null);
  const [unlockPin, setUnlockPin] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [unlockLoading, setUnlockLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      const repos = getRepositories();
      
      const orgMembers = await repos.organizationMembers.findByUserId(user.id);
      
      const loadedOrgs = [];
      for (const m of orgMembers) {
        const org = await repos.organizations.findById(m.organizationId);
        if (org) loadedOrgs.push(org);
      }
      
      const allOrgs = await repos.organizations.findAll().catch(() => []);
      const owned = allOrgs.filter((o: any) => o.ownerId === user.id);
      for (const org of owned) {
        if (!loadedOrgs.find(o => o.id === org.id)) {
          loadedOrgs.push(org);
        }
      }
      setMyOrgs(loadedOrgs);
    };
    
    loadData();
  }, [user]);

  useEffect(() => {
    if (myOrgs.length === 1 && !currentOrganization) {
      sessionStorage.removeItem('boutika_consolidated_view');
      selectOrganization(myOrgs[0].id);
    }
  }, [myOrgs, currentOrganization, selectOrganization]);

  const loadShops = async () => {
    if (!currentOrganization || !user) return;
    const repos = getRepositories();
    
    if (role === 'owner' || role === 'admin') {
      const shops = await repos.shops.findAllByOrganization(currentOrganization.id);
      setMyShops(shops);
    } else {
      const staff = await repos.shopStaff.findByUserId(user.id);
      const loadedShops = [];
      for (const st of staff) {
        const s = await repos.shops.findById(currentOrganization.id, st.shopId);
        if (s) loadedShops.push(s);
      }
      setMyShops(loadedShops);
    }
  };

  useEffect(() => {
    loadShops();
  }, [currentOrganization, user, role]);

  useEffect(() => {
    const loadConsolidatedMetrics = async () => {
      if (!currentOrganization) return;
      const repos = getRepositories();
      const startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);

      let totalOrgRev = 0;
      let totalOrgTrans = 0;

      for (const shop of myShops) {
        const sales = await repos.sales.findAllByShop(currentOrganization.id, shop.id);
        const todaysSales = sales.filter(s => new Date(s.createdAt) >= startOfDay);
        totalOrgRev += todaysSales.reduce((sum, sale) => sum + (sale.total ?? 0), 0);
        totalOrgTrans += todaysSales.length;
      }
      setConsolidatedRevenue(totalOrgRev);
      setConsolidatedTransactions(totalOrgTrans);
    };
    if (myShops.length > 0) {
      loadConsolidatedMetrics();
    }
  }, [currentOrganization, myShops]);

  useEffect(() => {
    const loadMetrics = async () => {
      if (!currentOrganization || !currentShop) return;
      const repos = getRepositories();
      
      const startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);
      
      const sales = await repos.sales.findRecent(currentOrganization.id, currentShop.id, 100);
      const todaysSales = sales.filter(s => new Date(s.createdAt) >= startOfDay);
      
      const totalRev = todaysSales.reduce((sum, sale) => sum + (sale.total ?? 0), 0);
      
      setRevenue(totalRev);
      setTransactions(todaysSales.length);
    };
    loadMetrics();
  }, [currentOrganization, currentShop]);

  if (!currentOrganization) {
    return (
      <div className="flex flex-col gap-lg mb-lg">
        <div className="flex justify-between items-center w-full max-w-2xl">
          <h1 className="font-headline-lg text-headline-lg text-on-surface" data-testid="dashboard-title">
            {t('dashboard.overviewTitle')}
          </h1>
        </div>
        {myOrgs.length === 0 ? (
          <div className="w-full mt-8 p-6 text-center border border-outline-variant rounded-xl bg-surface-container-lowest">
            <span className="material-symbols-outlined text-[48px] text-error mb-4">error_outline</span>
            <h2 className="text-xl font-bold text-on-surface mb-2">Aucune entreprise trouvée</h2>
            <p className="text-on-surface-variant mb-6">Votre compte n'est associé à aucune entreprise. Veuillez créer un nouveau compte ou contacter le support.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md w-full max-w-2xl">
            {myOrgs.map(org => (
              <button 
                key={org.id} 
                onClick={() => {
                  sessionStorage.removeItem('boutika_consolidated_view');
                  selectOrganization(org.id);
                }}
                className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl hover:bg-surface-container-low transition-colors text-left flex flex-col gap-xs shadow-sm"
              >
                <span className="font-title-lg text-title-lg text-primary">{org.name}</span>
                <span className="font-body-md text-on-surface-variant">Ouvrir l'organisation</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (myShops.length === 0) {
    return (
      <div className="flex flex-col gap-lg mb-lg">
        <div className="flex justify-between items-center w-full max-w-2xl">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Configuration
          </h1>
        </div>
        <div className="w-full mt-2 pb-24">
          <OnboardingWizard onComplete={loadShops} />
        </div>
      </div>
    );
  }

  const isConsolidated = sessionStorage.getItem('boutika_consolidated_view') === 'true';

  if (shopToUnlock !== null) {
    const handleUnlock = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user?.phone) {
        setUnlockError("Erreur : Impossible de vérifier le PIN (aucun numéro associé).");
        return;
      }
      setUnlockLoading(true);
      setUnlockError('');
      try {
        await signInWithPhone(user.phone, unlockPin);
        if (shopToUnlock === 'consolidated') {
          sessionStorage.setItem('boutika_consolidated_view', 'true');
          await selectShop('');
        } else {
          sessionStorage.removeItem('boutika_consolidated_view');
          await selectShop(shopToUnlock);
        }
        setShopToUnlock(null);
        setUnlockPin('');
      } catch (err) {
        setUnlockError("Code PIN incorrect.");
      } finally {
        setUnlockLoading(false);
      }
    };

    return (
      <div className="flex flex-col gap-lg mb-lg w-full max-w-md mx-auto animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center w-full">
          <button 
            onClick={() => {
              setShopToUnlock(null);
              setUnlockPin('');
              setUnlockError('');
            }}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Retour
          </button>
        </div>
        
        <div className="bg-surface-container-low p-xl rounded-2xl border border-outline-variant text-center shadow-sm mt-8">
          <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">lock</span>
          </div>
          <h2 className="text-headline-sm font-bold text-on-surface mb-2">Sécurité</h2>
          <p className="text-body-md text-on-surface-variant mb-6">
            Veuillez entrer votre code PIN pour accéder à ce tableau de bord.
          </p>
          
          <form onSubmit={handleUnlock} className="flex flex-col gap-4">
            <div>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={unlockPin}
                onChange={e => {
                  setUnlockPin(e.target.value);
                  setUnlockError('');
                }}
                className="w-full text-center text-headline-lg tracking-[0.5em] font-mono px-4 py-3 bg-surface border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="••••"
                required
              />
              {unlockError && (
                <p className="text-error text-sm mt-2 flex items-center justify-center gap-1 animate-in fade-in">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {unlockError}
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={unlockPin.length < 4 || unlockLoading}
              className="w-full bg-primary text-on-primary py-3 rounded-full font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {unlockLoading ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <>
                  Déverrouiller
                  <span className="material-symbols-outlined text-[20px]">lock_open</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (myShops.length > 0 && !currentShop && !isConsolidated) {
    return (
      <div className="flex flex-col gap-lg mb-lg">
        <div className="flex justify-between items-center w-full max-w-2xl">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Sélectionnez une boutique
          </h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md w-full max-w-2xl mt-4">
          {myShops.map(shop => (
            <button 
              key={shop.id} 
              onClick={() => {
                setShopToUnlock(shop.id);
              }}
              className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl hover:bg-surface-container-low transition-colors text-left flex flex-col gap-xs shadow-sm"
            >
              <span className="font-title-lg text-title-lg text-primary">{shop.name}</span>
              <span className="font-body-md text-on-surface-variant">{shop.address || 'Aucune adresse'}</span>
            </button>
          ))}
          <button 
            onClick={() => {
              setShopToUnlock('consolidated');
            }}
            className="bg-primary-container/20 border border-primary/30 p-md rounded-xl hover:bg-primary-container/30 transition-colors text-left flex flex-col gap-xs shadow-sm"
          >
            <span className="font-title-lg text-title-lg text-primary">Toutes les boutiques</span>
            <span className="font-body-md text-on-surface-variant">Vue consolidée</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto w-full pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display-sm text-[24px] font-bold text-on-surface leading-tight mb-1" data-testid="dashboard-title">
          Tableau de bord des<br/>ventes
        </h1>
        <p className="text-on-surface-variant text-sm">
          Consultez les performances de vos boutiques.
        </p>
      </div>

      {/* Selector */}
      <div className="mb-4">
        <div className="relative inline-block w-full">
          <select 
            className="w-full appearance-none border border-outline-variant bg-surface rounded-md py-2 pl-3 pr-10 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            value={currentShop?.id || ''}
            onChange={(e) => {
              if (e.target.value === '') {
                setShopToUnlock('consolidated');
              } else {
                setShopToUnlock(e.target.value);
              }
            }}
          >
            <option value="">Toutes les boutiques (Consolidé)</option>
            {myShops.map(shop => (
              <option key={shop.id} value={shop.id}>{shop.name}</option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
            expand_more
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-surface-container-low rounded-md p-1 mb-6">
        <button className="flex-1 text-center py-1.5 text-xs font-medium rounded shadow-sm bg-surface text-on-surface">Jour</button>
        <button className="flex-1 text-center py-1.5 text-xs font-medium rounded text-on-surface-variant">Semaine</button>
        <button className="flex-1 text-center py-1.5 text-xs font-medium rounded text-on-surface-variant">Mois</button>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        {/* Ventes Totales */}
        <div className="border border-outline-variant rounded-lg p-4 bg-surface flex flex-col relative">
          <div className="absolute top-4 right-4 w-8 h-8 bg-primary-fixed flex items-center justify-center rounded">
            <span className="material-symbols-outlined text-[18px] text-on-primary-fixed">receipt_long</span>
          </div>
          <span className="text-[10px] font-bold tracking-wider text-on-surface-variant uppercase mb-2">Ventes Totales</span>
          <span className="text-[28px] font-bold text-on-surface leading-tight mb-2">
            {currentShop ? revenue.toFixed(0) : consolidatedRevenue.toFixed(0)} FCFA
          </span>
          <div className="flex items-center gap-1 text-[11px] font-medium text-[#10B981]">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span>+8.5%</span>
            <span className="text-on-surface-variant ml-1 font-normal">vs période préc.</span>
          </div>
        </div>

        {/* Volume d'articles */}
        <div className="border border-outline-variant rounded-lg p-4 bg-surface flex flex-col relative">
          <div className="absolute top-4 right-4 w-8 h-8 bg-primary-fixed flex items-center justify-center rounded">
            <span className="material-symbols-outlined text-[18px] text-on-primary-fixed">inventory_2</span>
          </div>
          <span className="text-[10px] font-bold tracking-wider text-on-surface-variant uppercase mb-2">Volume d'articles</span>
          <span className="text-[28px] font-bold text-on-surface leading-tight mb-2">
            {currentShop ? transactions : consolidatedTransactions}
          </span>
          <div className="flex items-center gap-1 text-[11px] font-medium text-[#10B981]">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span>+12.2%</span>
            <span className="text-on-surface-variant ml-1 font-normal">vs période préc.</span>
          </div>
        </div>

        {/* Meilleure Boutique (only if consolidated) */}
        {!currentShop && (
          <div className="border border-outline-variant rounded-lg p-4 bg-surface flex flex-col relative">
            <div className="absolute top-4 right-4">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">storefront</span>
            </div>
            <span className="text-[10px] font-bold tracking-wider text-on-surface-variant uppercase mb-4">Meilleure Boutique</span>
            <span className="text-sm text-primary mb-2">45 200 FCFA de CA</span>
            <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden mb-1">
              <div className="bg-primary h-full" style={{ width: '36%' }}></div>
            </div>
            <span className="text-[10px] text-primary-container">36% du CA global</span>
          </div>
        )}

        {/* Graphique */}
        <div className="border border-outline-variant rounded-lg p-4 bg-surface flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium text-on-surface">Évolution des ventes</span>
            <span className="material-symbols-outlined text-on-surface-variant text-[18px] cursor-pointer">more_vert</span>
          </div>
          <div className="w-full h-[180px] bg-[#F8F9FA] border border-dashed border-outline-variant flex flex-col items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[32px] text-outline mb-2">bar_chart</span>
            <span className="text-xs">Graphique des ventes (Placeholder)</span>
          </div>
        </div>
      </div>

      {/* Top Produits */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-on-surface">Top Produits</h2>
          <span className="text-xs text-on-surface-variant cursor-pointer hover:underline">Tout voir</span>
        </div>
        <div className="flex flex-col gap-2">
          {/* Mock Product 1 */}
          <div className="border border-outline-variant rounded bg-surface p-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-surface-container-low rounded overflow-hidden">
                <img src="https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=100&h=100" alt="Portefeuille" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-on-surface truncate w-32">Portefeuille Cuir...</span>
                <span className="text-[10px] text-on-surface-variant">Maroquinerie</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-medium text-on-surface">145 Ventes</span>
              <span className="text-[10px] text-on-surface-variant">12 325 FCFA</span>
            </div>
          </div>
          {/* Mock Product 2 */}
          <div className="border border-outline-variant rounded bg-surface p-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-surface-container-low rounded overflow-hidden">
                <img src="https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=100&h=100" alt="Mug" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-on-surface truncate w-32">Mug Céramique...</span>
                <span className="text-[10px] text-on-surface-variant">Maison</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-medium text-on-surface">112 Ventes</span>
              <span className="text-[10px] text-on-surface-variant">3 920 FCFA</span>
            </div>
          </div>
          {/* Mock Product 3 */}
          <div className="border border-outline-variant rounded bg-surface p-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-surface-container-low rounded overflow-hidden">
                <img src="https://images.unsplash.com/photo-1599643478514-4a4e09d5630f?auto=format&fit=crop&q=80&w=100&h=100" alt="Collier" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-on-surface truncate w-32">Collier Argent G...</span>
                <span className="text-[10px] text-on-surface-variant">Bijoux</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-medium text-on-surface">89 Ventes</span>
              <span className="text-[10px] text-on-surface-variant">7 565 FCFA</span>
            </div>
          </div>
          {/* Mock Product 4 */}
          <div className="border border-outline-variant rounded bg-surface p-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-surface-container-low rounded overflow-hidden">
                <img src="https://images.unsplash.com/photo-1620619747372-cb150f56a31c?auto=format&fit=crop&q=80&w=100&h=100" alt="Echarpe" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-on-surface truncate w-32">Écharpe Lin Nat...</span>
                <span className="text-[10px] text-on-surface-variant">Accessoires</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-medium text-on-surface">76 Ventes</span>
              <span className="text-[10px] text-on-surface-variant">3 420 FCFA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
