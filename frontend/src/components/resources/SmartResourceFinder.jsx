import { useState, useEffect, useCallback, useRef } from 'react';
import { resourcesAPI } from '../../services/api';
import { GoogleLogo } from '../auth/GoogleSignInButton';
import {
  FolderSearch,
  Search,
  Link2,
  RefreshCw,
  ExternalLink,
  FileText,
  BookOpen,
  GraduationCap,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  FileCode,
  FileSpreadsheet,
  File,
  ChevronRight,
  ShieldCheck,
  FolderTree,
  Unlink,
} from 'lucide-react';

const CATEGORY_COLORS = {
  'Mid Semester Papers': 'bg-[#FED7A5]/35 text-[#9E6752] border-[#FED7A5]',
  'End Semester Papers': 'bg-[#FFF7EC] text-[#9E6752] border-[#9E6752]/30',
  'Previous Year Questions': 'bg-[#534145]/10 text-[#534145] border-[#534145]/25',
  'Textbooks': 'bg-[#2D4354]/10 text-[#2D4354] border-[#2D4354]/25',
  'Reference Books': 'bg-[#73766A]/15 text-[#73766A] border-[#73766A]/25',
  'Book Notes': 'bg-[#FFF7EC] text-[#2D4354] border-[#2D4354]/20',
  'Lecture Notes': 'bg-[#2D4354]/10 text-[#2D4354] border-[#2D4354]/30',
  'Assignments': 'bg-[#73766A]/15 text-[#73766A] border-[#73766A]/30',
  'Lab Manuals': 'bg-[#FED7A5]/35 text-[#9E6752] border-[#FED7A5]',
  'Practical Files': 'bg-[#534145]/10 text-[#534145] border-[#534145]/25',
  'Formula Sheets': 'bg-[#FED7A5]/40 text-[#9E6752] border-[#9E6752]/30',
  'Other Resources': 'bg-[#FAF8F5] text-[#77756F] border-[#73766A]/20',
};

const getFileIcon = (mimeType = '', fileName = '') => {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pdf') || mimeType.includes('pdf')) {
    return (
      <div className="w-9 h-9 rounded-xl bg-[#FFF7EC] text-[#9E6752] border border-[#9E6752]/30 flex items-center justify-center shrink-0 shadow-2xs">
        <FileText className="w-5 h-5 text-[#9E6752]" />
      </div>
    );
  }
  if (
    lower.endsWith('.docx') ||
    lower.endsWith('.doc') ||
    mimeType.includes('word') ||
    mimeType.includes('document')
  ) {
    return (
      <div className="w-9 h-9 rounded-xl bg-[#2D4354]/10 text-[#2D4354] border border-[#2D4354]/25 flex items-center justify-center shrink-0 shadow-2xs">
        <FileText className="w-5 h-5 text-[#2D4354]" />
      </div>
    );
  }
  if (
    lower.endsWith('.xlsx') ||
    lower.endsWith('.csv') ||
    mimeType.includes('sheet')
  ) {
    return (
      <div className="w-9 h-9 rounded-xl bg-[#73766A]/15 text-[#73766A] border border-[#73766A]/25 flex items-center justify-center shrink-0 shadow-2xs">
        <FileSpreadsheet className="w-5 h-5 text-[#73766A]" />
      </div>
    );
  }
  if (
    lower.endsWith('.py') ||
    lower.endsWith('.c') ||
    lower.endsWith('.cpp') ||
    lower.endsWith('.java')
  ) {
    return (
      <div className="w-9 h-9 rounded-xl bg-[#534145]/10 text-[#534145] border border-[#534145]/25 flex items-center justify-center shrink-0 shadow-2xs">
        <FileCode className="w-5 h-5 text-[#534145]" />
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] text-[#77756F] border border-[#73766A]/20 flex items-center justify-center shrink-0 shadow-2xs">
      <File className="w-5 h-5 text-[#77756F]" />
    </div>
  );
};

