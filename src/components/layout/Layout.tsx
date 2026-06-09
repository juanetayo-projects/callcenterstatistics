import { type ReactNode, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, CalendarRange,
  Megaphone, Users, FileText, LogOut, RefreshCw,
  ChevronDown, Menu, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BASE = '/callcenterstatistics';

/** Grupo desplegable en el sidebar */
function SideGroup({ label, icon: Icon, children }: { label: string; icon: any; children: { to: string; label: string }[] }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          width: '100%', padding: '8px 12px', borderRadius: '8px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.65)', fontSize: '12px', fontWeight: '600',
          textTransform: 'uppercase', letterSpacing: '0.07em',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'white')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
      >
        <Icon style={{ width: '14px', height: '14px', flexShrink: 0 }} />
        <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
        <ChevronDown style={{
          width: '12px', height: '12px', flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
        }} />
      </button>
      {open && (
        <div style={{ paddingLeft: '12px', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
          {children.map(c => (
            <NavLink
              key={c.to}
              to={c.to}
              style={({ isActive }) => ({
                display: 'block', padding: '7px 12px', borderRadius: '7px',
                fontSize: '13px', fontWeight: isActive ? '600' : '400',
                color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                textDecoration: 'none', transition: 'all 0.15s',
                borderLeft: isActive ? '3px solid rgba(255,255,255,0.7)' : '3px solid transparent',
              })}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                if (!el.style.borderLeft.includes('0.7')) {
                  el.style.backgroundColor = 'rgba(255,255,255,0.08)';
                  el.style.color = 'white';
                }
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                if (!el.style.borderLeft.includes('0.7')) {
                  el.style.backgroundColor = 'transparent';
                  el.style.color = 'rgba(255,255,255,0.6)';
                }
              }}
            >
              {c.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { appUser, isAdmin, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = appUser?.nombres
    ? appUser.nombres.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const sidebarContent = (
    <div style={{
      width: '220px', minHeight: '100vh', flexShrink: 0,
      background: 'linear-gradient(180deg, #0D2D6B 0%, #112e6e 60%, #0a2254 100%)',
      display: 'flex', flexDirection: 'column',
      boxShadow: '4px 0 24px rgba(13,45,107,0.18)',
    }}>
      {/* Logo / Brand */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <NavLink to={`${BASE}/`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <img src="/callcenterstatistics/logo_cacsb_blanc.png" alt="CAC" style={{ height: '38px', objectFit: 'contain' }} />
          <div>
            <p style={{ color: 'white', fontSize: '12px', fontWeight: '700', margin: 0, lineHeight: 1.3 }}>Call Center</p>
            <p style={{ color: 'white', fontSize: '12px', fontWeight: '700', margin: 0, lineHeight: 1.3 }}>Statistics</p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9px', margin: '2px 0 0', lineHeight: 1 }}>Rondas de Humanización</p>
          </div>
        </NavLink>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        {/* Dashboard */}
        <NavLink
          to={`${BASE}/`}
          end
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '9px',
            padding: '9px 12px', borderRadius: '8px',
            fontSize: '13px', fontWeight: isActive ? '700' : '500',
            color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
            backgroundColor: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
            textDecoration: 'none', transition: 'all 0.15s',
          })}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            if (el.style.backgroundColor === 'transparent') {
              el.style.backgroundColor = 'rgba(255,255,255,0.08)';
              el.style.color = 'white';
            }
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            if (!el.style.fontWeight.includes('700')) {
              el.style.backgroundColor = 'transparent';
              el.style.color = 'rgba(255,255,255,0.7)';
            }
          }}
        >
          <LayoutDashboard style={{ width: '15px', height: '15px', flexShrink: 0 }} />
          Dashboard
        </NavLink>

        {/* Separator */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '6px 4px' }} />

        <SideGroup label="Registros" icon={CalendarDays} children={[
          { to: `${BASE}/registro/diario`, label: 'Registro Diario' },
          { to: `${BASE}/registro/mensual`, label: 'Registro Mensual' },
        ]} />

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 4px' }} />

        <SideGroup label="Datos" icon={CalendarRange} children={[
          { to: `${BASE}/datos/diario`, label: 'Datos Diarios' },
          { to: `${BASE}/datos/mensual`, label: 'Datos Mensuales' },
        ]} />

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 4px' }} />

        {/* Campañas */}
        <NavLink
          to={`${BASE}/campanias`}
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '9px',
            padding: '9px 12px', borderRadius: '8px',
            fontSize: '13px', fontWeight: isActive ? '700' : '500',
            color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
            backgroundColor: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
            textDecoration: 'none', transition: 'all 0.15s',
          })}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            if (el.style.backgroundColor === 'transparent') {
              el.style.backgroundColor = 'rgba(255,255,255,0.08)';
              el.style.color = 'white';
            }
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            if (!el.style.fontWeight.includes('700')) {
              el.style.backgroundColor = 'transparent';
              el.style.color = 'rgba(255,255,255,0.7)';
            }
          }}
        >
          <Megaphone style={{ width: '15px', height: '15px', flexShrink: 0 }} />
          Campañas
        </NavLink>

        {/* Reportes */}
        <NavLink
          to={`${BASE}/reportes`}
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '9px',
            padding: '9px 12px', borderRadius: '8px',
            fontSize: '13px', fontWeight: isActive ? '700' : '500',
            color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
            backgroundColor: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
            textDecoration: 'none', transition: 'all 0.15s',
          })}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            if (el.style.backgroundColor === 'transparent') {
              el.style.backgroundColor = 'rgba(255,255,255,0.08)';
              el.style.color = 'white';
            }
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            if (!el.style.fontWeight.includes('700')) {
              el.style.backgroundColor = 'transparent';
              el.style.color = 'rgba(255,255,255,0.7)';
            }
          }}
        >
          <FileText style={{ width: '15px', height: '15px', flexShrink: 0 }} />
          Reportes
        </NavLink>

        {/* Usuarios (admin only) */}
        {isAdmin && (
          <NavLink
            to={`${BASE}/usuarios`}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '9px',
              padding: '9px 12px', borderRadius: '8px',
              fontSize: '13px', fontWeight: isActive ? '700' : '500',
              color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
              backgroundColor: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
              textDecoration: 'none', transition: 'all 0.15s',
            })}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              if (el.style.backgroundColor === 'transparent') {
                el.style.backgroundColor = 'rgba(255,255,255,0.08)';
                el.style.color = 'white';
              }
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              if (!el.style.fontWeight.includes('700')) {
                el.style.backgroundColor = 'transparent';
                el.style.color = 'rgba(255,255,255,0.7)';
              }
            }}
          >
            <Users style={{ width: '15px', height: '15px', flexShrink: 0 }} />
            Usuarios
          </NavLink>
        )}
      </nav>

      {/* User footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '12px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.15)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '12px', fontWeight: '700', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ color: 'white', fontSize: '12px', fontWeight: '600', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {appUser?.nombres || 'Usuario'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {appUser?.profile?.perfil}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              padding: '7px', borderRadius: '7px', background: 'rgba(255,255,255,0.08)',
              border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
              fontSize: '11px', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >
            <RefreshCw style={{ width: '12px', height: '12px' }} />
            Recargar
          </button>
          <button
            onClick={signOut}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              padding: '7px', borderRadius: '7px', background: 'rgba(239,68,68,0.15)',
              border: 'none', cursor: 'pointer', color: 'rgba(252,165,165,0.9)',
              fontSize: '11px', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = 'rgba(252,165,165,0.9)'; }}
          >
            <LogOut style={{ width: '12px', height: '12px' }} />
            Salir
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#f0f4f8' }}>
      <style>{`
        @media (min-width: 768px) {
          .sidebar-desktop { display: flex !important; }
          .mobile-topbar   { display: none !important; }
          .main-content    { margin-top: 0 !important; }
        }
        @media (max-width: 767px) {
          .sidebar-desktop { display: none !important; }
          .mobile-topbar   { display: flex !important; }
          .main-content    { margin-top: 52px !important; }
        }
      `}</style>

      {/* Sidebar desktop */}
      <div className="sidebar-desktop" style={{ display: 'none', flexShrink: 0 }}>
        {sidebarContent}
      </div>

      {/* Mobile: hamburger top bar */}
      <div className="mobile-topbar" style={{
        display: 'none',
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
        background: 'linear-gradient(135deg, #0D2D6B 0%, #16468E 100%)',
        alignItems: 'center', height: '52px', padding: '0 12px', gap: '10px',
        boxShadow: '0 2px 12px rgba(13,45,107,0.25)',
      }}>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '7px', padding: '7px', color: 'white', cursor: 'pointer', display: 'flex' }}
        >
          {mobileOpen ? <X style={{ width: '18px', height: '18px' }} /> : <Menu style={{ width: '18px', height: '18px' }} />}
        </button>
        <img src="/callcenterstatistics/logo_cacsb_blanc.png" alt="CAC" style={{ height: '28px', objectFit: 'contain' }} />
        <span style={{ color: 'white', fontSize: '13px', fontWeight: '700' }}>Call Center Statistics</span>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 45, backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setMobileOpen(false)}
          />
          <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50 }} onClick={() => setMobileOpen(false)}>
            {sidebarContent}
          </div>
        </>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <main
          className="main-content"
          style={{ flex: 1, padding: '28px 36px', maxWidth: '1060px', width: '100%' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: {
  title: string; subtitle?: string; actions?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-6 pb-5 border-b border-[#e2e8f0]">
      <div>
        <h1 className="text-2xl font-bold text-[#0D2D6B] tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 ml-4 shrink-0">{actions}</div>}
    </div>
  );
}
