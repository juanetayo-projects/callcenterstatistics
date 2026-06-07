import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { DailyRecords } from './pages/DailyRecords';
import { MonthlyRecords } from './pages/MonthlyRecords';
import { Campaigns } from './pages/Campaigns';
import { Users } from './pages/Users';
import { Reports } from './pages/Reports';

const BASE = '/callcenterstatistics';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { session, loading, isAdmin } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f9]">
      <div className="text-center">
        <img src="/callcenterstatistics/logo_cacsb2.png" alt="CAC" className="h-16 mx-auto mb-4 opacity-60" />
        <p className="text-gray-500 text-sm">Cargando...</p>
      </div>
    </div>
  );
  if (!session) return <Navigate to={`${BASE}/login`} replace />;
  if (adminOnly && !isAdmin) return <Navigate to={`${BASE}/`} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { session } = useAuth();
  return (
    <Routes>
      <Route path={`${BASE}/login`} element={session ? <Navigate to={`${BASE}/`} replace /> : <Login />} />
      <Route path={`${BASE}/`} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path={`${BASE}/registro/diario`} element={<ProtectedRoute><DailyRecords /></ProtectedRoute>} />
      <Route path={`${BASE}/registro/mensual`} element={<ProtectedRoute><MonthlyRecords /></ProtectedRoute>} />
      <Route path={`${BASE}/datos/diario`} element={<ProtectedRoute><DailyRecords /></ProtectedRoute>} />
      <Route path={`${BASE}/datos/mensual`} element={<ProtectedRoute><MonthlyRecords /></ProtectedRoute>} />
      <Route path={`${BASE}/campanias`} element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
      <Route path={`${BASE}/reportes`} element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path={`${BASE}/usuarios`} element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={`${BASE}/`} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
