import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Mail, AlertCircle, ArrowLeft } from 'lucide-react';

export const PlatformAdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { requestAdminOtp, isAdminAuthenticated } = useAuth();

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/platform-admin');
    }
  }, [isAdminAuthenticated, navigate]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await requestAdminOtp(email);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la demande.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Portail Administrateur</h1>
          <p className="text-slate-400 mt-2 text-sm text-center">
            Accès restreint. Seuls les administrateurs Boutika sont autorisés.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Autorisé</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="admin@boutika.com"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center"
            >
              {loading ? 'Vérification...' : 'Recevoir le lien de connexion'}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-700">
              <Mail className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Vérifiez votre e-mail</h3>
              <p className="text-slate-400 text-sm">
                Un lien magique a été envoyé à l'adresse <br/>
                <span className="font-semibold text-white">{email}</span>
              </p>
              <p className="text-slate-400 text-sm mt-4">
                Cliquez sur le lien pour vous connecter automatiquement au portail d'administration.
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-slate-400 text-sm hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Changer d'adresse email
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
