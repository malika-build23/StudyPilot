import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

// Google Official 4-Color 'G' Logo SVG
export const GoogleLogo = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

const GoogleSignInButton = ({
  onSuccess,
  onError,
  text = 'Continue with Google',
  disabled = false,
}) => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const googleBtnRef = useRef(null);

  // Check if Google Client ID is configured in frontend environment
  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    window.GOOGLE_CLIENT_ID ||
    '';

  useEffect(() => {
    // If Client ID is set, load and initialize Google Identity Services script
    if (!googleClientId) return;

    const loadScript = () => {
      if (window.google?.accounts?.id) {
        initGoogle();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initGoogle();
      script.onerror = () => {
        console.warn('Google Identity Services script failed to load.');
      };
      document.body.appendChild(script);
    };

    const initGoogle = () => {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Optionally render invisible or visible GIS button if container is present
        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: 360,
            text: 'continue_with',
            shape: 'rectangular',
          });
        }
      } catch (err) {
        console.error('Google accounts initialization error:', err);
      }
    };

    loadScript();
  }, [googleClientId]);

  const handleCredentialResponse = async (response) => {
    if (!response?.credential) {
      if (onError) onError('Google authorization token not received.');
      return;
    }

    setLoading(true);
    setNotice('');
    try {
      const result = await googleLogin(response.credential);
      if (result.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/dashboard');
        }
      } else {
        const msg = result.error || 'Failed to authenticate with Google.';
        setNotice(msg);
        if (onError) onError(msg);
      }
    } catch (err) {
      const msg = err.message || 'Network error during Google sign-in.';
      setNotice(msg);
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (loading || disabled) return;

    if (!googleClientId) {
      setNotice(
        'Google OAuth Client ID is not yet configured. Please set GOOGLE_CLIENT_ID in backend/.env and VITE_GOOGLE_CLIENT_ID in frontend/.env to complete live Google authorization.'
      );
      if (onError) {
        onError('GOOGLE_CLIENT_ID required in environment.');
      }
      return;
    }

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
      } catch (err) {
        console.error('Error prompting Google sign-in:', err);
      }
    } else {
      setNotice('Loading Google Sign-In SDK... Please try again in a moment.');
    }
  };

  return (
    <div className="w-full space-y-2">
      {notice && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <span className="font-semibold block">Google OAuth Notice</span>
            <span>{notice}</span>
          </div>
        </div>
      )}

      {/* Primary visible button with native Google GIS overlay */}
      <div className="relative w-full overflow-hidden rounded-xl">
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={loading || disabled}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm shadow-xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed group active:scale-99"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          ) : (
            <GoogleLogo className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" />
          )}
          <span>{loading ? 'Authenticating with Google...' : text}</span>
        </button>

        {/* Native GSI button overlay (fully clickable directly to launch OAuth popup) */}
        {!disabled && !loading && (
          <div
            ref={googleBtnRef}
            className="absolute inset-0 w-full h-full opacity-[0.001] z-10 cursor-pointer overflow-hidden flex items-center justify-center scale-125"
            title="Sign in with Google"
          />
        )}
      </div>
    </div>
  );
};

export default GoogleSignInButton;
