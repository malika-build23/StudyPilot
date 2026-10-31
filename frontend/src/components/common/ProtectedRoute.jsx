import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5]">
        <div className="flex flex-col items-center gap-4 p-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-[#F1F0ED]">
          <img src="/logo.png" alt="StudyPilot Logo" className="w-16 h-16 object-contain animate-float-gentle drop-shadow-md" />
          <div className="text-center">
            <h3 className="font-extrabold text-[#20212B] text-lg">StudyPilot AI</h3>
            <p className="text-xs text-[#77756F] mt-1 flex items-center justify-center gap-1.5 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2D4354]" />
              <span>Authenticating session...</span>
            </p>
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
