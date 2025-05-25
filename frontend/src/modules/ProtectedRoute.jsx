import { Navigate } from 'react-router-dom';
import { useAuth } from '../modules/Store/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user } = useAuth();

    return user ? children : <Navigate to="/login" replace />;
}
