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
    if (error) setError('Correo o contraseña incorrectos.');
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(160deg, #0d2d4e 0%, #1a5276 60%, #154360 100%)',
      padding: '16px',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      {/* Card contenedor */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
        width: '100%',
        maxWidth: '400px',
        overflow: 'hidden',
      }}>
        {/* Header azul con logo */}
        <div style={{
          background: 'linear-gradient(135deg, #1a5276 0%, #2980b9 100%)',
          padding: '32px 32px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}>
          <img
            src="/callcenterstatistics/logo_cacsb_blanc.png"
            alt="CAC Santa Bárbara"
            style={{ height: '56px', width: 'auto', objectFit: 'contain' }}
          />
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: 'white', fontSize: '18px', fontWeight: '700', margin: 0, letterSpacing: '0.3px' }}>
              Call Center Statistics
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '4px 0 0' }}>
              Clínica de Alta Complejidad Santa Bárbara
            </p>
          </div>
        </div>

        {/* Body del card */}
        <div style={{ padding: '28px 32px 32px' }}>
          {mode === 'login' ? (
            <>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a5276', marginBottom: '20px', textAlign: 'center' }}>
                Iniciar Sesión
              </h2>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>
                    Correo electrónico
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9ca3af' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="usuario@cacsantabarbara.co"
                      required
                      style={{
                        width: '100%', paddingLeft: '40px', paddingRight: '16px',
                        paddingTop: '11px', paddingBottom: '11px',
                        borderRadius: '8px', border: '1.5px solid #e2e8f0',
                        fontSize: '14px', color: '#2d3748', outline: 'none',
                        backgroundColor: '#f8fafc', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>
                    Contraseña
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9ca3af' }} />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{
                        width: '100%', paddingLeft: '40px', paddingRight: '44px',
                        paddingTop: '11px', paddingBottom: '11px',
                        borderRadius: '8px', border: '1.5px solid #e2e8f0',
                        fontSize: '14px', color: '#2d3748', outline: 'none',
                        backgroundColor: '#f8fafc', boxSizing: 'border-box',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}
                    >
                      {showPass ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div style={{ backgroundColor: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#c53030' }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '8px',
                    background: loading ? '#7fb3d3' : 'linear-gradient(135deg, #1a5276 0%, #2980b9 100%)',
                    color: 'white', fontWeight: '700', fontSize: '15px',
                    border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'opacity 0.2s',
                  }}
                >
                  {loading && (
                    <svg style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  )}
                  {loading ? 'Ingresando...' : 'Ingresar'}
                </button>

                <button
                  type="button"
                  onClick={() => { setMode('reset'); setError(''); setMessage(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2980b9', fontSize: '13px', textDecoration: 'underline', textAlign: 'center' }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </form>
            </>
          ) : (
            <>
              <button
                onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#718096', fontSize: '13px', marginBottom: '16px', padding: 0 }}
              >
                <ArrowLeft style={{ width: '14px', height: '14px' }} /> Volver al inicio de sesión
              </button>

              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a5276', marginBottom: '8px' }}>
                Recuperar contraseña
              </h2>
              <p style={{ fontSize: '13px', color: '#718096', marginBottom: '20px', lineHeight: '1.5' }}>
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Correo electrónico</label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9ca3af' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="usuario@cacsantabarbara.co"
                      required
                      style={{
                        width: '100%', paddingLeft: '40px', paddingRight: '16px',
                        paddingTop: '11px', paddingBottom: '11px',
                        borderRadius: '8px', border: '1.5px solid #e2e8f0',
                        fontSize: '14px', color: '#2d3748', outline: 'none',
                        backgroundColor: '#f8fafc', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {error && (
                  <div style={{ backgroundColor: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#c53030' }}>
                    {error}
                  </div>
                )}
                {message && (
                  <div style={{ backgroundColor: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#276749' }}>
                    ✓ {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !!message}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '8px',
                    background: (loading || !!message) ? '#7fb3d3' : 'linear-gradient(135deg, #1a5276 0%, #2980b9 100%)',
                    color: 'white', fontWeight: '700', fontSize: '15px',
                    border: 'none', cursor: (loading || !!message) ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '0 32px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: '#a0aec0', margin: 0 }}>
            © {new Date().getFullYear()} Clínica Santa Bárbara — Sistema Interno
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
