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
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
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

const CATEGORY_COLORS_DARK = {
  'Mid Semester Papers': 'bg-[#9E6752]/25 text-[#FED7A5] border-[#9E6752]/45',
  'End Semester Papers': 'bg-[#9E6752]/20 text-[#FED7A5] border-[#9E6752]/35',
  'Previous Year Questions': 'bg-[#534145]/40 text-[#FED7A5] border-[#534145]/60',
  'Textbooks': 'bg-[#2D4354]/50 text-[#93C5FD] border-[#2D4354]/70',
  'Reference Books': 'bg-[#73766A]/30 text-[#E5E7EB] border-[#73766A]/50',
  'Book Notes': 'bg-[#2D4354]/40 text-[#FED7A5] border-[#2D4354]/60',
  'Lecture Notes': 'bg-[#2D4354]/50 text-[#93C5FD] border-[#2D4354]/70',
  'Assignments': 'bg-[#73766A]/30 text-[#E5E7EB] border-[#73766A]/50',
  'Lab Manuals': 'bg-[#9E6752]/25 text-[#FED7A5] border-[#9E6752]/45',
  'Practical Files': 'bg-[#534145]/40 text-[#FED7A5] border-[#534145]/60',
  'Formula Sheets': 'bg-[#9E6752]/30 text-[#FED7A5] border-[#9E6752]/45',
  'Other Resources': 'bg-[#2B3642] text-[#C5C7BC] border-[#73766A]/40',
};

