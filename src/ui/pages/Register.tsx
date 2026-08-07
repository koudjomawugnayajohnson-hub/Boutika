import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { z } from 'zod';
import { Store, Settings, PieChart, Users, Package, HeartHandshake, Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse courriel invalide").optional().or(z.literal('')),
  phone: z.string().regex(/^\+?[0-9]{6,15}$/, "Numéro de téléphone invalide"),
  pin: z.string().regex(/^[0-9]{6}$/, "Le mot de passe (PIN) doit contenir exactement 6 chiffres"),
  confirmPin: z.string()
}).refine((data) => data.pin === data.confirmPin, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPin"],
});

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', pin: '', confirmPin: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const navigate = useNavigate();
  const { signUpWithPhone } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const validatedData = registerSchema.parse(formData);
      localStorage.setItem('boutika_pending_org_name', validatedData.name);
      
      // The current backend system uses Phone and PIN
      await signUpWithPhone(validatedData.phone, validatedData.pin);
      
      navigate('/app');
    } catch (err: any) {
      if (err && err.errors && Array.isArray(err.errors)) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((e: any) => {
          if (e.path && e.path[0]) newErrors[e.path[0].toString()] = e.message;
        });
        setErrors(newErrors);
      } else {
        setErrors({ general: err.message || "Une erreur est survenue lors de l'inscription." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white font-sans text-slate-800">
      
      {/* Left Section (Hero / Info) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#F8FAFC] border-r border-slate-200 flex-col justify-center px-12 xl:px-24">
        
        <div className="mb-12 flex items-center gap-2">
          <Store className="w-8 h-8 text-slate-800" />
          <span className="text-2xl font-bold text-slate-900 tracking-tight">Boutika</span>
        </div>

        <h1 className="text-4xl xl:text-5xl font-bold text-slate-900 leading-tight mb-6">
          Gérez votre boutique avec élégance et précision
        </h1>
        
        <p className="text-lg text-slate-600 mb-12 max-w-lg leading-relaxed">
          Une plateforme complète pour centraliser vos opérations, de la gestion des stocks à la relation client. Activez les modules selon vos besoins.
        </p>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-y-8 gap-x-4">
          <div className="flex items-center gap-3 font-semibold text-slate-800">
            <PieChart className="w-5 h-5 text-slate-700" /> Ventes
          </div>
          <div className="flex items-center gap-3 font-semibold text-slate-800">
            <Store className="w-5 h-5 text-slate-700" /> Comptabilité
          </div>
          <div className="flex items-center gap-3 font-semibold text-slate-800">
            <Settings className="w-5 h-5 text-slate-700" /> Opérations
          </div>
          <div className="flex items-center gap-3 font-semibold text-slate-800">
            <Users className="w-5 h-5 text-slate-700" /> GRH
          </div>
          <div className="flex items-center gap-3 font-semibold text-slate-800">
            <Package className="w-5 h-5 text-slate-700" /> Inventaire
          </div>
          <div className="flex items-center gap-3 font-semibold text-slate-800">
            <HeartHandshake className="w-5 h-5 text-slate-700" /> CRM
          </div>
        </div>
      </div>

      {/* Right Section (Form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[440px]">
          
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Créer un compte</h2>

          <form onSubmit={handleRegister} className="space-y-4">
            {errors.general && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
                {errors.general}
              </div>
            )}

            {/* Nom de l'entreprise */}
            <div>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nom de l'entreprise *"
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors ${errors.name ? 'border-red-500' : 'border-slate-300'}`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            {/* Adresse courriel */}
            <div>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Adresse courriel *"
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors ${errors.email ? 'border-red-500' : 'border-slate-300'}`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Numéro de téléphone */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center justify-center px-3 border border-r-0 border-slate-300 rounded-l-md bg-white text-sm text-slate-600">
                <span className="font-medium mr-1">TG</span> +228
              </div>
              <div className="relative w-full">
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Numéro de téléphone *"
                  className={`w-full px-4 py-3 border rounded-r-md focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors ${errors.phone ? 'border-red-500' : 'border-slate-300'}`}
                />
              </div>
            </div>
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}

            {/* Mot de passe (PIN) */}
            <div className="relative">
              <input
                name="pin"
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={6}
                value={formData.pin}
                onChange={handleChange}
                placeholder="Mot de passe (PIN à 6 chiffres) *"
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors pr-10 ${errors.pin ? 'border-red-500' : 'border-slate-300'}`}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.pin && <p className="mt-1 text-xs text-red-600">{errors.pin}</p>}

            {/* Confirmer Mot de passe (PIN) */}
            <div className="relative">
              <input
                name="confirmPin"
                type={showConfirmPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={6}
                value={formData.confirmPin}
                onChange={handleChange}
                placeholder="Confirmer le mot de passe *"
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors pr-10 ${errors.confirmPin ? 'border-red-500' : 'border-slate-300'}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPin(!showConfirmPin)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showConfirmPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPin && <p className="mt-1 text-xs text-red-600">{errors.confirmPin}</p>}

            <p className="text-sm text-slate-500 mt-4 leading-relaxed">
              En vous inscrivant, vous acceptez les <a href="#" className="font-medium text-slate-700 hover:underline">conditions générales</a> et la <a href="#" className="font-medium text-slate-700 hover:underline">politique de confidentialité de Boutika</a>.
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#475569] hover:bg-[#334155] text-white font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50 mt-6 flex items-center justify-center shadow-sm"
            >
              {isLoading ? (
                <span className="material-symbols-rounded animate-spin">progress_activity</span>
              ) : (
                "Commencer gratuitement"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-slate-600">
            Vous avez un compte ?{' '}
            <Link to="/login" className="font-bold text-slate-700 hover:underline">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};>
      </div>
    </div>
  );
};
