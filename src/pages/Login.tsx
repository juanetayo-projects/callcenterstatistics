import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function Login() {
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
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
    else setMessage('Revisa tu correo para restablecer la contraseña.');
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/callcenterstatistics/logo_cacsb2.png" alt="CAC Santa Bárbara" className="h-20 object-contain mb-4" />
          <h1 className="text-xl font-bold text-[#1a5276]">Call Center Statistics</h1>
          <p className="text-sm text-gray-500 mt-1">CAC Santa Bárbara</p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="usuario@cacsantabarbara.co"
              required
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            {error && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>}
            <Button type="submit" loading={loading} className="mt-2 w-full" size="lg">
              Ingresar
            </Button>
            <button
              type="button"
              onClick={() => { setMode('reset'); setError(''); setMessage(''); }}
              className="text-sm text-[#1a5276] hover:underline text-center mt-1"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>
            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="usuario@cacsantabarbara.co"
              required
            />
            {error && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>}
            {message && <p className="text-sm text-green-700 bg-green-50 rounded p-2">{message}</p>}
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Enviar enlace
            </Button>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setMessage(''); }}
              className="text-sm text-[#1a5276] hover:underline text-center"
            >
              ← Volver al inicio de sesión
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
