import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../i18n';
import { getRepositories } from '../../infrastructure/config';
import { Product, InventoryItem } from '../../core/types';

export const Catalog: React.FC = () => {
  const { currentOrganization, currentShop } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<Record<string, InventoryItem>>({});
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: 0, initialStock: 0, imageUrl: '' });

  const loadData = async () => {
    if (!currentOrganization) return;
    const repos = getRepositories();
    const orgProducts = await repos.products.findAllByOrganization(currentOrganization.id);
    setProducts(orgProducts.filter(p => p.status !== 'archived'));

    if (currentShop) {
      const shopInventory = await repos.inventory.findAllByShop(currentOrganization.id, currentShop.id);
      const invMap: Record<string, InventoryItem> = {};
      shopInventory.forEach(item => {
        invMap[item.productId] = item;
      });
      setInventory(invMap);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentOrganization, currentShop]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization || !currentShop) return;

    const repos = getRepositories();
    const createdProduct = await repos.products.create({
      organizationId: currentOrganization.id,
      name: newProduct.name,
      category: newProduct.category,
      price: Number(newProduct.price),
      imageUrl: newProduct.imageUrl || undefined,
      status: 'active'
    });

    // Also initialize inventory
    if (newProduct.initialStock > 0) {
      await repos.inventory.upsert({
        shopId: currentShop.id,
        productId: createdProduct.id,
        quantity: Number(newProduct.initialStock),
        lowStockThreshold: 5
      });
    }

    setIsCreateModalOpen(false);
    setNewProduct({ name: '', category: '', price: 0, initialStock: 0, imageUrl: '' });
    // Reload data
    setLoading(true);
    loadData();
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!currentOrganization) return;
    if (window.confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      const repos = getRepositories();
      await repos.products.update(currentOrganization.id, productId, { status: 'archived' });
      setLoading(true);
      loadData();
    }
  };

  if (!currentOrganization || !currentShop) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-xl">
        <span className="material-symbols-outlined text-[64px] text-primary mb-sm">storefront</span>
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-xs">Veuillez sélectionner un magasin</h2>
        <p className="font-body-md text-body-md text-on-surface-variant text-center max-w-md">
          Vous devez sélectionner une organisation et un magasin dans la barre de navigation en haut pour accéder au catalogue.
        </p>
      </div>
    );
  }
  return (
    <div className="max-w-container-max mx-auto px-gutter md:px-lg py-md md:py-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-lg">
        <div>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-xs">
            {t('catalog.title')}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {t('catalog.subtitle')}
          </p>
        </div>
        <div className="w-full md:w-[400px]">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              type="text" 
              placeholder={t('catalog.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-md font-body-md text-body-md text-on-background focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-xs overflow-x-auto pb-sm scrollbar-hide mb-md">
        <button className="whitespace-nowrap px-sm py-[6px] bg-primary text-on-primary rounded-full font-label-md text-label-md border border-primary">
          {t('catalog.filterAll')}
        </button>
        <button className="whitespace-nowrap px-sm py-[6px] bg-surface-container-lowest text-on-surface-variant rounded-full font-label-md text-label-md border border-outline-variant hover:bg-surface-container-low transition-colors">
          {t('catalog.filterClothes')}
        </button>
        <button className="whitespace-nowrap px-sm py-[6px] bg-surface-container-lowest text-on-surface-variant rounded-full font-label-md text-label-md border border-outline-variant hover:bg-surface-container-low transition-colors">
          {t('catalog.filterAccessories')}
        </button>
        <button className="whitespace-nowrap px-sm py-[6px] bg-surface-container-lowest text-on-surface-variant rounded-full font-label-md text-label-md border border-outline-variant hover:bg-surface-container-low transition-colors">
          {t('catalog.filterFood')}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-xl">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">refresh</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
          {products.map(product => {
            const stock = inventory[product.id]?.quantity || 0;
            const isOutOfStock = stock === 0;
            const isLowStock = stock > 0 && stock <= (inventory[product.id]?.lowStockThreshold || 5);
            
            return (
              <div key={product.id} className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col group hover:border-primary-container transition-colors">
                <div className="aspect-square bg-surface-container-low relative overflow-hidden flex items-center justify-center">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-[48px] text-outline">image</span>
                  )}
                  
                  <button 
                    onClick={() => handleDeleteProduct(product.id)}
                    className="absolute top-2 left-2 w-8 h-8 bg-[#ef4444]/10 hover:bg-[#ef4444]/20 text-[#ef4444] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Supprimer"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>

                  <div className="absolute top-2 right-2 bg-surface-container-lowest/90 backdrop-blur-sm px-2 py-1 rounded font-label-md text-label-md text-on-background border border-outline-variant flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-[#ef4444]' : isLowStock ? 'bg-[#f59e0b]' : 'bg-[#10b981]'}`}></div>
                    {isOutOfStock ? t('catalog.outOfStock') : `${t('catalog.inStock')}: ${stock}`}
                  </div>
                </div>
                <div className="p-sm flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-xs">
                    <h3 className="font-title-lg text-title-lg text-on-background leading-tight">{product.name}</h3>
                    <span className="font-title-lg text-title-lg text-primary">{product.price.toFixed(2)} €</span>
                  </div>
                  <p className="font-label-md text-label-md text-secondary mb-sm uppercase tracking-wider">{product.category || 'Générique'} • {product.id}</p>
                  
                  <div className="mt-auto space-y-2">
                    {product.customFields && Object.keys(product.customFields).map(key => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="font-label-md text-label-md text-on-surface-variant capitalize">{key}</span>
                        <div className="flex gap-1">
                          <span className="px-2 py-0.5 border border-outline-variant rounded font-body-md text-body-md text-xs bg-surface-container-low">
                            {product.customFields?.[key]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button 
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-[88px] md:bottom-lg right-gutter md:right-lg w-[56px] h-[56px] bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:bg-primary-container transition-colors active:scale-95 z-30"
      >
        <span className="material-symbols-outlined text-[24px]">add</span>
      </button>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-on-surface/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-bright rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-md border-b border-outline-variant">
              <h3 className="font-title-lg text-title-lg text-on-surface">Nouveau Produit</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateProduct} className="p-md flex flex-col gap-sm">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase">Nom du produit *</label>
                <input 
                  type="text" 
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="px-3 py-2 border border-outline-variant rounded bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Ex: T-Shirt Noir"
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase">Catégorie</label>
                <input 
                  type="text" 
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="px-3 py-2 border border-outline-variant rounded bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Ex: Vêtements"
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase">Image du produit (Optionnel)</label>
                <div className="flex items-center gap-sm">
                  {newProduct.imageUrl && (
                    <div className="w-12 h-12 rounded bg-surface-container-low overflow-hidden border border-outline-variant flex-shrink-0">
                      <img src={newProduct.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-3 py-2 border border-outline-variant rounded bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-container file:text-on-primary-container hover:file:bg-primary/20 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase">Prix (€) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                    className="px-3 py-2 border border-outline-variant rounded bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase">Stock Initial</label>
                  <input 
                    type="number" 
                    min="0"
                    value={newProduct.initialStock}
                    onChange={(e) => setNewProduct({...newProduct, initialStock: parseInt(e.target.value)})}
                    className="px-3 py-2 border border-outline-variant rounded bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-sm mt-md pt-sm border-t border-outline-variant">
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 font-label-md text-label-md text-primary hover:bg-surface-container-low rounded transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 font-label-md text-label-md bg-primary text-on-primary rounded hover:bg-primary-container transition-colors"
                >
                  Créer le produit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
