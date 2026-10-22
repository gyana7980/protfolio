import { useEffect, useState } from 'react';
import { navigate } from '../App.jsx';

export default function ProtectedRoute({ children }) {
  const [authenticated] = useState(() => Boolean(localStorage.getItem('portfolio-admin-token')));

  useEffect(() => {
    if (!authenticated) navigate('/');
  }, [authenticated]);

  return authenticated ? children : null;
}