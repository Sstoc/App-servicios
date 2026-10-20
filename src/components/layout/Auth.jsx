import React, { useState, useEffect } from 'react';
import { Card } from '../ui';
import { supabase } from '../../lib/supabase';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Inicializar tiempo restante de bloqueo desde localStorage
  const [lockoutRemaining, setLockoutRemaining] = useState(() => {
    try {
      const lockUntil = Number(localStorage.getItem('auth_lockout_until') || 0);
      const diff = Math.ceil((lockUntil - Date.now()) / 1000);
      return diff > 0 ? diff : 0;
    } catch {
      return 0;
    }
  });

  // Temporizador regresivo si hay bloqueo activo
  useEffect(() => {
    if (lockoutRemaining <= 0) return;

    const timer = setInterval(() => {
      setLockoutRemaining(prev => {
        if (prev <= 1) {
          localStorage.removeItem('auth_lockout_until');
          localStorage.removeItem('auth_failed_attempts');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutRemaining]);

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
    if (lockoutRemaining > 0) return;

    setLoading(true);
    setError('');

    const sanitizedEmail = email.trim().toLowerCase();

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: sanitizedEmail, password });
        if (error) throw error;

        // Login exitoso: limpiar intentos fallidos
        localStorage.removeItem('auth_failed_attempts');
        localStorage.removeItem('auth_lockout_until');
      } else {
        const { data, error } = await supabase.auth.signUp({ email: sanitizedEmail, password });
        if (error) throw error;
        
        // Supabase devuelve identidades vacías si el usuario ya existe (seguridad)
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setError('Este email ya está registrado.');
          return;
        }

        setError('¡Cuenta creada! Revisa tu email para confirmar tu registro.');
      }
    } catch (err) {
      if (isLogin) {
        const currentAttempts = Number(localStorage.getItem('auth_failed_attempts') || 0) + 1;
        if (currentAttempts >= MAX_FAILED_ATTEMPTS) {
          const lockUntil = Date.now() + (LOCKOUT_SECONDS * 1000);
          localStorage.setItem('auth_lockout_until', String(lockUntil));
          localStorage.setItem('auth_failed_attempts', String(MAX_FAILED_ATTEMPTS));
          setLockoutRemaining(LOCKOUT_SECONDS);
          setError(`Demasiados intentos fallidos. Por seguridad, el acceso se bloqueó por ${LOCKOUT_SECONDS} segundos.`);
        } else {
          localStorage.setItem('auth_failed_attempts', String(currentAttempts));
          const left = MAX_FAILED_ATTEMPTS - currentAttempts;
          setError(`${translateError(err)} (Queda${left === 1 ? ' 1 intento' : `n ${left} intentos`} antes del bloqueo temporal).`);
        }
      } else {
        setError(translateError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#F5F7FB] dark:bg-[#090E1D] flex items-center justify-center p-4 overflow-hidden transition-colors duration-300">
      {/* Fondo sutil (adaptable) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-16 bg-[#2563EB]/10 dark:bg-[#1B263B]/50 blur-xl"></div>
        <div className="absolute top-20 left-10 w-40 h-40 bg-[#2563EB]/20 dark:bg-[#3478F6]/20 rounded-full blur-[80px]"></div>
      </div>

      <Card className="w-full max-w-[400px] p-0 overflow-hidden border border-[#E2E8F0] dark:border-[#253149] shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] bg-white dark:bg-[#111A2D] !rounded-3xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="p-8 pb-4 text-center">
          <div className="w-18 h-18 mx-auto mb-5 relative group">
             <img src="/logo-home.png" alt="Logo" className="w-full h-full rounded-2xl object-contain shadow-md relative z-10" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9] tracking-tight leading-none">Home - Servicios</h2>
          <p className="text-[#2563EB] dark:text-[#3478F6] text-[10px] font-bold mt-2 uppercase tracking-[0.2em]">Gestión Inteligente</p>
        </div>

        <form onSubmit={handleAuth} className="p-8 pt-4 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.2em] ml-1">Email</label>
            <input 
              type="email" 
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLogin && lockoutRemaining > 0}
              className="w-full p-3.5 bg-[#EEF2F7] dark:bg-[#1B263B] border border-[#E2E8F0] dark:border-[#253149] rounded-xl focus:border-[#2563EB] dark:focus:border-[#3478F6] focus:ring-2 focus:ring-[#2563EB]/20 dark:focus:ring-[#3478F6]/20 outline-none font-medium text-sm text-[#0F172A] dark:text-[#F1F5F9] transition-colors placeholder:text-[#64748B]/50 dark:placeholder:text-[#94A3B8]/40 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.2em] ml-1">Contraseña</label>
            <div className="relative group">
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLogin && lockoutRemaining > 0}
                className="w-full p-3.5 bg-[#EEF2F7] dark:bg-[#1B263B] border border-[#E2E8F0] dark:border-[#253149] rounded-xl focus:border-[#2563EB] dark:focus:border-[#3478F6] focus:ring-2 focus:ring-[#2563EB]/20 dark:focus:ring-[#3478F6]/20 outline-none font-medium text-sm text-[#0F172A] dark:text-[#F1F5F9] transition-colors placeholder:text-[#64748B]/50 dark:placeholder:text-[#94A3B8]/40 disabled:opacity-50"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLogin && lockoutRemaining > 0}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#2563EB] dark:hover:text-[#F1F5F9] bg-[#E2E8F0]/70 dark:bg-[#253149] hover:bg-[#E2E8F0] dark:hover:bg-[#253149]/80 px-2.5 py-1.5 rounded-lg transition-colors border border-[#E2E8F0] dark:border-[#253149] disabled:opacity-50"
              >
                {showPassword ? 'OCULTAR' : 'VER'}
              </button>
            </div>
          </div>

          {/* Banner de bloqueo por rate limit */}
          {isLogin && lockoutRemaining > 0 && (
            <div className="p-3.5 rounded-xl text-xs font-semibold text-center bg-[#B45309]/10 dark:bg-[#F59E0B]/10 text-[#B45309] dark:text-[#F59E0B] border border-[#B45309]/20 dark:border-[#F59E0B]/20 animate-in slide-in-from-top-2 duration-300 flex items-center justify-center gap-2">
              <i className="fa-solid fa-lock text-sm"></i>
              <span>Acceso bloqueado: esperá <strong>{lockoutRemaining}s</strong> para reintentar</span>
            </div>
          )}
          
          {error && !(isLogin && lockoutRemaining > 0) && (
            <div className={`p-3.5 rounded-xl text-xs font-semibold text-center animate-in slide-in-from-top-2 duration-300 ${error.includes('¡') ? 'bg-[#15803D]/10 text-[#15803D] dark:bg-[#16A765]/10 dark:text-[#16A765] border border-[#15803D]/20 dark:border-[#16A765]/20' : 'bg-[#DC2626]/10 text-[#DC2626] dark:bg-[#F04452]/10 dark:text-[#F04452] border border-[#DC2626]/20 dark:border-[#F04452]/20'}`}>
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3.5 pt-2">
            <button 
              type="submit" 
              disabled={loading || (isLogin && lockoutRemaining > 0)}
              className="bg-[#0F172A] dark:bg-[#1B263B] hover:bg-[#1E293B] dark:hover:bg-[#253149] text-white font-semibold py-3.5 rounded-xl transition-all active:scale-95 border border-[#0F172A] dark:border-[#253149] shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLogin && lockoutRemaining > 0 ? (
                <span className="flex items-center justify-center gap-1.5 text-xs">
                  <i className="fa-solid fa-lock text-xs"></i>
                  {lockoutRemaining}s
                </span>
              ) : loading ? (
                <i className="fa-solid fa-circle-notch animate-spin"></i>
              ) : (
                isLogin ? 'Entrar' : 'Registrarme'
              )}
            </button>
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3478F6] dark:hover:bg-[#2563EB] text-white font-semibold py-3.5 rounded-xl transition-all active:scale-95 shadow-sm text-sm"
            >
              {isLogin ? 'Crear cuenta' : 'Volver'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};