const SmartResourceFinder = () => {
  const [folderUrl, setFolderUrl] = useState('');
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Search and Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [resources, setResources] = useState([]);
  const [searching, setSearching] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);

  // Notifications
  const [errorNotice, setErrorNotice] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const pollingRef = useRef(null);

  // 1. Fetch initial connection info and handle OAuth return redirect
  const fetchConnection = useCallback(async () => {
    try {
      const res = await resourcesAPI.getConnection();
      if (res.data?.success && res.data?.data) {
        setConnection(res.data.data);
        if (res.data.data.folderUrl) {
          setFolderUrl(res.data.data.folderUrl);
        }
        return res.data.data;
      } else {
        setConnection(null);
      }
    } catch (err) {
      console.error('Failed to load drive connection:', err);
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  // 2. Fetch resources / execute search
  const executeSearch = useCallback(
    async (query = searchQuery, category = selectedCategory, subject = selectedSubject) => {
      setSearching(true);
      setErrorNotice('');
      try {
        const res = await resourcesAPI.search({
          query,
          category,
          subject,
        });

        if (res.data?.success) {
          setResources(res.data.data || []);
        }
      } catch (err) {
        console.error('Error searching resources:', err);
        setErrorNotice('Failed to perform search. Please try again.');
      } finally {
        setSearching(false);
      }
    },
    [searchQuery, selectedCategory, selectedSubject]
  );

  // 3. Fetch filter categories & subjects
  const fetchFilterMetadata = useCallback(async () => {
    try {
      const res = await resourcesAPI.getAll({ limit: 100 });
      if (res.data?.success) {
        setAvailableCategories(res.data.categories || []);
        setAvailableSubjects(res.data.subjects || []);
        if (!searchQuery.trim()) {
          setResources(res.data.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to load resource categories:', err);
    }
  }, [searchQuery]);

  // Handle OAuth callback from Google consent redirect
  useEffect(() => {
    const handleOAuthReturn = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const driveConnected = params.get('drive_connected');
      const oauthError = params.get('oauth_error');

      if (driveConnected) {
        setSuccessNotice('Google Drive connected! Indexing academic files...');
        window.history.replaceState({}, document.title, window.location.pathname);
        await fetchConnection();
        startStatusPolling();
        return;
      }

      if (oauthError) {
        setErrorNotice(`Google authorization notice: ${decodeURIComponent(oauthError)}`);
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (code) {
        let returnFolderUrl = '';
        if (state) {
          try {
            const parsedState = JSON.parse(atob(state));
            returnFolderUrl = parsedState.folderUrl || '';
          } catch (e) {
            // Ignore state parse errors
          }
        }

        setConnecting(true);
        setSuccessNotice('Google Drive authorized! Connecting folder and indexing academic files...');

        try {
          const callbackRes = await resourcesAPI.oauthCallback(
            code,
            returnFolderUrl || folderUrl
          );

          if (callbackRes.data?.success) {
            setSuccessNotice('Google Drive connected! Indexing resources...');
            // Clean up query string from browser URL
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
            await fetchConnection();
            startStatusPolling();
          }
        } catch (err) {
          console.error('OAuth callback failed:', err);
          setErrorNotice(
            err.response?.data?.message || 'Google Drive authorization failed.'
          );
        } finally {
          setConnecting(false);
        }
      } else {
        fetchConnection().then((conn) => {
          if (conn && conn.connectionStatus === 'connected') {
            fetchFilterMetadata();
            executeSearch('', 'All', 'All');
            if (conn.indexingStatus === 'indexing') {
              startStatusPolling();
            }
          }
        });
      }
    };

    handleOAuthReturn();

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [fetchConnection, fetchFilterMetadata, folderUrl]);

  // Polling for indexing progress
  const startStatusPolling = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await resourcesAPI.getIndexStatus();
        if (res.data?.success && res.data?.data) {
          const statusData = res.data.data;
          setConnection((prev) => (prev ? { ...prev, ...statusData } : statusData));

          if (statusData.indexingStatus === 'completed') {
            clearInterval(pollingRef.current);
            setSuccessNotice(
              `Indexing complete! Found and classified ${statusData.totalIndexed} academic documents.`
            );
            fetchFilterMetadata();
            executeSearch('', 'All', 'All');
          } else if (statusData.indexingStatus === 'error') {
            clearInterval(pollingRef.current);
            setErrorNotice(
              statusData.indexingProgress?.error || 'Indexing encountered an issue.'
            );
          }
        }
      } catch (err) {
        console.warn('Status poll error:', err);
      }
    }, 1500);
  };

  // Pre-load Google Identity Services SDK for popup authorization
  useEffect(() => {
    if (!window.google?.accounts?.oauth2) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  // Launch Google OAuth consent popup directly (eliminates redirect_uri mismatch errors)
  const requestDriveAccessToken = (callback) => {
    const googleClientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      '587914716488-7r29baaoc9t3euu4vvpddeh2eopvql10.apps.googleusercontent.com';

    const launchPopup = () => {
      try {
        if (!window.google?.accounts?.oauth2) {
          setErrorNotice('Google Identity Services SDK is still loading. Please try again in a moment.');
          setConnecting(false);
          return;
        }

        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'https://www.googleapis.com/auth/drive.readonly',
          callback: (response) => {
            if (response.error) {
              setErrorNotice(`Google authorization was not completed (${response.error}).`);
              setConnecting(false);
              return;
            }
            if (response.access_token) {
              callback(response.access_token);
            }
          },
          error_callback: (err) => {
            console.error('GIS token error:', err);
            setErrorNotice('Google authorization popup was closed or cancelled.');
            setConnecting(false);
          },
        });

        client.requestAccessToken({ prompt: 'consent' });
      } catch (initErr) {
        console.error('Failed to init GIS token client:', initErr);
        setErrorNotice('Could not initialize Google Drive authorization popup.');
        setConnecting(false);
      }
    };

    if (window.google?.accounts?.oauth2) {
      launchPopup();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => launchPopup();
      script.onerror = () => {
        setErrorNotice('Could not load Google Identity Services SDK.');
        setConnecting(false);
      };
      document.body.appendChild(script);
    }
  };

  // Connect Drive Folder
  const handleConnect = async (e) => {
    e?.preventDefault();
    const cleanUrl = folderUrl.trim();
    if (!cleanUrl) {
      setErrorNotice('Please paste your Google Drive folder link.');
      return;
    }

    setErrorNotice('');
    setSuccessNotice('');
    setConnecting(true);

    // Try connecting with existing backend credentials first
    try {
      const res = await resourcesAPI.connect(cleanUrl);

      if (res.data?.success && !res.data?.needsAuth) {
        setConnection(res.data.data);
        setSuccessNotice('Google Drive folder connected! Indexing academic files...');
        startStatusPolling();
        setConnecting(false);
        return;
      }

      // If Google authorization is needed, launch GIS popup directly (prevents redirect_uri_mismatch!)
      setSuccessNotice('Opening Google authorization popup to grant Drive folder read access...');
      requestDriveAccessToken(async (accessToken) => {
        try {
          setSuccessNotice('Google Drive authorized! Connecting folder and indexing academic files...');
          const tokenRes = await resourcesAPI.connectWithToken(accessToken, cleanUrl);
          if (tokenRes.data?.success) {
            setConnection(tokenRes.data.data);
            setSuccessNotice('Google Drive folder connected! Indexing academic files...');
            startStatusPolling();
          } else {
            setErrorNotice(tokenRes.data?.message || 'Could not connect folder.');
          }
        } catch (tokenErr) {
          setErrorNotice(
            tokenErr.response?.data?.message || 'Failed to connect folder with Google token.'
          );
        } finally {
          setConnecting(false);
        }
      });
    } catch (err) {
      console.error('Notice on connect check, launching popup:', err.message);
      // Fallback: Launch GIS popup token flow directly
      requestDriveAccessToken(async (accessToken) => {
        try {
          setSuccessNotice('Google Drive authorized! Connecting folder and indexing academic files...');
          const tokenRes = await resourcesAPI.connectWithToken(accessToken, cleanUrl);
          if (tokenRes.data?.success) {
            setConnection(tokenRes.data.data);
            setSuccessNotice('Google Drive folder connected! Indexing academic files...');
            startStatusPolling();
          } else {
            setErrorNotice(tokenRes.data?.message || 'Could not connect folder.');
          }
        } catch (tokenErr) {
          setErrorNotice(
            tokenErr.response?.data?.message || 'Failed to connect folder with Google token.'
          );
        } finally {
          setConnecting(false);
        }
      });
    }
  };

  // Sync / Refresh Drive
  const handleSync = async () => {
    if (syncing || !connection) return;
    setSyncing(true);
    setErrorNotice('');
    setSuccessNotice('');

    try {
      const res = await resourcesAPI.sync();
      if (res.data?.success) {
        setSuccessNotice('Checking Drive for newly added or modified documents...');
        startStatusPolling();
      } else {
        setErrorNotice(res.data?.message || 'Failed to start sync.');
      }
    } catch (err) {
      console.error('Error syncing resources:', err);
      setErrorNotice(
        err.response?.data?.message || 'Failed to sync Google Drive folder.'
      );
    } finally {
      setSyncing(false);
    }
  };

  // Disconnect Drive
  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect this Google Drive folder and remove all indexed document shortcuts?')) {
      return;
    }

    setDisconnecting(true);
    setErrorNotice('');
    try {
      const res = await resourcesAPI.disconnect();
      if (res.data?.success) {
        setConnection(null);
        setResources([]);
        setFolderUrl('');
        setSuccessNotice('Google Drive folder disconnected.');
        if (pollingRef.current) clearInterval(pollingRef.current);
      }
    } catch (err) {
      console.error('Error disconnecting drive:', err);
      setErrorNotice('Failed to disconnect Google Drive.');
    } finally {
      setDisconnecting(false);
    }
  };

  // Debounced search on query or category change
  useEffect(() => {
    if (!connection || connection.indexingStatus === 'indexing') return;

    const timer = setTimeout(() => {
      executeSearch(searchQuery, selectedCategory, selectedSubject);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedSubject, connection, executeSearch]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-sm font-medium text-slate-500">
          Loading Smart Resource Finder...
        </span>
      </div>
    );
  }

  const isIndexing = connection?.indexingStatus === 'indexing';
  const hasConnectedFolder = connection && connection.folderId;

  return (
    <div className="bg-white rounded-3xl border border-[#73766A]/15 p-6 sm:p-8 shadow-[0_4px_24px_-2px_rgba(45,67,84,0.04)] hover:border-[#2D4354]/30 transition-all space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#73766A]/10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2D4354] via-[#534145] to-[#9E6752] text-[#FED7A5] flex items-center justify-center shadow-md shadow-[#2D4354]/20 shrink-0">
            <FolderSearch className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-[#20212B] tracking-tight">
                Smart Resource Finder
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2D4354] bg-[#FED7A5]/30 px-2.5 py-0.5 rounded-full border border-[#FED7A5]">
                <Sparkles className="w-3 h-3 text-[#9E6752]" />
                Drive AI
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#77756F] mt-0.5 font-medium">
              Connect Your Academic Resources & Search Instantly
            </p>
          </div>
        </div>

        {/* Action controls when connected */}
        {hasConnectedFolder && (
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={handleSync}
              disabled={syncing || isIndexing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#73766A]/20 hover:border-[#2D4354]/40 bg-white hover:bg-[#FAF8F5] text-[#20212B] text-xs font-semibold shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
              title="Check Google Drive for new or updated documents"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${syncing || isIndexing ? 'animate-spin text-[#9E6752]' : 'text-[#77756F]'}`}
              />
              <span>{syncing || isIndexing ? 'Syncing...' : 'Refresh Resources'}</span>
            </button>

            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="p-2 rounded-xl border border-[#73766A]/20 hover:border-red-200 text-[#77756F] hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Disconnect Google Drive folder"
            >
              <Unlink className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Notifications */}
      {successNotice && (
        <div className="p-3.5 rounded-2xl bg-[#FFF7EC] border border-[#FED7A5] text-[#2D4354] text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#9E6752]" />
            <span>{successNotice}</span>
          </div>
          <button
            onClick={() => setSuccessNotice('')}
            className="text-[#77756F] hover:text-[#20212B]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorNotice && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorNotice}</span>
          </div>
          <button
            onClick={() => setErrorNotice('')}
            className="text-rose-700 hover:text-rose-900"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Disconnected / Link Input Form */}
      {!hasConnectedFolder ? (
        <div className="space-y-5">
          <p className="text-xs sm:text-sm text-[#77756F] leading-relaxed">
            Connect your Google Drive folder to find notes, books, question papers and other academic resources instantly. No more digging through nested folders or losing semester study materials!
          </p>

          <form onSubmit={handleConnect} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#77756F]">
                <Link2 className="w-4 h-4" />
              </div>
              <input
                type="url"
                required
                value={folderUrl}
                onChange={(e) => setFolderUrl(e.target.value)}
                placeholder="Paste your Google Drive folder link (e.g. https://drive.google.com/drive/folders/...)"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#73766A]/20 focus:border-[#2D4354] focus:ring-4 focus:ring-[#2D4354]/10 text-xs sm:text-sm text-[#20212B] placeholder:text-[#77756F]/60 outline-none transition-all shadow-2xs"
              />
            </div>

            <button
              type="submit"
              disabled={connecting}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#2D4354] hover:bg-[#20212B] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#2D4354]/20 hover:scale-101 active:scale-99 transition-all disabled:opacity-50 cursor-pointer shrink-0"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#FED7A5]" />
                  <span>Connecting Drive...</span>
                </>
              ) : (
                <>
                  <FolderSearch className="w-4 h-4 text-[#FED7A5]" />
                  <span>Connect Drive</span>
                </>
              )}
            </button>
          </form>

          {/* Value Props Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#73766A]/15 text-center">
              <span className="block text-base mb-1">⚡</span>
              <p className="text-[11px] font-bold text-[#20212B]">Instant Search</p>
              <p className="text-[10px] text-[#77756F] mt-0.5">Find files by keyword</p>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#73766A]/15 text-center">
              <span className="block text-base mb-1">📂</span>
              <p className="text-[11px] font-bold text-[#20212B]">Recursive Scanning</p>
              <p className="text-[10px] text-[#77756F] mt-0.5">All nested subfolders</p>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#73766A]/15 text-center">
              <span className="block text-base mb-1">🏷️</span>
              <p className="text-[11px] font-bold text-[#20212B]">Auto Classification</p>
              <p className="text-[10px] text-[#77756F] mt-0.5">PYQs, notes, books</p>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#73766A]/15 text-center">
              <span className="block text-base mb-1">📑</span>
              <p className="text-[11px] font-bold text-[#20212B]">Direct File Links</p>
              <p className="text-[10px] text-[#77756F] mt-0.5">Open exact Drive file</p>
            </div>
          </div>
        </div>
      ) : (
        /* 3. Connected Folder & Search Workspace */
        <div className="space-y-6">
          {/* Active Folder Badge & Status */}
          <div className="p-4 rounded-2xl bg-[#FED7A5]/25 border border-[#FED7A5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#2D4354] text-[#FED7A5] flex items-center justify-center shrink-0 shadow-xs">
                <FolderTree className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs sm:text-sm font-bold text-[#20212B] truncate">
                    {connection.folderName || 'Academic Resources Folder'}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#2D4354] bg-white px-2 py-0.5 rounded-full border border-[#73766A]/20">
                    <ShieldCheck className="w-3 h-3 text-[#73766A]" />
                    Connected
                  </span>
                </div>
                <p className="text-[11px] text-[#77756F] flex items-center gap-2 mt-0.5">
                  <span>{connection.totalIndexedResources ?? resources.length} files indexed</span>
                  {connection.googleEmail && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 truncate">
                        <GoogleLogo className="w-3 h-3 shrink-0" />
                        {connection.googleEmail}
                      </span>
                    </>
                  )}
                  {connection.lastSyncedAt && (
                    <>
                      <span>•</span>
                      <span>
                        Last synced{' '}
                        {new Date(connection.lastSyncedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Indexing status indicator */}
            {isIndexing && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFF7EC] border border-[#FED7A5] text-[#9E6752] text-xs font-medium animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9E6752]" />
                <span>
                  {connection.indexingProgress?.currentStage || 'Scanning Drive resources...'}
                </span>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="space-y-3">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#77756F] group-focus-within:text-[#2D4354] transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search academic resources (e.g. "EMT mid sem paper", "Maths book", "Digital notes")...'
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-[#73766A]/20 focus:border-[#2D4354] focus:ring-4 focus:ring-[#2D4354]/10 text-xs sm:text-sm font-medium text-[#20212B] placeholder:text-[#77756F]/60 outline-none transition-all shadow-xs bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#77756F] hover:text-[#20212B]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#77756F] mr-1 shrink-0">
                Category:
              </span>
              {['All', ...new Set(['Mid Semester Papers', 'Previous Year Questions', 'Lecture Notes', 'Textbooks', 'Assignments', 'Lab Manuals', ...availableCategories])].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full font-bold text-xs transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-[#2D4354] text-[#FED7A5] shadow-xs'
                      : 'bg-[#FAF8F5] hover:bg-[#FED7A5]/25 text-[#77756F]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Subject Filter (if multiple subjects detected) */}
            {availableSubjects.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#77756F] mr-1 shrink-0">
                  Subject:
                </span>
                {['All', ...availableSubjects].map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubject(sub)}
                    className={`px-2.5 py-0.5 rounded-full font-medium text-[11px] transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      selectedSubject === sub
                        ? 'bg-[#2D4354] text-white'
                        : 'bg-[#FAF8F5] hover:bg-[#FED7A5]/25 text-[#77756F] border border-[#73766A]/20'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. Results Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-[#20212B]">
                {searching ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2D4354]" />
                    Searching matching resources...
                  </span>
                ) : (
                  <span>Found {resources.length} matching resources</span>
                )}
              </p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedSubject('All');
                  }}
                  className="text-[11px] text-[#2D4354] hover:underline font-semibold"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Results Grid */}
            {resources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {resources.map((item) => {
                  const categoryStyle =
                    CATEGORY_COLORS[item.resourceType] || CATEGORY_COLORS['Other Resources'];

                  return (
                    <div
                      key={item._id || item.driveFileId}
                      className="p-4.5 rounded-2xl border border-[#73766A]/15 bg-white hover:border-[#2D4354]/40 shadow-xs hover:shadow-[0_10px_28px_-4px_rgba(45,67,84,0.1)] transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between group"
                    >
                      <div className="space-y-2.5">
                        {/* Top Metadata Badges */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${categoryStyle}`}
                          >
                            {item.resourceType || 'Resource'}
                          </span>

                          {item.subject && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#20212B] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#73766A]/20">
                              <BookOpen className="w-3 h-3 text-[#2D4354]" />
                              <span className="truncate max-w-[120px]">{item.subject}</span>
                            </span>
                          )}

                          {item.semester && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2D4354] bg-[#FED7A5]/30 px-2 py-0.5 rounded-md border border-[#FED7A5]">
                              <GraduationCap className="w-3 h-3 text-[#9E6752]" />
                              <span>{item.semester}</span>
                            </span>
                          )}
                        </div>

                        {/* File Name & Icon */}
                        <div className="flex items-start gap-3">
                          {getFileIcon(item.mimeType, item.fileName)}
                          <div className="min-w-0 flex-1">
                            <h4
                              className="text-xs sm:text-sm font-bold text-[#20212B] group-hover:text-[#2D4354] transition-colors line-clamp-2 leading-snug"
                              title={item.fileName}
                            >
                              {item.fileName}
                            </h4>
                          </div>
                        </div>

                        {/* Folder Path Breadcrumb */}
                        {item.folderPath && (
                          <p
                            className="text-[11px] text-[#77756F] flex items-center gap-1 truncate font-medium"
                            title={item.folderPath}
                          >
                            <ChevronRight className="w-3 h-3 shrink-0 text-[#73766A]/40" />
                            <span className="truncate">{item.folderPath}</span>
                          </p>
                        )}
                      </div>

                      {/* Footer: Date & Direct File Navigation */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#73766A]/10 text-xs">
                        <span className="text-[11px] text-[#77756F] font-medium">
                          {item.lastModifiedTime
                            ? new Date(item.lastModifiedTime).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Drive File'}
                        </span>

                        <a
                          href={item.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#2D4354] text-[#2D4354] hover:text-[#FED7A5] border border-[#73766A]/20 font-bold text-xs transition-all shadow-2xs group-hover:scale-102"
                          title="Open exact document in Google Drive"
                        >
                          <span>Open Resource</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty state */
              <div className="py-12 px-4 text-center rounded-2xl bg-slate-50/60 border border-dashed border-slate-200">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  {searchQuery
                    ? `No resources matching "${searchQuery}"`
                    : 'No academic resources found yet'}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  {searchQuery
                    ? 'Try searching by subject acronym (e.g. EMT, DBMS, Maths), resource category, or check your spelling.'
                    : 'Click "Refresh Resources" to scan newly uploaded files or verify that your Google Drive folder contains documents.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-blue-600 hover:bg-slate-50"
                  >
                    View All Resources
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartResourceFinder;