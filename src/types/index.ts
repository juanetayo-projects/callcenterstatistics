export type UserProfile = 'Administrador' | 'Analista';

export interface Profile {
  id: number;
  perfil: UserProfile;
}

export interface AppUser {
  id: string;
  nombres: string;
  email: string;
  telefono: string;
  profile_id: number;
  profile?: Profile;
  created_at: string;
}

export interface Campaign {
  id: number;
  nombre: string;
  descripcion: string | null;
  activa: boolean;
  created_at: string;
}

export interface DailyCall {
  id: number;
  fecha: string;
  atendidas: number;
  expiradas: number;
  abandonadas: number;
  ab_durante_anuncio: number;
  transferidas: number;
  transf_no_atendidas: number;
  total: number;
  no_atendidas: number;
  observaciones: string | null;
  user_id: string | null;
  created_at: string;
}

export interface MonthlyCall {
  id: number;
  anio: number;
  mes: string;
  mes_numero: number;
  tot_llamadas: number;
  entrantes: number;
  atendidas: number;
  pct_atendidas: number;
  no_atendidas: number;
  pct_no_atendidas: number;
  salientes: number;
  validas: number;
  nivel_atencion: number;
  observaciones: string | null;
  user_id: string | null;
  created_at: string;
}

export interface CampaignRecord {
  id: number;
  campaign_id: number;
  anio: number;
  mes_numero: number;
  mes: string;
  total_llamadas: number;
  campaign?: Campaign;
  created_at: string;
}

export interface DashboardKPIs {
  totalLlamadas: number;
  totalAtendidas: number;
  totalNoAtendidas: number;
  pctAtendidas: number;
  nivelServicio: number;
}
