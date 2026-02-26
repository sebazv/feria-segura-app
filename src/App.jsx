import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/auth';

// Pages
import Home from './pages/original/Home';
import Login from './pages/Login';
import Loading from './pages/original/Loading';
import Confirmation from './pages/original/Confirmation';
import History from './pages/original/History';
import News from './pages/original/News';
import Chat from './pages/original/Chat';
import Encuestas from './pages/original/Encuestas';
import Profile from './pages/original/Profile';

// Simple Layout
function Layout({ children }) {
  return <div>{children}</div>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/history" element={<History />} />
          <Route path="/news" element={<News />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/encuestas" element={<Encuestas />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
