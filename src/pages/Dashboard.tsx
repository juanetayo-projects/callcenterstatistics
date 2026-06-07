import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Phone, PhoneIncoming, PhoneOff, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, KPICard } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Layout, PageHeader } from '../components/layout/Layout';
import { formatNumber, formatPercent, getYearOptions } from '../lib/utils';
import type { DailyCall, MonthlyCall, CampaignRecord } from '../types';

const COLORS = ['#0D2D6B','#16468E','#2563eb','#7c3aed','#dc2626','#d97706','#16a34a','#0891b2','#be185d','#7f8c8d','#0f766e','#c2410c','#4338ca'];

export function Dashboard() {
  const years = getYearOptions();
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthly, setMonthly] = useState<MonthlyCall[]>([]);
  const [daily, setDaily] = useState<DailyCall[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState('');

  useEffect(() => { fetchData(); }, [year]);

  async function fetchData() {
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

  const totals = monthly.reduce(
    (acc, m) => ({
      llamadas: acc.llamadas + (m.tot_llamadas || 0),
      atendidas: acc.atendidas + (m.atendidas || 0),
      noAtendidas: acc.noAtendidas + (m.no_atendidas || 0),
      salientes: acc.salientes + (m.salientes || 0),
    }),
    { llamadas: 0, atendidas: 0, noAtendidas: 0, salientes: 0 }
  );
  const pctAtendidas = totals.llamadas > 0 ? (totals.atendidas / totals.llamadas) * 100 : 0;

  const campPieData = Object.values(
    campaigns.reduce((acc, c) => {
      const name = c.campaign?.nombre || 'Desconocida';
      if (!acc[name]) acc[name] = { name, value: 0 };
      acc[name].value += c.total_llamadas || 0;
      return acc;
    }, {} as Record<string, { name: string; value: number }>)
  ).sort((a, b) => b.value - a.value).slice(0, 8);

  const dailyTrend = daily.slice(-30).map(d => ({
    fecha: d.fecha.slice(5),
    Atendidas: d.atendidas,
    'No Atendidas': d.no_atendidas,
  }));

  const monthlyBarData = monthly.map(m => ({
    mes: m.mes,
    Atendidas: m.atendidas,
    'No Atendidas': m.no_atendidas,
    'Salientes': m.salientes,
  }));

  return (
    <Layout>
      <PageHeader
        title="Dashboard General"
        subtitle="Resumen ejecutivo de indicadores del Call Center"
        actions={
          <div className="flex items-center gap-3">
            {updated && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Actualizado: {updated}
              </span>
            )}
            <Select
              options={years.map(y => ({ value: y, label: String(y) }))}
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="w-28"
            />
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
            <p className="text-sm text-gray-400">Cargando datos...</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Total Llamadas" value={formatNumber(totals.llamadas)} icon={Phone}
              color="#0D2D6B" borderColor="#0D2D6B" subtitle={`Año ${year}`}
              tip="Total de llamadas registradas en el período" />
            <KPICard title="Atendidas" value={formatNumber(totals.atendidas)} icon={PhoneIncoming}
              color="#16a34a" borderColor="#16a34a" tip="Llamadas efectivamente atendidas" />
            <KPICard title="No Atendidas" value={formatNumber(totals.noAtendidas)} icon={PhoneOff}
              color="#dc2626" borderColor="#dc2626" tip="Llamadas abandonadas, expiradas o no atendidas" />
            <KPICard title="% Atención" value={formatPercent(pctAtendidas)} icon={TrendingUp}
              color="#16468E" borderColor="#16468E" tip="Porcentaje de llamadas atendidas sobre el total" />
          </div>

          {/* Charts row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader>
                <CardTitle>Llamadas por Mes</CardTitle>
                <span className="text-xs text-gray-400" data-tip="Comparativo mensual de llamadas atendidas vs no atendidas">Año {year}</span>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={monthlyBarData} barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.12)', fontSize: 12 }} />
                    <Legend iconType="circle" iconSize={8} />
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
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={monthly.map(m => ({ mes: m.mes, '% Atendidas': m.pct_atendidas, '% No Atendidas': m.pct_no_atendidas, 'Nivel Servicio': m.nivel_atencion }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.12)', fontSize: 12 }}
                      formatter={(v: unknown) => `${(v as number)?.toFixed(2)}%`} />
                    <Legend iconType="circle" iconSize={8} />
                    <Line type="monotone" dataKey="% Atendidas" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3, fill: '#16a34a' }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="% No Atendidas" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 3, fill: '#dc2626' }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="Nivel Servicio" stroke="#16468E" strokeWidth={2} strokeDasharray="5 3" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader>
                <CardTitle>Tendencia Diaria</CardTitle>
                <span className="text-xs text-gray-400">Últimos 30 días registrados</span>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#64748b' }} interval={4} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.12)', fontSize: 12 }} />
                    <Legend iconType="circle" iconSize={8} />
                    <Line type="monotone" dataKey="Atendidas" stroke="#0D2D6B" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="No Atendidas" stroke="#dc2626" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Campaña</CardTitle>
                <span className="text-xs text-gray-400">Top 8 campañas</span>
              </CardHeader>
              <CardContent>
                {campPieData.length === 0 ? (
                  <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">
                    Sin datos de campañas para {year}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={campPieData} cx="40%" cy="50%" outerRadius={85} innerRadius={35}
                        dataKey="value" nameKey="name"
                        label={({ percent }: { percent?: number }) => `${((percent || 0) * 100).toFixed(0)}%`}
                        labelLine={false} fontSize={10}>
                        {campPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.12)', fontSize: 12 }}
                        formatter={(v: unknown) => formatNumber(v as number)} />
                      <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={8} formatter={(v: string) => v.replace('CAC_SB_', '').replace(/_/g, ' ')} />
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
