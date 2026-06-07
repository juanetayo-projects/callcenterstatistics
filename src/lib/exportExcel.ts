import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { DailyCall, MonthlyCall, CampaignRecord } from '../types';


export function exportDailyCalls(data: DailyCall[], filename = 'registros_diarios') {
  const headers = [
    'Fecha', 'Atendidas', 'Expiradas', 'Abandonadas',
    'Ab. Anuncio', 'Transferidas', 'Transf. No Atend.', 'Total', 'No Atendidas', 'Observaciones',
  ];
  const rows = data.map(r => [
    r.fecha, r.atendidas, r.expiradas, r.abandonadas,
    r.ab_durante_anuncio, r.transferidas, r.transf_no_atendidas,
    r.total, r.no_atendidas, r.observaciones || '',
  ]);

  const ws = XLSX.utils.aoa_to_sheet([
    [`CAC Santa Bárbara - Registros Diarios Call Center`],
    [],
    headers,
    ...rows,
  ]);

  ws['!cols'] = headers.map(() => ({ wch: 16 }));
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Registros Diarios');

  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `${filename}.xlsx`);
}

export function exportMonthlyCalls(data: MonthlyCall[], filename = 'registros_mensuales') {
  const headers = [
    'Año', 'Mes', 'Total Llamadas', 'Entrantes', 'Atendidas', '% Atendidas',
    'No Atendidas', '% No Atendidas', 'Salientes', 'Válidas', 'Nivel Atención', 'Observaciones',
  ];
  const rows = data.map(r => [
    r.anio, r.mes, r.tot_llamadas, r.entrantes, r.atendidas,
    `${r.pct_atendidas?.toFixed(2)}%`, r.no_atendidas,
    `${r.pct_no_atendidas?.toFixed(2)}%`, r.salientes, r.validas,
    `${r.nivel_atencion?.toFixed(2)}%`, r.observaciones || '',
  ]);

  const ws = XLSX.utils.aoa_to_sheet([
    [`CAC Santa Bárbara - Registros Mensuales Call Center`],
    [],
    headers,
    ...rows,
  ]);

  ws['!cols'] = headers.map(() => ({ wch: 16 }));
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Registros Mensuales');

  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `${filename}.xlsx`);
}

export function exportCampaignRecords(data: CampaignRecord[], filename = 'registros_campanias') {
  const headers = ['Año', 'Mes', 'Campaña', 'Total Llamadas'];
  const rows = data.map(r => [
    r.anio, r.mes, r.campaign?.nombre || r.campaign_id, r.total_llamadas,
  ]);

  const ws = XLSX.utils.aoa_to_sheet([
    [`CAC Santa Bárbara - Registros por Campaña`],
    [],
    headers,
    ...rows,
  ]);

  ws['!cols'] = headers.map(() => ({ wch: 20 }));
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Campañas');

  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `${filename}.xlsx`);
}
