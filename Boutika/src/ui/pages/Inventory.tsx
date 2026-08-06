import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../i18n';
import { getRepositories } from '../../infrastructure/config';
import { Product, InventoryItem } from '../../core/types';

export const Inventory: React.FC = () => {
  const { currentOrganization, currentShop } = useAuth();
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [newMovement, setNewMovement] = useState({ productId: '', quantity: 0, type: 'add' });

  const loadData = async () => {
    if (!currentOrganization || !currentShop) return;
    const repos = getRepositories();
    
    const orgProducts = await repos.products.findAllByOrganization(currentOrganization.id);
    const prodMap: Record<string, Product> = {};
    orgProducts.forEach(p => {
      prodMap[p.id] = p;
    });
    setProducts(prodMap);

    const shopInventory = await repos.inventory.findAllByShop(currentOrganization.id, currentShop.id);
    setInventory(shopInventory);
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentOrganization, currentShop]);

  const handleCreateMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization || !currentShop || !newMovement.productId || newMovement.quantity <= 0) return;

    const repos = getRepositories();
    const existing = await repos.inventory.findByProduct(currentOrganization.id, currentShop.id, newMovement.productId);
    
    let newQty = (existing?.quantity || 0) + (newMovement.type === 'add' ? Number(newMovement.quantity) : -Number(newMovement.quantity));
    if (newQty < 0) newQty = 0;

    await repos.inventory.upsert({
      shopId: currentShop.id,
      productId: newMovement.productId,
      quantity: newQty,
      lowStockThreshold: existing?.lowStockThreshold || 5
    });

    setIsMovementModalOpen(false);
    setNewMovement({ productId: '', quantity: 0, type: 'add' });
    setLoading(true);
    loadData();
  };

  if (!currentOrganization || !currentShop) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-xl">
        <span className="material-symbols-outlined text-[64px] text-primary mb-sm">storefront</span>
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-xs">Veuillez sélectionner un magasin</h2>
        <p className="font-body-md text-body-md text-on-surface-variant text-center max-w-md">
          Vous devez sélectionner une organisation et un magasin dans la barre de navigation en haut pour accéder aux stocks.
        </p>
      </div>
    );
  }
  const outOfStockCount = inventory.filter(i => i.quantity === 0).length;
  const lowStockCount = inventory.filter(i => i.quantity > 0 && i.quantity <= i.lowStockThreshold).length;

  return (
    <div className="max-w-container-max mx-auto px-gutter md:px-lg py-md md:py-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm mb-lg">
        <div>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-1">
            {t('inventory.title')}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {t('inventory.subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-surface-bright text-on-surface-variant border border-outline-variant px-sm py-xs rounded flex items-center space-x-2 hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[20px]">file_download</span>
            <span className="font-label-md text-label-md uppercase">{t('inventory.export')}</span>
          </button>
          <button 
            onClick={() => setIsMovementModalOpen(true)}
            className="bg-primary text-on-primary px-sm py-xs rounded flex items-center space-x-2 hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="font-label-md text-label-md uppercase">{t('inventory.newMovement')}</span>
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
        <div className="bg-surface-bright border border-outline-variant rounded-lg p-md flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-error-container rounded-bl-full opacity-20 -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-start justify-between mb-sm relative z-10">
            <div className="p-2 bg-error-container rounded text-on-error-container">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <span className="font-title-lg text-title-lg text-error">{outOfStockCount}</span>
          </div>
          <div className="relative z-10">
            <h3 className="font-label-md text-label-md text-on-surface-variant uppercase mb-1">{t('inventory.outOfStockAlert')}</h3>
            <p className="font-body-md text-body-md text-on-surface">{t('inventory.outOfStockAction')}</p>
          </div>
        </div>

        <div className="bg-surface-bright border border-outline-variant rounded-lg p-md flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary-fixed rounded-bl-full opacity-20 -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-start justify-between mb-sm relative z-10">
            <div className="p-2 bg-tertiary-fixed rounded text-on-tertiary-fixed-variant">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
            <span className="font-title-lg text-title-lg text-on-surface">{lowStockCount}</span>
          </div>
          <div className="relative z-10">
            <h3 className="font-label-md text-label-md text-on-surface-variant uppercase mb-1">{t('inventory.lowStockAlert')}</h3>
            <p className="font-body-md text-body-md text-on-surface">{t('inventory.lowStockAction')}</p>
          </div>
        </div>

        <div className="bg-surface-bright border border-outline-variant rounded-lg p-md flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed rounded-bl-full opacity-20 -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-start justify-between mb-sm relative z-10">
            <div className="p-2 bg-primary-fixed rounded text-on-primary-fixed">
              <span className="material-symbols-outlined">local_shipping</span>
            </div>
            <span className="font-title-lg text-title-lg text-on-surface">0</span>
          </div>
          <div className="relative z-10">
            <h3 className="font-label-md text-label-md text-on-surface-variant uppercase mb-1">{t('inventory.inTransitAlert')}</h3>
            <p className="font-body-md text-body-md text-on-surface">{t('inventory.inTransitAction')}</p>
          </div>
        </div>
      </section>

      <section className="bg-surface-bright border border-outline-variant rounded-lg flex flex-col">
        <div className="p-md border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-sm">
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input 
              className="w-full pl-10 pr-3 py-2 bg-surface border border-outline-variant rounded font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-on-surface-variant" 
              placeholder={t('inventory.searchPlaceholder')} 
              type="text"
            />
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex flex-col">
              <label className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase">{t('inventory.shopFilter')}</label>
              <select className="bg-surface border border-outline-variant rounded py-1 px-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
                <option>{currentShop.name}</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase">{t('inventory.statusFilter')}</label>
              <select className="bg-surface border border-outline-variant rounded py-1 px-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Tous les statuts</option>
                <option>En rupture</option>
                <option>Stock faible</option>
                <option>En stock</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
             <div className="flex justify-center p-xl">
               <span className="material-symbols-outlined animate-spin text-primary text-4xl">refresh</span>
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-md py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{t('inventory.tableProductSku')}</th>
                  <th className="px-md py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{t('inventory.tableCategory')}</th>
                  <th className="px-md py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{t('inventory.tableCurrentStock')}</th>
                  <th className="px-md py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{t('inventory.tableStatus')}</th>
                  <th className="px-md py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">{t('inventory.tableActions')}</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md divide-y divide-outline-variant">
                {inventory.map(item => {
                  const product = products[item.productId];
                  if (!product) return null;
                  
                  const isOutOfStock = item.quantity === 0;
                  const isLowStock = item.quantity > 0 && item.quantity <= item.lowStockThreshold;

                  return (
                    <tr key={item.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="px-md py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded bg-surface-variant flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-outline">image</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-on-surface">{product.name}</p>
                            <p className="text-on-surface-variant text-xs">SKU: {product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-md py-3 text-on-surface-variant">{product.category || 'Générique'}</td>
                      <td className="px-md py-3 font-medium text-on-surface">
                        {item.quantity} <span className="text-on-surface-variant text-xs ml-1">/ {t('inventory.min')}: {item.lowStockThreshold}</span>
                      </td>
                      <td className="px-md py-3">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-error-container text-on-error-container font-label-md text-[10px] uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-error mr-1.5"></span> {t('catalog.outOfStock')}
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-md text-[10px] uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-tertiary mr-1.5"></span> {t('inventory.lowStockAlert')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-md text-[10px] uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-[#10b981] mr-1.5"></span> {t('catalog.inStock')}
                          </span>
                        )}
                      </td>
                      <td className="px-md py-3 text-right">
                        <button className="text-primary hover:text-primary-container p-1 rounded transition-colors" title={t('common.edit')}>
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {isMovementModalOpen && (
        <div className="fixed inset-0 bg-on-surface/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-bright rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-md border-b border-outline-variant">
              <h3 className="font-title-lg text-title-lg text-on-surface">Nouveau mouvement</h3>
              <button onClick={() => setIsMovementModalOpen(false)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateMovement} className="p-md flex flex-col gap-sm">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase">Produit *</label>
                <select 
                  required
                  value={newMovement.productId}
                  onChange={(e) => setNewMovement({...newMovement, productId: e.target.value})}
                  className="px-3 py-2 border border-outline-variant rounded bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="" disabled>Sélectionnez un produit...</option>
                  {Object.values(products).filter(p => p.status !== 'archived').map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase">Type de mouvement</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="type" 
                      value="add" 
                      checked={newMovement.type === 'add'} 
                      onChange={(e) => setNewMovement({...newMovement, type: e.target.value})}
                    />
                    <span className="font-body-md">Entrée de stock (+)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="type" 
                      value="remove" 
                      checked={newMovement.type === 'remove'} 
                      onChange={(e) => setNewMovement({...newMovement, type: e.target.value})}
                    />
                    <span className="font-body-md">Sortie de stock (-)</span>
                  </label>
                </div>
              </div>
              
              <div className="flex flex-col gap-1 mt-2">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase">Quantité *</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  value={newMovement.quantity || ''}
                  onChange={(e) => setNewMovement({...newMovement, quantity: parseInt(e.target.value)})}
                  className="px-3 py-2 border border-outline-variant rounded bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
              
              <div className="flex justify-end gap-sm mt-md pt-sm border-t border-outline-variant">
                <button 
                  type="button" 
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-4 py-2 font-label-md text-label-md text-primary hover:bg-surface-container-low rounded transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 font-label-md text-label-md bg-primary text-on-primary rounded hover:bg-primary-container transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
