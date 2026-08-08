import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRepositories } from '../../infrastructure/config';
import { Shop, Sale, Product, InventoryItem, OrganizationMember, ShopStaff, User } from '../../core/types';
import { 
  ArrowLeft, Store, MapPin, BarChart3, Package, AlertTriangle, 
  Users, UserPlus, UserMinus, Trash2, Power, Box, Receipt 
} from 'lucide-react';

export const ShopDashboard: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { currentOrganization, role, selectShop } = useAuth();
  const repos = getRepositories();

  const [shop, setShop] = useState<Shop | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orgMembers, setOrgMembers] = useState<OrganizationMember[]>([]);
  const [shopStaff, setShopStaff] = useState<ShopStaff[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Modals/Dialogs
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (!currentOrganization || !role) return;

    // Security check: only owner/admin can access
    if (role === 'member') {
      navigate('/app');
      return;
    }

    loadData();
  }, [shopId, currentOrganization, role]);

  const loadData = async () => {
    if (!shopId || !currentOrganization) return;
    setIsLoading(true);
    try {
      const fetchedShop = await repos.shops.findById(currentOrganization.id, shopId);
      if (!fetchedShop) throw new Error('Boutique introuvable');
      
      setShop(fetchedShop);
      setEditName(fetchedShop.name);
      setEditAddress(fetchedShop.address || '');

      // Load stats
      const [fetchedSales, fetchedProducts, fetchedInventory] = await Promise.all([
        repos.sales.findAllByShop(currentOrganization.id, shopId),
        repos.products.findAllByOrganization(currentOrganization.id),
        repos.inventory.findAllByShop(currentOrganization.id, shopId)
      ]);
      setSales(fetchedSales);
      setProducts(fetchedProducts);
      setInventory(fetchedInventory);

      // Load team
      if (role === 'owner' || role === 'admin') {
        const [fetchedOrgMembers, fetchedShopStaff] = await Promise.all([
          repos.organizationMembers.findByOrganization(currentOrganization.id),
          repos.shopStaff.findByShop(currentOrganization.id, shopId)
        ]);
        setOrgMembers(fetchedOrgMembers);
        setShopStaff(fetchedShopStaff);
        
        // Load user details for members
        const userPromises = fetchedOrgMembers.map(m => repos.users.findById(m.userId));
        const resolvedUsers = await Promise.all(userPromises);
        const usersMap: Record<string, User> = {};
        resolvedUsers.forEach(u => {
          if (u) usersMap[u.id] = u;
        });
        setUsers(usersMap);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop || !currentOrganization) return;
    setIsSavingInfo(true);
    try {
      const updated = await repos.shops.update(currentOrganization.id, shop.id, {
        name: editName,
        address: editAddress
      });
      setShop(updated);
      showToast('Informations mises à jour', 'success');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour', 'error');
    } finally {
      setIsSavingInfo(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!shop || !currentOrganization) return;
    try {
      const newStatus = shop.status === 'inactive' ? 'active' : 'inactive';
      const updated = await repos.shops.update(currentOrganization.id, shop.id, { status: newStatus });
      setShop(updated);
      showToast(`Boutique ${newStatus === 'active' ? 'activée' : 'désactivée'}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Erreur', 'error');
    }
  };

  const handleDeleteShop = async () => {
    if (!shop || !currentOrganization) return;
    if (sales.length > 0) {
      showToast('Impossible de supprimer: il y a un historique de ventes.', 'error');
      setIsDeleteModalOpen(false);
      return;
    }
    try {
      await repos.shops.delete(currentOrganization.id, shop.id);
      showToast('Boutique supprimée', 'success');
      navigate('/app/shops');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la suppression', 'error');
      setIsDeleteModalOpen(false);
    }
  };

  const handleAssignMember = async (userId: string) => {
    if (!shop || !currentOrganization) return;
    try {
      const newStaff = await repos.shopStaff.create({
        shopId: shop.id,
        userId: userId
      });
      setShopStaff([...shopStaff, newStaff]);
      showToast('Membre assigné avec succès', 'success');
      setIsAssignModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l\'assignation', 'error');
    }
  };

  const handleRemoveMember = async (staffId: string) => {
    try {
      await repos.shopStaff.delete(staffId);
      setShopStaff(shopStaff.filter(s => s.id !== staffId));
      showToast('Membre retiré', 'success');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du retrait', 'error');
    }
  };

  const handleNavigateToStock = async () => {
    if (shop) {
      await selectShop(shop.id);
      navigate('/app/inventory');
    }
  };

  const handleNavigateToSales = async () => {
    if (shop) {
      await selectShop(shop.id);
      navigate('/app/pos');
    }
  };

  // Derived Stats
  const activeProductsCount = products.filter(p => p.status !== 'archived').length;
  const lowStockAlerts = inventory.filter(i => {
    const p = products.find(prod => prod.id === i.productId);
    const threshold = i.lowStockThreshold ?? p?.lowStockThreshold ?? 0;
    return i.quantity <= threshold;
  }).length;
  
  const todaySales = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return sales.filter(s => new Date(s.createdAt) >= today).reduce((sum, s) => sum + (s.totalAmount || s.total || 0), 0);
  }, [sales]);

  const weekSales = useMemo(() => {
    const today = new Date();
    const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
    firstDay.setHours(0,0,0,0);
    return sales.filter(s => new Date(s.createdAt) >= firstDay).reduce((sum, s) => sum + (s.totalAmount || s.total || 0), 0);
  }, [sales]);

  // Derived Members
  const unassignedMembers = orgMembers.filter(m => 
    m.role === 'member' && !shopStaff.some(s => s.userId === m.userId)
  );

  const assignedMembers = shopStaff.map(s => {
    const orgMem = orgMembers.find(m => m.userId === s.userId);
    const user = users[s.userId];
    return {
      staffId: s.id,
      userId: s.userId,
      name: user?.name || user?.email || user?.phone || 'Utilisateur inconnu',
      role: orgMem?.role
    };
  });

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
    <div className="w-full relative pb-20">
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
          <Link to="/app/shops" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Retour aux boutiques
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{shop.name}</h1>
            {shop.status === 'inactive' && (
              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full border border-slate-200">
                Inactif
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleStatus}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              shop.status === 'inactive' 
                ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Power className="w-4 h-4" />
            {shop.status === 'inactive' ? 'Activer la boutique' : 'Désactiver la boutique'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Ventes du jour</span>
              </div>
              <p className="text-xl font-bold text-slate-800">{todaySales.toLocaleString()} FCFA</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Ventes (Semaine)</span>
              </div>
              <p className="text-xl font-bold text-slate-800">{weekSales.toLocaleString()} FCFA</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Package className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Produits Actifs</span>
              </div>
              <p className="text-xl font-bold text-slate-800">{activeProductsCount}</p>
            </div>
            <div className={`p-4 rounded-xl border shadow-sm ${lowStockAlerts > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
              <div className={`flex items-center gap-2 mb-2 ${lowStockAlerts > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Stock Faible</span>
              </div>
              <p className={`text-xl font-bold ${lowStockAlerts > 0 ? 'text-amber-800' : 'text-slate-800'}`}>{lowStockAlerts}</p>
            </div>
          </div>

          {/* General Information */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Store className="w-5 h-5 text-slate-500" />
                Informations générales
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSaveInfo} className="flex flex-col gap-4 max-w-lg">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Nom de la boutique</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Adresse</label>
                  <textarea
                    rows={2}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isSavingInfo}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSavingInfo ? 'Sauvegarde...' : 'Enregistrer les modifications'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-6">
             <h2 className="text-lg font-bold text-slate-800 mb-4">Accès rapide</h2>
             <div className="flex flex-wrap gap-4">
                <button onClick={handleNavigateToStock} className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex-1 min-w-[200px]">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                    <Box className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-800">Voir le stock</p>
                    <p className="text-xs text-slate-500">Gérer l'inventaire de cette boutique</p>
                  </div>
                </button>
                
                <button onClick={handleNavigateToSales} className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex-1 min-w-[200px]">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-800">Voir les ventes</p>
                    <p className="text-xs text-slate-500">Historique et caisse de cette boutique</p>
                  </div>
                </button>
             </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          
          {/* Team Assigned */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-500" />
                Équipe assignée
              </h2>
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Assigner un membre"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            </div>
            <div className="p-0">
              {assignedMembers.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  Aucun membre assigné à cette boutique.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {assignedMembers.map(member => (
                    <li key={member.staffId} className="flex items-center justify-between px-6 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{member.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{member.role}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveMember(member.staffId)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Retirer"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          {role === 'owner' && (
            <div className="bg-white border border-red-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-red-100 bg-red-50">
                <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Zone de danger
                </h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-600 mb-4">
                  La suppression d'une boutique est irréversible. Elle libérera une place dans votre quota de boutiques.
                </p>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors w-full flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer cette boutique
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Assign Member Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Assigner un membre</h2>
              <button onClick={() => setIsAssignModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
                &times;
              </button>
            </div>
            <div className="p-6">
              {unassignedMembers.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Tous les membres sont déjà assignés ou il n'y a pas d'autres membres.</p>
              ) : (
                <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                  {unassignedMembers.map(m => {
                    const user = users[m.userId];
                    return (
                      <li key={m.id} className="flex items-center justify-between p-3 hover:bg-slate-50">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{user?.name || user?.email || user?.phone || 'Inconnu'}</p>
                          <p className="text-xs text-slate-500 capitalize">{m.role}</p>
                        </div>
                        <button
                          onClick={() => handleAssignMember(m.userId)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-md hover:bg-blue-100"
                        >
                          Assigner
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Supprimer la boutique ?</h2>
              
              {sales.length > 0 ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-sm text-left mb-6">
                  <strong>Action impossible :</strong> Cette boutique a déjà enregistré des ventes. 
                  Pour préserver l'historique de votre comptabilité, vous ne pouvez pas la supprimer. 
                  Nous vous suggérons de la <strong>désactiver</strong> à la place.
                </div>
              ) : (
                <p className="text-slate-500 mb-6 text-sm">
                  Êtes-vous sûr de vouloir supprimer définitivement cette boutique ? Cette action est irréversible.
                </p>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                {!sales.length ? (
                  <button
                    onClick={handleDeleteShop}
                    className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Supprimer
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      if (shop.status !== 'inactive') handleToggleStatus();
                    }}
                    className="flex-1 px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    Désactiver plutôt
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
