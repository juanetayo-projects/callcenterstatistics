import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Login() {
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Correo o contraseña incorrectos. Intenta nuevamente.');
    }
    setLoading(false);
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/callcenterstatistics/reset-password`,
    });
    if (error) setError(error.message);
    else setMessage('Enlace enviado. Revisa tu bandeja de entrada.');
    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'linear-gradient(160deg, #0d2d4e 0%, #1a5276 60%, #154360 100%)' }}
    >
      {/* Logo área */}
      <div className="flex flex-col items-center mb-8">
        <img
          src="/callcenterstatistics/logo_cacsb_blanc.png"
          alt="CAC Santa Bárbara"
          className="h-24 object-contain mb-4 drop-shadow-lg"
        />
        <h1 className="text-white text-2xl font-bold tracking-wide">Call Center Statistics</h1>
        <p className="text-white/60 text-sm mt-1">Clínica de Alta Complejidad Santa Bárbara</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        {mode === 'login' ? (
          <>
            <h2 className="text-center text-xl font-bold text-[#1a5276] mb-6">Iniciar Sesión</h2>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="usuario@cacsantabarbara.co"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276] focus:border-transparent bg-gray-50"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276] focus:border-transparent bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-[#1a5276] hover:bg-[#154360] text-white font-semibold text-sm transition-colors mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                Ingresar
              </button>

              <button
                type="button"
                onClick={() => { setMode('reset'); setError(''); setMessage(''); }}
                className="text-center text-sm text-[#1a5276] hover:text-[#154360] hover:underline mt-1"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>
          </>
        ) : (
          <>
            <button
              onClick={() => { setMode('login'); setError(''); setMessage(''); }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#1a5276] mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Volver
            </button>

            <h2 className="text-xl font-bold text-[#1a5276] mb-1">Recuperar contraseña</h2>
            <p className="text-sm text-gray-500 mb-5">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="usuario@cacsantabarbara.co"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276] focus:border-transparent bg-gray-50"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              {message && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !!message}
                className="w-full py-3 rounded-lg bg-[#1a5276] hover:bg-[#154360] text-white font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                Enviar enlace
              </button>
            </form>
          </>
        )}
      </div>

      {/* Footer */}
      <p className="text-white/40 text-xs mt-8">
        © {new Date().getFullYear()} Clínica Santa Bárbara — Sistema Interno
      </p>
    </div>
  );
}
