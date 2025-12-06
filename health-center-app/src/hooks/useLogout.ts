import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

export function useLogout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return handleLogout;
}
