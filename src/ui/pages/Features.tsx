import React from 'react';
import { Link } from 'react-router-dom';

export const Features: React.FC = () => {
  const features = [
    {
      icon: 'inventory',
      title: 'Zéro Rupture de Stock',
      description: 'Suivi en temps réel de votre inventaire pour ne jamais manquer une vente.',
    },
    {
      icon: 'admin_panel_settings',
      title: 'Contrôle Absolu',
      description: 'Gestion fine des accès employés et sécurisation de vos données sensibles.',
    },
    {
      icon: 'point_of_sale',
      title: 'Encaissement Haute Vitesse',
      description: 'Caisse rapide, interface intuitive et impression de tickets thermiques.',
    },
    {
      icon: 'query_stats',
      title: 'Tableaux de bord consolidés',
      description: 'Pilotez l\'ensemble de vos boutiques (multi-boutiques) avec des statistiques unifiées.',
    }
  ];

  return (
    <div className="bg-surface-container-lowest text-on-surface antialiased min-h-screen flex flex-col font-body-md relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20 flex justify-center items-center">
        <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-br from-primary-fixed to-transparent blur-3xl absolute -top-40 -right-40"></div>
        <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-secondary-container to-transparent blur-3xl absolute -bottom-20 -left-20"></div>
      </div>

      <header className="w-full max-w-container-max mx-auto px-lg md:px-xl py-md flex items-center justify-between z-10 relative">
        <Link to="/" className="text-primary font-title-lg text-title-lg flex items-center gap-xs hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>storefront</span>
          Boutika
        </Link>
        <Link to="/login" className="bg-primary text-on-primary hover:bg-surface-tint transition-colors rounded px-md py-xs text-label-md font-label-md flex items-center justify-center gap-xs shadow-sm">
          Se connecter
        </Link>
      </header>
      
      <main className="w-full max-w-container-max mx-auto px-lg md:px-xl py-xl flex flex-col items-center z-10 relative flex-1">
        <div className="text-center max-w-3xl mb-xl">
          <h1 className="text-headline-lg-mobile md:text-display-lg font-headline-lg-mobile md:font-display-lg text-on-surface mb-md">
            Fonctionnalités clés
          </h1>
          <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Découvrez comment Boutika vous permet d'optimiser chaque aspect de votre activité grâce à des outils pensés pour les commerçants exigeants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg w-full max-w-4xl">
          {features.map((feature, index) => (
            <div key={index} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg flex flex-col items-start gap-md hover:border-primary/50 transition-colors shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center mb-xs group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px]" style={{fontVariationSettings: "'FILL' 1"}}>{feature.icon}</span>
              </div>
              <h3 className="text-title-lg font-title-lg text-on-surface">{feature.title}</h3>
              <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-2xl mb-xl">
          <Link to="/login" className="bg-primary text-on-primary hover:bg-surface-tint transition-colors rounded px-xl py-md text-label-lg font-label-lg flex items-center justify-center gap-sm shadow-md">
            Commencer maintenant
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </main>
    </div>
  );
};
