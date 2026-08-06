import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../i18n';

export const Login: React.FC = () => {
  const [step, setStep] = useState<'EMAIL' | 'LINK_SENT'>('EMAIL');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { requestEmailOtp, isAuthenticated, isAdminAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/platform-admin');
    } else if (isAuthenticated) {
      navigate('/app');
    }
  }, [isAuthenticated, isAdminAuthenticated, navigate]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().length > 5 && email.includes('@')) {
      const result = await requestEmailOtp(email);
      if (result.success) {
        setStep('LINK_SENT');
        setError('');
      } else {
        setError(result.error || t('auth.loginError'));
      }
    } else {
      setError(t('auth.loginError'));
    }
  };

  if (step === 'EMAIL') {
    return (
      <div className="bg-surface text-on-surface h-screen flex flex-col items-center justify-center font-body-md">
        <div className="w-full max-w-[400px] px-sm md:px-0">
          <div className="flex items-center justify-center mb-xl">
            <span className="text-headline-md font-headline-md font-bold text-primary tracking-tight">Boutika</span>
          </div>
          
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md md:p-lg flex flex-col gap-lg shadow-sm">
            <div className="flex flex-col gap-xs text-center">
              <h1 className="text-headline-md font-headline-md md:text-headline-lg md:font-headline-lg text-on-surface">Connexion</h1>
              <p className="text-body-md font-body-md text-on-surface-variant max-w-[280px] mx-auto">
                Saisissez votre adresse email pour vous connecter
              </p>
            </div>
            
            {error && <div className="text-error text-center text-label-md font-label-md">{error}</div>}
            
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-sm">
              <div className="flex flex-col gap-base">
                <label className="text-label-md font-label-md text-on-surface-variant uppercase" htmlFor="email">Adresse email</label>
                <div className="relative flex items-center">
                  <input 
                    className="w-full h-12 px-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-body-lg font-body-lg text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@email.com"
                    data-testid="login-email"
                    required 
                  />
                </div>
              </div>
              
              <p className="text-label-md font-label-md text-outline text-center mt-xs">
                {t('auth.termsText')} <a className="text-primary hover:underline" href="#">{t('auth.termsLink')}</a>.
              </p>
              
              <button type="submit" data-testid="login-submit" className="w-full h-12 bg-primary text-on-primary text-title-lg font-title-lg rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-xs mt-sm">
                {t('common.continue')}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>

              <div className="mt-4 text-center">
                <button 
                  type="button" 
                  onClick={() => navigate('/register')}
                  className="text-primary font-label-md text-label-md hover:underline"
                >
                  {t('auth.registerTitle')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // LINK_SENT Step
  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex items-center justify-center">
      <main className="w-full max-w-md p-md md:p-lg">
        <div className="mb-xl text-center">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-sm">Boutika</h1>
          <p className="font-title-lg text-title-lg text-on-surface">Vérifiez votre e-mail</p>
        </div>
        
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mb-md text-on-primary-container">
            <span className="material-symbols-outlined" style={{fontSize: '32px'}}>mark_email_read</span>
          </div>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg">
            Nous avons envoyé un lien magique de connexion à <br/>
            <span className="font-semibold text-on-surface">{email}</span>
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant mb-md">
            Cliquez sur ce lien pour vous connecter automatiquement.
          </p>
          <div className="text-center font-body-md text-body-md text-on-surface-variant mt-sm">
            <p className="mb-xs">Vous n'avez rien reçu ?</p>
            <button 
              type="button" 
              onClick={() => handleEmailSubmit({ preventDefault: () => {} } as React.FormEvent)} 
              className="text-primary font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer mx-auto"
            >
              Renvoyer le lien
            </button>
          </div>
        </div>
        
        <div className="mt-lg text-center">
          <button 
            type="button" 
            onClick={() => setStep('EMAIL')}
            className="text-secondary font-label-md text-label-md hover:text-on-surface transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            {t('auth.backToLogin')}
          </button>
        </div>
      </main>
    </div>
  );
};
