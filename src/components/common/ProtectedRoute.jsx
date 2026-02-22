import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="인증 확인 중..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
