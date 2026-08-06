import React, { useEffect, useState } from 'react';
import { getRepositories } from '../../infrastructure/config';
import { Organization, PlanTier, Subscription, SubscriptionStatus, BillingPeriod, AuditLog } from '../../core/types';
import { t } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

type OrgWithSub = {
  org: Organization;
  sub: Subscription | null;
};

export const PlatformAdmin: React.FC = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState<OrgWithSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'audit'>('all');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  const [selectedOrg, setSelectedOrg] = useState<OrgWithSub | null>(null);

  const loadData = async () => {
    setLoading(true);
    const repos = getRepositories();
    const allOrgs = await repos.organizations.findAll();
    const allSubs = await repos.subscriptions.findAll();

    const merged = allOrgs.map(org => {
      const sub = allSubs.find(s => s.organizationId === org.id) || null;
      return { org, sub };
    });
    setData(merged);

    if (repos.auditLogs.findAll) {
      const logs = await repos.auditLogs.findAll();
      setAuditLogs(logs);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeCount = data.filter(d => d.sub?.status === 'active').length;
  const pendingCount = data.filter(d => d.sub?.status === 'pending_activation').length;
  
  // Rough MRR estimate
  const mrr = data.reduce((acc, d) => {
    if (d.sub?.status !== 'active') return acc;
    if (d.sub.planTier === 'pro') return acc + (d.sub.billingPeriod === 'monthly' ? 20000 : 15000); // 180000/12 = 15000
    if (d.sub.planTier === 'starter') return acc + (d.sub.billingPeriod === 'monthly' ? 10000 : 8333); // 100000/12 = 8333
    return acc;
  }, 0);

  const filteredData = data.filter(d => {
    if (filter === 'pending') return d.sub?.status === 'pending_activation';
    if (filter === 'active') return d.sub?.status === 'active';
    return true;
  });

  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      <header className="w-full top-0 sticky bg-surface-bright border-b border-outline-variant z-40 shrink-0">
        <div className="flex items-center justify-between px-lg h-16 w-full max-w-container-max mx-auto">
          <div className="flex items-center gap-sm">
            <div className="font-headline-md text-headline-md text-primary">{t('platformAdmin.title')}</div>
          </div>
          <div className="flex items-center gap-sm">
            <span className="font-label-md text-on-surface-variant mr-4">{user?.phone} (Admin)</span>
            <div 
              className="w-8 h-8 rounded bg-primary-container text-on-primary flex items-center justify-center cursor-pointer"
              title={t('layout.logout')}
              onClick={logout}
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-sm md:px-lg py-md md:py-lg max-w-container-max mx-auto w-full flex flex-col gap-lg">
        {loading ? (
          <div className="text-center p-xl">{t('common.loading')}</div>
        ) : (
          <>
            <div className="flex flex-col gap-1 mb-4">
              <h1 className="font-display-lg text-display-lg font-bold text-on-surface">Tableau de bord</h1>
              <p className="font-body-md text-on-surface-variant">Aperçu des performances globales et de l'état du système.</p>
            </div>
            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-sm mb-6">
              {/* MRR GLOBAL */}
              <div className="bg-surface border border-outline-variant p-md rounded-xl flex flex-col relative overflow-hidden shadow-sm">
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">payments</span>
                </div>
                <span className="text-[10px] font-bold tracking-wider text-on-surface-variant uppercase mb-2">MRR GLOBAL</span>
                <span className="text-[28px] font-bold text-on-surface leading-tight mb-2">{Math.round(mrr).toLocaleString('fr-FR')} FCFA</span>
                <div className="flex items-center gap-1 text-[11px] font-medium text-[#10B981]">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  <span>+12.4% ce mois</span>
                </div>
              </div>
              
              {/* ARR PROJETÉ */}
              <div className="bg-surface border border-outline-variant p-md rounded-xl flex flex-col relative overflow-hidden shadow-sm">
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">bar_chart</span>
                </div>
                <span className="text-[10px] font-bold tracking-wider text-on-surface-variant uppercase mb-2">ARR PROJETÉ</span>
                <span className="text-[28px] font-bold text-on-surface leading-tight mb-2">{(Math.round(mrr) * 12).toLocaleString('fr-FR')} FCFA</span>
                <div className="flex items-center gap-1 text-[11px] font-medium text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  <span>Basé sur le MRR actuel</span>
                </div>
              </div>

              {/* NOUVEAUX COMPTES */}
              <div className="bg-surface border border-outline-variant p-md rounded-xl flex flex-col relative overflow-hidden shadow-sm">
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                </div>
                <span className="text-[10px] font-bold tracking-wider text-on-surface-variant uppercase mb-2">NOUVEAUX COMPTES</span>
                <span className="text-[28px] font-bold text-on-surface leading-tight mb-2">{activeCount + pendingCount}</span>
                <div className="flex items-center gap-1 text-[11px] font-medium text-[#10B981]">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  <span>+45 vs mois dernier</span>
                </div>
              </div>
            </div>

            {/* List Section */}
            <div className="flex flex-col gap-sm">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-title-lg text-title-lg text-on-surface font-semibold">Organisations</h2>
                <div className="flex gap-2">
                  <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded text-xs font-medium ${filter==='all' ? 'bg-primary text-on-primary' : 'bg-surface-container border border-outline-variant text-on-surface'}`}>Tous</button>
                  <button onClick={() => setFilter('pending')} className={`px-3 py-1 rounded text-xs font-medium ${filter==='pending' ? 'bg-primary text-on-primary' : 'bg-surface-container border border-outline-variant text-on-surface'}`}>En attente</button>
                  <button onClick={() => setFilter('active')} className={`px-3 py-1 rounded text-xs font-medium ${filter==='active' ? 'bg-primary text-on-primary' : 'bg-surface-container border border-outline-variant text-on-surface'}`}>Actif</button>
                  <button onClick={() => setFilter('audit')} className={`px-3 py-1 rounded text-xs font-medium ${filter==='audit' ? 'bg-primary text-on-primary' : 'bg-surface-container border border-outline-variant text-on-surface'}`}>Audit Log</button>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                {filter === 'audit' ? (
                  <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm text-on-surface">
                      <thead className="bg-surface-container text-on-surface-variant font-medium">
                        <tr>
                          <th className="px-4 py-3 border-b border-outline-variant">Date</th>
                          <th className="px-4 py-3 border-b border-outline-variant">Action</th>
                          <th className="px-4 py-3 border-b border-outline-variant">Utilisateur</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.length === 0 ? (
                          <tr><td colSpan={3} className="px-4 py-6 text-center text-on-surface-variant">Aucun log trouvé.</td></tr>
                        ) : (
                          auditLogs.map(log => (
                            <tr key={log.id} className="border-b border-outline-variant last:border-0 hover:bg-surface-container-low transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap">{new Date(log.createdAt!).toLocaleString()}</td>
                              <td className="px-4 py-3">{log.action}</td>
                              <td className="px-4 py-3">{log.userId}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : filteredData.length === 0 ? (
                  <div className="text-center p-6 text-on-surface-variant text-sm border border-outline-variant rounded-xl bg-surface">{t('platformAdmin.noPending')}</div>
                ) : (
                  filteredData.map(({ org, sub }) => (
                    <div key={org.id} className="bg-surface border border-outline-variant rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:border-primary/30 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="font-bold text-on-surface">{org.name}</span>
                          <span className="text-xs text-on-surface-variant">ID: {org.ownerId}</span>
                        </div>
                        {sub?.status === 'active' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E6F4EA] text-[#137333] uppercase tracking-wider">Actif</span>
                        ) : sub?.status === 'pending_activation' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF7E0] text-[#B06000] uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B06000] animate-pulse"></span>
                            En attente
                          </span>
                        ) : sub?.status === 'canceled' || sub?.status === 'past_due' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-error-container text-on-error-container uppercase tracking-wider">Suspendu/Rejeté</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-variant text-on-surface-variant uppercase tracking-wider">Aucun</span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm border-t border-outline-variant pt-3 mt-1">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">Forfait</span>
                          <span className="font-medium text-on-surface capitalize">{sub?.planTier || org.planTier}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">Fin de validité</span>
                          <span className="font-medium text-on-surface">{sub?.renewalDate ? new Date(sub.renewalDate).toLocaleDateString() : '-'}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => setSelectedOrg({ org, sub })}
                        className="w-full mt-2 py-2 bg-surface-container border border-outline-variant text-on-surface rounded-lg text-sm font-medium hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[16px]">settings</span>
                        Gérer l'organisation
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {selectedOrg && (
        <SubscriptionManagementModal 
          orgWithSub={selectedOrg}
          onClose={() => setSelectedOrg(null)}
          onRefresh={() => {
            setSelectedOrg(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};

const SubscriptionManagementModal: React.FC<{
  orgWithSub: OrgWithSub;
  onClose: () => void;
  onRefresh: () => void;
}> = ({ orgWithSub, onClose, onRefresh }) => {
  const { org, sub } = orgWithSub;
  const repos = getRepositories();
  const { adminUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(sub?.planTier || org.planTier);

  // Extend by +1 month or +1 year
  const handleAddTime = async (type: 'month' | 'year') => {
    if (!window.confirm(`Confirmer l'ajout de 1 ${type === 'month' ? 'mois' : 'an'} (paiement reçu) ?`)) return;
    setLoading(true);
    try {
      const baseDate = sub?.renewalDate ? new Date(sub.renewalDate) : new Date();
      // If baseDate is in the past, maybe use today as starting point
      const now = new Date();
      const startDate = baseDate < now ? now : baseDate;

      if (type === 'month') startDate.setMonth(startDate.getMonth() + 1);
      if (type === 'year') startDate.setFullYear(startDate.getFullYear() + 1);

      if (sub) {
        await repos.subscriptions.update(org.id, sub.id, {
          status: 'active',
          renewalDate: startDate.toISOString()
        });
      } else {
        await repos.subscriptions.create({
          organizationId: org.id,
          planTier: selectedPlan,
          billingPeriod: type === 'month' ? 'monthly' : 'annual',
          status: 'active',
          paymentMethod: 'cash',
          renewalDate: startDate.toISOString(),
          activatedAt: now.toISOString()
        });
      }

      await repos.auditLogs.create({
        organizationId: org.id,
        userId: adminUser?.userId || 'system',
        action: `ADMIN_ACTIVATE_SUBSCRIPTION: +1 ${type}`,
        details: { plan: selectedPlan }
      });

      onRefresh();
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'enregistrement du paiement.");
    } finally {
      setLoading(false);
    }
  };

  // Suspend
  const handleSuspend = async () => {
    if (!sub) return;
    if (!window.confirm("Voulez-vous vraiment suspendre l'accès de cette organisation ?")) return;
    setLoading(true);
    try {
      await repos.subscriptions.update(org.id, sub.id, {
        status: 'past_due'
      });
      await repos.auditLogs.create({
        organizationId: org.id,
        userId: adminUser?.userId || 'system',
        action: `ADMIN_SUSPEND_SUBSCRIPTION`,
        details: {}
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Reject
  const handleReject = async () => {
    if (!sub) return;
    const note = window.prompt("Raison du rejet (cette note sera enregistrée) :");
    if (note === null) return;
    setLoading(true);
    try {
      await repos.subscriptions.update(org.id, sub.id, {
        status: 'canceled',
        // In a real system, we'd add rejectionNote to the DB schema. 
        // We'll store it in the audit log for now.
      });
      await repos.auditLogs.create({
        organizationId: org.id,
        userId: adminUser?.userId || 'system',
        action: `ADMIN_REJECT_SUBSCRIPTION`,
        details: { note }
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Change Plan
  const handleChangePlan = async () => {
    if (selectedPlan === (sub?.planTier || org.planTier)) {
      alert("Ce forfait est déjà actif.");
      return;
    }
    setLoading(true);
    try {
      await repos.organizations.update(org.id, { planTier: selectedPlan });
      if (sub) {
        await repos.subscriptions.update(org.id, sub.id, { planTier: selectedPlan });
      }
      await repos.auditLogs.create({
        organizationId: org.id,
        userId: adminUser?.userId || 'system',
        action: `ADMIN_CHANGE_PLAN`,
        details: { newPlan: selectedPlan }
      });
      alert("Forfait modifié avec succès.");
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Delete Organization
  const handleDeleteOrg = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer DÉFINITIVEMENT cette organisation ? Cette action est irréversible.")) return;
    setLoading(true);
    try {
      await repos.organizations.delete(org.id);
      await repos.auditLogs.create({
        organizationId: org.id,
        userId: adminUser?.userId || 'system',
        action: `ADMIN_DELETE_ORGANIZATION`,
        details: {}
      });
      alert("Organisation supprimée.");
      onRefresh();
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la suppression.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-surface rounded-xl shadow-lg w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-md border-b border-outline-variant">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-[24px]">manage_accounts</span>
            <h2 className="font-title-lg text-title-lg font-semibold text-on-surface">Gestion : {org.name}</h2>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-md flex flex-col gap-6 overflow-y-auto">
          {/* Status info */}
          <div className="bg-surface-container-low rounded p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant">Statut actuel :</span>
              <span className="font-medium text-on-surface capitalize">{sub?.status || 'Aucun abonnement'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant">Date de fin :</span>
              <span className="font-medium text-on-surface">
                {sub?.renewalDate ? new Date(sub.renewalDate).toLocaleDateString() : 'Non définie'}
              </span>
            </div>
          </div>

          {/* Section: Prolonger / Activer */}
          <div className="flex flex-col gap-2">
            <h3 className="font-label-md text-xs uppercase text-on-surface-variant tracking-wider">Enregistrer un paiement manuel</h3>
            <div className="flex gap-2">
              <button 
                disabled={loading}
                onClick={() => handleAddTime('month')}
                className="flex-1 bg-primary text-on-primary rounded py-2 text-sm font-medium hover:bg-primary-container transition-colors disabled:opacity-50"
              >
                + 1 Mois
              </button>
              <button 
                disabled={loading}
                onClick={() => handleAddTime('year')}
                className="flex-1 bg-primary text-on-primary rounded py-2 text-sm font-medium hover:bg-primary-container transition-colors disabled:opacity-50"
              >
                + 1 An
              </button>
            </div>
            {sub?.status === 'pending_activation' && (
              <div className="mt-2 flex flex-col gap-2">
                <p className="text-xs text-primary">Ceci activera l'abonnement en attente.</p>
                <button 
                  disabled={loading}
                  onClick={handleReject}
                  className="w-full bg-surface-variant text-on-surface-variant rounded py-2 text-sm font-medium hover:bg-error-container hover:text-error transition-colors disabled:opacity-50"
                >
                  Rejeter la demande
                </button>
              </div>
            )}
          </div>

          {/* Section: Modifier Forfait */}
          <div className="flex flex-col gap-2 border-t border-outline-variant pt-4">
            <h3 className="font-label-md text-xs uppercase text-on-surface-variant tracking-wider">Modifier le forfait</h3>
            <div className="flex gap-2">
              <select 
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value as PlanTier)}
                className="flex-1 border border-outline-variant rounded p-2 text-sm bg-surface text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
              <button 
                disabled={loading}
                onClick={handleChangePlan}
                className="px-4 bg-surface-container border border-outline-variant text-on-surface rounded text-sm hover:bg-surface-container-high transition-colors disabled:opacity-50"
              >
                Appliquer
              </button>
            </div>
          </div>

          {/* Section: Zone de danger */}
          <div className="flex flex-col gap-2 border-t border-outline-variant pt-4">
            <h3 className="font-label-md text-xs uppercase text-on-surface-variant tracking-wider">Zone de danger</h3>
            
            {sub && (sub.status === 'active' || sub.status === 'pending_activation') && (
              <button 
                disabled={loading}
                onClick={handleSuspend}
                className="w-full border border-error text-error rounded py-2 text-sm font-medium hover:bg-error-container transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mb-2"
              >
                <span className="material-symbols-outlined text-[18px]">block</span>
                Suspendre l'abonnement
              </button>
            )}

            <button 
              disabled={loading}
              onClick={handleDeleteOrg}
              className="w-full bg-error text-on-error rounded py-2 text-sm font-medium hover:bg-error-container hover:text-on-error-container transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">delete_forever</span>
              Supprimer l'organisation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
