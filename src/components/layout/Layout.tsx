import { type ReactNode, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, CalendarRange,
  Megaphone, Users, FileText, LogOut, RefreshCw,
  ChevronDown, Menu, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BASE = '/callcenterstatistics';

function NavDropdown({ label, icon: Icon, children }: { label: string; icon: any; children: { to: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${open ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
        <Icon className="h-4 w-4" />
        {label}
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl border border-[#e2e8f0] py-1.5 min-w-[200px] z-50"
          style={{ boxShadow: '0 8px 32px rgba(13,45,107,0.15), 0 2px 8px rgba(0,0,0,0.08)' }}>
          <div className="px-3 pb-1.5 mb-1 border-b border-[#e2e8f0]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#0D2D6B]/50">{label}</p>
          </div>
          {children.map(c => (
            <NavLink
              key={c.to}
              to={c.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 mx-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-[#0D2D6B] text-white font-semibold' : 'text-gray-700 hover:bg-[#0D2D6B]/8 hover:text-[#0D2D6B]'}`
              }
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = appUser?.nombres
    ? appUser.nombres.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4f8]">
      {/* Top Navbar */}
      <header style={{ background: 'linear-gradient(135deg, #0D2D6B 0%, #16468E 100%)' }}
        className="sticky top-0 z-40 shadow-lg">
        <div className="flex items-center h-14 px-4 gap-4">
          {/* Logo */}
          <NavLink to={`${BASE}/`} className="flex items-center gap-2 shrink-0">
            <img src="/callcenterstatistics/logo_cacsb_blanc.png" alt="CAC" className="h-8 object-contain" />
            <div className="hidden sm:block">
              <p className="text-white text-xs font-bold leading-tight">Call Center Statistics</p>
              <p className="text-white/50 text-[10px] leading-tight">Rondas de Humanización · Supabase</p>
            </div>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 ml-4">
            <NavLink to={`${BASE}/`} end className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`
            }>
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </NavLink>

            <NavDropdown label="Registros" icon={CalendarDays} children={[
              { to: `${BASE}/registro/diario`, label: 'Registro Diario' },
              { to: `${BASE}/registro/mensual`, label: 'Registro Mensual' },
            ]} />

            <NavDropdown label="Datos" icon={CalendarRange} children={[
              { to: `${BASE}/datos/diario`, label: 'Datos Diarios' },
              { to: `${BASE}/datos/mensual`, label: 'Datos Mensuales' },
            ]} />

            <NavLink to={`${BASE}/campanias`} className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`
            }>
              <Megaphone className="h-4 w-4" /> Campañas
            </NavLink>

            <NavLink to={`${BASE}/reportes`} className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`
            }>
              <FileText className="h-4 w-4" /> Reportes
            </NavLink>

            {isAdmin && (
              <NavLink to={`${BASE}/usuarios`} className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`
              }>
                <Users className="h-4 w-4" /> Usuarios
              </NavLink>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              data-tip="Recargar página"
              onClick={() => window.location.reload()}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors hidden sm:flex"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-white text-xs font-semibold leading-tight">{appUser?.nombres || 'Usuario'}</p>
                  <p className="text-white/60 text-[10px]">{appUser?.profile?.perfil}</p>
                </div>
                <ChevronDown className="h-3 w-3 text-white/60 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[180px] z-50">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">{appUser?.nombres}</p>
                      <p className="text-xs text-gray-500">{appUser?.email}</p>
                    </div>
                    <button
                      onClick={() => { setUserMenuOpen(false); signOut(); }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-1">
            {[
              { to: `${BASE}/`, label: 'Dashboard', end: true },
              { to: `${BASE}/registro/diario`, label: 'Registro Diario' },
              { to: `${BASE}/registro/mensual`, label: 'Registro Mensual' },
              { to: `${BASE}/datos/diario`, label: 'Datos Diarios' },
              { to: `${BASE}/datos/mensual`, label: 'Datos Mensuales' },
              { to: `${BASE}/campanias`, label: 'Campañas' },
              { to: `${BASE}/reportes`, label: 'Reportes' },
              ...(isAdmin ? [{ to: `${BASE}/usuarios`, label: 'Usuarios' }] : []),
            ].map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-white/20 text-white' : 'text-white/80'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1 px-8 py-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
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
