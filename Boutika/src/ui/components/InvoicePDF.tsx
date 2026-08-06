import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Shop, Sale } from '../../core/types';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
    color: '#1f2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 40,
    objectFit: 'contain',
    marginBottom: 10,
  },
  shopInfo: {
    flexDirection: 'column',
  },
  shopName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  invoiceTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
    textAlign: 'right',
  },
  metaData: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  section: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 100,
    color: '#6b7280',
  },
  value: {
    flex: 1,
    fontFamily: 'Helvetica-Bold',
  },
  table: {
    width: '100%',
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#9ca3af',
    paddingBottom: 5,
    marginBottom: 10,
  },
  tableHeaderCell: {
    fontFamily: 'Helvetica-Bold',
    color: '#4b5563',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  colProduct: { flex: 3 },
  colQty: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 1, textAlign: 'right' },
  colTotal: { flex: 1, textAlign: 'right' },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  totalBox: {
    width: 200,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  totalLabel: {
    fontFamily: 'Helvetica-Bold',
  },
  totalAmount: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    color: '#2563eb',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  }
});

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

interface InvoicePDFProps {
  shop: Shop;
  sale: Sale;
  items: InvoiceItem[];
  sellerName: string;
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ shop, sale, items, sellerName }) => {
  const date = new Date(sale.createdAt).toLocaleString('fr-FR');
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.shopInfo}>
            {shop.logoUrl && <Image style={styles.logo} src={shop.logoUrl} />}
            <Text style={styles.shopName}>{shop.name}</Text>
            {shop.address && <Text>{shop.address}</Text>}
            {shop.phone && <Text>{shop.phone}</Text>}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>FACTURE</Text>
            <View style={styles.metaData}>
              <Text style={{ color: '#6b7280' }}>Numéro : {sale.id.slice(0, 8).toUpperCase()}</Text>
              <Text style={{ color: '#6b7280' }}>Date : {date}</Text>
            </View>
          </View>
        </View>

        {/* Customer & Seller Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Client :</Text>
            <Text style={styles.value}>{sale.customerName || 'Client de passage'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Servi par :</Text>
            <Text style={styles.value}>{sellerName}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colProduct]}>Produit</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qté</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Prix Unitaire</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
          </View>
          
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colProduct}>{item.name}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{item.price.toFixed(2)} €</Text>
              <Text style={styles.colTotal}>{(item.quantity * item.price).toFixed(2)} €</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total à payer :</Text>
              <Text style={styles.totalAmount}>{(sale.total || 0).toFixed(2)} €</Text>
            </View>
            <View style={styles.row}>
              <Text style={{ color: '#6b7280', marginTop: 5 }}>Moyen de paiement : {sale.paymentMethod || 'Espèces'}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Merci de votre visite !</Text>
          <Text>Généré par Boutika</Text>
        </View>
        
      </Page>
    </Document>
  );
};
