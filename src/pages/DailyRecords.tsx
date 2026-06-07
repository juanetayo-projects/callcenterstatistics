import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Download, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Layout, PageHeader } from '../components/layout/Layout';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { exportDailyCalls } from '../lib/exportExcel';
import { formatNumber, getYearOptions, MESES } from '../lib/utils';
import type { DailyCall } from '../types';

const EMPTY: Omit<DailyCall, 'id' | 'created_at'> = {
  fecha: new Date().toISOString().slice(0, 10),
  atendidas: 0, expiradas: 0, abandonadas: 0,
  ab_durante_anuncio: 0, transferidas: 0, transf_no_atendidas: 0,
  total: 0, no_atendidas: 0, observaciones: '', user_id: null,
};

export function DailyRecords({ formOnly = false }: { formOnly?: boolean }) {
  const { isAdmin, user } = useAuth();
  const { showToast } = useToast();
  const [records, setRecords] = useState<DailyCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DailyCall | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [search, setSearch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  useEffect(() => { fetchRecords(); }, [filterYear, filterMonth]);

  async function fetchRecords() {
    setLoading(true);
    let q = supabase.from('daily_calls').select('*').order('fecha', { ascending: false });
    if (filterYear) q = q.gte('fecha', `${filterYear}-01-01`).lte('fecha', `${filterYear}-12-31`);
    if (filterMonth && filterYear) {
      const m = filterMonth.padStart(2, '0');
      q = q.gte('fecha', `${filterYear}-${m}-01`).lte('fecha', `${filterYear}-${m}-31`);
    }
    const { data } = await q;
    setRecords(data || []);
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY, user_id: user?.id || null });
    setShowModal(true);
  }

  function openEdit(r: DailyCall) {
    setEditing(r);
    setForm({ fecha: r.fecha, atendidas: r.atendidas, expiradas: r.expiradas, abandonadas: r.abandonadas, ab_durante_anuncio: r.ab_durante_anuncio, transferidas: r.transferidas, transf_no_atendidas: r.transf_no_atendidas, total: r.total, no_atendidas: r.no_atendidas, observaciones: r.observaciones || '', user_id: r.user_id });
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    const payload = { ...form, total: form.atendidas + form.expiradas + form.abandonadas + form.ab_durante_anuncio + form.transferidas, no_atendidas: form.expiradas + form.abandonadas + form.ab_durante_anuncio + form.transf_no_atendidas };
    const { error } = editing
      ? await supabase.from('daily_calls').update(payload).eq('id', editing.id)
      : await supabase.from('daily_calls').insert(payload);
    if (error) showToast(error.message, 'error');
    else { showToast(editing ? 'Registro actualizado' : 'Registro creado', 'success'); setShowModal(false); fetchRecords(); }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este registro?')) return;
    const { error } = await supabase.from('daily_calls').delete().eq('id', id);
    if (error) showToast(error.message, 'error');
    else { showToast('Registro eliminado', 'success'); fetchRecords(); }
  }

  const filtered = records.filter(r =>
    !search || r.fecha.includes(search) || (r.observaciones || '').toLowerCase().includes(search.toLowerCase())
  );

  const years = getYearOptions();

  if (formOnly) {
    return (
      <Layout>
        <PageHeader title="Registro Diario" subtitle="Ingresar datos de llamadas del día" />
        <Card>
          <CardContent>
            <FormFields form={form} setForm={setForm} saving={saving} onSave={handleSave} onCancel={() => setForm({ ...EMPTY })} />
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        title="Datos Diarios"
        subtitle="Gestión de registros diarios de llamadas"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => exportDailyCalls(filtered)}>
              <Download className="h-4 w-4" /> Exportar
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Nuevo
            </Button>
          </div>
        }
      />

      {/* Filtros */}
      <Card className="mb-4">
        <CardContent className="py-3">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <input
                className="pl-8 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0D2D6B] w-48"
                placeholder="Buscar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select
              options={years.map(y => ({ value: y, label: String(y) }))}
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
              placeholder="Año"
              className="w-28"
            />
            <Select
              options={MESES.map((m, i) => ({ value: i + 1, label: m }))}
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              placeholder="Mes"
              className="w-28"
            />
            {(filterYear || filterMonth || search) && (
              <Button variant="ghost" size="sm" onClick={() => { setFilterYear(''); setFilterMonth(''); setSearch(''); }}>
                Limpiar
              </Button>
            )}
            <span className="text-sm text-gray-500 ml-auto">{filtered.length} registros</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0D2D6B] text-white">
                {['Fecha', 'Atendidas', 'Expiradas', 'Abandonadas', 'Ab. Anuncio', 'Transferidas', 'Transf. No At.', 'Total', 'No Atend.', 'Obs.', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="px-4 py-8 text-center text-gray-400">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={11} className="px-4 py-8 text-center text-gray-400">Sin registros</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f0f4f8]'}>
                  <td className="px-4 py-2 font-medium">{r.fecha}</td>
                  <td className="px-4 py-2 text-[#16a34a] font-semibold">{formatNumber(r.atendidas)}</td>
                  <td className="px-4 py-2">{formatNumber(r.expiradas)}</td>
                  <td className="px-4 py-2 text-[#dc2626]">{formatNumber(r.abandonadas)}</td>
                  <td className="px-4 py-2">{formatNumber(r.ab_durante_anuncio)}</td>
                  <td className="px-4 py-2">{formatNumber(r.transferidas)}</td>
                  <td className="px-4 py-2">{formatNumber(r.transf_no_atendidas)}</td>
                  <td className="px-4 py-2 font-semibold">{formatNumber(r.total)}</td>
                  <td className="px-4 py-2 text-[#dc2626]">{formatNumber(r.no_atendidas)}</td>
                  <td className="px-4 py-2 text-gray-500 max-w-[120px] truncate" title={r.observaciones || ''}>{r.observaciones}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(r)} className="p-1 text-[#0D2D6B] hover:bg-blue-50 rounded">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {isAdmin && (
                        <button onClick={() => handleDelete(r.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Registro Diario' : 'Nuevo Registro Diario'}>
        <FormFields form={form} setForm={setForm} saving={saving} onSave={handleSave} onCancel={() => setShowModal(false)} />
      </Modal>
    </Layout>
  );
}

function FormFields({ form, setForm, saving, onSave, onCancel }: {
  form: any; setForm: any; saving: boolean; onSave: () => void; onCancel: () => void;
}) {
  const f = (field: string, value: string) => setForm((p: any) => ({ ...p, [field]: field === 'fecha' || field === 'observaciones' ? value : Number(value) || 0 }));
  const numFields: { key: string; label: string }[] = [
    { key: 'atendidas', label: 'Atendidas' },
    { key: 'expiradas', label: 'Expiradas' },
    { key: 'abandonadas', label: 'Abandonadas' },
    { key: 'ab_durante_anuncio', label: 'Ab. Durante Anuncio' },
    { key: 'transferidas', label: 'Transferidas' },
    { key: 'transf_no_atendidas', label: 'Transf. No Atendidas' },
  ];
  return (
    <div className="flex flex-col gap-4">
      <Input label="Fecha" type="date" value={form.fecha} onChange={e => f('fecha', e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        {numFields.map(({ key, label }) => (
          <Input key={key} label={label} type="number" min={0} value={form[key]} onChange={e => f(key, e.target.value)} />
        ))}
      </div>
      <Input label="Observaciones" value={form.observaciones || ''} onChange={e => f('observaciones', e.target.value)} placeholder="Opcional..." />
      <div className="flex gap-2 justify-end mt-2">
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button loading={saving} onClick={onSave}>Guardar</Button>
      </div>
    </div>
  );
}
