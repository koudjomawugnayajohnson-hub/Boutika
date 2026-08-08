import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../../infrastructure/supabase/client';
import { Plus, Settings, Store, MapPin, X } from 'lucide-react';

interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string;
  created_at: string;
}

export const Shops: React.FC = () => {
  const { currentOrganization } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [newShopAddress, setNewShopAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (currentOrganization?.id) {
      fetchShops();
    }
  }, [currentOrganization?.id]);

  const fetchShops = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShops(data || []);
    } catch (error: any) {
      showToast(error.message || 'Erreur lors de la récupération des boutiques', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName.trim()) return;

    setIsSubmitting(true);
    try {
      // TODO: Implémenter la vérification du quota selon le forfait (Starter: 1, Pro: 3)

      const { data, error } = await supabase
        .from('shops')
        .insert([{
          organization_id: currentOrganization!.id,
          name: newShopName.trim(),
          address: newShopAddress.trim() || null
        }])
        .select()
        .single();

      if (error) throw error;

      setShops([data, ...shops]);
      setIsModalOpen(false);
      setNewShopName('');
      setNewShopAddress('');
      showToast('Boutique créée avec succès', 'success');
    } catch (error: any) {
      showToast(error.message || 'Erreur lors de la création de la boutique', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        } transition-all duration-300 flex items-center gap-2`}>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Mes Boutiques</h1>
          <p className="text-slate-500 text-sm mt-1">Gérez vos différents points de vente</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Ajouter une boutique
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : shops.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Store className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Aucune boutique</h3>
          <p className="text-slate-500 max-w-sm mb-6 text-sm">
            Vous n'avez pas encore de point de vente. Créez votre première boutique pour commencer à gérer votre activité.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Créer ma première boutique
          </button>
        </div>
      ) : (
        /* Bento Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <div key={shop.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 shrink-0">
                  <Store className="w-6 h-6 text-slate-700" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 mb-1 truncate">{shop.name}</h3>
                <div className="flex items-start gap-1.5 text-slate-500 mt-2">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="text-sm line-clamp-2">{shop.address || 'Aucune adresse renseignée'}</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link to={`/app/shops/${shop.id}`} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium transition-colors">
                  <Settings className="w-4 h-4" />
                  Gérer
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Ajout Boutique */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Ajouter une boutique</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateShop} className="flex flex-col p-6 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="shopName" className="text-sm font-medium text-slate-700">
                  Nom de la boutique <span className="text-red-500">*</span>
                </label>
                <input
                  id="shopName"
                  type="text"
                  required
                  value={newShopName}
                  onChange={(e) => setNewShopName(e.target.value)}
                  placeholder="Ex: Boutique Principale"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label htmlFor="shopAddress" className="text-sm font-medium text-slate-700">
                  Adresse (optionnel)
                </label>
                <textarea
                  id="shopAddress"
                  rows={3}
                  value={newShopAddress}
                  onChange={(e) => setNewShopAddress(e.target.value)}
                  placeholder="Adresse complète"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                />
              </div>

              <div className="flex items-center gap-3 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newShopName.trim()}
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Enregistrer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
