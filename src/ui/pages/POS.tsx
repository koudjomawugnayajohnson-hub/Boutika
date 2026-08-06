import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../i18n';
import { getRepositories } from '../../infrastructure/config';
import { Product, InventoryItem, Sale, SaleItem } from '../../core/types';
import { pdf } from '@react-pdf/renderer';
import { InvoicePDF } from '../components/InvoicePDF';

interface CartItem {
  product: Product;
  quantity: number;
}

export const POS: React.FC = () => {
  const { currentOrganization, currentShop, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<Record<string, InventoryItem>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!currentOrganization || !currentShop) return;
      const repos = getRepositories();
      
      const orgProducts = await repos.products.findAllByOrganization(currentOrganization.id);
      setProducts(orgProducts);

      const shopInventory = await repos.inventory.findAllByShop(currentOrganization.id, currentShop.id);
      const invMap: Record<string, InventoryItem> = {};
      shopInventory.forEach(item => {
        invMap[item.productId] = item;
      });
      setInventory(invMap);
      
      setLoading(false);
    };
    loadData();
  }, [currentOrganization, currentShop]);

  if (!currentOrganization || !currentShop) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-xl w-full">
        <span className="material-symbols-outlined text-[64px] text-primary mb-sm">storefront</span>
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-xs">Veuillez sélectionner un magasin</h2>
        <p className="font-body-md text-body-md text-on-surface-variant text-center max-w-md">
          Vous devez sélectionner une organisation et un magasin dans la barre de navigation en haut pour accéder au point de vente.
        </p>
      </div>
    );
  }
  const handleAddToCart = (product: Product) => {
    const currentStock = inventory[product.id]?.quantity || 0;
    const existing = cart.find(c => c.product.id === product.id);
    const newQty = (existing?.quantity || 0) + 1;
    
    if (newQty > currentStock) {
      alert(t('pos.stockExceeded'));
      return;
    }

    if (existing) {
      setCart(cart.map(c => c.product.id === product.id ? { ...c, quantity: newQty } : c));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateCartQty = (productId: string, delta: number) => {
    const existing = cart.find(c => c.product.id === productId);
    if (!existing) return;
    
    const newQty = existing.quantity + delta;
    if (newQty <= 0) {
      setCart(cart.filter(c => c.product.id !== productId));
      return;
    }

    const currentStock = inventory[productId]?.quantity || 0;
    if (newQty > currentStock) {
      alert(t('pos.stockExceeded'));
      return;
    }

    setCart(cart.map(c => c.product.id === productId ? { ...c, quantity: newQty } : c));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const repos = getRepositories();
      
      // Create Sale
      const sale = await repos.sales.create({
        shopId: currentShop.id,
        organizationId: currentOrganization.id,
        status: 'closed',
        total: total,
        paymentMethod: 'card', // Mock default
        createdBy: user?.id,
        customerName: customerName || undefined
      });

      // Create SaleItems and update inventory
      for (const item of cart) {
        await repos.saleItems.create({
          saleId: sale.id,
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.price,
        });

        const currentInv = inventory[item.product.id];
        if (currentInv) {
          const updatedInv = await repos.inventory.upsert({
            shopId: currentShop.id,
            productId: item.product.id,
            quantity: currentInv.quantity - item.quantity,
            lowStockThreshold: currentInv.lowStockThreshold,
          });
          setInventory(prev => ({ ...prev, [item.product.id]: updatedInv }));
        }
      }

      // Check if this is the first sale for the shop
      const allSales = await repos.sales.findAllByShop(currentOrganization.id, currentShop.id);
      if (allSales.length === 1) {
        await repos.auditLogs.create({
          organizationId: currentOrganization.id,
          userId: user?.id,
          action: 'first_sale_created',
          entityType: 'sale',
          entityId: sale.id
        });
      }

      // Generate PDF
      const invoiceItems = cart.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      }));
      
      const doc = <InvoicePDF shop={currentShop} sale={sale} items={invoiceItems} sellerName={user?.phone || 'Vendeur inconnu'} />;
      const asPdf = pdf();
      asPdf.updateContainer(doc);
      const blob = await asPdf.toBlob();
      
      // Auto-print
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.print();
        }, 100);
      };

      setCart([]);
      setCustomerName('');
    } catch (e) {
      console.error(e);
      alert('Erreur lors de l\'encaissement.');
    }
  };

  const filteredProducts = products.filter(p => {
    if (filter !== 'all' && p.category?.toLowerCase() !== filter.toLowerCase()) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] w-full max-w-container-max mx-auto -mt-md -mx-gutter px-0 md:px-lg md:mt-0 md:-mx-0 overflow-hidden">
      {/* Left: Product Grid & Search */}
      <section className="flex-1 flex flex-col bg-surface-bright border-r border-outline-variant overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-md border-b border-outline-variant flex flex-col sm:flex-row gap-sm items-center justify-between shrink-0">
          <div className="relative w-full sm:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              type="text" 
              placeholder={t('pos.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-DEFAULT bg-surface text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
            />
          </div>
          <button className="w-full sm:w-auto flex items-center justify-center gap-xs px-4 py-2 border border-outline-variant rounded-DEFAULT text-primary hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined">barcode_scanner</span>
            <span className="font-label-md text-label-md">{t('pos.scan')}</span>
          </button>
        </div>

        {/* Categories */}
        <div className="px-md py-sm flex gap-sm overflow-x-auto scrollbar-hide shrink-0 border-b border-outline-variant bg-surface-container-lowest">
          <button onClick={() => setFilter('all')} className={`px-4 py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap ${filter === 'all' ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container-low'}`}>{t('catalog.filterAll')}</button>
          <button onClick={() => setFilter('Vêtements')} className={`px-4 py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap ${filter === 'Vêtements' ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container-low'}`}>{t('catalog.filterClothes')}</button>
          <button onClick={() => setFilter('Accessoires')} className={`px-4 py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap ${filter === 'Accessoires' ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container-low'}`}>{t('catalog.filterAccessories')}</button>
          <button onClick={() => setFilter('Alimentaire')} className={`px-4 py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap ${filter === 'Alimentaire' ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container-low'}`}>{t('catalog.filterFood')}</button>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-md grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md content-start">
          {loading ? (
             <div className="col-span-full flex justify-center p-xl">
               <span className="material-symbols-outlined animate-spin text-primary text-4xl">refresh</span>
             </div>
          ) : filteredProducts.map(product => {
            const stock = inventory[product.id]?.quantity || 0;
            const outOfStock = stock === 0;

            return (
              <button 
                key={product.id}
                onClick={() => handleAddToCart(product)}
                disabled={outOfStock}
                data-testid="pos-product"
                className={`group flex flex-col bg-surface border border-outline-variant rounded-lg overflow-hidden hover:shadow-sm transition-all active:scale-[0.98] text-left ${outOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="aspect-square bg-surface-container-low w-full relative flex items-center justify-center">
                  <span className="material-symbols-outlined text-outline text-4xl">image</span>
                  <div className="absolute top-2 right-2 bg-surface-container-lowest/90 backdrop-blur-sm px-2 py-1 rounded font-label-md text-label-md text-on-background border border-outline-variant flex items-center gap-1">
                     <span className="font-label-md text-[10px]">{stock}</span>
                  </div>
                </div>
                <div className="p-sm flex flex-col gap-1">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{product.category || 'Générique'}</span>
                  <span className="font-body-md text-body-md text-on-surface font-semibold truncate">{product.name}</span>
                  <span className="font-body-lg text-body-lg text-primary">{product.price.toFixed(2)} €</span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Right: Cart & Numpad */}
      <section className="w-full md:w-[400px] flex-shrink-0 bg-surface-container-lowest flex flex-col relative z-20 pb-16 md:pb-0">
        <div className="p-md border-b border-outline-variant flex items-center justify-between shrink-0">
          <h2 className="font-title-lg text-title-lg text-on-surface flex items-center gap-xs">
            <span className="material-symbols-outlined">shopping_cart</span>
            {t('pos.cartTitle')}
          </h2>
          <button onClick={clearCart} className="text-error hover:bg-error-container p-1.5 rounded transition-colors" title={t('pos.clearCart')}>
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-50 p-lg text-center">
              <span className="material-symbols-outlined text-[48px] mb-sm">shopping_basket</span>
              <p>{t('pos.emptyCart')}</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={item.product.id} className={`px-md py-3 border-b border-outline-variant flex items-start justify-between bg-surface-bright ${idx === cart.length - 1 ? 'border-l-2 border-l-primary' : ''}`}>
                <div className="flex flex-col flex-1 pr-sm">
                  <span className="font-body-md text-body-md font-semibold text-on-surface">{item.product.name}</span>
                  <span className="font-label-md text-label-md text-on-surface-variant">{item.product.price.toFixed(2)} € / {t('pos.perUnit')}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-body-lg text-body-lg text-on-surface font-semibold">{(item.product.price * item.quantity).toFixed(2)} €</span>
                  <div className="flex items-center gap-2 border border-outline-variant rounded bg-surface">
                    <button onClick={() => updateCartQty(item.product.id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-low active:bg-surface-variant transition-colors"><span className="material-symbols-outlined text-[18px]">remove</span></button>
                    <span className="font-body-md text-body-md w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateCartQty(item.product.id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-low active:bg-surface-variant transition-colors"><span className="material-symbols-outlined text-[18px]">add</span></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total & Controls */}
        <div className="shrink-0 bg-surface border-t border-outline-variant p-md">
          <div className="flex justify-between items-end mb-sm">
            <span className="font-title-lg text-title-lg text-on-surface-variant">{t('pos.total')}</span>
            <span className="font-display-lg text-headline-lg md:text-display-lg text-on-surface font-bold">{total.toFixed(2)} €</span>
          </div>

          <div className="flex gap-1 mb-sm p-1 bg-surface-container-low rounded border border-outline-variant">
            <button className="flex-1 py-1.5 font-label-md text-label-md rounded bg-surface shadow-sm border border-outline-variant text-on-surface">{t('pos.qty')}</button>
            <button className="flex-1 py-1.5 font-label-md text-label-md rounded text-on-surface-variant hover:bg-surface transition-colors">{t('pos.price')}</button>
            <button className="flex-1 py-1.5 font-label-md text-label-md rounded text-on-surface-variant hover:bg-surface transition-colors">{t('pos.discount')}</button>
          </div>

          <div className="mb-sm">
            <input 
              type="text" 
              placeholder="Nom du client (Optionnel)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-outline-variant rounded bg-surface text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <button onClick={handleCheckout} disabled={cart.length === 0} className={`w-full h-14 bg-primary text-on-primary rounded font-title-lg text-title-lg flex items-center justify-center gap-xs transition-all ${cart.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 active:scale-[0.98]'}`}>
            <span>{t('pos.checkout')}</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </section>
    </div>
  );
};
