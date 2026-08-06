import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRepositories } from '../../infrastructure/config';
import { Subscription as SubType } from '../../core/types';
import { t } from '../i18n';
import { Link } from 'react-router-dom';

export const Subscription: React.FC = () => {
  const { currentOrganization, user } = useAuth();
  const [subscription, setSubscription] = useState<SubType | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [step, setStep] = useState<'pricing' | 'payment'>('pricing');
  const [selectedTier, setSelectedTier] = useState<'starter' | 'pro' | 'enterprise'>('starter');
  const [paymentMethod, setPaymentMethod] = useState('especes');

  useEffect(() => {
    const loadData = async () => {
      if (!currentOrganization) return;
      const repos = getRepositories();
      const sub = await repos.subscriptions.findByOrganization(currentOrganization.id);
      setSubscription(sub);
      setLoading(false);
    };
    loadData();
  }, [currentOrganization]);

  const handlePlanSelect = (tier: 'starter' | 'pro' | 'enterprise') => {
    setSelectedTier(tier);
    setStep('payment');
  };

  const handleSubscribe = async () => {
    if (!currentOrganization) return;
    const repos = getRepositories();
    const newSub = await repos.subscriptions.create({
      organizationId: currentOrganization.id,
      planTier: selectedTier,
      billingPeriod: billingPeriod,
      status: 'pending_activation',
    });
    setSubscription(newSub);
  };

  const getPrice = (tier: string, period: string) => {
    if (tier === 'starter') return period === 'monthly' ? 10000 : 100000;
    if (tier === 'pro') return period === 'monthly' ? 20000 : 180000;
    return 0; // Enterprise is custom
  };

  if (!currentOrganization) {
    return <div className="p-xl text-center">{t('dashboard.selectOrganization')}</div>;
  }

  if (loading) {
    return <div className="p-xl text-center">{t('common.loading')}</div>;
  }

  // --- PENDING STATE (Image 4) ---
  if (subscription?.status === 'pending_activation') {
    return (
      <div className="max-w-md mx-auto w-full pb-24 pt-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[32px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>pending_actions</span>
        </div>
        <h1 className="font-display-sm text-[24px] font-bold text-on-surface leading-tight mb-3">
          Paiement en attente
        </h1>
        <p className="text-on-surface-variant text-sm px-4 mb-8">
          Votre demande d'abonnement a bien été prise en compte. Votre compte sera activé dès réception de votre paiement en espèces par notre agent.
        </p>

        <div className="w-full max-w-sm border border-outline-variant rounded-lg p-4 bg-surface flex items-center justify-between mb-8">
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wider">Statut de l'abonnement</span>
            <span className="text-sm font-medium text-primary">En cours de vérification</span>
          </div>
          <div className="bg-[#FFF8E1] text-[#F59E0B] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border border-[#FDE68A]">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></span>
            Activation en attente
          </div>
        </div>

        <Link to="/app" className="w-full max-w-sm bg-primary text-on-primary py-3 rounded font-medium text-sm hover:bg-primary-container transition-colors">
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  // --- ACTIVE STATE & BILLING HISTORY (Image 5) ---
  if (subscription?.status === 'active') {
    return (
      <div className="max-w-md mx-auto w-full pb-24 pt-4">
        <div className="mb-6 border-b border-outline-variant pb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="font-display-sm text-[20px] font-bold text-on-surface leading-tight">Mon Abonnement</h1>
            <div className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              Actif
            </div>
          </div>
          <div className="border border-primary bg-primary-fixed-dim bg-opacity-10 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-on-surface">Forfait <strong className="capitalize">{subscription.planTier}</strong></span>
              <span className="text-xs text-on-surface-variant capitalize">{subscription.billingPeriod === 'monthly' ? 'Mensuel' : 'Annuel'}</span>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">
              Fin de validité : <strong className="text-on-surface">{subscription.renewalDate ? new Date(subscription.renewalDate).toLocaleDateString() : 'Non définie'}</strong>
            </p>
            <button className="w-full border border-primary text-primary py-2 rounded text-sm font-medium">
              Changer de forfait
            </button>
          </div>
        </div>

        <div>
          <h2 className="font-display-sm text-[20px] font-bold text-on-surface mb-4">Historique de facturation</h2>
          <div className="flex flex-col gap-3">
            {/* Mock Invoice 1 */}
            <div className="flex justify-between items-center border border-outline-variant rounded p-3 bg-surface">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-on-surface">15 Janvier 2024</span>
                <span className="text-xs text-on-surface-variant">Facture #INV-2024-01</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-on-surface">29 000 FCFA</span>
                <span className="text-[10px] text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">download</span> Télécharger
                </span>
              </div>
            </div>
            {/* Mock Invoice 2 */}
            <div className="flex justify-between items-center border border-outline-variant rounded p-3 bg-surface">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-on-surface">15 Décembre 2023</span>
                <span className="text-xs text-on-surface-variant">Facture #INV-2023-12</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-on-surface">29 000 FCFA</span>
                <span className="text-[10px] text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">download</span> Télécharger
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- PAYMENT METHOD (Image 3) ---
  if (step === 'payment') {
    const total = getPrice(selectedTier, billingPeriod);
    return (
      <div className="max-w-md mx-auto w-full pb-24 pt-4">
        <button onClick={() => setStep('pricing')} className="flex items-center gap-1 text-on-surface-variant text-sm mb-4 hover:text-on-surface">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span> Retour aux forfaits
        </button>
        <div className="mb-6">
          <h1 className="font-display-sm text-[24px] font-bold text-on-surface leading-tight mb-1">
            Méthode de paiement
          </h1>
          <p className="text-on-surface-variant text-sm">
            Choisissez comment vous souhaitez régler votre abonnement.
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors border-primary bg-primary-fixed-dim bg-opacity-10`}>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-surface-container-high text-on-surface flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                </div>
                <span className="text-sm font-medium text-on-surface">Paiement manuel (Espèces)</span>
              </div>
              <span className="text-xs text-on-surface-variant ml-11">Un agent vous contactera pour récupérer le paiement et activer votre compte.</span>
            </div>
            <input type="radio" name="paymentMethod" value="especes" checked={true} readOnly className="w-4 h-4 text-primary" />
          </label>
        </div>

        <div className="border-t border-outline-variant pt-4 mb-8 flex justify-between items-center">
          <span className="text-sm text-on-surface-variant font-medium">Total à payer</span>
          <span className="text-xl font-bold text-on-surface">{total} FCFA</span>
        </div>

        <button onClick={handleSubscribe} className="w-full bg-primary text-on-primary py-3 rounded font-medium text-sm hover:bg-primary-container transition-colors">
          Continuer
        </button>
      </div>
    );
  }

  // --- PRICING (Image 2) ---
  return (
    <div className="max-w-md mx-auto w-full pb-24 pt-4">
      <div className="mb-6 text-center">
        <h1 className="font-display-sm text-[24px] font-bold text-on-surface leading-tight mb-1">
          Choisissez votre forfait
        </h1>
        <p className="text-on-surface-variant text-sm">
          Des prix simples, sans surprise.
        </p>
      </div>

      <div className="flex justify-center items-center bg-surface-container-low p-1 rounded-full w-fit mx-auto mb-8">
        <button 
          onClick={() => setBillingPeriod('monthly')}
          className={`px-6 py-1.5 rounded-full text-sm font-medium transition-colors ${billingPeriod === 'monthly' ? 'bg-surface shadow-sm text-on-surface' : 'text-on-surface-variant'}`}
        >
          Mensuel
        </button>
        <button 
          onClick={() => setBillingPeriod('annual')}
          className={`px-6 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${billingPeriod === 'annual' ? 'bg-surface shadow-sm text-on-surface' : 'text-on-surface-variant'}`}
        >
          Annuel
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {/* Starter */}
        <div className="border border-outline-variant rounded-xl p-5 bg-surface relative">
          <h3 className="font-bold text-lg text-on-surface mb-1">Starter</h3>
          <div className="flex items-end gap-1 mb-4">
            <span className="font-display-md text-3xl font-bold text-on-surface">{billingPeriod === 'monthly' ? '10 000' : '100 000'}</span>
            <span className="font-display-md text-3xl font-bold text-on-surface">FCFA</span>
            <span className="text-on-surface-variant text-sm mb-1">/{billingPeriod === 'monthly' ? 'mois' : 'an'}</span>
          </div>
          <button 
            onClick={() => handlePlanSelect('starter')}
            className="w-full border border-outline-variant text-on-surface font-medium py-2 rounded mb-4 hover:bg-surface-container-low transition-colors text-sm"
          >
            Commencer gratuitement
          </button>
          <ul className="flex flex-col gap-2 text-sm text-on-surface-variant">
            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">check</span> 1 boutique max</li>
            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">check</span> Rapports de base</li>
            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">check</span> Support par email</li>
          </ul>
        </div>

        {/* Pro */}
        <div className="border-2 border-primary rounded-xl p-5 bg-surface relative shadow-sm">
          <div className="absolute top-0 right-4 transform -translate-y-1/2 bg-primary text-on-primary text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
            Populaire
          </div>
          <h3 className="font-bold text-lg text-on-surface mb-1">Pro</h3>
          <div className="flex items-end gap-1 mb-4">
            <span className="font-display-md text-3xl font-bold text-on-surface">{billingPeriod === 'monthly' ? '20 000' : '180 000'}</span>
            <span className="font-display-md text-3xl font-bold text-on-surface">FCFA</span>
            <span className="text-on-surface-variant text-sm mb-1">/{billingPeriod === 'monthly' ? 'mois' : 'an'}</span>
          </div>
          <button 
            onClick={() => handlePlanSelect('pro')}
            data-testid="subscription-tier-pro"
            className="w-full bg-primary text-on-primary font-medium py-2 rounded mb-4 hover:bg-primary-container transition-colors text-sm"
          >
            S'abonner
          </button>
          <ul className="flex flex-col gap-2 text-sm text-on-surface-variant">
            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">check</span> Jusqu'à 3 boutiques</li>
            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">check</span> Rapports avancés</li>
            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">check</span> Support prioritaire 24/7</li>
          </ul>
        </div>

        {/* Enterprise */}
        <div className="border border-outline-variant rounded-xl p-5 bg-surface relative">
          <h3 className="font-bold text-lg text-on-surface mb-1">Enterprise</h3>
          <div className="flex items-end gap-1 mb-4 h-[36px]">
            <span className="font-display-md text-3xl font-bold text-on-surface">Sur mesure</span>
          </div>
          <button 
            onClick={() => handlePlanSelect('enterprise')}
            className="w-full border border-outline-variant text-on-surface font-medium py-2 rounded mb-4 hover:bg-surface-container-low transition-colors text-sm"
          >
            Nous contacter
          </button>
          <ul className="flex flex-col gap-2 text-sm text-on-surface-variant">
            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">check</span> Boutiques illimitées</li>
            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">check</span> API complète</li>
            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">check</span> Accompagnement dédié</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
