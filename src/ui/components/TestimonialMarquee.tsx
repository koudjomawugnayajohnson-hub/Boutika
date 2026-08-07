import React from 'react';
import { Star } from 'lucide-react';

export const TestimonialMarquee: React.FC = () => {
  const testimonials = [
    {
      name: "Ousmane D.",
      role: "Grossiste Import-Export",
      text: "Depuis Boutika, finies les pertes inexpliquées dans l'entrepôt. Le contrôle d'accès par code PIN pour mon staff est une vraie révolution."
    },
    {
      name: "Aminata S.",
      role: "Gérante de 3 Pharmacies",
      text: "Je pilote mes trois points de vente depuis mon téléphone. Les rapports consolidés me font gagner des heures chaque semaine."
    },
    {
      name: "Ibrahim T.",
      role: "Propriétaire de Supermarché",
      text: "La caisse est ultra-rapide. Les clients n'attendent plus, et le ticket thermique sort instantanément. Un outil de niveau entreprise."
    },
    {
      name: "Fatoumata K.",
      role: "Boutique de Prêt-à-porter",
      text: "Le catalogue s'est adapté à mes tailles et couleurs en quelques clics. Enfin un logiciel pensé pour les commerçants, pas pour les informaticiens."
    }
  ];

  // On double le tableau pour créer l'illusion d'une boucle infinie fluide
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="w-full py-16 bg-slate-50 border-t border-slate-100 overflow-hidden flex flex-col justify-center">
      
      <div className="max-w-5xl mx-auto px-6 text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
          Ils ont repris le contrôle de leur commerce
        </h2>
        <p className="text-slate-500">
          Rejoignez le réseau des commerçants qui accélèrent leur croissance.
        </p>
      </div>

      {/* Zone de défilement (Marquee) */}
      <div className="relative flex w-full overflow-hidden bg-slate-50 py-4">
        
        {/* Les masques dégradés sur les bords pour fondre le texte (Effet Premium) */}
        <div className="absolute top-0 left-0 z-10 w-16 md:w-24 h-full bg-gradient-to-r from-slate-50 to-transparent"></div>
        <div className="absolute top-0 right-0 z-10 w-16 md:w-24 h-full bg-gradient-to-l from-slate-50 to-transparent"></div>

        {/* Le conteneur animé */}
        <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused]">
          {duplicatedTestimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="w-[85vw] max-w-[320px] md:w-96 mx-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm whitespace-normal flex-shrink-0"
            >
              <div className="flex items-center mb-4">
                {/* 5 Étoiles jaunes */}
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 italic mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>
              <div>
                <p className="font-bold text-slate-900">{testimonial.name}</p>
                <p className="text-sm text-slate-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
