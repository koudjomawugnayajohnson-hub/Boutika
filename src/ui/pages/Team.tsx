import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRepositories } from '../../infrastructure/config';
import { Shop } from '../../core/types';

export const Team: React.FC = () => {
  const { currentOrganization } = useAuth();
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  
  // Minimal state for the mock
  const [shops, setShops] = useState<Shop[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    if (currentOrganization) {
      loadData();
    }
  }, [currentOrganization]);

  const loadData = async () => {
    if (!currentOrganization) return;
    const repos = getRepositories();
    const fetchedShops = await repos.shops.findAllByOrganization(currentOrganization.id);
    setShops(fetchedShops);

    const fetchedMembers = await repos.organizationMembers.findByOrganization(currentOrganization.id);
    // Join with user data
    const memberData = await Promise.all(fetchedMembers.map(async m => {
      const u = await repos.users.findById(m.userId);
      return { ...m, user: u };
    }));
    setMembers(memberData);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-lg">
        <div>
          <h1 className="font-display-sm text-display-sm text-primary">Équipe</h1>
          <p className="text-on-surface-variant font-body-md">Gérez les membres de votre organisation et leurs accès.</p>
        </div>
        <button 
          onClick={() => setInviteModalOpen(true)}
          className="bg-primary text-on-primary px-4 py-2 rounded font-label-md hover:bg-primary-container transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Inviter un membre
        </button>
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-lowest text-on-surface-variant font-label-md uppercase">
              <th className="p-4 font-medium">Utilisateur</th>
              <th className="p-4 font-medium">Rôle</th>
              <th className="p-4 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id} className="border-b border-outline-variant last:border-0 hover:bg-surface-container-low transition-colors">
                <td className="p-4">
                  <div className="font-medium text-on-surface">{m.user?.name || 'Utilisateur'}</div>
                  <div className="text-sm text-on-surface-variant">{m.user?.phone}</div>
                </td>
                <td className="p-4 capitalize text-on-surface">{m.role}</td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-fixed text-on-primary-fixed">
                    Actif
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isInviteModalOpen && (
        <InviteModal 
          shops={shops} 
          onClose={() => setInviteModalOpen(false)} 
          onSubmit={() => {
            setInviteModalOpen(false);
            // Reload if needed
          }} 
        />
      )}
    </div>
  );
};

