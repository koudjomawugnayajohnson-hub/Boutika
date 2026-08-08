import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Store, Smartphone, BarChart3, FileText, Layers, CheckCircle, Search, Filter, ShieldCheck, Package, ArrowRightLeft } from 'lucide-react';
import { TestimonialMarquee } from '../components/TestimonialMarquee';

const CatalogPreviewUI = () => (
  <div className="w-full h-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col font-sans">
    {/* Header / Search & Filter */}
    <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
      <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-md px-3 py-2 mr-3 shadow-sm">
        <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
        <span className="text-slate-400 text-sm truncate">Rechercher...</span>
      </div>
      <div className="p-2 bg-white border border-slate-200 rounded-md shadow-sm shrink-0">
        <Filter className="w-4 h-4 text-slate-600" />
      </div>
    </div>
    
    {/* Categories (Badges) */}
    <div className="px-4 py-3 border-b border-slate-100 flex gap-2 overflow-x-auto shrink-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full whitespace-nowrap">Épicerie</span>
      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full whitespace-nowrap">Mode</span>
      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full whitespace-nowrap">Quincaillerie</span>
    </div>

    {/* Product List */}
    <div className="flex-1 p-3 sm:p-4 flex flex-col gap-3 overflow-y-auto">
      {/* Item 1 */}
      <div className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded flex items-center justify-center text-orange-600 shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-800 truncate">Riz 50kg</div>
            <div className="text-xs text-slate-500 truncate">Champ perso : Date exp.</div>
          </div>
        </div>
        <div className="text-right shrink-0 ml-2">
          <div className="text-sm font-semibold text-slate-800 whitespace-nowrap">18 000 F</div>
          <div className="text-xs font-medium text-emerald-600 whitespace-nowrap">Stock : 140</div>
        </div>
      </div>

      {/* Item 2 */}
      <div className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-100 rounded flex items-center justify-center text-pink-600 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-800 truncate">Pagne Wax</div>
            <div className="text-xs text-slate-500 truncate">Champ perso : Motif</div>
          </div>
        </div>
        <div className="text-right shrink-0 ml-2">
          <div className="text-sm font-semibold text-slate-800 whitespace-nowrap">6 500 F</div>
          <div className="text-xs font-medium text-blue-600 whitespace-nowrap">Variantes : 12</div>
        </div>
      </div>

      {/* Item 3 */}
      <div className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-slate-600 shrink-0">
            <Box className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-800 truncate">Ciment 50kg</div>
            <div className="text-xs text-slate-500 truncate">Champ perso : Fournis.</div>
          </div>
        </div>
        <div className="text-right shrink-0 ml-2">
          <div className="text-sm font-semibold text-slate-800 whitespace-nowrap">4 500 F</div>
          <div className="text-xs font-medium text-amber-600 whitespace-nowrap">Prix de gros</div>
        </div>
      </div>
    </div>
  </div>
);

const MultiStorePreviewUI = () => (
  <div className="w-full h-full bg-slate-50 border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col font-sans p-3 sm:p-4 gap-3 sm:gap-4 relative">
    {/* Store Selector */}
    <div className="bg-white border border-slate-200 p-3 rounded-lg flex items-center justify-between shadow-sm shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <Store className="w-5 h-5 text-blue-600 shrink-0" />
        <span className="text-sm font-bold text-slate-800 truncate">Boutique Principale</span>
      </div>
      <span className="text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md shrink-0 ml-2">Ouverte</span>
    </div>

    <div className="grid grid-cols-2 gap-3 shrink-0">
      <div className="bg-white border border-slate-200 p-3 rounded-lg flex flex-col gap-1 shadow-sm">
        <span className="text-xs text-slate-500 font-medium truncate">Ventes (Auj.)</span>
        <span className="text-lg font-bold text-slate-800">124</span>
      </div>
      <div className="bg-white border border-slate-200 p-3 rounded-lg flex flex-col gap-1 shadow-sm">
        <span className="text-xs text-slate-500 font-medium truncate">Stock total</span>
        <span className="text-lg font-bold text-slate-800">3,450</span>
      </div>
    </div>

    {/* Secondary Store (Warehouse) */}
    <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm relative overflow-hidden mt-1 shrink-0">
      <div className="absolute top-0 right-0 w-16 h-16 bg-slate-100 rounded-bl-full -mr-8 -mt-8 z-0"></div>
      <div className="relative z-10 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Package className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-sm font-bold text-slate-800 truncate">Dépôt Central</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-rose-700 rounded uppercase shrink-0 ml-2">Staff Restreint</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-500 truncate">Accès Limité</span>
        </div>
      </div>
    </div>

    {/* Transfer Alert */}
    <div className="mt-auto bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-start gap-3 shrink-0">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
        <ArrowRightLeft className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-bold text-slate-800 truncate">Transfert en cours</div>
        <div className="text-xs text-slate-600 mt-1 line-clamp-2">50x Ciment expédiés vers Boutique Principale.</div>
      </div>
    </div>

    {/* Role Indicators */}
    <div className="flex gap-2 shrink-0">
      <div className="flex-1 flex justify-center items-center gap-1.5 py-1.5 border border-emerald-200 bg-emerald-50 rounded-md">
        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
        <span className="text-xs font-semibold text-emerald-700 truncate">Gérant</span>
      </div>
      <div className="flex-1 flex justify-center items-center gap-1.5 py-1.5 border border-slate-200 bg-white rounded-md">
        <div className="w-2 h-2 rounded-full bg-slate-400 shrink-0"></div>
        <span className="text-xs font-semibold text-slate-600 truncate">Caissier</span>
      </div>
    </div>
  </div>
);

