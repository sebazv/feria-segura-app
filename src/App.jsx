import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import { useStore } from './store';

// Original pages
import OriginalHome from './pages/original/Home';
import OriginalLoading from './pages/original/Loading';
import OriginalConfirmation from './pages/original/Confirmation';
import OriginalHistory from './pages/original/History';
import OriginalNews from './pages/original/News';
import OriginalProfile from './pages/original/Profile';

// Stitch pages
import StitchHome from './pages/stitch/Home';
import StitchLoading from './pages/stitch/Loading';
import StitchConfirmation from './pages/stitch/Confirmation';
import StitchHistory from './pages/stitch/History';
import StitchNews from './pages/stitch/News';
import StitchProfile from './pages/stitch/Profile';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AlertsPage from './pages/admin/Alerts';
import MapPage from './pages/admin/Map';
import UsersPage from './pages/admin/Users';
import SettingsPage from './pages/admin/Settings';

export default function App() {
  const { useStitchUI } = useStore();

  const Home = useStitchUI ? StitchHome : OriginalHome;
  const Loading = useStitchUI ? StitchLoading : OriginalLoading;
  const Confirmation = useStitchUI ? StitchConfirmation : OriginalConfirmation;
  const History = useStitchUI ? StitchHistory : OriginalHistory;
  const News = useStitchUI ? StitchNews : OriginalNews;
  const Profile = useStitchUI ? StitchProfile : OriginalProfile;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="history" element={<History />} />
          <Route path="news" element={<News />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Confirmation uses layout but hides nav */}
        <Route element={<Layout hideNav={true} />}>
          <Route path="/confirmation" element={<Confirmation />} />
        </Route>

        {/* Loading page for GPS */}
        <Route element={<Layout hideNav={true} />}>
          <Route path="/loading" element={<Loading />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
