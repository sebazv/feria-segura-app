import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Confirmation from './pages/Confirmation';
import News from './pages/News';
import Profile from './pages/Profile';

export default function App() {
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
