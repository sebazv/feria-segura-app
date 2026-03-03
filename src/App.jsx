import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import BottomNav from './components/BottomNav';

// Pages
import Home from './pages/original/Home';
import Login from './pages/Login';
import RegistrationFlow from './pages/RegistrationFlow';
import Loading from './pages/original/Loading';
import Confirmation from './pages/original/Confirmation';
import History from './pages/original/History';
import News from './pages/original/News';
import Chat from './pages/original/Chat';
import Encuestas from './pages/original/Encuestas';
import Profile from './pages/original/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminAlerts from './pages/admin/Alerts';
import AdminUsers from './pages/admin/Users';
import AdminSettings from './pages/admin/Settings';
import AdminMap from './pages/admin/Map';
import AdminNotifications from './pages/admin/Notifications';

// Layout with Bottom Nav
function AppLayout({ children }) {
    const { user } = useAuth();
    return (
        <>
            {children}
            {user && <BottomNav />}
        </>
    );
}

// Protected Route - allow navigation, just check auth
function ProtectedRoute({ children, requireAdmin = false }) {
    const { user, userData } = useAuth();
    
    // Allow access if user exists and is approved
    if (user && userData?.estado === 'ACTIVO') {
        if (requireAdmin && userData?.role !== 'admin') {
            return <Navigate to="/" replace />;
        }
        return children;
    }
    
    // Not logged in or not approved -> registration
    return <Navigate to="/registro" replace />;
}

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <AppLayout>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/registro" element={<RegistrationFlow />} />
                        <Route path="/loading" element={<Loading />} />
                        <Route path="/confirmation" element={<Confirmation />} />
                        
                        {/* Protected Routes */}
                        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                        <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
                        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                        <Route path="/encuestas" element={<ProtectedRoute><Encuestas /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        
                        {/* Admin Routes */}
                        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
                        <Route path="/admin/alerts" element={<ProtectedRoute requireAdmin><AdminAlerts /></ProtectedRoute>} />
                        <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
                        <Route path="/users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
                        <Route path="/admin/notifications" element={<ProtectedRoute requireAdmin><AdminNotifications /></ProtectedRoute>} />
                        <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminSettings /></ProtectedRoute>} />
                        <Route path="/admin/map" element={<ProtectedRoute requireAdmin><AdminMap /></ProtectedRoute>} />
                        
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AppLayout>
            </Router>
        </AuthProvider>
    );
}