const InviteModal: React.FC<{ shops: Shop[], onClose: () => void, onSubmit: () => void }> = ({ shops, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+228');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'manager' | 'vendeur'>('manager');
  const [selectedShops, setSelectedShops] = useState<string[]>([]);

  const handleToggleShop = (id: string) => {
    setSelectedShops(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedShops.length === shops.length) setSelectedShops([]);
    else setSelectedShops(shops.map(s => s.id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-surface rounded-xl shadow-lg w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between p-md border-b border-outline-variant">
          <div className="flex items-center gap-md">
            <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
            </div>
            <div>
              <h2 className="font-title-lg text-title-lg text-on-surface font-semibold">Inviter un collaborateur</h2>
              <p className="text-on-surface-variant text-sm mt-1">Ajoutez un nouveau membre à votre équipe de gestion.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-md overflow-y-auto flex flex-col gap-6">
          
          {/* Nom et Numéro */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-label-md uppercase tracking-wider text-on-surface font-medium text-xs">Nom</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">person</span>
                <input 
                  type="text" 
                  placeholder="Jean Dupont" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-outline-variant rounded p-2 pl-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-label-md uppercase tracking-wider text-on-surface font-medium text-xs">Numéro de téléphone</label>
              <div className="flex border border-outline-variant rounded focus-within:border-primary focus-within:ring-1 focus-within:ring-primary overflow-hidden">
                <div className="flex items-center bg-surface-container-lowest border-r border-outline-variant px-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px] mr-1">phone</span>
                  <select 
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-transparent border-0 text-sm text-on-surface focus:ring-0 cursor-pointer outline-none"
                  >
                    <option value="+228">🇹🇬 +228</option>
                    <option value="+226">🇧🇫 +226</option>
                    <option value="+223">🇲🇱 +223</option>
                  </select>
                </div>
                <input 
                  type="tel" 
                  placeholder="90 00 00 00" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 focus:outline-none text-on-surface bg-transparent"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-md uppercase tracking-wider text-on-surface font-medium text-xs">Mot de passe</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">lock</span>
                <input 
                  type="password" 
                  placeholder="Définir un mot de passe" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-outline-variant rounded p-2 pl-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
                />
              </div>
            </div>
          </div>

          {/* Role */}
          <div className="flex flex-col gap-2">
            <label className="font-label-md uppercase tracking-wider text-on-surface font-medium text-xs">Rôle & Permissions</label>
            <div className="flex flex-col gap-3">
              {/* Manager */}
              <label className={`flex items-center justify-between p-3 border rounded cursor-pointer transition-colors ${role === 'manager' ? 'border-primary bg-primary-fixed-dim bg-opacity-20' : 'border-outline-variant'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined">manage_accounts</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-on-surface">Manager de boutique</span>
                    <span className="text-sm text-on-surface-variant">Gestion complète des stocks et des ventes.</span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${role === 'manager' ? 'border-primary' : 'border-outline-variant'}`}>
                  {role === 'manager' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                {/* visually hidden radio input to ensure accessibility if needed, omitted for mock brevity */}
                <input type="radio" className="hidden" checked={role === 'manager'} onChange={() => setRole('manager')} />
              </label>

              {/* Vendeur */}
              <label className={`flex items-center justify-between p-3 border rounded cursor-pointer transition-colors ${role === 'vendeur' ? 'border-primary bg-primary-fixed-dim bg-opacity-20' : 'border-outline-variant'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined">point_of_sale</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-on-surface">Vendeur</span>
                    <span className="text-sm text-on-surface-variant">Accès limité au point de vente et consultation des stocks.</span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${role === 'vendeur' ? 'border-primary' : 'border-outline-variant'}`}>
                  {role === 'vendeur' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <input type="radio" className="hidden" checked={role === 'vendeur'} onChange={() => setRole('vendeur')} />
              </label>
            </div>
          </div>

          {/* Shops */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-label-md uppercase tracking-wider text-on-surface font-medium text-xs">Boutiques Assignées</label>
              <button onClick={handleSelectAll} className="text-primary text-sm font-medium hover:underline">
                Tout sélectionner
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto">
              {shops.map(shop => (
                <label key={shop.id} className="flex items-center gap-3 p-3 border border-outline-variant rounded cursor-pointer hover:bg-surface-container-low transition-colors">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedShops.includes(shop.id) ? 'bg-primary border-primary text-on-primary' : 'border-outline-variant'}`}>
                    {selectedShops.includes(shop.id) && <span className="material-symbols-outlined text-[14px]">check</span>}
                  </div>
                  <input type="checkbox" className="hidden" checked={selectedShops.includes(shop.id)} onChange={() => handleToggleShop(shop.id)} />
                  <div className="flex flex-col">
                    <span className="font-medium text-on-surface">{shop.name}</span>
                    <span className="text-xs text-on-surface-variant">{shop.address || 'Aucune adresse'}</span>
                  </div>
                </label>
              ))}
              {shops.length === 0 && (
                <div className="text-sm text-on-surface-variant p-2">Aucune boutique disponible.</div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-md border-t border-outline-variant flex items-center justify-between gap-4 bg-surface-container-lowest">
          <button 
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-outline-variant text-on-surface rounded font-medium hover:bg-surface-container-low transition-colors text-sm"
          >
            ANNULER
          </button>
          <button 
            onClick={onSubmit}
            className="flex-1 py-2 px-4 bg-primary text-on-primary rounded font-medium hover:bg-primary-container transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            ENREGISTRER
          </button>
        </div>

      </div>
    </div>
  );
};
