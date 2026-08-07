import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TestimonialMarquee } from '../components/TestimonialMarquee';

export const Home: React.FC = () => {
  const { isAuthenticated, isAdminAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Removed auto-redirect so users can see the landing page

  return (
    <div className="bg-surface-container-lowest text-on-surface antialiased min-h-screen flex flex-col justify-center items-center relative overflow-hidden font-body-md">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20 flex justify-center items-center">
        <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-primary-fixed to-transparent blur-3xl absolute -top-40 -left-40"></div>
        <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-secondary-container to-transparent blur-3xl absolute -bottom-20 -right-20"></div>
      </div>
      
      {/* Main Content Container */}
      <main className="w-full max-w-container-max mx-auto px-lg md:px-xl py-xl flex flex-col md:flex-row items-center justify-between z-10 gap-xl relative">
        {/* Left Side: Copy & Actions */}
        <div className="flex-1 flex flex-col items-start justify-center text-left max-w-2xl">
          <div className="mb-sm">
            <span className="text-primary font-title-lg text-title-lg flex items-center gap-xs">
              <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>storefront</span>
              Boutika
            </span>
          </div>
          <h1 className="text-headline-lg-mobile md:text-display-lg font-headline-lg-mobile md:font-display-lg text-on-surface mb-md">
            Gérez votre boutique en toute simplicité.
          </h1>
          <p className="text-body-lg font-body-lg text-on-surface-variant mb-lg max-w-md">
            La plateforme tout-en-un pour les commerçants modernes. Suivez vos ventes, gérez vos stocks et pilotez votre activité avec une interface élégante et intuitive.
          </p>
          <div className="flex flex-col sm:flex-row gap-sm w-full sm:w-auto">
            <Link to="/login" className="bg-primary text-on-primary hover:bg-surface-tint transition-colors rounded px-md py-xs text-label-md font-label-md flex items-center justify-center gap-xs shadow-sm">
              Commencer
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
            <Link to="/fonctionnalites" className="border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors rounded px-md py-xs text-label-md font-label-md flex items-center justify-center gap-xs">
              Découvrir les fonctionnalités
            </Link>
          </div>
          <div className="mt-xl flex items-center gap-md">
            <div className="flex -space-x-2">
              <img className="w-10 h-10 rounded-full border-2 border-surface-container-lowest object-cover" alt="User 1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuu1Xh_P3oTxp53_b5Q5ESA_Ts7gqSE58OufXJK2PrFKpFDubnzp6CL2hGYhPpM5nvRexY8lfAl28J9MZeUFQcr09iK8Btigw8hy8g9NhXlmZ4A8kgDTBSrcB00MwZVjHcI_UiUPdcLWm_2O6yaWl5LcgV09PepsDVm-OmSdsdhO0NeC1YODTk2zd7uVGl1KIRsdmRKe5NPz6_LJuO9AQHy90BTUK4SxswnrLPhn4ecUVcZBvhErPQ" />
              <img className="w-10 h-10 rounded-full border-2 border-surface-container-lowest object-cover" alt="User 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3u3va1r64Tvna2FivdAd7JqU_1Et3mlOtP1VE5fJ72k2aZ7MbtC6ShxAbIDCFsE3POlozUW0iiIRT-LqqZ4SbHoFgcJNoNgWn2-ztWrb6H306DGzHeBcgBMe31k1KZSidVsq8ClAn381bsmAc5g4o4Vy6KfcYkUr33x7Qg_1FQYn_23m_DmrY7-04djIXBMAZebnPgiD7VLYB4Y3JaXpvOHtTCc_chn6xTAC_zUveVwmbQb-diVX3" />
              <img className="w-10 h-10 rounded-full border-2 border-surface-container-lowest object-cover" alt="User 3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCizSE1Ww870ao-SBKCalNjmcz-6PpqEHwHcmClFBYQjlWhAxuLCSmwkZtnK2x4oNRVk91eGJYHw_wqLimskec8H36FLPeIFezk0RKaqRSjP_WL0aPE-SrkrCv7kyFWFVXFMgNL7iksXoFn6EdUUgc4Et6X1tEv1DJXVagywk7xy6CcmGlJRsLMtnsEdi9MY2-lmKWTBaebeVhlyVavJVzln4rpabKIXYyZBEM5PnMS6YJdHcaJ1M92" />
            </div>
            <div className="text-label-md font-label-md text-on-surface-variant">
              Rejoignez des milliers de commerçants.
            </div>
          </div>
        </div>
        
        {/* Right Side: Illustration/Bento */}
        <div className="flex-1 w-full max-w-xl relative">
          {/* Glassmorphism Card Overlay */}
          <div className="absolute -left-md top-10 bg-surface-container-lowest/80 backdrop-blur-md border border-outline-variant rounded-xl p-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-20 hidden md:flex flex-col gap-xs w-48">
            <div className="text-label-md font-label-md text-on-surface-variant uppercase">Ventes du jour</div>
            <div className="text-title-lg font-title-lg text-on-surface">€1,240.50</div>
            <div className="flex items-center text-tertiary-container text-label-md font-label-md gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +14%
            </div>
          </div>
          {/* Main Image Container */}
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-outline-variant aspect-video bg-surface-container relative group">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Un professionnel utilisant Boutika" src="/hero_image.png" fetchPriority="high" />
            {/* Overlay subtle gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          </div>
        </div>
      </main>

      {/* Testimonials */}
      <TestimonialMarquee />
    </div>
  );
};
