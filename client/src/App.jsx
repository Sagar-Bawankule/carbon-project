import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import InputActivity from './pages/InputActivity';
import History from './pages/History';
import Recommendations from './pages/Recommendations';
import Leaderboard from './pages/Leaderboard';
import WeeklyReport from './pages/WeeklyReport';
import Shop from './pages/Shop';

// Components
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.onboardingCompleted && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

// Public Route Component (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    if (!user.onboardingCompleted) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
};

// Wrapper to force Dashboard remount on navigation (fixes Recharts crash)
const DashboardWrapper = () => {
  const location = useLocation();
  return <Dashboard key={location.key} />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Home Page - Landing */}
      <Route path="/" element={<Home />} />

      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={
          <ErrorBoundary>
            <DashboardWrapper />
          </ErrorBoundary>
        } />
        <Route path="input" element={<InputActivity />} />
        <Route path="history" element={<History />} />
        <Route path="recommendations" element={<Recommendations />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="reports" element={<WeeklyReport />} />
        <Route path="shop" element={<Shop />} />
      </Route>

      {/* Legacy redirects */}
      <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/input" element={<Navigate to="/app/input" replace />} />
      <Route path="/history" element={<Navigate to="/app/history" replace />} />
      <Route path="/recommendations" element={<Navigate to="/app/recommendations" replace />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1e293b',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
