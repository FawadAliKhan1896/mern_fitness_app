import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import WorkoutForm from './pages/WorkoutForm';
import WorkoutDetail from './pages/WorkoutDetail';
import Nutrition from './pages/Nutrition';
import Progress from './pages/Progress';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Export from './pages/Export';
import Support from './pages/Support';
import BodyTransformation from './pages/BodyTransformation';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/workouts" element={<ProtectedRoute><Layout><Workouts /></Layout></ProtectedRoute>} />
      <Route path="/workouts/new" element={<ProtectedRoute><Layout><WorkoutForm /></Layout></ProtectedRoute>} />
      <Route path="/workouts/:id" element={<ProtectedRoute><Layout><WorkoutDetail /></Layout></ProtectedRoute>} />
      <Route path="/workouts/:id/edit" element={<ProtectedRoute><Layout><WorkoutForm /></Layout></ProtectedRoute>} />
      <Route path="/nutrition" element={<ProtectedRoute><Layout><Nutrition /></Layout></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><Layout><Progress /></Layout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
      <Route path="/export" element={<ProtectedRoute><Layout><Export /></Layout></ProtectedRoute>} />
      <Route path="/support" element={<ProtectedRoute><Layout><Support /></Layout></ProtectedRoute>} />
      <Route path="/body-transformation" element={<ProtectedRoute><Layout><BodyTransformation /></Layout></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
