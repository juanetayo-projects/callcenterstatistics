import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, CalendarRange,
  Megaphone, Users, FileText, LogOut, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

const BASE = '/callcenterstatistics';

const navItems = [
  { to: `${BASE}/`, label: 'Dashboard', icon: LayoutDashboard },
  { to: `${BASE}/registro/diario`, label: 'Registro Diario', icon: CalendarDays },
  { to: `${BASE}/registro/mensual`, label: 'Registro Mensual', icon: CalendarRange },
  { to: `${BASE}/datos/diario`, label: 'Datos Diarios', icon: CalendarDays },
  { to: `${BASE}/datos/mensual`, label: 'Datos Mensuales', icon: CalendarRange },
  { to: `${BASE}/campanias`, label: 'Campañas', icon: Megaphone },
  { to: `${BASE}/reportes`, label: 'Reportes', icon: FileText },
];

const adminItems = [
  { to: `${BASE}/usuarios`, label: 'Usuarios', icon: Users },
];

export function Sidebar() {
  const { isAdmin, signOut, appUser } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      'flex flex-col bg-[#1a5276] text-white transition-all duration-300 min-h-screen shrink-0',
      collapsed ? 'w-16' : 'w-60',
    )}>
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/20">
        {!collapsed && (
          <img src="/callcenterstatistics/logo_cacsb_blanc.png" alt="CAC" className="h-9 object-contain" />
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="text-white/80 hover:text-white">
          {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === `${BASE}/`}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
              isActive
                ? 'bg-white/20 text-white font-medium'
                : 'text-white/75 hover:bg-white/10 hover:text-white',
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className={cn('mt-3 mb-1 px-3 text-xs font-semibold text-white/40 uppercase', collapsed && 'hidden')}>
              Administración
            </div>
            {adminItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-white/20 text-white font-medium'
                    : 'text-white/75 hover:bg-white/10 hover:text-white',
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/20 px-3 py-3">
        {!collapsed && (
          <p className="text-xs text-white/60 mb-2 truncate">{appUser?.nombres || 'Usuario'}</p>
        )}
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm text-white/75 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
