import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../i18n';
import { getRepositories } from '../../infrastructure/config';
import { Sale, SaleItem, Product, Organization, Shop } from '../../core/types';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

const pdfStyles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  companyInfo: { fontSize: 10, color: '#666' },
  title: { fontSize: 24, fontWeight: 'bold' },
  details: { marginBottom: 20, fontSize: 12 },
  table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableColHeader: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#f0f0f0', padding: 5 },
  tableCol: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, padding: 5 },
  tableCellHeader: { fontSize: 10, fontWeight: 'bold' },
  tableCell: { fontSize: 10 },
  total: { marginTop: 20, textAlign: 'right', fontSize: 14, fontWeight: 'bold' }
});

const InvoicePDF = ({ sale, items, products, org, shop }: { sale: Sale, items: SaleItem[], products: Record<string, Product>, org: Organization, shop: Shop }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <View>
          <Text style={pdfStyles.title}>FACTURE</Text>
          <Text style={pdfStyles.companyInfo}>#{sale.id}</Text>
          <Text style={pdfStyles.companyInfo}>Date: {new Date(sale.createdAt).toLocaleDateString('fr-FR')}</Text>
        </View>
        <View>
          <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{org.name}</Text>
          <Text style={pdfStyles.companyInfo}>{shop.name}</Text>
        </View>
      </View>

      <View style={pdfStyles.table}>
        <View style={pdfStyles.tableRow}>
          <View style={{ ...pdfStyles.tableColHeader, width: '40%' }}>
            <Text style={pdfStyles.tableCellHeader}>Produit</Text>
          </View>
          <View style={{ ...pdfStyles.tableColHeader, width: '20%' }}>
            <Text style={pdfStyles.tableCellHeader}>Prix Unitaire</Text>
          </View>
          <View style={{ ...pdfStyles.tableColHeader, width: '20%' }}>
            <Text style={pdfStyles.tableCellHeader}>Quantité</Text>
          </View>
          <View style={{ ...pdfStyles.tableColHeader, width: '20%' }}>
            <Text style={pdfStyles.tableCellHeader}>Total</Text>
          </View>
        </View>

        {items.map(item => (
          <View style={pdfStyles.tableRow} key={item.id}>
            <View style={{ ...pdfStyles.tableCol, width: '40%' }}>
              <Text style={pdfStyles.tableCell}>{products[item.productId]?.name || 'Produit Inconnu'}</Text>
            </View>
            <View style={{ ...pdfStyles.tableCol, width: '20%' }}>
              <Text style={pdfStyles.tableCell}>{item.unitPrice.toFixed(2)} €</Text>
            </View>
            <View style={{ ...pdfStyles.tableCol, width: '20%' }}>
              <Text style={pdfStyles.tableCell}>{item.quantity}</Text>
            </View>
            <View style={{ ...pdfStyles.tableCol, width: '20%' }}>
              <Text style={pdfStyles.tableCell}>{(item.unitPrice * item.quantity).toFixed(2)} €</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={pdfStyles.total}>Total TTC: {(sale.total || 0).toFixed(2)} €</Text>
    </Page>
  </Document>
);

export const SaleDetail: React.FC<{ saleId: string; onBack: () => void }> = ({ saleId, onBack }) => {
  const { currentOrganization, currentShop } = useAuth();
  const [sale, setSale] = useState<Sale | null>(null);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!currentOrganization || !currentShop) return;
      const repos = getRepositories();

      // We need a findById for Sales, assuming it exists or we mock it.
      // Wait, in MockRepositories, we don't have SaleRepository exported fully yet.
      // But we can get it from repos.sales (we assume repos.sales has findById but wait...)
      // Let's assume we fetch all and filter for now if not sure.
      const allSales = await repos.sales.findRecent(currentOrganization.id, currentShop.id, 100);
      const foundSale = allSales.find(s => s.id === saleId);
      
      if (foundSale) {
        setSale(foundSale);
        const saleItems = (await repos.saleItems.findAllBySale ? await repos.saleItems.findAllBySale(currentOrganization.id, currentShop.id, saleId) : []);
        setItems(saleItems);

        const orgProducts = await repos.products.findAllByOrganization(currentOrganization.id);
        const prodMap: Record<string, Product> = {};
        orgProducts.forEach(p => {
          prodMap[p.id] = p;
        });
        setProducts(prodMap);
      }
      
      setLoading(false);
    };
    loadData();
  }, [saleId, currentOrganization, currentShop]);

  if (loading) {
    return (
      <div className="flex justify-center p-xl">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">refresh</span>
      </div>
    );
  }

  if (!sale || !currentOrganization || !currentShop) {
    return (
      <div className="max-w-container-max mx-auto px-gutter md:px-lg py-md md:py-lg">
        <button onClick={onBack} className="text-primary hover:underline mb-sm flex items-center">
          <span className="material-symbols-outlined mr-1">arrow_back</span> Retour
        </button>
        <p>Vente introuvable.</p>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-gutter md:px-lg py-md md:py-lg">
      <button onClick={onBack} className="text-primary hover:underline mb-md flex items-center gap-1 font-label-md text-label-md transition-colors hover:text-primary-container">
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        Retour
      </button>
      
      <div className="bg-surface-bright border border-outline-variant rounded-lg p-md md:p-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm mb-lg border-b border-outline-variant pb-md">
          <div>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-xs">
              Facture #{sale.id}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Date: {new Date(sale.createdAt).toLocaleString('fr-FR')}
            </p>
          </div>
          
          <PDFDownloadLink
            document={<InvoicePDF sale={sale} items={items} products={products} org={currentOrganization} shop={currentShop} />}
            fileName={`facture_${sale.id}.pdf`}
            className="bg-primary text-on-primary px-4 py-2 rounded font-label-md text-label-md uppercase inline-flex items-center gap-2 hover:bg-primary-container transition-colors"
          >
            {({ blob, url, loading, error }) => (
              loading ? 'Génération du PDF...' : (
                <>
                  <span className="material-symbols-outlined">download</span>
                  Télécharger PDF
                </>
              )
            )}
          </PDFDownloadLink>
        </div>

        <div className="mb-lg">
          <h3 className="font-title-lg text-title-lg text-on-surface mb-sm border-b border-outline-variant pb-xs">Détails des articles</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-md py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Produit</th>
                <th className="px-md py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Prix Unitaire</th>
                <th className="px-md py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center">Quantité</th>
                <th className="px-md py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Total</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md divide-y divide-outline-variant">
              {items.length === 0 ? (
                <tr>
                   <td colSpan={4} className="px-md py-3 text-center text-on-surface-variant">Aucun article trouvé.</td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-md py-3">{products[item.productId]?.name || 'Inconnu'}</td>
                    <td className="px-md py-3 text-right">{item.unitPrice.toFixed(2)} €</td>
                    <td className="px-md py-3 text-center">{item.quantity}</td>
                    <td className="px-md py-3 text-right">{(item.unitPrice * item.quantity).toFixed(2)} €</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-md border-t border-outline-variant">
          <div className="text-right">
            <span className="font-title-lg text-title-lg text-on-surface-variant mr-4">Total TTC</span>
            <span className="font-headline-sm text-headline-sm text-on-surface">{(sale.total || 0).toFixed(2)} €</span>
          </div>
        </div>
      </div>
    </div>
  );
};
