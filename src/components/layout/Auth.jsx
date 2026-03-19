import React, { useState } from 'react';
import { Card, Button } from '../ui';
import { supabase } from '../../lib/supabase';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const translateError = (err) => {
    const msg = err.message || err;
    if (msg.includes('Invalid login credentials')) return 'Email o contraseña incorrectos.';
    if (msg.includes('Email not confirmed')) return 'Debes confirmar tu email antes de entrar.';
    if (msg.includes('Password should be at least 6 characters')) return 'La contraseña debe tener al menos 6 caracteres.';
    if (msg.includes('User already registered')) return 'Este email ya está registrado.';
    if (msg.includes('Error sending confirmation email')) return 'Error al enviar el email de confirmación el servidor esta saturado. Reintenta en unos instantes.';
    if (msg.includes('rate limit')) return 'Demasiados intentos. Espera unos segundos y vuelve a probar.';
    if (msg.includes('Invalid email')) return 'El formato del email no es válido.';
    return msg;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        // Supabase devuelve identidades vacías si el usuario ya existe (seguridad)
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setError('Este email ya está registrado.');
          return;
        }

        setError('¡Cuenta creada! Revisa tu email para confirmar tu registro.');
      }
    } catch (err) {
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-[#0a0c14] flex items-center justify-center p-4 overflow-hidden transition-colors duration-500">
      {/* Fondo que simula la app borrosa (adaptable) */}
      <div className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-16 bg-indigo-500/10 dark:bg-slate-800/50 blur-xl"></div>
        <div className="absolute top-20 left-10 w-40 h-40 bg-indigo-500/20 dark:bg-indigo-500/30 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[100px]"></div>
        <div className="grid grid-cols-2 gap-10 p-20 opacity-20">
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl blur-md"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl blur-md"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl blur-md"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl blur-md"></div>
        </div>
      </div>

      <Card className="w-full max-w-[400px] p-0 overflow-hidden border border-slate-200 dark:border-white/5 shadow-[0_30px_100px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_100px_rgba(0,0,0,0.8)] bg-white/90 dark:bg-[#11141f]/98 backdrop-blur-2xl !rounded-[2.5rem] relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="p-8 pb-4 text-center">
          <div className="w-20 h-20 mx-auto mb-6 relative group">
             <img src="/logo-home.png" alt="Logo" className="w-full h-full rounded-3xl object-contain shadow-2xl relative z-10" />
             <div className="absolute -inset-2 bg-indigo-500/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Home - Servicios</h2>
          <p className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black mt-2 uppercase tracking-[0.2em] opacity-80">Gestión Inteligente</p>
        </div>

        <form onSubmit={handleAuth} className="p-8 pt-4 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-[0.25em] ml-1">Email</label>
            <input 
              type="email" 
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-4 bg-slate-50 dark:bg-[#0a0c14] border border-slate-100 dark:border-white/[0.03] rounded-2xl focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-800 dark:text-white transition-all placeholder:text-slate-300 dark:placeholder:text-white/10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-[0.25em] ml-1">Contraseña</label>
            <div className="relative group">
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-4 bg-slate-50 dark:bg-[#0a0c14] border border-slate-100 dark:border-white/[0.03] rounded-2xl focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-800 dark:text-white transition-all placeholder:text-slate-300 dark:placeholder:text-white/10"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 dark:text-white/30 hover:text-indigo-600 dark:hover:text-white bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 px-3 py-1.5 rounded-xl transition-all border border-slate-200/50 dark:border-white/5"
              >
                {showPassword ? 'OCULTAR' : 'VER'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className={`p-4 rounded-2xl text-xs font-bold text-center animate-in slide-in-from-top-2 duration-300 ${error.includes('¡') ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-100 border border-red-500/20'}`}>
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-slate-900 dark:bg-[#0a0c14] hover:bg-black text-white font-black py-4 rounded-2xl transition-all active:scale-95 border border-white/5 shadow-2xl text-sm disabled:opacity-50"
            >
              {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : (isLogin ? 'Entrar' : 'Registrarme')}
            </button>
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl transition-all active:scale-95 shadow-[0_10px_30px_rgba(79,70,229,0.3)] border border-white/10 text-sm"
            >
              {isLogin ? 'Crear cuenta' : 'Volver'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};
