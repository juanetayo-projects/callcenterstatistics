import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Phone, PhoneIncoming, PhoneOff, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Layout, PageHeader } from '../components/layout/Layout';
import { formatNumber, formatPercent, getYearOptions } from '../lib/utils';
import type { DailyCall, MonthlyCall, CampaignRecord } from '../types';

const COLORS = ['#1a5276', '#2980b9', '#e74c3c', '#27ae60', '#f39c12', '#8e44ad', '#16a085', '#d35400', '#2c3e50', '#7f8c8d', '#c0392b', '#1abc9c', '#e67e22'];

function KPICard({ title, value, icon: Icon, color, subtitle }: {
  title: string; value: string; icon: React.ElementType; color: string; subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <div className={`p-3 rounded-lg`} style={{ backgroundColor: `${color}20` }}>
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-[#2c3e50]">{value}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const years = getYearOptions();
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthly, setMonthly] = useState<MonthlyCall[]>([]);
  const [daily, setDaily] = useState<DailyCall[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [year]);

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
    setLoading(false);
  }

  const totals = monthly.reduce(
    (acc, m) => ({
      llamadas: acc.llamadas + (m.tot_llamadas || 0),
      atendidas: acc.atendidas + (m.atendidas || 0),
      noAtendidas: acc.noAtendidas + (m.no_atendidas || 0),
    }),
    { llamadas: 0, atendidas: 0, noAtendidas: 0 }
  );
  const pctAtendidas = totals.llamadas > 0 ? (totals.atendidas / totals.llamadas) * 100 : 0;

  // Campaign pie data
  const campPieData = Object.values(
    campaigns.reduce((acc, c) => {
      const name = c.campaign?.nombre || 'Desconocida';
      if (!acc[name]) acc[name] = { name, value: 0 };
      acc[name].value += c.total_llamadas || 0;
      return acc;
    }, {} as Record<string, { name: string; value: number }>)
  ).sort((a, b) => b.value - a.value);

  // Daily trend (last 30 records)
  const dailyTrend = daily.slice(-30).map(d => ({
    fecha: d.fecha.slice(5),
    atendidas: d.atendidas,
    noAtendidas: d.no_atendidas,
  }));

  return (
    <Layout>
      <PageHeader
        title="Dashboard Call Center"
        subtitle={`Resumen de indicadores - Año ${year}`}
        actions={
          <Select
            options={years.map(y => ({ value: y, label: String(y) }))}
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="w-28"
          />
        }
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Cargando datos...</div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Total Llamadas" value={formatNumber(totals.llamadas)} icon={Phone} color="#1a5276" subtitle={`Año ${year}`} />
            <KPICard title="Atendidas" value={formatNumber(totals.atendidas)} icon={PhoneIncoming} color="#27ae60" />
            <KPICard title="No Atendidas" value={formatNumber(totals.noAtendidas)} icon={PhoneOff} color="#e74c3c" />
            <KPICard title="% Atención" value={formatPercent(pctAtendidas)} icon={TrendingUp} color="#2980b9" />
          </div>

          {/* Charts row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Llamadas por Mes</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={monthly.map(m => ({ mes: m.mes, Atendidas: m.atendidas, 'No Atendidas': m.no_atendidas }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Atendidas" fill="#1a5276" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="No Atendidas" fill="#e74c3c" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>% Atención por Mes</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={monthly.map(m => ({ mes: m.mes, '% Atención': m.pct_atendidas, '% No Atención': m.pct_no_atendidas }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit="%" />
                    <Tooltip formatter={(v: unknown) => `${(v as number)?.toFixed(2)}%`} />
                    <Legend />
                    <Line type="monotone" dataKey="% Atención" stroke="#27ae60" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="% No Atención" stroke="#e74c3c" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Tendencia Diaria (últimos 30 días)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 10 }} interval={4} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="atendidas" name="Atendidas" stroke="#1a5276" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="noAtendidas" name="No Atendidas" stroke="#e74c3c" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Llamadas por Campaña</CardTitle></CardHeader>
              <CardContent>
                {campPieData.length === 0 ? (
                  <div className="flex items-center justify-center h-[260px] text-gray-400 text-sm">Sin datos de campañas</div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={campPieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label={({ name, percent }: { name?: string; percent?: number }) => `${(name || '').replace('CAC_SB_', '').replace('_', ' ')} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                        {campPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: unknown) => formatNumber(v as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Nivel de servicio */}
          <Card>
            <CardHeader><CardTitle>Nivel de Atención Mensual</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthly.map(m => ({ mes: m.mes, 'Nivel Atención': m.nivel_atencion }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                  <Tooltip formatter={(v: unknown) => `${(v as number)?.toFixed(2)}%`} />
                  <Bar dataKey="Nivel Atención" fill="#2980b9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
}
