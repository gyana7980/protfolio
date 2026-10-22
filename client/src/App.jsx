import { useEffect, useState } from 'react';
import { fetchProfile } from './api';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Journey from './components/Journey.jsx';
import Skills from './components/Skills.jsx';
import Achievements from './components/Achievements.jsx';
import Contact from './components/Contact.jsx';
import HiddenLogin from './pages/HiddenLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import './styles/admin.css';

const secretRoute = (import.meta.env.VITE_ADMIN_ROUTE || '/portal-entry').replace(/\/+$/, '') || '/portal-entry';
const dashboardRoute = `${secretRoute}/dashboard`;

function normalizePath(path) {
  return path.length > 1 ? path.replace(/\/+$/, '') : path;
}

export function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => normalizePath(window.location.pathname));
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const updatePath = () => setCurrentPath(normalizePath(window.location.pathname));
    window.addEventListener('popstate', updatePath);
    return () => window.removeEventListener('popstate', updatePath);
  }, []);

  useEffect(() => {
    if (currentPath !== '/') return undefined;
    const openLogin = (event) => {
      if (event.ctrlKey && event.shiftKey && event.code === 'KeyA') {
        event.preventDefault();
        navigate(secretRoute);
      }
    };
    window.addEventListener('keydown', openLogin);
    return () => window.removeEventListener('keydown', openLogin);
  }, [currentPath]);

  useEffect(() => {
    if (currentPath !== '/' && currentPath !== secretRoute && currentPath !== dashboardRoute) {
      navigate('/');
    }
  }, [currentPath]);

  useEffect(() => {
    if (currentPath !== '/') return;
    fetchProfile().then(setProfile).catch((e) => setError(e.message));
  }, [currentPath]);

  if (currentPath === secretRoute) {
    return <HiddenLogin dashboardRoute={dashboardRoute} />;
  }
  if (currentPath === dashboardRoute) {
    return (
      <ProtectedRoute>
        <AdminDashboard onLogout={() => navigate('/')} />
      </ProtectedRoute>
    );
  }
  if (currentPath !== '/') return null;

  if (error) {
    return (
      <div className="state">
        <h1>Couldn't load the CV</h1>
        <p>{error}</p>
        <p className="mono">Is the API running and the database seeded?</p>
      </div>
    );
  }
  if (!profile) return <div className="state"><div className="loader" /></div>;

  return (
    <>
      <Nav name={profile.name} photo={profile.photo} />
      <main>
        <Hero profile={profile} />
        <About profile={profile} />
        <Journey profile={profile} />
        <Skills profile={profile} />
        <Achievements profile={profile} />
        <Contact profile={profile} />
      </main>
      <footer className="footer">
        <span>© {new Date().getFullYear()} {profile.name}</span>
      </footer>
    </>
  );
}
