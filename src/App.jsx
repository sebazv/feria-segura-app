import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import { useStore } from './store';
import { onAuthChange, getUsuarioDatos, logoutFeriante } from './lib/auth';

// Original pages
import OriginalHome from './pages/original/Home';
import OriginalLoading from './pages/original/Loading';
import OriginalConfirmation from './pages/original/Confirmation';
import OriginalHistory from './pages/original/History';
import OriginalNews from './pages/original/News';
import OriginalChat from './pages/original/Chat';
import OriginalEncuestas from './pages/original/Encuestas';
import OriginalProfile from './pages/original/Profile';

// Stitch pages
import StitchHome from './pages/stitch/Home';
import StitchLoading from './pages/stitch/Loading';
import StitchConfirmation from './pages/stitch/Confirmation';
import StitchHistory from './pages/stitch/History';
import StitchNews from './pages/stitch/News';
import StitchChat from './pages/stitch/Chat';
import StitchEncuestas from './pages/stitch/Encuestas';
import StitchProfile from './pages/stitch/Profile';

// Login
import Login from './pages/Login';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AlertsPage from './pages/admin/Alerts';
import MapPage from './pages/admin/Map';
import UsersPage from './pages/admin/Users';
import SettingsPage from './pages/admin/Settings';

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            if (firebaseUser) {
                const datos = await getUsuarioDatos(firebaseUser.uid);
                setUserData(datos.success ? datos.datos : null);
                setUser(firebaseUser);
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await logoutFeriante();
        setUser(null);
        setUserData(null);
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Protected Route wrapper
function ProtectedRoute({ children, requireAdmin = false }) {
    const { user, userData, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        } else if (!loading && requireAdmin && userData?.role !== 'admin') {
            navigate('/');
        }
    }, [user, userData, loading, navigate, requireAdmin]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return user ? children : null;
}

// Public route - redirect if logged in
function PublicRoute({ children }) {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return !user ? children : null;
}

function AppContent() {
    const { useStitchUI } = useStore();

    const Home = useStitchUI ? StitchHome : OriginalHome;
    const Loading = useStitchUI ? StitchLoading : OriginalLoading;
    const Confirmation = useStitchUI ? StitchConfirmation : OriginalConfirmation;
    const History = useStitchUI ? StitchHistory : OriginalHistory;
    const News = useStitchUI ? StitchNews : OriginalNews;
    const Chat = useStitchUI ? StitchChat : OriginalChat;
    const Encuestas = useStitchUI ? StitchEncuestas : OriginalEncuestas;
    const Profile = useStitchUI ? StitchProfile : OriginalProfile;

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
                <PublicRoute>
                    <Login />
                </PublicRoute>
            } />

            {/* Protected Routes */}
            <Route path="/" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route index element={<Home />} />
                <Route path="history" element={<History />} />
                <Route path="news" element={<News />} />
                <Route path="chat" element={<Chat />} />
                <Route path="encuestas" element={<Encuestas />} />
                <Route path="profile" element={<Profile />} />
            </Route>

            {/* Confirmation and Loading (protected) */}
            <Route path="/confirmation" element={
                <ProtectedRoute>
                    <Layout hideNav={true}>
                        <Confirmation />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/loading" element={
                <ProtectedRoute>
                    <Layout hideNav={true}>
                        <Loading />
                    </Layout>
                </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                    <AdminLayout />
                </ProtectedRoute>
            }>
                <Route index element={<AdminDashboard />} />
                <Route path="alerts" element={<AlertsPage />} />
                <Route path="map" element={<MapPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}
