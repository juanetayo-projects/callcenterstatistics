# Call Center Statistics — CAC Santa Bárbara

Aplicación SaaS para visualizar y gestionar el comportamiento de atención de llamadas del Call Center.

## URLs

- **Aplicación:** https://juanetayo-projects.github.io/callcenterstatistics/
- **Repositorio:** https://github.com/juanetayo-projects/callcenterstatistics
- **Supabase:** https://supabase.com/dashboard/project/lsllalsrkwvypihhtopy

## Stack Tecnológico

| Componente | Tecnología |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Estilos | Tailwind CSS v4 |
| Gráficas | Recharts |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Exportación | xlsx + file-saver |
| Deploy | GitHub Pages (Actions) |

## Módulos

| Ruta | Descripción |
|---|---|
| `/` | Dashboard con KPIs y 4 tipos de gráficas |
| `/registro/diario` | Formulario ingreso diario |
| `/registro/mensual` | Formulario ingreso mensual |
| `/datos/diario` | CRUD registros diarios + filtros |
| `/datos/mensual` | CRUD registros mensuales + filtros |
| `/campanias` | CRUD campañas y registros por campaña |
| `/reportes` | Exportar Excel con logo CAC |
| `/usuarios` | CRUD usuarios y perfiles (solo Administrador) |

## Estructura del Código

```
callcenter/app/               ← CÓDIGO FUENTE AQUÍ
├── .github/workflows/
│   └── deploy.yml            # CI/CD GitHub Pages automático
├── public/
│   ├── logo_cacsb2.png
│   ├── logo_cacsb_blanc.png
│   └── 404.html
├── src/
│   ├── components/layout/    # Sidebar, Layout
│   ├── components/ui/        # Button, Input, Card, Modal, Toast...
│   ├── context/              # AuthContext
│   ├── lib/                  # supabase, utils, exportExcel
│   ├── pages/                # Login, Dashboard, DailyRecords, MonthlyRecords,
│   │                         # Campaigns, Users, Reports
│   ├── types/index.ts
│   ├── App.tsx
│   └── main.tsx
├── .env                      # Variables locales (NO en git)
├── .env.example              # Plantilla
└── vite.config.ts
```

## Instalación Local

```bash
cd "C:\Users\Juan Carlos Etayo\callcenter\app"
npm install
# Copiar .env.example a .env y completar credenciales
npm run dev
```

## Base de Datos Supabase

| Tabla | Descripción |
|---|---|
| `profiles` | Administrador / Analista |
| `app_users` | Usuarios vinculados a Auth |
| `campaigns` | 13 campañas (CRUD) |
| `daily_calls` | Registros diarios |
| `monthly_calls` | Resúmenes mensuales |
| `campaign_records` | Registros por campaña/mes |

## Permisos

| Acción | Administrador | Analista |
|---|---|---|
| Ver datos | ✅ | ✅ |
| Crear/Editar | ✅ | ✅ |
| Eliminar | ✅ | ❌ |
| Gestionar usuarios | ✅ | ❌ |

## Primer Usuario Administrador

1. Supabase Dashboard > Authentication > Users > Add User
2. Table Editor > app_users > cambiar `profile_id` a `1` (Administrador)

## Deploy

Push a `main` activa GitHub Actions automáticamente → GitHub Pages.
