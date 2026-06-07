import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Key, User, Mail, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Layout, PageHeader } from '../components/layout/Layout';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal, FormSection } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import type { AppUser, Profile } from '../types';

export function Users() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ nombres: '', email: '', telefono: '', password: '', profile_id: 1 });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [uRes, pRes] = await Promise.all([
      supabase.from('app_users').select('*, profile:profiles(*)').order('nombres'),
      supabase.from('profiles').select('*'),
    ]);
    setUsers(uRes.data || []);
    setProfiles(pRes.data || []);
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    if (editing) {
      const { error } = await supabase.from('app_users').update({ nombres: form.nombres, telefono: form.telefono, profile_id: form.profile_id }).eq('id', editing.id);
      if (error) showToast(error.message, 'error');
      else { showToast('Usuario actualizado', 'success'); setShowModal(false); fetchAll(); }
    } else {
      const { data, error } = await supabase.auth.admin.createUser({ email: form.email, password: form.password, email_confirm: true });
      if (error) { showToast(error.message, 'error'); setSaving(false); return; }
      await supabase.from('app_users').insert({ id: data.user.id, nombres: form.nombres, email: form.email, telefono: form.telefono, profile_id: form.profile_id });
      showToast('Usuario creado', 'success');
      setShowModal(false);
      fetchAll();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este usuario?')) return;
    await supabase.from('app_users').delete().eq('id', id);
    showToast('Usuario eliminado', 'success');
    fetchAll();
  }

  async function handleReset() {
    setSaving(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/callcenterstatistics/reset-password`,
    });
    if (error) showToast(error.message, 'error');
    else { setResetSent(true); showToast('Enlace de recuperación enviado', 'success'); }
    setSaving(false);
  }

  const filtered = users.filter(u => !search || u.nombres.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      <PageHeader
        title="Usuarios"
        subtitle="Gestión de usuarios y permisos"
        actions={
          <Button size="sm" onClick={() => {
            setEditing(null);
            setForm({ nombres: '', email: '', telefono: '', password: '', profile_id: profiles[0]?.id || 1 });
            setShowModal(true);
          }}>
            <Plus className="h-4 w-4" /> Nuevo Usuario
          </Button>
        }
      />

      <Card className="mb-4">
        <CardContent className="py-3">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <input className="pl-8 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0D2D6B] focus:bg-white w-56" placeholder="Buscar por nombre o email..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Button variant="outline" size="sm" onClick={() => { setResetEmail(''); setResetSent(false); setShowResetModal(true); }}>
              <Key className="h-4 w-4" /> Recuperar Contraseña
            </Button>
            <span className="text-sm text-gray-500 ml-auto">{filtered.length} usuarios</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0D2D6B] text-white">
                {['Nombre', 'Email', 'Teléfono', 'Perfil', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Cargando...</td></tr>
                : filtered.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Sin usuarios</td></tr>
                : filtered.map((u, i) => (
                  <tr key={u.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f0f4f8]'}>
                    <td className="px-4 py-2 font-medium">{u.nombres}</td>
                    <td className="px-4 py-2 text-gray-500">{u.email}</td>
                    <td className="px-4 py-2">{u.telefono}</td>
                    <td className="px-4 py-2">
                      <Badge variant={u.profile?.perfil === 'Administrador' ? 'info' : 'neutral'}>
                        {u.profile?.perfil || 'Sin perfil'}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditing(u); setForm({ nombres: u.nombres, email: u.email, telefono: u.telefono, password: '', profile_id: u.profile_id }); setShowModal(true); }} className="p-1 text-[#0D2D6B] hover:bg-blue-50 rounded"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDelete(u.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal usuario */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Editar Usuario' : 'Nuevo Usuario'}
        subtitle={editing ? `Modificando datos de ${editing.nombres}` : 'Complete los datos para crear el acceso'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button loading={saving} onClick={handleSave}>
              {editing ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <div className="space-y-3">
            <FormSection icon={User} label="Datos personales" />
            <Input label="Nombre completo" value={form.nombres} onChange={e => setForm(p => ({ ...p, nombres: e.target.value }))} placeholder="Nombre y apellido" />
            <Input label="Teléfono" value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))} placeholder="Opcional" />
          </div>

          {!editing && (
            <div className="space-y-3">
              <FormSection icon={Mail} label="Acceso al sistema" />
              <Input label="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="correo@ejemplo.com" />
              <Input label="Contraseña inicial" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Mínimo 6 caracteres" />
            </div>
          )}

          <div className="space-y-3">
            <FormSection icon={Shield} label="Permisos" />
            <Select label="Perfil de acceso" options={profiles.map(p => ({ value: p.id, label: p.perfil }))} value={form.profile_id} onChange={e => setForm(p => ({ ...p, profile_id: Number(e.target.value) }))} />
          </div>
        </div>
      </Modal>

      {/* Modal recuperar contraseña */}
      <Modal
        open={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Recuperar Contraseña"
        subtitle="Se enviará un enlace de restablecimiento al correo"
        footer={
          !resetSent ? (
            <>
              <Button variant="ghost" onClick={() => setShowResetModal(false)}>Cancelar</Button>
              <Button loading={saving} onClick={handleReset}>Enviar enlace</Button>
            </>
          ) : (
            <Button onClick={() => setShowResetModal(false)}>Cerrar</Button>
          )
        }
      >
        {resetSent ? (
          <div className="py-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Key className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-green-700 font-medium mb-1">Enlace enviado correctamente</p>
            <p className="text-sm text-gray-500">Revisa el correo de <strong>{resetEmail}</strong></p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Ingresa el email del usuario para enviarle un enlace de recuperación de contraseña.</p>
            <Input label="Email del usuario" type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="correo@ejemplo.com" />
          </div>
        )}
      </Modal>
    </Layout>
  );
}
