import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { useStore } from './store';

// Original pages
import OriginalHome from './pages/original/Home';
import OriginalConfirmation from './pages/original/Confirmation';
import OriginalNews from './pages/original/News';
import OriginalProfile from './pages/original/Profile';

// Stitch pages
import StitchHome from './pages/stitch/Home';
import StitchConfirmation from './pages/stitch/Confirmation';
import StitchNews from './pages/stitch/News';
import StitchProfile from './pages/stitch/Profile';

export default function App() {
  const { useStitchUI } = useStore();

  const Home = useStitchUI ? StitchHome : OriginalHome;
  const Confirmation = useStitchUI ? StitchConfirmation : OriginalConfirmation;
  const News = useStitchUI ? StitchNews : OriginalNews;
  const Profile = useStitchUI ? StitchProfile : OriginalProfile;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="news" element={<News />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Confirmation uses layout but hides nav */}
        <Route element={<Layout hideNav={true} />}>
          <Route path="/confirmation" element={<Confirmation />} />
        </Route>
      </Routes>
    </Router>
  );
}
