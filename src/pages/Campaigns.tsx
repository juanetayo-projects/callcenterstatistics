import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Download, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Layout, PageHeader } from '../components/layout/Layout';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { exportCampaignRecords } from '../lib/exportExcel';
import { formatNumber, getYearOptions, MESES } from '../lib/utils';
import type { Campaign, CampaignRecord } from '../types';

export function Campaigns() {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [records, setRecords] = useState<CampaignRecord[]>([]);
  const [tab, setTab] = useState<'campaigns' | 'records'>('campaigns');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [editingCamp, setEditingCamp] = useState<Campaign | null>(null);
  const [editingRec, setEditingRec] = useState<CampaignRecord | null>(null);
  const [campForm, setCampForm] = useState({ nombre: '', descripcion: '', activa: true });
  const [recForm, setRecForm] = useState({ campaign_id: 0, anio: new Date().getFullYear(), mes_numero: 1, mes: 'ENE', total_llamadas: 0 });
  const [search, setSearch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterCamp, setFilterCamp] = useState('');

  useEffect(() => { fetchAll(); }, [filterYear, filterMonth, filterCamp]);

  async function fetchAll() {
    setLoading(true);
    const [cRes, rQuery] = await Promise.all([
      supabase.from('campaigns').select('*').order('nombre'),
      buildRecordsQuery(),
    ]);
    setCampaigns(cRes.data || []);
    const { data } = await rQuery;
    setRecords(data || []);
    setLoading(false);
  }

  function buildRecordsQuery() {
    let q = supabase.from('campaign_records').select('*, campaign:campaigns(*)').order('anio', { ascending: false }).order('mes_numero');
    if (filterYear) q = q.eq('anio', Number(filterYear));
    if (filterMonth) q = q.eq('mes_numero', Number(filterMonth));
    if (filterCamp) q = q.eq('campaign_id', Number(filterCamp));
    return q;
  }

  async function saveCampaign() {
    setSaving(true);
    const { error } = editingCamp
      ? await supabase.from('campaigns').update(campForm).eq('id', editingCamp.id)
      : await supabase.from('campaigns').insert(campForm);
    if (error) showToast(error.message, 'error');
    else { showToast('Campaña guardada', 'success'); setShowModal(false); fetchAll(); }
    setSaving(false);
  }

  async function deleteCampaign(id: number) {
    if (!confirm('¿Eliminar esta campaña?')) return;
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) showToast(error.message, 'error');
    else { showToast('Campaña eliminada', 'success'); fetchAll(); }
  }

  async function saveRecord() {
    setSaving(true);
    const payload = { ...recForm, mes: MESES[recForm.mes_numero - 1] };
    const { error } = editingRec
      ? await supabase.from('campaign_records').update(payload).eq('id', editingRec.id)
      : await supabase.from('campaign_records').insert(payload);
    if (error) showToast(error.message, 'error');
    else { showToast('Registro guardado', 'success'); setShowRecordModal(false); fetchAll(); }
    setSaving(false);
  }

  async function deleteRecord(id: number) {
    if (!confirm('¿Eliminar este registro?')) return;
    const { error } = await supabase.from('campaign_records').delete().eq('id', id);
    if (error) showToast(error.message, 'error');
    else { showToast('Eliminado', 'success'); fetchAll(); }
  }

  const years = getYearOptions();
  const filteredCamps = campaigns.filter(c => !search || c.nombre.toLowerCase().includes(search.toLowerCase()));
  const filteredRecs = records.filter(r => !search || (r.campaign?.nombre || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      <PageHeader
        title="Campañas"
        subtitle="Gestión de campañas y registros por campaña"
        actions={
          <div className="flex gap-2">
            {tab === 'records' && (
              <Button variant="outline" size="sm" onClick={() => exportCampaignRecords(filteredRecs)}>
                <Download className="h-4 w-4" /> Exportar
              </Button>
            )}
            <Button size="sm" onClick={() => {
              if (tab === 'campaigns') { setEditingCamp(null); setCampForm({ nombre: '', descripcion: '', activa: true }); setShowModal(true); }
              else { setEditingRec(null); setRecForm({ campaign_id: campaigns[0]?.id || 0, anio: new Date().getFullYear(), mes_numero: 1, mes: 'ENE', total_llamadas: 0 }); setShowRecordModal(true); }
            }}>
              <Plus className="h-4 w-4" /> Nuevo
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-[#d5d8dc]">
        {(['campaigns', 'records'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-[#1a5276] text-[#1a5276]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t === 'campaigns' ? 'Campañas' : 'Registros por Campaña'}
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="py-3">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <input className="pl-8 pr-3 py-2 text-sm border border-[#d5d8dc] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a5276] w-48" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {tab === 'records' && (
              <>
                <Select options={years.map(y => ({ value: y, label: String(y) }))} value={filterYear} onChange={e => setFilterYear(e.target.value)} placeholder="Año" className="w-28" />
                <Select options={MESES.map((m, i) => ({ value: i + 1, label: m }))} value={filterMonth} onChange={e => setFilterMonth(e.target.value)} placeholder="Mes" className="w-28" />
                <Select options={campaigns.map(c => ({ value: c.id, label: c.nombre }))} value={filterCamp} onChange={e => setFilterCamp(e.target.value)} placeholder="Campaña" className="w-48" />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {tab === 'campaigns' ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#1a5276] text-white">{['Nombre', 'Descripción', 'Estado', ''].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase">{h}</th>)}</tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Cargando...</td></tr>
                  : filteredCamps.map((c, i) => (
                    <tr key={c.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f4f6f9]'}>
                      <td className="px-4 py-2 font-medium">{c.nombre}</td>
                      <td className="px-4 py-2 text-gray-500">{c.descripcion}</td>
                      <td className="px-4 py-2"><Badge variant={c.activa ? 'success' : 'neutral'}>{c.activa ? 'Activa' : 'Inactiva'}</Badge></td>
                      <td className="px-4 py-2">
                        <div className="flex gap-1">
                          <button onClick={() => { setEditingCamp(c); setCampForm({ nombre: c.nombre, descripcion: c.descripcion || '', activa: c.activa }); setShowModal(true); }} className="p-1 text-[#1a5276] hover:bg-blue-50 rounded"><Pencil className="h-3.5 w-3.5" /></button>
                          {isAdmin && <button onClick={() => deleteCampaign(c.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="h-3.5 w-3.5" /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#1a5276] text-white">{['Año', 'Mes', 'Campaña', 'Total Llamadas', ''].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase">{h}</th>)}</tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Cargando...</td></tr>
                  : filteredRecs.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Sin registros</td></tr>
                  : filteredRecs.map((r, i) => (
                    <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f4f6f9]'}>
                      <td className="px-4 py-2">{r.anio}</td>
                      <td className="px-4 py-2">{r.mes}</td>
                      <td className="px-4 py-2 font-medium">{r.campaign?.nombre}</td>
                      <td className="px-4 py-2">{formatNumber(r.total_llamadas)}</td>
                      <td className="px-4 py-2">
                        <div className="flex gap-1">
                          <button onClick={() => { setEditingRec(r); setRecForm({ campaign_id: r.campaign_id, anio: r.anio, mes_numero: r.mes_numero, mes: r.mes, total_llamadas: r.total_llamadas }); setShowRecordModal(true); }} className="p-1 text-[#1a5276] hover:bg-blue-50 rounded"><Pencil className="h-3.5 w-3.5" /></button>
                          {isAdmin && <button onClick={() => deleteRecord(r.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="h-3.5 w-3.5" /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingCamp ? 'Editar Campaña' : 'Nueva Campaña'}>
        <div className="flex flex-col gap-4">
          <Input label="Nombre" value={campForm.nombre} onChange={e => setCampForm(p => ({ ...p, nombre: e.target.value }))} />
          <Input label="Descripción" value={campForm.descripcion} onChange={e => setCampForm(p => ({ ...p, descripcion: e.target.value }))} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={campForm.activa} onChange={e => setCampForm(p => ({ ...p, activa: e.target.checked }))} className="rounded" />
            Campaña activa
          </label>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button loading={saving} onClick={saveCampaign}>Guardar</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showRecordModal} onClose={() => setShowRecordModal(false)} title={editingRec ? 'Editar Registro' : 'Nuevo Registro de Campaña'}>
        <div className="flex flex-col gap-4">
          <Select label="Campaña" options={campaigns.map(c => ({ value: c.id, label: c.nombre }))} value={recForm.campaign_id} onChange={e => setRecForm(p => ({ ...p, campaign_id: Number(e.target.value) }))} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Año" options={years.map(y => ({ value: y, label: String(y) }))} value={recForm.anio} onChange={e => setRecForm(p => ({ ...p, anio: Number(e.target.value) }))} />
            <Select label="Mes" options={MESES.map((m, i) => ({ value: i + 1, label: m }))} value={recForm.mes_numero} onChange={e => setRecForm(p => ({ ...p, mes_numero: Number(e.target.value), mes: MESES[Number(e.target.value) - 1] }))} />
          </div>
          <Input label="Total Llamadas" type="number" min={0} value={recForm.total_llamadas} onChange={e => setRecForm(p => ({ ...p, total_llamadas: Number(e.target.value) || 0 }))} />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowRecordModal(false)}>Cancelar</Button>
            <Button loading={saving} onClick={saveRecord}>Guardar</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