export const Features: React.FC = () => {
  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
      {/* NOUVEAU : HEADER DE NAVIGATION STRICTEMENT POUR LA PAGE MARKETING */}
      {/* sticky top-0 permet au menu de rester visible quand on scrolle */}
      <header className="sticky top-0 z-50 w-full flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-sm border-b border-slate-100">
        
        {/* Logo cliquable (Retour Accueil) */}
        <Link to="/" className="flex items-center gap-2 group">
          <Store className="w-6 h-6 text-blue-700 group-hover:opacity-80 transition-opacity" />
          <span className="text-xl font-bold text-blue-700 group-hover:opacity-80 transition-opacity">
            Boutika
          </span>
        </Link>

        {/* Bouton de Connexion */}
        <Link 
          to="/login" 
          className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          Connexion
        </Link>
      </header>

      {/* 1. HERO SECTION (En-tête) */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-20 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6">
          Boutika aide les boutiques indépendantes à gérer leurs ventes.
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto mb-10 leading-relaxed">
          Gérez votre stock, vos factures et vos points de vente de tout secteur, sans aucune compétence informatique complexe.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/register" 
            className="px-8 py-4 text-base font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors shadow-sm"
          >
            Commencer maintenant
          </Link>
          <Link 
            to="/pricing" 
            className="px-8 py-4 text-base font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
          >
            Voir les tarifs
          </Link>
        </div>
      </section>

      {/* 2. SECTION PRINCIPALE (Zig-Zag Layout pour les 2 piliers majeurs) */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Pilier 1 : Catalogue */}
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-24">
          <div className="lg:w-1/2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-700 rounded-lg mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Catalogue produit flexible</h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              Un seul outil qui s'adapte à n'importe quel type de commerce (mode, épicerie, quincaillerie...) grâce à des champs personnalisables, sans reconfiguration lourde.
            </p>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-600" /> Adaptabilité totale</li>
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-600" /> Création de produits en 1 clic</li>
            </ul>
          </div>
          <div className="lg:w-1/2 w-full h-[400px] bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shadow-inner p-4 md:p-6 overflow-hidden">
            <CatalogPreviewUI />
          </div>
        </div>

        {/* Pilier 2 : Multi-boutiques */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 mb-16">
          <div className="lg:w-1/2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-700 rounded-lg mb-6">
              <Store className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Multi-boutiques natif</h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              Gérez plusieurs points de vente depuis un seul compte, dès le tier de base. Le personnel n'a accès qu'à la boutique qui lui est assignée.
            </p>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-600" /> Vues consolidées</li>
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-600" /> Sécurité des accès employés</li>
            </ul>
          </div>
          <div className="lg:w-1/2 w-full h-[400px] bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shadow-inner p-4 md:p-6 overflow-hidden">
             <MultiStorePreviewUI />
          </div>
        </div>
      </section>

      {/* 3. BENTO GRID (Grille moderne pour les 4 autres fonctionnalités) */}
      <section className="bg-slate-50 py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Tout ce dont vous avez besoin pour opérer</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Carte Mobile Money */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <Smartphone className="w-8 h-8 text-blue-600 mb-6" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">Paiement Mobile Money natif</h3>
              <p className="text-slate-600 leading-relaxed">
                Abonnement payable en mobile money, avec activation manuelle en espèces pour les commerçants sans accès en ligne — pas de carte bancaire requise.
              </p>
            </div>

            {/* Carte Inventaire */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <Box className="w-8 h-8 text-blue-600 mb-6" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">Suivi de stock en temps réel</h3>
              <p className="text-slate-600 leading-relaxed">
                Alertes de stock bas par boutique. Mise à jour automatique de l'inventaire à chaque transaction pour éviter les ruptures.
              </p>
            </div>

            {/* Carte Facturation */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <FileText className="w-8 h-8 text-blue-600 mb-6" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">Facturation automatique</h3>
              <p className="text-slate-600 leading-relaxed">
                Une facture au format PDF est générée à chaque vente clôturée, prête à être exportée, imprimée ou partagée.
              </p>
            </div>

            {/* Carte Rapports */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <BarChart3 className="w-8 h-8 text-blue-600 mb-6" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">Rapports de ventes</h3>
              <p className="text-slate-600 leading-relaxed">
                Vue complète de vos performances (jour/semaine/mois), par boutique et de manière consolidée, sans aucun jargon comptable.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialMarquee />

      {/* 4. BOTTOM CTA (Appel à l'action final) */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">
          Prêt à moderniser votre gestion ?
        </h2>
        <p className="text-lg text-slate-500 mb-10">
          Rejoignez les milliers de commerçants qui pilotent leur activité en toute simplicité.
        </p>
        <Link 
          to="/register" 
          className="inline-flex items-center justify-center px-10 py-4 text-base font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-lg"
        >
          Créer mon compte Boutika
        </Link>
      </section>

    </main>
  );
};
