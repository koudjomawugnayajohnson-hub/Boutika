import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../i18n';
import { z } from 'zod';

const loginSchema = z.object({
  phone: z.string().regex(/^[0-9]{8,10}$/, "Le numéro de téléphone doit contenir entre 8 et 10 chiffres"),
  pin: z.string().regex(/^[0-9]{6}$/, "Le code PIN doit contenir exactement 6 chiffres"),
});

export const Login: React.FC = () => {
  const [formData, setFormData] = useState({ phone: '', pin: '' });
  const [countryCode, setCountryCode] = useState('+228');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signInWithPhone, isAuthenticated, isAdminAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  useEffect(() => {
    if (justLoggedIn) {
      if (isAdminAuthenticated) {
        navigate('/platform-admin');
      } else if (isAuthenticated) {
        navigate('/app');
      }
    }
  }, [isAuthenticated, isAdminAuthenticated, navigate, justLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const validatedData = loginSchema.parse(formData);
      const fullPhone = `${countryCode}${validatedData.phone.replace(/^0+/, '')}`;
      await signInWithPhone(fullPhone, validatedData.pin);
      setJustLoggedIn(true);
    } catch (err: any) {
      if (err.errors && Array.isArray(err.errors)) {
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

  const countryCodes = [
    { code: '+228', label: '🇹🇬 Togo (+228)' },
    { code: '+229', label: '🇧🇯 Bénin (+229)' },
    { code: '+225', label: '🇨🇮 Côte d\'Ivoire (+225)' },
    { code: '+226', label: '🇧🇫 Burkina Faso (+226)' },
    { code: '+227', label: '🇳🇪 Niger (+227)' },
    { code: '+224', label: '🇬🇳 Guinée (+224)' },
    { code: '+221', label: '🇸🇳 Sénégal (+221)' },
    { code: '+223', label: '🇲🇱 Mali (+223)' },
  ];

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center font-body-md relative">
      {/* Header minimaliste */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-center">
        <span className="text-xl font-bold text-primary tracking-tight cursor-pointer" onClick={() => navigate('/')}>
          Boutika
        </span>
        <button 
          onClick={() => navigate('/register')}
          className="text-sm font-medium text-primary hover:underline px-4 py-2 border border-primary/20 rounded-md hover:bg-primary/5 transition-colors"
        >
          Nouveau compte
        </button>
      </header>

      <div className="w-full max-w-[400px] px-sm md:px-0 mt-8">
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
              <div className={`flex bg-surface-container-lowest border rounded-lg focus-within:ring-1 focus-within:ring-primary focus-within:border-transparent overflow-hidden transition-all ${errors.phone ? 'border-error focus-within:ring-error' : 'border-outline-variant'}`}>
                <div className="flex-shrink-0 flex items-center bg-slate-50 border-r border-outline-variant">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="h-full px-2 py-3 bg-transparent text-sm text-on-surface font-medium focus:outline-none cursor-pointer appearance-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%2364748b\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.2rem center', paddingRight: '1.5rem' }}
                  >
                    {countryCodes.map(c => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <input 
                  className="w-full h-12 px-sm bg-transparent text-body-lg font-body-lg text-on-surface placeholder:text-outline focus:outline-none"
                  id="phone" 
                  type="tel" 
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Numéro local"
                  data-testid="login-phone"
                  required 
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-error">{errors.phone}</p>}
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
          </form>
        </div>
      </div>
    </div>
  );
};
