import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { z } from 'zod';
import { Store, Settings, PieChart, Users, Package, HeartHandshake, Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
  phone: z.string().regex(/^\+?[0-9]{6,15}$/, "Numéro de téléphone invalide"),
  pin: z.string().regex(/^[0-9]{6}$/, "Le mot de passe (PIN) doit contenir exactement 6 chiffres"),
  confirmPin: z.string()
}).refine((data) => data.pin === data.confirmPin, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPin"],
});

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', pin: '', confirmPin: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const navigate = useNavigate();
  const { signUpWithPhone } = useAuth();

  const [countryCode, setCountryCode] = useState('+228');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Combine country code and phone number for validation and submission
      const fullPhone = formData.phone.startsWith('+') ? formData.phone : `${countryCode}${formData.phone.replace(/^0+/, '')}`;
      const dataToValidate = { ...formData, phone: fullPhone };
      
      const validatedData = registerSchema.parse(dataToValidate);
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

  const countryCodes = [
    { code: '+228', label: 'TG +228' },
    { code: '+229', label: 'BJ +229' },
    { code: '+225', label: 'CI +225' },
    { code: '+226', label: 'BF +226' },
    { code: '+227', label: 'NE +227' },
    { code: '+224', label: 'GN +224' },
    { code: '+221', label: 'SN +221' },
    { code: '+223', label: 'ML +223' },
  ];

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

        {/* Dashboard Mockup Image */}
        <div className="mt-12 rounded-xl overflow-hidden border border-slate-200 shadow-xl">
           <img src="/dashboard_multiboutique.png" alt="Interface Boutika" className="w-full h-auto object-cover" />
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
                className={`w-full bg-white px-4 py-3.5 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors ${errors.name ? 'border-red-500' : 'border-slate-300'}`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            {/* Numéro de téléphone */}
            <div className={`flex bg-white border rounded-lg focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent overflow-hidden transition-colors ${errors.phone ? 'border-red-500 focus-within:ring-red-500' : 'border-slate-300'}`}>
              <div className="flex-shrink-0 flex items-center bg-slate-50 border-r border-slate-300">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="h-full px-3 py-3.5 bg-transparent text-sm text-slate-900 font-medium focus:outline-none cursor-pointer appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%2364748b\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.2rem center', paddingRight: '1.5rem' }}
                >
                  {countryCodes.map(c => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Numéro de téléphone *"
                className="w-full px-4 py-3.5 bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none"
              />
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
                  className={`w-full bg-white px-4 py-3.5 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors pr-10 ${errors.pin ? 'border-red-500' : 'border-slate-300'}`}
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
                  className={`w-full bg-white px-4 py-3.5 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors pr-10 ${errors.confirmPin ? 'border-red-500' : 'border-slate-300'}`}
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
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-3.5 px-4 rounded-lg transition-colors disabled:opacity-50 mt-6 flex items-center justify-center shadow-sm"
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
};
