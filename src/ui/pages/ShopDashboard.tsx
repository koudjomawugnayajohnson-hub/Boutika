import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../infrastructure/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';

interface Shop {
  id: string;
  name: string;
  organization_id: string;
}

export const ShopDashboard: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShopDetails = async () => {
      if (!shopId || !currentOrganization) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('shops')
          .select('*')
          .eq('id', shopId)
          .single();

        if (error) throw error;
        
        // Security check: ensure the shop belongs to the current organization
        if (data.organization_id !== currentOrganization.id) {
          throw new Error('Vous n\'avez pas accès à cette boutique.');
        }

        setShop(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Boutique introuvable');
        // Automatically redirect to shops list after a short delay
        setTimeout(() => navigate('/app/shops'), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShopDetails();
  }, [shopId, currentOrganization, navigate]);

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl shadow-sm text-center">
          <h2 className="text-xl font-bold mb-2">Boutique introuvable</h2>
          <p>{error}</p>
          <p className="text-sm mt-4 text-red-500">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* Back button */}
      <Link 
        to="/app/shops" 
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux boutiques
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{shop.name}</h1>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
          <span className="material-symbols-outlined text-[32px] text-slate-400">construction</span>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Tableau de bord en construction</h3>
        <p className="text-slate-500 max-w-md">
          Tableau de bord de la boutique en construction. Les modules de stock et de caisse seront bientôt disponibles ici.
        </p>
      </div>
    </div>
  );
};
