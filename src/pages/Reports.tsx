import { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Layout, PageHeader } from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { useToast } from '../components/ui/Toast';
import { exportDailyCalls, exportMonthlyCalls, exportCampaignRecords } from '../lib/exportExcel';
import { getYearOptions, MESES } from '../lib/utils';

const years = getYearOptions();

export function Reports() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()));
  const [filterMonth, setFilterMonth] = useState('');

  async function exportReport(type: 'daily' | 'monthly' | 'campaigns') {
    setLoading(type);
    try {
      if (type === 'daily') {
        let q = supabase.from('daily_calls').select('*').order('fecha');
        if (filterYear) q = q.gte('fecha', `${filterYear}-01-01`).lte('fecha', `${filterYear}-12-31`);
        if (filterMonth && filterYear) {
          const m = filterMonth.padStart(2, '0');
          q = q.gte('fecha', `${filterYear}-${m}-01`).lte('fecha', `${filterYear}-${m}-31`);
        }
        const { data, error } = await q;
        if (error) throw error;
        exportDailyCalls(data || [], `registros_diarios_${filterYear}${filterMonth ? `_${MESES[Number(filterMonth) - 1]}` : ''}`);
        showToast('Reporte diario exportado', 'success');
      } else if (type === 'monthly') {
        let q = supabase.from('monthly_calls').select('*').order('anio').order('mes_numero');
        if (filterYear) q = q.eq('anio', Number(filterYear));
        if (filterMonth) q = q.eq('mes_numero', Number(filterMonth));
        const { data, error } = await q;
        if (error) throw error;
        exportMonthlyCalls(data || [], `registros_mensuales_${filterYear}`);
        showToast('Reporte mensual exportado', 'success');
      } else {
        let q = supabase.from('campaign_records').select('*, campaign:campaigns(*)').order('anio').order('mes_numero');
        if (filterYear) q = q.eq('anio', Number(filterYear));
        if (filterMonth) q = q.eq('mes_numero', Number(filterMonth));
        const { data, error } = await q;
        if (error) throw error;
        exportCampaignRecords(data || [], `campañas_${filterYear}`);
        showToast('Reporte de campañas exportado', 'success');
      }
    } catch (e: any) {
      showToast(e.message || 'Error al exportar', 'error');
    }
    setLoading(null);
  }

  const reports = [
    {
      id: 'daily',
      title: 'Registros Diarios',
      description: 'Exporta todos los registros diarios de llamadas con detalle de atendidas, abandonadas, transferidas y más.',
      icon: FileSpreadsheet,
    },
    {
      id: 'monthly',
      title: 'Registros Mensuales',
      description: 'Exporta el resumen mensual de llamadas con métricas de atención y nivel de servicio.',
      icon: FileSpreadsheet,
    },
    {
      id: 'campaigns',
      title: 'Llamadas por Campaña',
      description: 'Exporta el total de llamadas agrupado por campaña y mes.',
      icon: FileSpreadsheet,
    },
  ];

  return (
    <Layout>
      <PageHeader title="Reportes" subtitle="Exportar datos a Excel con logo CAC Santa Bárbara" />

      {/* Filtros globales */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Filtros de Exportación</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <Select
              label="Año"
              options={years.map(y => ({ value: y, label: String(y) }))}
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
              placeholder="Todos los años"
              className="w-36"
            />
            <Select
              label="Mes"
              options={MESES.map((m, i) => ({ value: i + 1, label: m }))}
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              placeholder="Todos los meses"
              className="w-36"
            />
            {(filterYear || filterMonth) && (
              <Button variant="ghost" size="sm" onClick={() => { setFilterYear(''); setFilterMonth(''); }}>
                Limpiar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports.map(r => (
          <Card key={r.id} className="hover:shadow-md transition-shadow">
            <CardContent className="py-6">
              <div className="flex flex-col items-start gap-4">
                <div className="p-3 bg-[#0D2D6B]/10 rounded-lg">
                  <r.icon className="h-6 w-6 text-[#0D2D6B]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0D2D6B]">{r.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{r.description}</p>
                </div>
                <Button
                  size="sm"
                  loading={loading === r.id}
                  onClick={() => exportReport(r.id as any)}
                  className="w-full mt-2"
                >
                  <Download className="h-4 w-4" /> Exportar Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Nota sobre los reportes</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Todos los reportes incluyen el encabezado <strong>CAC Santa Bárbara - Call Center Statistics</strong>.
            Los filtros de año y mes aplican a todos los reportes. Los archivos se descargan en formato <strong>.xlsx</strong> compatible con Microsoft Excel.
          </p>
        </CardContent>
      </Card>
    </Layout>
  );
}
