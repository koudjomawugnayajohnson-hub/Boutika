import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../i18n';
import { z } from 'zod';

const loginSchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{6,14}$/, "Numéro de téléphone invalide (format international requis, ex: +228...)"),
  pin: z.string().regex(/^[0-9]{6}$/, "Le code PIN doit contenir exactement 6 chiffres"),
});

export const Login: React.FC = () => {
  const [formData, setFormData] = useState({ phone: '', pin: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signInWithPhone, isAuthenticated, isAdminAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/platform-admin');
    } else if (isAuthenticated) {
      navigate('/app');
    }
  }, [isAuthenticated, isAdminAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const validatedData = loginSchema.parse(formData);
      await signInWithPhone(validatedData.phone, validatedData.pin);
      // Redirection automatique gérée par useEffect
    } catch (err: any) {
      if (err && err.errors && Array.isArray(err.errors)) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((e: any) => {
          if (e.path && e.path[0]) newErrors[e.path[0].toString()] = e.message;
        });
        setErrors(newErrors);
      } else {
        setErrors({ general: err.message || t('auth.loginError') });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

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
              Saisissez votre numéro de téléphone et votre code PIN
            </p>
          </div>
          
          {errors.general && <div className="text-error text-center text-label-md font-label-md">{errors.general}</div>}
          
          <form onSubmit={handleLogin} className="flex flex-col gap-sm">
            <div className="flex flex-col gap-base">
              <label className="text-label-md font-label-md text-on-surface-variant uppercase" htmlFor="phone">Numéro de téléphone</label>
              <div className="relative flex flex-col">
                <input 
                  className={`w-full h-12 px-sm rounded-lg border bg-surface-container-lowest text-body-lg font-body-lg text-on-surface placeholder:text-outline focus:ring-1 focus:outline-none transition-all ${errors.phone ? 'border-error focus:border-error focus:ring-error' : 'border-outline-variant focus:border-primary focus:ring-primary'}`}
                  id="phone" 
                  type="tel" 
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+228..."
                  data-testid="login-phone"
                  required 
                />
                {errors.phone && <p className="mt-1 text-xs text-error">{errors.phone}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-base mt-2">
              <label className="text-label-md font-label-md text-on-surface-variant uppercase" htmlFor="pin">Code PIN (6 chiffres)</label>
              <div className="relative flex flex-col">
                <input 
                  className={`w-full h-12 px-sm rounded-lg border bg-surface-container-lowest text-body-lg font-body-lg text-on-surface placeholder:text-outline focus:ring-1 focus:outline-none transition-all tracking-[0.5em] font-mono text-center ${errors.pin ? 'border-error focus:border-error focus:ring-error' : 'border-outline-variant focus:border-primary focus:ring-primary'}`}
                  id="pin" 
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={formData.pin}
                  onChange={handleChange}
                  placeholder="••••••"
                  data-testid="login-pin"
                  required 
                />
                {errors.pin && <p className="mt-1 text-xs text-error">{errors.pin}</p>}
              </div>
            </div>
            
            <p className="text-label-md font-label-md text-outline text-center mt-xs">
              {t('auth.termsText')} <a className="text-primary hover:underline" href="#">{t('auth.termsLink')}</a>.
            </p>
            
            <button type="submit" disabled={isLoading} data-testid="login-submit" className="w-full h-12 bg-primary text-on-primary text-title-lg font-title-lg rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-xs mt-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <>
                  {t('common.continue')}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
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
};
