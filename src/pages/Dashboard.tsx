import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Phone, PhoneIncoming, PhoneOff, TrendingUp, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Layout, PageHeader } from '../components/layout/Layout';
import { formatNumber, formatPercent, getYearOptions, MESES } from '../lib/utils';
import type { MonthlyCall, DailyCall, CampaignRecord } from '../types';

const COLORS = ['#0D2D6B','#16468E','#2563eb','#7c3aed','#dc2626','#d97706','#16a34a','#0891b2','#be185d','#0f766e','#c2410c','#4338ca'];

const selectCls = "text-sm border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0D2D6B] font-medium text-[#0D2D6B]";

export function Dashboard() {
  const allYears = getYearOptions();
  const [year, setYear] = useState<number | null>(null);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterCampaign, setFilterCampaign] = useState('');
  const [availYears, setAvailYears] = useState<number[]>([]);
  const [campaignList, setCampaignList] = useState<{ id: number; nombre: string }[]>([]);
  const [monthly, setMonthly] = useState<MonthlyCall[]>([]);
  const [daily, setDaily] = useState<DailyCall[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState('');

  // Al montar: detectar el año más reciente con datos y cargar campañas
  useEffect(() => {
    async function init() {
      const [{ data }, { data: ys }, { data: camps }] = await Promise.all([
        supabase.from('monthly_calls').select('anio').order('anio', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('monthly_calls').select('anio').order('anio', { ascending: false }),
        supabase.from('campaigns').select('id, nombre').order('nombre'),
      ]);
      const best = data?.anio ?? new Date().getFullYear();
      setYear(best);
      const unique = [...new Set((ys ?? []).map((r: any) => r.anio as number))];
      setAvailYears(unique.length > 0 ? unique : allYears);
      setCampaignList(camps || []);
    }
    init();
  }, []);

  useEffect(() => { if (year !== null) fetchData(); }, [year]);

  async function fetchData() {
    if (year === null) return;
    setLoading(true);
    const [mRes, dRes, cRes] = await Promise.all([
      supabase.from('monthly_calls').select('*').eq('anio', year).order('mes_numero'),
      supabase.from('daily_calls').select('*').gte('fecha', `${year}-01-01`).lte('fecha', `${year}-12-31`).order('fecha'),
      supabase.from('campaign_records').select('*, campaign:campaigns(*)').eq('anio', year),
    ]);
    setMonthly(mRes.data || []);
    setDaily(dRes.data || []);
    setCampaigns(cRes.data || []);
    setUpdated(new Date().toLocaleString('es-CO'));
    setLoading(false);
  }

  // Datos filtrados por mes y campaña (client-side)
  const monthlyFiltered = filterMonth
    ? monthly.filter(m => m.mes_numero === Number(filterMonth))
    : monthly;
  const dailyFiltered = filterMonth
    ? daily.filter(d => new Date(d.fecha).getMonth() + 1 === Number(filterMonth))
    : daily;
  const campaignsFiltered = filterCampaign
    ? campaigns.filter(c => String(c.campaign_id) === filterCampaign)
    : campaigns;

  const totals = monthlyFiltered.reduce(
    (acc, m) => ({
      llamadas:    acc.llamadas    + (m.tot_llamadas  || 0),
      atendidas:   acc.atendidas   + (m.atendidas     || 0),
      noAtendidas: acc.noAtendidas + (m.no_atendidas  || 0),
      salientes:   acc.salientes   + (m.salientes     || 0),
    }),
    { llamadas: 0, atendidas: 0, noAtendidas: 0, salientes: 0 }
  );
  const pctAtendidas = totals.llamadas > 0 ? (totals.atendidas / totals.llamadas) * 100 : 0;
  const pctNoAtendidas = totals.llamadas > 0 ? (totals.noAtendidas / totals.llamadas) * 100 : 0;

  const campPieData = Object.values(
    campaignsFiltered.reduce((acc, c) => {
      const name = (c.campaign?.nombre || 'Desconocida').replace('CAC_SB_', '').replace(/_/g, ' ');
      if (!acc[name]) acc[name] = { name, value: 0 };
      acc[name].value += c.total_llamadas || 0;
      return acc;
    }, {} as Record<string, { name: string; value: number }>)
  ).sort((a, b) => b.value - a.value).slice(0, 8);

  const dailyTrend = dailyFiltered.slice(-30).map(d => ({
    fecha: d.fecha.slice(5),
    Atendidas: d.atendidas,
    'No Atendidas': d.no_atendidas,
  }));

  const monthlyBarData = monthlyFiltered.map(m => ({
    mes: m.mes,
    Atendidas: m.atendidas,
    'No Atendidas': m.no_atendidas,
  }));

  const noData = !loading && monthly.length === 0;

  const ttStyle = {
    borderRadius: '10px', border: 'none',
    boxShadow: '0 4px 24px rgba(13,45,107,0.14)', fontSize: 12,
  };

  return (
    <Layout>
      <PageHeader
        title="Dashboard"
        subtitle="Resumen ejecutivo de indicadores del Call Center"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {updated && <span className="text-xs text-gray-400 hidden lg:block">Actualizado: {updated}</span>}

            {/* Año */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Año</span>
              <select value={year ?? ''} onChange={e => { setYear(Number(e.target.value)); setFilterMonth(''); }} className={selectCls}>
                {(availYears.length > 0 ? availYears : allYears).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Mes */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Mes</span>
              <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className={selectCls}>
                <option value="">Todos</option>
                {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>

            {/* Campaña */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Campaña</span>
              <select value={filterCampaign} onChange={e => setFilterCampaign(e.target.value)} className={selectCls} style={{ maxWidth: '160px' }}>
                <option value="">Todas</option>
                {campaignList.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre.replace('CAC_SB_', '').replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Limpiar filtros */}
            {(filterMonth || filterCampaign) && (
              <button onClick={() => { setFilterMonth(''); setFilterCampaign(''); }}
                className="text-xs text-[#0D2D6B] underline hover:no-underline">
                Limpiar
              </button>
            )}

            <button onClick={fetchData}
              className="p-2 rounded-lg border border-[#e2e8f0] bg-white text-gray-400 hover:text-[#0D2D6B] hover:border-[#0D2D6B] transition-colors"
              title="Recargar">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-[#0D2D6B]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-sm text-gray-400">Cargando datos {year}...</p>
          </div>
        </div>
      ) : noData ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-[#e2e8f0]">
          <Phone className="h-12 w-12 text-gray-200 mb-3" />
          <p className="text-gray-500 font-semibold">Sin datos para el año {year}</p>
          <p className="text-sm text-gray-400 mt-1">Seleccione otro año en el filtro</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">

          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Total Llamadas"
              value={formatNumber(totals.llamadas)}
              sub={filterMonth ? `${MESES[Number(filterMonth)-1]} ${year}` : `Año ${year}`}
              icon={Phone}
              accent="#0D2D6B"
              pct={100}
            />
            <KpiCard
              label="Atendidas"
              value={formatNumber(totals.atendidas)}
              sub={formatPercent(pctAtendidas) + ' del total'}
              icon={PhoneIncoming}
              accent="#16a34a"
              pct={pctAtendidas}
            />
            <KpiCard
              label="No Atendidas"
              value={formatNumber(totals.noAtendidas)}
              sub={formatPercent(pctNoAtendidas) + ' del total'}
              icon={PhoneOff}
              accent="#dc2626"
              pct={pctNoAtendidas}
            />
            <KpiCard
              label="Nivel de Atención"
              value={formatPercent(pctAtendidas)}
              sub={filterMonth ? `Mes ${MESES[Number(filterMonth)-1]}` : `${monthlyFiltered.length} meses registrados`}
              icon={TrendingUp}
              accent="#16468E"
              pct={pctAtendidas}
            />
          </div>

          {/* ── Charts fila 1 ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader>
                <CardTitle>Llamadas por Mes</CardTitle>
                <span className="text-xs text-gray-400">Atendidas vs No atendidas · {year}</span>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={monthlyBarData} barSize={20} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip contentStyle={ttStyle} cursor={{ fill: '#f0f4f8' }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Atendidas" fill="#0D2D6B" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="No Atendidas" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>% Atención Mensual</CardTitle>
                <span className="text-xs text-gray-400">Tendencia del nivel de servicio</span>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={monthly.map(m => ({
                    mes: m.mes,
                    '% Atendidas': +m.pct_atendidas.toFixed(1),
                    '% No Atendidas': +m.pct_no_atendidas.toFixed(1),
                    'Nivel Servicio': +m.nivel_atencion.toFixed(1),
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} width={40} />
                    <Tooltip contentStyle={ttStyle} formatter={(v: unknown) => `${v}%`} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="% Atendidas" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="% No Atendidas" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="Nivel Servicio" stroke="#16468E" strokeWidth={2} strokeDasharray="5 3" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* ── Charts fila 2 ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader>
                <CardTitle>Tendencia Diaria</CardTitle>
                <span className="text-xs text-gray-400">Últimos 30 días registrados</span>
              </CardHeader>
              <CardContent>
                {dailyTrend.length === 0 ? (
                  <div className="flex items-center justify-center h-52 text-gray-400 text-sm">Sin registros diarios</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={4} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
                      <Tooltip contentStyle={ttStyle} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="Atendidas" stroke="#0D2D6B" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                      <Line type="monotone" dataKey="No Atendidas" stroke="#dc2626" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Campaña</CardTitle>
                <span className="text-xs text-gray-400">Top 8 campañas · {year}</span>
              </CardHeader>
              <CardContent>
                {campPieData.length === 0 ? (
                  <div className="flex items-center justify-center h-52 text-gray-400 text-sm">Sin datos de campañas</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={campPieData} cx="38%" cy="50%" outerRadius={90} innerRadius={38}
                        dataKey="value" nameKey="name"
                        label={({ percent }: { percent?: number }) => `${((percent || 0) * 100).toFixed(0)}%`}
                        labelLine={false} fontSize={10}>
                        {campPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={ttStyle} formatter={(v: unknown) => formatNumber(v as number)} />
                      <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={8}
                        wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </Layout>
  );
}

/* ── KPI Card profesional ── */
function KpiCard({ label, value, sub, icon: Icon, accent, pct }: {
  label: string; value: string; sub: string;
  icon: React.ElementType; accent: string; pct: number;
}) {
  const bar = Math.min(Math.max(pct, 0), 100);
  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden"
      style={{ boxShadow: '0 2px 8px rgba(13,45,107,0.08), 0 8px 24px rgba(13,45,107,0.06)' }}>
      {/* Accent top bar */}
      <div className="h-1 w-full" style={{ background: accent }} />
      <div className="px-5 py-5">
        {/* Icon + label */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</span>
          <div className="p-2 rounded-xl" style={{ backgroundColor: `${accent}12` }}>
            <Icon className="h-4 w-4" style={{ color: accent }} />
          </div>
        </div>
        {/* Value */}
        <p className="text-4xl font-extrabold tracking-tight leading-none" style={{ color: accent }}>
          {value}
        </p>
        <p className="text-xs text-gray-400 mt-2">{sub}</p>
        {/* Progress bar */}
        <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${bar}%`, background: accent }} />
        </div>
      </div>
    </div>
  );
}
