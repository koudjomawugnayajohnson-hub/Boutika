import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../i18n';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, "Le nom de l'organisation doit contenir au moins 2 caractères"),
  phone: z.string().regex(/^\\+[1-9]\\d{6,14}$/, "Numéro de téléphone invalide (format international requis, ex: +228...)"),
  pin: z.string().regex(/^[0-9]{6}$/, "Le code PIN doit contenir exactement 6 chiffres"),
  confirmPin: z.string()
}).refine((data) => data.pin === data.confirmPin, {
  message: "Les codes PIN ne correspondent pas",
  path: ["confirmPin"],
});

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', pin: '', confirmPin: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { signUpWithPhone } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validation Zod
      const validatedData = registerSchema.parse(formData);
      
      localStorage.setItem('boutika_pending_org_name', validatedData.name);
      await signUpWithPhone(validatedData.phone, validatedData.pin);
      
      // La connexion est automatique après un signUp réussi (sans email/sms confirm)
      // La redirection se fera via le AuthContext (Home) ou ici.
      navigate('/app');
    } catch (err: any) {
      if (err && err.errors && Array.isArray(err.errors)) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((e: any) => {
          if (e.path && e.path[0]) newErrors[e.path[0].toString()] = e.message;
        });
        setErrors(newErrors);
      } else {
        setErrors({ general: err.message || t('auth.registerError') });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
            <span className="material-symbols-rounded text-2xl">storefront</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{t('auth.registerTitle')}</h2>
          <p className="text-gray-500 mt-2">{t('auth.registerSubtitle')}</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          {errors.general && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              {errors.general}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              {t('common.organizationName')}
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={t('common.organizationName')}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de téléphone
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="+228..."
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>
          
          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
              Code PIN (6 chiffres)
            </label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={formData.pin}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors tracking-[0.5em] font-mono text-center ${errors.pin ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="••••••"
            />
            {errors.pin && <p className="mt-1 text-xs text-red-600">{errors.pin}</p>}
          </div>
          
          <div>
            <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le Code PIN
            </label>
            <input
              id="confirmPin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={formData.confirmPin}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors tracking-[0.5em] font-mono text-center ${errors.confirmPin ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="••••••"
            />
            {errors.confirmPin && <p className="mt-1 text-xs text-red-600">{errors.confirmPin}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <span className="material-symbols-rounded animate-spin">progress_activity</span>
            ) : (
              t('auth.registerAction')
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          {t('auth.alreadyHaveAccount')}{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:bg-blue-50 font-medium px-2 py-1 rounded"
          >
            {t('auth.loginTitle')}
          </button>
        </div>
      </div>
    </div>
  );
};
