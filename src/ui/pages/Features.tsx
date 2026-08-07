import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Store, Smartphone, BarChart3, FileText, Layers, CheckCircle } from 'lucide-react';

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
          <div className="lg:w-1/2 w-full h-[400px] bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shadow-inner">
            {/* Placeholder Visuel */}
            <span className="text-slate-400 font-medium">[Visuel : Interface du catalogue produit]</span>
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
          <div className="lg:w-1/2 w-full h-[400px] bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shadow-inner">
             {/* Placeholder Visuel */}
             <span className="text-slate-400 font-medium">[Visuel : Dashboard avec carte multi-boutiques]</span>
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
