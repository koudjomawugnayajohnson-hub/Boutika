import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRepositories } from '../../infrastructure/config';
import { t } from '../i18n';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const { user, currentOrganization, selectOrganization, selectShop } = useAuth();
  const [step, setStep] = useState<'shop' | 'success'>('shop');
  
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopPhone, setShopPhone] = useState('');

  const [loading, setLoading] = useState(false);



  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentOrganization || !shopName.trim()) return;
    setLoading(true);
    try {
      const repos = getRepositories();
      const newShop = await repos.shops.create({
        organizationId: currentOrganization.id,
        name: shopName.trim(),
        address: shopAddress.trim(),
        phone: shopPhone.trim()
      });

      // Audit Log for Lot D
      await repos.auditLogs.create({
        organizationId: currentOrganization.id,
        userId: user.id,
        action: 'shop_created',
        entityType: 'shop',
        entityId: newShop.id,
      });

      await repos.shopStaff.create({
        shopId: newShop.id,
        userId: user.id
      });

      await selectShop(newShop.id);
      setStep('success');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-surface border border-outline-variant rounded-xl p-6 shadow-sm mt-8">


      {step === 'shop' && (
        <form onSubmit={handleCreateShop} className="flex flex-col gap-4">
          <div className="text-center mb-2">
            <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[24px]">store</span>
            </div>
            <h2 className="text-title-lg font-bold text-on-surface">Votre premier point de vente</h2>
            <p className="text-body-md text-on-surface-variant mt-1">Où se trouve votre boutique physique ?</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-label-md font-medium text-on-surface">Nom de la boutique</label>
            <input 
              type="text" 
              required
              value={shopName}
              onChange={e => setShopName(e.target.value)}
              placeholder="Ex: Boutique Centre-Ville"
              className="px-3 py-2 bg-surface border border-outline-variant rounded-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-label-md font-medium text-on-surface">Adresse (optionnel)</label>
            <input 
              type="text" 
              value={shopAddress}
              onChange={e => setShopAddress(e.target.value)}
              placeholder="Ex: 123 Rue du Commerce, Dakar"
              className="px-3 py-2 bg-surface border border-outline-variant rounded-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-label-md font-medium text-on-surface">Téléphone (optionnel)</label>
            <input 
              type="tel" 
              value={shopPhone}
              onChange={e => setShopPhone(e.target.value)}
              placeholder="Ex: +221 77 000 00 00"
              className="px-3 py-2 bg-surface border border-outline-variant rounded-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !shopName.trim()}
            className="w-full bg-primary text-on-primary py-2.5 rounded-full font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Création...' : 'Créer ma boutique'}
          </button>
        </form>
      )}

      {step === 'success' && (
        <div className="flex flex-col items-center justify-center gap-4 text-center py-6 animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-[32px]">check_circle</span>
          </div>
          <h2 className="text-headline-sm font-bold text-on-surface">Félicitations ! 🎉</h2>
          <p className="text-body-lg text-on-surface-variant max-w-[280px]">
            Votre boutique <strong>{shopName}</strong> a été créée avec succès.
          </p>
          <p className="text-body-md text-outline">
            Bienvenue sur Boutika, vous êtes maintenant prêt(e) à gérer votre commerce avec élégance.
          </p>
          <button 
            onClick={onComplete}
            className="w-full bg-primary text-on-primary py-3 rounded-full font-bold hover:bg-primary/90 transition-all mt-4 flex items-center justify-center gap-2"
          >
            Accéder à mon tableau de bord
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
};
