import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { z } from 'zod';

const adminLoginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  pin: z.string().regex(/^[0-9]{6}$/, "Le code PIN doit contenir exactement 6 chiffres"),
});

export const PlatformAdminLogin: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', pin: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signInAdminWithEmail, isAdminAuthenticated } = useAuth();

  const [justLoggedIn, setJustLoggedIn] = useState(false);

  useEffect(() => {
    if (justLoggedIn && isAdminAuthenticated) {
      navigate('/platform-admin');
    }
  }, [isAdminAuthenticated, navigate, justLoggedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const validatedData = adminLoginSchema.parse(formData);
      const success = await signInAdminWithEmail(validatedData.email, validatedData.pin);
      if (!success) {
        setError('Identifiants incorrects.');
      } else {
        setJustLoggedIn(true);
      }
    } catch (err: any) {
      if (err && err.errors && Array.isArray(err.errors)) {
        setError(err.errors[0].message);
      } else {
        setError(err.message || 'Erreur de connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-slate-900">
          <ShieldCheck size={48} className="text-slate-800" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Administration
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Espace réservé à l'équipe technique
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email administrateur
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="focus:ring-slate-500 focus:border-slate-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 px-3 border"
                  placeholder="admin@boutika.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-slate-700">
                Code PIN (6 chiffres)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={formData.pin}
                  onChange={handleChange}
                  className="focus:ring-slate-500 focus:border-slate-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 px-3 border font-mono tracking-widest"
                  placeholder="••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50"
              >
                {loading ? 'Vérification...' : 'Se connecter'}
              </button>
            </div>
          </form>
          <div className="mt-6">
            <button
              onClick={() => navigate('/')}
              className="w-full flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 items-center gap-2"
            >
              <ArrowLeft size={16} />
              Retourner à l'accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