const getFileIcon = (mimeType = '', fileName = '', isDark = false) => {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pdf') || mimeType.includes('pdf')) {
    return (
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs border ${
          isDark
            ? 'bg-[#3D2820] text-[#FED7A5] border-[#9E6752]/50'
            : 'bg-[#FFF7EC] text-[#9E6752] border-[#9E6752]/30'
        }`}
      >
        <FileText className={`w-5 h-5 ${isDark ? 'text-[#FED7A5]' : 'text-[#9E6752]'}`} />
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
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs border ${
          isDark
            ? 'bg-[#253545] text-[#93C5FD] border-[#3B82F6]/30'
            : 'bg-[#2D4354]/10 text-[#2D4354] border-[#2D4354]/25'
        }`}
      >
        <FileText className={`w-5 h-5 ${isDark ? 'text-[#93C5FD]' : 'text-[#2D4354]'}`} />
      </div>
    );
  }
  if (
    lower.endsWith('.xlsx') ||
    lower.endsWith('.csv') ||
    mimeType.includes('sheet')
  ) {
    return (
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs border ${
          isDark
            ? 'bg-[#203328] text-[#86EFAC] border-[#22C55E]/30'
            : 'bg-[#73766A]/15 text-[#73766A] border-[#73766A]/25'
        }`}
      >
        <FileSpreadsheet className={`w-5 h-5 ${isDark ? 'text-[#86EFAC]' : 'text-[#73766A]'}`} />
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
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs border ${
          isDark
            ? 'bg-[#3A2430] text-[#F472B6] border-[#EC4899]/30'
            : 'bg-[#534145]/10 text-[#534145] border-[#534145]/25'
        }`}
      >
        <FileCode className={`w-5 h-5 ${isDark ? 'text-[#F472B6]' : 'text-[#534145]'}`} />
      </div>
    );
  }
  return (
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs border ${
        isDark
          ? 'bg-[#2B3642] text-[#C5C7BC] border-[#73766A]/30'
          : 'bg-[#FAF8F5] text-[#77756F] border-[#73766A]/20'
      }`}
    >
      <File className={`w-5 h-5 ${isDark ? 'text-[#C5C7BC]' : 'text-[#77756F]'}`} />
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

  // Minimise State (Persisted)
  const [isMinimized, setIsMinimized] = useState(() => {
    try {
      return localStorage.getItem('studypilot_srf_minimized') === 'true';
    } catch {
      return false;
    }
  });

  // Dark Theme Feature (Carefully Persisted & Self-Contained)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('studypilot_srf_theme');
      if (saved) return saved === 'dark';
      return document.documentElement.classList.contains('dark');
    } catch {
      return false;
    }
  });

  const toggleMinimize = () => {
    setIsMinimized((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('studypilot_srf_minimized', String(next));
      } catch {}
      return next;
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('studypilot_srf_theme', next ? 'dark' : 'light');
      } catch {}
      return next;
    });
  };

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
        console.error('Failed to search resources:', err);
        setErrorNotice(err.response?.data?.message || 'Error searching resources');
      } finally {
        setSearching(false);
      }
    },
    [searchQuery, selectedCategory, selectedSubject]
  );

  // 3. Fetch categories and detected subjects for filter tabs
  const fetchMetadata = useCallback(async () => {
    try {
      const [catRes, subRes] = await Promise.allSettled([
        resourcesAPI.getCategories(),
        resourcesAPI.getSubjects(),
      ]);

      if (catRes.status === 'fulfilled' && catRes.value.data?.success) {
        setAvailableCategories(catRes.value.data.data || []);
      }
      if (subRes.status === 'fulfilled' && subRes.value.data?.success) {
        setAvailableSubjects(subRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories/subjects:', err);
    }
  }, []);

  // Check URL parameters for OAuth status callbacks
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const driveStatus = params.get('drive_status');
    const driveError = params.get('drive_error');

    if (driveStatus === 'connected') {
      setSuccessNotice('Google Drive connected! Initial recursive file indexing started.');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (driveStatus === 'error' || driveError) {
      setErrorNotice(
        driveError
          ? decodeURIComponent(driveError)
          : 'Failed to authenticate with Google Drive. Please try again.'
      );
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchConnection().then((conn) => {
      if (conn && conn.folderId) {
        executeSearch();
        fetchMetadata();
      }
    });
  }, [fetchConnection, executeSearch, fetchMetadata]);

  // Polling while indexing status is 'indexing'
  useEffect(() => {
    if (connection?.indexingStatus === 'indexing') {
      pollingRef.current = setInterval(async () => {
        try {
          const statusRes = await resourcesAPI.getConnection();
          if (statusRes.data?.success && statusRes.data?.data) {
            const updated = statusRes.data.data;
            setConnection(updated);

            if (updated.indexingStatus !== 'indexing') {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
              executeSearch();
              fetchMetadata();
              setSuccessNotice(
                `Indexing complete! ${updated.totalIndexedResources || 0} academic files are ready.`
              );
            }
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 3000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [connection?.indexingStatus, executeSearch, fetchMetadata]);

  // Handle Drive Connection via Folder URL
  const handleConnect = async (e) => {
    e.preventDefault();
    if (!folderUrl.trim()) return;

    setErrorNotice('');
    setSuccessNotice('');
    setConnecting(true);

    try {
      const res = await resourcesAPI.connect({ folderUrl: folderUrl.trim() });
      if (res.data?.success && res.data?.authUrl) {
        window.location.href = res.data.authUrl;
      } else if (res.data?.success && res.data?.data) {
        setConnection(res.data.data);
        setSuccessNotice('Google Drive folder connected successfully!');
        executeSearch();
        fetchMetadata();
      }
    } catch (err) {
      console.error('Failed to initiate drive connection:', err);
      setErrorNotice(
        err.response?.data?.message ||
          'Failed to connect to Google Drive. Please ensure the link is a valid public or shared folder.'
      );
    } finally {
      setConnecting(false);
    }
  };

  // Handle Manual Sync / Refresh
  const handleSync = async () => {
    if (syncing || connection?.indexingStatus === 'indexing') return;
    setSyncing(true);
    setErrorNotice('');
    try {
      const res = await resourcesAPI.sync();
      if (res.data?.success) {
        setSuccessNotice('Sync initiated. Scanning for newly added or updated files...');
        setConnection((prev) => ({
          ...prev,
          indexingStatus: 'indexing',
        }));
      }
    } catch (err) {
      console.error('Sync failed:', err);
      setErrorNotice(err.response?.data?.message || 'Failed to start resource synchronization');
    } finally {
      setSyncing(false);
    }
  };

  // Handle Disconnect
  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect this Google Drive folder from StudyPilot AI? You can reconnect anytime.')) {
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
      }
    } catch (err) {
      console.error('Failed to disconnect drive:', err);
      setErrorNotice(err.response?.data?.message || 'Error disconnecting folder');
    } finally {
      setDisconnecting(false);
    }
  };

  // Search input debounce handler
  useEffect(() => {
    const timer = setTimeout(() => {
      if (connection?.folderId) {
        executeSearch(searchQuery, selectedCategory, selectedSubject);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedSubject, connection, executeSearch]);

  if (loading) {
    return (
      <div
        className={`rounded-3xl p-8 border shadow-xs flex items-center justify-center gap-3 transition-colors ${
          isDarkMode
            ? 'bg-[#181F26] border-[#2D4354]/60 text-[#C5C7BC]'
            : 'bg-white border-slate-200/80 text-slate-500'
        }`}
      >
        <Loader2
          className={`w-6 h-6 animate-spin ${isDarkMode ? 'text-[#FED7A5]' : 'text-blue-600'}`}
        />
        <span className="text-sm font-medium">Loading Smart Resource Finder...</span>
      </div>
    );
  }

  const isIndexing = connection?.indexingStatus === 'indexing';
  const hasConnectedFolder = Boolean(connection && connection.folderId);

  return (
    <div
      className={`rounded-3xl p-6 sm:p-8 transition-all duration-300 space-y-6 ${
        isDarkMode
          ? 'bg-[#181F26] border border-[#2D4354]/60 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.4)] hover:border-[#FED7A5]/40 text-[#FAF8F5]'
          : 'bg-white border border-[#73766A]/15 shadow-[0_4px_24px_-2px_rgba(45,67,84,0.04)] hover:border-[#2D4354]/30 text-[#20212B]'
      }`}
    >
      {/* 1. Header Section with Controls */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b transition-colors ${
          isDarkMode ? 'border-[#2D4354]/40' : 'border-[#73766A]/10'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2D4354] via-[#534145] to-[#9E6752] text-[#FED7A5] flex items-center justify-center shadow-md shadow-[#2D4354]/20 shrink-0">
            <FolderSearch className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3
                className={`text-lg sm:text-xl font-black tracking-tight ${
                  isDarkMode ? 'text-[#FAF8F5]' : 'text-[#20212B]'
                }`}
              >
                Smart Resource Finder
              </h3>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isDarkMode
                    ? 'bg-[#2D4354]/80 text-[#FED7A5] border-[#FED7A5]/40'
                    : 'text-[#2D4354] bg-[#FED7A5]/30 border-[#FED7A5]'
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#9E6752]" />
                Drive AI
              </span>
            </div>
            <p
              className={`text-xs sm:text-sm mt-0.5 font-medium ${
                isDarkMode ? 'text-[#C5C7BC]' : 'text-[#77756F]'
              }`}
            >
              Connect Your Academic Resources & Search Instantly
            </p>
          </div>
        </div>

        {/* Action controls: Connected buttons + Dark Theme toggle + Minimise toggle */}
        <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
          {hasConnectedFolder && (
            <>
              <button
                onClick={handleSync}
                disabled={syncing || isIndexing}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold shadow-2xs transition-all disabled:opacity-50 cursor-pointer ${
                  isDarkMode
                    ? 'border-[#344454] hover:border-[#FED7A5]/50 bg-[#222B34] hover:bg-[#2B3642] text-[#FAF8F5]'
                    : 'border-[#73766A]/20 hover:border-[#2D4354]/40 bg-white hover:bg-[#FAF8F5] text-[#20212B]'
                }`}
                title="Check Google Drive for new or updated documents"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    syncing || isIndexing
                      ? 'animate-spin text-[#FED7A5]'
                      : isDarkMode
                      ? 'text-[#FED7A5]'
                      : 'text-[#77756F]'
                  }`}
                />
                <span className="hidden sm:inline">
                  {syncing || isIndexing ? 'Syncing...' : 'Refresh Resources'}
                </span>
              </button>

              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isDarkMode
                    ? 'border-[#344454] hover:border-red-400 text-slate-400 hover:text-red-400 hover:bg-red-950/40'
                    : 'border-[#73766A]/20 hover:border-red-200 text-[#77756F] hover:text-red-600 hover:bg-red-50'
                }`}
                title="Disconnect Google Drive folder"
              >
                <Unlink className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Dark / Light Theme Toggle Feature */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
              isDarkMode
                ? 'border-[#FED7A5]/40 bg-[#222B34] hover:bg-[#2B3642] text-[#FED7A5] shadow-xs'
                : 'border-[#73766A]/20 hover:border-[#2D4354]/40 bg-white hover:bg-[#FAF8F5] text-[#2D4354]'
            }`}
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle dark theme"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-[#FED7A5] animate-in spin-in-90 duration-200" />
            ) : (
              <Moon className="w-4 h-4 text-[#2D4354] animate-in spin-in-90 duration-200" />
            )}
          </button>

          {/* Minimise / Expand Toggle Button */}
          <button
            onClick={toggleMinimize}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
              isDarkMode
                ? 'border-[#344454] hover:border-[#FED7A5]/50 bg-[#222B34] hover:bg-[#2B3642] text-[#FAF8F5]'
                : 'border-[#73766A]/20 hover:border-[#2D4354]/40 bg-white hover:bg-[#FAF8F5] text-[#20212B]'
            }`}
            title={isMinimized ? 'Expand Smart Resource Finder' : 'Minimise Smart Resource Finder'}
            aria-label={isMinimized ? 'Expand' : 'Minimise'}
          >
            <span className="text-xs font-semibold">
              {isMinimized ? 'Expand' : 'Minimise'}
            </span>
            {isMinimized ? (
              <ChevronDown className={`w-4 h-4 ${isDarkMode ? 'text-[#FED7A5]' : 'text-[#2D4354]'}`} />
            ) : (
              <ChevronUp className={`w-4 h-4 ${isDarkMode ? 'text-[#C5C7BC]' : 'text-[#77756F]'}`} />
            )}
          </button>
        </div>
      </div>

      {/* Compact Quick-Status Bar (Shown when Minimised) */}
      {isMinimized && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                hasConnectedFolder
                  ? isIndexing
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-emerald-400'
                  : 'bg-slate-400'
              }`}
            />
            <span
              className={`font-medium ${
                isDarkMode ? 'text-[#C5C7BC]' : 'text-[#77756F]'
              }`}
            >
              {hasConnectedFolder
                ? `${connection.folderName || 'Google Drive Folder'} • ${resources.length} academic resources indexed`
                : 'Google Drive folder not connected'}
            </span>
          </div>

          <button
            onClick={toggleMinimize}
            className={`self-start sm:self-auto inline-flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
              isDarkMode
                ? 'text-[#FED7A5] hover:text-white'
                : 'text-[#2D4354] hover:text-[#20212B]'
            }`}
          >
            <span>{hasConnectedFolder ? 'Open Search Workspace' : 'Connect folder link'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Body (Collapsed when Minimised) */}
      {!isMinimized && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Notifications */}
          {successNotice && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in ${
                isDarkMode
                  ? 'bg-[#2D251D] border border-[#9E6752]/60 text-[#FED7A5]'
                  : 'bg-[#FFF7EC] border border-[#FED7A5] text-[#2D4354]'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#9E6752]" />
                <span>{successNotice}</span>
              </div>
              <button
                onClick={() => setSuccessNotice('')}
                className={`hover:opacity-100 ${
                  isDarkMode ? 'text-[#FED7A5]/80 hover:text-white' : 'text-[#77756F] hover:text-[#20212B]'
                }`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {errorNotice && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in ${
                isDarkMode
                  ? 'bg-rose-950/40 border border-rose-800 text-rose-300'
                  : 'bg-rose-50 border border-rose-200 text-rose-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorNotice}</span>
              </div>
              <button
                onClick={() => setErrorNotice('')}
                className={`hover:opacity-100 ${
                  isDarkMode ? 'text-rose-300 hover:text-white' : 'text-rose-700 hover:text-rose-900'
                }`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 2. Disconnected / Link Input Form */}
          {!hasConnectedFolder ? (
            <div className="space-y-5">
              <p
                className={`text-xs sm:text-sm leading-relaxed ${
                  isDarkMode ? 'text-[#C5C7BC]' : 'text-[#77756F]'
                }`}
              >
                Connect your Google Drive folder to find notes, books, question papers and other academic resources instantly. No more digging through nested folders or losing semester study materials!
              </p>

              <form onSubmit={handleConnect} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div
                    className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                      isDarkMode ? 'text-slate-400' : 'text-[#77756F]'
                    }`}
                  >
                    <Link2 className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    required
                    value={folderUrl}
                    onChange={(e) => setFolderUrl(e.target.value)}
                    placeholder="Paste your Google Drive folder link (e.g. https://drive.google.com/drive/folders/...)"
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-xs sm:text-sm outline-none transition-all shadow-2xs ${
                      isDarkMode
                        ? 'bg-[#222B34] border-[#344454] text-[#FAF8F5] placeholder:text-[#73766A] focus:border-[#FED7A5] focus:ring-4 focus:ring-[#FED7A5]/15'
                        : 'bg-white border-[#73766A]/20 text-[#20212B] placeholder:text-[#77756F]/60 focus:border-[#2D4354] focus:ring-4 focus:ring-[#2D4354]/10'
                    }`}
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
                <div
                  className={`p-3 rounded-2xl border text-center transition-colors ${
                    isDarkMode
                      ? 'bg-[#222B34] border-[#344454]'
                      : 'bg-[#FAF8F5] border-[#73766A]/15'
                  }`}
                >
                  <span className="block text-base mb-1">⚡</span>
                  <p
                    className={`text-[11px] font-bold ${
                      isDarkMode ? 'text-[#FAF8F5]' : 'text-[#20212B]'
                    }`}
                  >
                    Instant Search
                  </p>
                  <p
                    className={`text-[10px] mt-0.5 ${
                      isDarkMode ? 'text-[#C5C7BC]' : 'text-[#77756F]'
                    }`}
                  >
                    Find files by keyword
                  </p>
                </div>
                <div
                  className={`p-3 rounded-2xl border text-center transition-colors ${
                    isDarkMode
                      ? 'bg-[#222B34] border-[#344454]'
                      : 'bg-[#FAF8F5] border-[#73766A]/15'
                  }`}
                >
                  <span className="block text-base mb-1">📂</span>
                  <p
                    className={`text-[11px] font-bold ${
                      isDarkMode ? 'text-[#FAF8F5]' : 'text-[#20212B]'
                    }`}
                  >
                    Recursive Scanning
                  </p>
                  <p
                    className={`text-[10px] mt-0.5 ${
                      isDarkMode ? 'text-[#C5C7BC]' : 'text-[#77756F]'
                    }`}
                  >
                    All nested subfolders
                  </p>
                </div>
                <div
                  className={`p-3 rounded-2xl border text-center transition-colors ${
                    isDarkMode
                      ? 'bg-[#222B34] border-[#344454]'
                      : 'bg-[#FAF8F5] border-[#73766A]/15'
                  }`}
                >
                  <span className="block text-base mb-1">🏷️</span>
                  <p
                    className={`text-[11px] font-bold ${
                      isDarkMode ? 'text-[#FAF8F5]' : 'text-[#20212B]'
                    }`}
                  >
                    Auto Classification
                  </p>
                  <p
                    className={`text-[10px] mt-0.5 ${
                      isDarkMode ? 'text-[#C5C7BC]' : 'text-[#77756F]'
                    }`}
                  >
                    PYQs, notes, books
                  </p>
                </div>
                <div
                  className={`p-3 rounded-2xl border text-center transition-colors ${
                    isDarkMode
                      ? 'bg-[#222B34] border-[#344454]'
                      : 'bg-[#FAF8F5] border-[#73766A]/15'
                  }`}
                >
                  <span className="block text-base mb-1">📑</span>
                  <p
                    className={`text-[11px] font-bold ${
                      isDarkMode ? 'text-[#FAF8F5]' : 'text-[#20212B]'
                    }`}
                  >
                    Direct File Links
                  </p>
                  <p
                    className={`text-[10px] mt-0.5 ${
                      isDarkMode ? 'text-[#C5C7BC]' : 'text-[#77756F]'
                    }`}
                  >
                    Open exact Drive file
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* 3. Connected Folder & Search Workspace */
            <div className="space-y-6">
              {/* Active Folder Badge & Status */}
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isDarkMode
                    ? 'bg-[#222B34] border-[#344454]'
                    : 'bg-[#FED7A5]/25 border-[#FED7A5]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#2D4354] text-[#FED7A5] flex items-center justify-center shrink-0 shadow-xs">
                    <FolderTree className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-xs sm:text-sm font-bold truncate ${
                          isDarkMode ? 'text-[#FAF8F5]' : 'text-[#20212B]'
                        }`}
                      >
                        {connection.folderName || 'Academic Resources Folder'}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isDarkMode
                            ? 'bg-[#181F26] text-[#FED7A5] border-[#344454]'
                            : 'text-[#2D4354] bg-white border-[#73766A]/20'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3 text-[#73766A]" />
                        Connected
                      </span>
                    </div>
                    <p
                      className={`text-[11px] flex items-center gap-2 mt-0.5 ${
                        isDarkMode ? 'text-[#C5C7BC]' : 'text-[#77756F]'
                      }`}
                    >
                      <span>
                        {connection.totalIndexedResources ?? resources.length} files indexed
                      </span>
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
                  <div
                    className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                      isDarkMode
                        ? 'text-slate-400 group-focus-within:text-[#FED7A5]'
                        : 'text-[#77756F] group-focus-within:text-[#2D4354]'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder='Search academic resources (e.g. "EMT mid sem paper", "Maths book", "Digital notes")...'
                    className={`w-full pl-11 pr-10 py-3.5 rounded-2xl border text-xs sm:text-sm font-medium outline-none transition-all shadow-xs ${
                      isDarkMode
                        ? 'bg-[#222B34] border-[#344454] text-[#FAF8F5] placeholder:text-[#73766A] focus:border-[#FED7A5] focus:ring-4 focus:ring-[#FED7A5]/15'
                        : 'bg-white border-[#73766A]/20 text-[#20212B] placeholder:text-[#77756F]/60 focus:border-[#2D4354] focus:ring-4 focus:ring-[#2D4354]/10'
                    }`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className={`absolute inset-y-0 right-0 pr-3.5 flex items-center ${
                        isDarkMode
                          ? 'text-slate-400 hover:text-white'
                          : 'text-[#77756F] hover:text-[#20212B]'
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Category Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider mr-1 shrink-0 ${
                      isDarkMode ? 'text-[#C5C7BC]' : 'text-[#77756F]'
                    }`}
                  >
                    Category:
                  </span>
                  {[
                    'All',
                    ...new Set([
                      'Mid Semester Papers',
                      'Previous Year Questions',
                      'Lecture Notes',
                      'Textbooks',
                      'Assignments',
                      'Lab Manuals',
                      ...availableCategories,
                    ]),
                  ].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full font-bold text-xs transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                        selectedCategory === cat
                          ? isDarkMode
                            ? 'bg-[#FED7A5] text-[#181F26] shadow-xs'
                            : 'bg-[#2D4354] text-[#FED7A5] shadow-xs'
                          : isDarkMode
                          ? 'bg-[#222B34] hover:bg-[#2B3642] text-[#C5C7BC] border border-[#344454]'
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
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider mr-1 shrink-0 ${
                        isDarkMode ? 'text-[#C5C7BC]' : 'text-[#77756F]'
                      }`}
                    >
                      Subject:
                    </span>
                    {['All', ...availableSubjects].map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubject(sub)}
                        className={`px-2.5 py-0.5 rounded-full font-medium text-[11px] transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                          selectedSubject === sub
                            ? isDarkMode
                              ? 'bg-[#2D4354] text-[#FED7A5] border border-[#FED7A5]/50'
                              : 'bg-[#2D4354] text-white'
                            : isDarkMode
                            ? 'bg-[#222B34] hover:bg-[#2B3642] text-[#C5C7BC] border border-[#344454]'
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
                  <p
                    className={`text-xs font-bold ${
                      isDarkMode ? 'text-[#FAF8F5]' : 'text-[#20212B]'
                    }`}
                  >
                    {searching ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2
                          className={`w-3.5 h-3.5 animate-spin ${
                            isDarkMode ? 'text-[#FED7A5]' : 'text-[#2D4354]'
                          }`}
                        />
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
                      className={`text-[11px] hover:underline font-semibold cursor-pointer ${
                        isDarkMode ? 'text-[#FED7A5]' : 'text-[#2D4354]'
                      }`}
                    >
                      Clear filters
                    </button>
                  )}
                </div>

                {/* Results Grid */}
                {resources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {resources.map((item) => {
                      const categoryStyle = isDarkMode
                        ? CATEGORY_COLORS_DARK[item.resourceType] ||
                          CATEGORY_COLORS_DARK['Other Resources']
                        : CATEGORY_COLORS[item.resourceType] ||
                          CATEGORY_COLORS['Other Resources'];

                      return (
                        <div
                          key={item._id || item.driveFileId}
                          className={`p-4.5 rounded-2xl border transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between group ${
                            isDarkMode
                              ? 'bg-[#222B34] border-[#344454] hover:border-[#FED7A5]/50 shadow-xs hover:shadow-[0_10px_28px_-4px_rgba(0,0,0,0.5)]'
                              : 'bg-white border-[#73766A]/15 hover:border-[#2D4354]/40 shadow-xs hover:shadow-[0_10px_28px_-4px_rgba(45,67,84,0.1)]'
                          }`}
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
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                    isDarkMode
                                      ? 'bg-[#181F26] text-[#FAF8F5] border-[#344454]'
                                      : 'bg-[#FAF8F5] text-[#20212B] border-[#73766A]/20'
                                  }`}
                                >
                                  <BookOpen
                                    className={`w-3 h-3 ${
                                      isDarkMode ? 'text-[#FED7A5]' : 'text-[#2D4354]'
                                    }`}
                                  />
                                  <span className="truncate max-w-[120px]">
                                    {item.subject}
                                  </span>
                                </span>
                              )}

                              {item.semester && (
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                    isDarkMode
                                      ? 'bg-[#2D4354]/60 text-[#FED7A5] border-[#FED7A5]/40'
                                      : 'bg-[#FED7A5]/30 text-[#2D4354] border-[#FED7A5]'
                                  }`}
                                >
                                  <GraduationCap className="w-3 h-3 text-[#9E6752]" />
                                  <span>{item.semester}</span>
                                </span>
                              )}
                            </div>

                            {/* File Name & Icon */}
                            <div className="flex items-start gap-3">
                              {getFileIcon(item.mimeType, item.fileName, isDarkMode)}
                              <div className="min-w-0 flex-1">
                                <h4
                                  className={`text-xs sm:text-sm font-bold transition-colors line-clamp-2 leading-snug ${
                                    isDarkMode
                                      ? 'text-[#FAF8F5] group-hover:text-[#FED7A5]'
                                      : 'text-[#20212B] group-hover:text-[#2D4354]'
                                  }`}
                                  title={item.fileName}
                                >
                                  {item.fileName}
                                </h4>
                              </div>
                            </div>

                            {/* Folder Path Breadcrumb */}
                            {item.folderPath && (
                              <p
                                className={`text-[11px] flex items-center gap-1 truncate font-medium ${
                                  isDarkMode ? 'text-[#C5C7BC]' : 'text-[#77756F]'
                                }`}
                                title={item.folderPath}
                              >
                                <ChevronRight
                                  className={`w-3 h-3 shrink-0 ${
                                    isDarkMode ? 'text-slate-500' : 'text-[#73766A]/40'
                                  }`}
                                />
                                <span className="truncate">{item.folderPath}</span>
                              </p>
                            )}
                          </div>

                          {/* Footer: Date & Direct File Navigation */}
                          <div
                            className={`flex items-center justify-between pt-3 mt-3 border-t text-xs ${
                              isDarkMode
                                ? 'border-[#344454] text-[#C5C7BC]'
                                : 'border-[#73766A]/10 text-[#77756F]'
                            }`}
                          >
                            <span className="text-[11px] font-medium">
                              {item.lastModifiedTime
                                ? new Date(item.lastModifiedTime).toLocaleDateString(
                                    undefined,
                                    {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    }
                                  )
                                : 'Drive File'}
                            </span>

                            <a
                              href={item.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-2xs group-hover:scale-102 ${
                                isDarkMode
                                  ? 'bg-[#181F26] hover:bg-[#FED7A5] text-[#FED7A5] hover:text-[#181F26] border border-[#344454]'
                                  : 'bg-[#FAF8F5] hover:bg-[#2D4354] text-[#2D4354] hover:text-[#FED7A5] border border-[#73766A]/20'
                              }`}
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
                  <div
                    className={`py-12 px-4 text-center rounded-2xl border border-dashed transition-colors ${
                      isDarkMode
                        ? 'bg-[#222B34]/40 border-[#344454] text-[#C5C7BC]'
                        : 'bg-slate-50/60 border-slate-200 text-slate-500'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
                        isDarkMode
                          ? 'bg-[#181F26] text-slate-400'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Search className="w-6 h-6" />
                    </div>
                    <h4
                      className={`text-sm font-bold ${
                        isDarkMode ? 'text-[#FAF8F5]' : 'text-slate-800'
                      }`}
                    >
                      {searchQuery
                        ? `No resources matching "${searchQuery}"`
                        : 'No academic resources found yet'}
                    </h4>
                    <p
                      className={`text-xs max-w-md mx-auto mt-1 ${
                        isDarkMode ? 'text-[#C5C7BC]' : 'text-slate-500'
                      }`}
                    >
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
                        className={`mt-3 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                          isDarkMode
                            ? 'bg-[#181F26] border-[#344454] text-[#FED7A5] hover:bg-[#2B3642]'
                            : 'bg-white border-slate-200 text-blue-600 hover:bg-slate-50'
                        }`}
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
      )}
    </div>
  );
};

export default SmartResourceFinder;