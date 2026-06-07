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
import { exportMonthlyCalls } from '../lib/exportExcel';
import { formatNumber, formatPercent, getYearOptions, MESES } from '../lib/utils';
import type { MonthlyCall } from '../types';

const EMPTY = {
  anio: new Date().getFullYear(),
  mes: 'ENE', mes_numero: 1,
  tot_llamadas: 0, entrantes: 0, atendidas: 0, pct_atendidas: 0,
  no_atendidas: 0, pct_no_atendidas: 0, salientes: 0, validas: 0,
  nivel_atencion: 0, observaciones: '', user_id: null as string | null,
};

export function MonthlyRecords({ formOnly = false }: { formOnly?: boolean }) {
  const { isAdmin, user } = useAuth();
  const { showToast } = useToast();
  const [records, setRecords] = useState<MonthlyCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<MonthlyCall | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchRecords(); }, [filterYear, filterMonth]);

  async function fetchRecords() {
    setLoading(true);
    let q = supabase.from('monthly_calls').select('*').order('anio', { ascending: false }).order('mes_numero');
    if (filterYear) q = q.eq('anio', Number(filterYear));
    if (filterMonth) q = q.eq('mes_numero', Number(filterMonth));
    const { data } = await q;
    setRecords(data || []);
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY, user_id: user?.id || null });
    setShowModal(true);
  }

  function openEdit(r: MonthlyCall) {
    setEditing(r);
    setForm({ anio: r.anio, mes: r.mes, mes_numero: r.mes_numero, tot_llamadas: r.tot_llamadas, entrantes: r.entrantes, atendidas: r.atendidas, pct_atendidas: r.pct_atendidas, no_atendidas: r.no_atendidas, pct_no_atendidas: r.pct_no_atendidas, salientes: r.salientes, validas: r.validas, nivel_atencion: r.nivel_atencion, observaciones: r.observaciones || '', user_id: r.user_id });
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      ...form,
      mes: MESES[form.mes_numero - 1],
      pct_atendidas: form.tot_llamadas > 0 ? (form.atendidas / form.tot_llamadas) * 100 : 0,
      pct_no_atendidas: form.tot_llamadas > 0 ? (form.no_atendidas / form.tot_llamadas) * 100 : 0,
    };
    const { error } = editing
      ? await supabase.from('monthly_calls').update(payload).eq('id', editing.id)
      : await supabase.from('monthly_calls').insert(payload);
    if (error) showToast(error.message, 'error');
    else { showToast(editing ? 'Registro actualizado' : 'Registro creado', 'success'); setShowModal(false); fetchRecords(); }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este registro?')) return;
    const { error } = await supabase.from('monthly_calls').delete().eq('id', id);
    if (error) showToast(error.message, 'error');
    else { showToast('Registro eliminado', 'success'); fetchRecords(); }
  }

  const filtered = records.filter(r => !search || r.mes.includes(search.toUpperCase()) || String(r.anio).includes(search));
  const years = getYearOptions();

  const NumInput = ({ k, label }: { k: string; label: string }) => (
    <Input label={label} type="number" min={0} value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: Number(e.target.value) || 0 }))} />
  );

  const modalContent = (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Select label="Año" options={years.map(y => ({ value: y, label: String(y) }))} value={form.anio} onChange={e => setForm(p => ({ ...p, anio: Number(e.target.value) }))} />
        <Select label="Mes" options={MESES.map((m, i) => ({ value: i + 1, label: m }))} value={form.mes_numero} onChange={e => setForm(p => ({ ...p, mes_numero: Number(e.target.value), mes: MESES[Number(e.target.value) - 1] }))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <NumInput k="tot_llamadas" label="Total Llamadas" />
        <NumInput k="entrantes" label="Entrantes" />
        <NumInput k="atendidas" label="Atendidas" />
        <NumInput k="no_atendidas" label="No Atendidas" />
        <NumInput k="salientes" label="Salientes" />
        <NumInput k="validas" label="Válidas" />
        <NumInput k="nivel_atencion" label="Nivel Atención (%)" />
      </div>
      <Input label="Observaciones" value={form.observaciones || ''} onChange={e => setForm(p => ({ ...p, observaciones: e.target.value }))} />
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
        <Button loading={saving} onClick={handleSave}>Guardar</Button>
      </div>
    </div>
  );

  if (formOnly) {
    return (
      <Layout>
        <PageHeader title="Registro Mensual" subtitle="Ingresar resumen mensual de llamadas" />
        <Card><CardContent>{modalContent}</CardContent></Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        title="Datos Mensuales"
        subtitle="Gestión de registros mensuales de llamadas"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => exportMonthlyCalls(filtered)}>
              <Download className="h-4 w-4" /> Exportar
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Nuevo
            </Button>
          </div>
        }
      />

      <Card className="mb-4">
        <CardContent className="py-3">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <input className="pl-8 pr-3 py-2 text-sm border border-[#d5d8dc] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a5276] w-40" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select options={years.map(y => ({ value: y, label: String(y) }))} value={filterYear} onChange={e => setFilterYear(e.target.value)} placeholder="Año" className="w-28" />
            <Select options={MESES.map((m, i) => ({ value: i + 1, label: m }))} value={filterMonth} onChange={e => setFilterMonth(e.target.value)} placeholder="Mes" className="w-28" />
            {(filterYear || filterMonth || search) && <Button variant="ghost" size="sm" onClick={() => { setFilterYear(''); setFilterMonth(''); setSearch(''); }}>Limpiar</Button>}
            <span className="text-sm text-gray-500 ml-auto">{filtered.length} registros</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1a5276] text-white">
                {['Año', 'Mes', 'Total', 'Entrantes', 'Atendidas', '% Atend.', 'No Atend.', '% No At.', 'Salientes', 'Válidas', 'Nivel At.', 'Obs.', ''].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={13} className="px-4 py-8 text-center text-gray-400">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={13} className="px-4 py-8 text-center text-gray-400">Sin registros</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f4f6f9]'}>
                  <td className="px-3 py-2 font-medium">{r.anio}</td>
                  <td className="px-3 py-2 font-medium">{r.mes}</td>
                  <td className="px-3 py-2">{formatNumber(r.tot_llamadas)}</td>
                  <td className="px-3 py-2">{formatNumber(r.entrantes)}</td>
                  <td className="px-3 py-2 text-[#27ae60] font-semibold">{formatNumber(r.atendidas)}</td>
                  <td className="px-3 py-2">{formatPercent(r.pct_atendidas)}</td>
                  <td className="px-3 py-2 text-[#e74c3c]">{formatNumber(r.no_atendidas)}</td>
                  <td className="px-3 py-2">{formatPercent(r.pct_no_atendidas)}</td>
                  <td className="px-3 py-2">{formatNumber(r.salientes)}</td>
                  <td className="px-3 py-2">{formatNumber(r.validas)}</td>
                  <td className="px-3 py-2">{formatPercent(r.nivel_atencion)}</td>
                  <td className="px-3 py-2 text-gray-500 max-w-[100px] truncate">{r.observaciones}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(r)} className="p-1 text-[#1a5276] hover:bg-blue-50 rounded"><Pencil className="h-3.5 w-3.5" /></button>
                      {isAdmin && <button onClick={() => handleDelete(r.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="h-3.5 w-3.5" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Registro Mensual' : 'Nuevo Registro Mensual'} size="lg">
        {modalContent}
      </Modal>
    </Layout>
  );
}
