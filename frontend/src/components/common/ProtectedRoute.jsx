import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-slate-800 text-lg">StudyPilot AI</h3>
            <p className="text-sm text-slate-500 mt-1">Authenticating session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
