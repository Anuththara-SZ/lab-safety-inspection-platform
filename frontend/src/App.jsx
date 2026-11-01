import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Labs from './pages/Labs';
import LabDetail from './pages/LabDetail';
import Inspections from './pages/Inspections';
import InspectionDetail from './pages/InspectionDetail';
import Incidents from './pages/Incidents';
import Templates from './pages/Templates';
import Users from './pages/Users';

// Redirects to /login if not signed in, or home if the role is not permitted
function Protected({ roles, children }) {
  const { user } = useAuth();
  const location = useLocation();
  // Remember where the user was going (e.g. after scanning a lab QR code) so login can return there
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={from} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={from} replace /> : <Register />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/labs" element={<Labs />} />
        <Route path="/labs/:id" element={<LabDetail />} />
        <Route path="/inspections" element={<Inspections />} />
        <Route path="/inspections/:id" element={<InspectionDetail />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route
          path="/templates"
          element={
            <Protected roles={['admin', 'inspector']}>
              <Templates />
            </Protected>
          }
        />
        <Route
          path="/users"
          element={
            <Protected roles={['admin']}>
              <Users />
            </Protected>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
