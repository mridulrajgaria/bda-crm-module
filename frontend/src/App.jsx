import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LeadList from './pages/Leads/LeadList';
import LeadKanban from './pages/Leads/LeadKanban';
import LeadForm from './pages/Leads/LeadForm';
import LeadDetail from './pages/Leads/LeadDetail';
import ClientList from './pages/Clients/ClientList';
import ActivityList from './pages/Activities/ActivityList';
import TeamPerformance from './pages/Team/TeamPerformance';
import Reports from './pages/Reports/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole) {
    const roleHierarchy = { admin: 3, manager: 2, bda: 1 };
    if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="leads" element={<LeadList />} />
        <Route path="leads/kanban" element={<LeadKanban />} />
        <Route path="leads/new" element={<LeadForm />} />
        <Route path="leads/:id" element={<LeadDetail />} />
        <Route path="leads/:id/edit" element={<LeadForm />} />
        <Route path="clients" element={<ClientList />} />
        <Route path="activities" element={<ActivityList />} />
        <Route path="team" element={
          <ProtectedRoute requiredRole="manager"><TeamPerformance /></ProtectedRoute>
        } />
        <Route path="reports" element={
          <ProtectedRoute requiredRole="manager"><Reports /></ProtectedRoute>
        } />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { background: '#1e293b', color: '#f1f5f9', fontSize: '14px', borderRadius: '8px' },
              success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}