export const fr = {
  common: {
    loading: "Chargement...",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    continue: "Continuer",
  },
  auth: {
    loginTitle: "Connexion à Boutika", // Old
    phoneTitle: "Votre numéro",
    phoneSubtitle: "Entrez votre numéro de mobile pour vous connecter ou créer un compte",
    phoneLabel: "Numéro de téléphone",
    phonePlaceholder: "6 12 34 56 78",
    termsText: "En continuant, vous acceptez nos",
    termsLink: "Conditions Générales",
    verificationTitle: "Vérification",
    verificationSubtitle: "Saisissez le code envoyé au",
    validateCode: "Valider le code",
    didNotReceive: "Vous n'avez pas reçu le code ?",
    resendCode: "Renvoyer le code",
    backToLogin: "Retour à la connexion",
    loginError: "Numéro ou code invalide.",
  },
  dashboard: {
    title: "Tableau de bord",
    overviewTitle: "Vue d'ensemble",
    today: "Aujourd'hui",
    revenue: "Chiffre d'Affaires",
    transactions: "Transactions",
    vsYesterday: "par rapport à hier",
    welcome: "Bienvenue sur Boutika",
    noOrganization: "Vous n'appartenez à aucune organisation.",
    selectOrganization: "Sélectionnez une organisation",
    selectShop: "Sélectionnez une boutique",
  },
  layout: {
    navDashboard: "Tableau",
    navInventory: "Stocks",
    navSales: "Ventes",
    navAccount: "Compte",
    logout: "Se déconnecter",
  },
  catalog: {
    title: "Catalogue de Produits",
    subtitle: "Gérez votre inventaire et vos déclinaisons.",
    searchPlaceholder: "Rechercher par nom, SKU ou catégorie...",
    filterAll: "Tous les produits",
    filterClothes: "Vêtements",
    filterAccessories: "Accessoires",
    filterFood: "Alimentaire",
    filterMore: "Plus de filtres",
    inStock: "En stock",
    outOfStock: "Rupture",
    size: "Taille",
    color: "Couleur",
    unit: "Unité",
    grind: "Mouture",
    capacity: "Capacité",
  },
  pos: {
    title: "Point de Vente",
    searchPlaceholder: "Rechercher un produit...",
    scan: "Scanner",
    cartTitle: "Panier Actuel",
    clearCart: "Vider le panier",
    perUnit: "unité",
    total: "Total",
    qty: "Qté",
    price: "Prix",
    discount: "% Remise",
    checkout: "Encaisser",
    emptyCart: "Panier vide",
    stockExceeded: "Stock insuffisant",
  },
  inventory: {
    title: "Gestion des stocks",
    subtitle: "Vue d'ensemble et mouvements pour tous les points de vente.",
    export: "Exporter",
    newMovement: "Nouveau mouvement",
    outOfStockAlert: "En Rupture",
    outOfStockAction: "Action immédiate requise",
    lowStockAlert: "Stock Faible",
    lowStockAction: "À réapprovisionner bientôt",
    inTransitAlert: "En Transit",
    inTransitAction: "Réceptions prévues ce jour",
    searchPlaceholder: "Rechercher un SKU, produit...",
    shopFilter: "Point de vente",
    statusFilter: "Statut",
    tableProductSku: "Produit & SKU",
    tableCategory: "Catégorie",
    tableCurrentStock: "Stock Actuel",
    tableStatus: "Statut",
    tableActions: "Actions",
    min: "Min",
  },
  saleDetail: {
    title: "Détail de la vente",
    backToSales: "Retour aux Ventes",
    saleNumber: "Vente #",
    seller: "Vendeur",
    statusCompleted: "Terminée",
    item: "Article",
    ref: "Réf.",
    qty: "Qté",
    unitPrice: "Prix Unitaire",
    total: "Total",
    paymentMethod: "Moyen de Paiement",
    creditCard: "Carte Bancaire",
    endingIn: "Terminant par",
    subtotal: "Sous-total HT",
    tax: "TVA",
    totalTtc: "Total TTC",
    sendEmail: "Envoyer par Email",
    printTicket: "Imprimer Ticket",
    generatePdf: "Générer Facture PDF",
  },
  subscription: {
    title: "Tarifs",
    subtitle: "Des tarifs simples pour développer votre boutique",
    description: "Choisissez le forfait qui correspond le mieux à la taille et aux ambitions de votre entreprise. Sans frais cachés, annulez à tout moment.",
    monthly: "Mensuel",
    annual: "Annuel",
    save20: "-20%",
    subscribe: "S'abonner",
    contactUs: "Nous contacter",
    pendingTitle: "Paiement en attente",
    pendingDescription: "Votre compte sera activé dès réception de votre paiement en espèces par notre agent.",
    status: "Statut",
    activationPending: "Activation en attente",
    backToDashboard: "Retour au tableau de bord",
    contactSupport: "Besoin d'aide ? Contactez le support"
  },
  platformAdmin: {
    title: "Administration Boutika",
    activeOrgs: "Organisations Actives",
    pendingOrgs: "Activations en Attente",
    mrr: "MRR Estimé",
    orgList: "Liste des Organisations",
    statusActive: "Actif",
    statusPending: "En attente",
    statusExpired: "Expiré",
    actionActivate: "Confirmer le reçu et activer",
    actionReject: "Rejeter",
    rejectNote: "Motif du rejet",
    cancel: "Annuler",
    confirmReject: "Confirmer le rejet",
    noPending: "Aucune activation en attente"
  },
  notifications: {
    title: "Notifications",
    empty: "Aucune nouvelle notification.",
    lowStockTitle: "Stock faible",
    lowStockDesc: "Le produit {productName} est presque en rupture de stock ({quantity} restants).",
    weeklyReportTitle: "Rapport Hebdomadaire",
    weeklyReportDesc: "Vos ventes de la semaine dernière ont généré {revenue} FCFA.",
    markAllAsRead: "Tout marquer comme lu"
  }
};

export type Translations = typeof fr;

// Simple i18n implementation for MVP
let currentLocale: Translations = fr;

export const t = (keyPath: string, params?: Record<string, string | number>): string => {
  const keys = keyPath.split('.');
  let current: any = currentLocale;
  for (const k of keys) {
    if (current[k] === undefined) return keyPath;
    current = current[k];
  }
  
  if (typeof current !== 'string') return keyPath;

  if (params) {
    let result = current;
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(new RegExp(`{${key}}`, 'g'), String(value));
    }
    return result;
  }
  return current;
};
