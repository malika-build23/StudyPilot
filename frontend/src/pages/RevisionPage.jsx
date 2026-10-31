import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { revisionAPI } from '../services/api';
import RevisionDashboard from '../components/revision/RevisionDashboard';
import DailyRevisionSession from '../components/revision/DailyRevisionSession';
import { Loader2 } from 'lucide-react';

const RevisionPage = () => {
  const [searchParams] = useSearchParams();
  const deckParam = searchParams.get('deck') || '';
  const subjectParam = searchParams.get('subject') || '';

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active Revision Session State
  const [sessionActive, setSessionActive] = useState(false);
  const [dueItems, setDueItems] = useState([]);
  const [sessionLoading, setSessionLoading] = useState(false);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await revisionAPI.getOverview();
      if (res.data?.success) {
        setOverview(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load revision overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleStartRevision = async (scopeDeckId = '') => {
    try {
      setSessionLoading(true);
      const params = {};
      const targetDeck = scopeDeckId || deckParam;
      if (targetDeck) params.deckId = targetDeck;
      if (subjectParam) params.subjectId = subjectParam;

      const res = await revisionAPI.getToday(params);
      if (res.data?.success) {
        setDueItems(res.data.data || []);
        setSessionActive(true);
      }
    } catch (err) {
      console.error('Failed to start revision session:', err);
      alert('Failed to retrieve due cards for revision.');
    } finally {
      setSessionLoading(false);
    }
  };

  // Auto-start if ?deck= was passed
  useEffect(() => {
    if (deckParam && !sessionActive && !loading) {
      handleStartRevision(deckParam);
    }
  }, [deckParam, loading]);

  if (loading || sessionLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs text-slate-500 font-medium">
          {sessionLoading ? 'Loading cards due for revision...' : 'Opening revision dashboard...'}
        </p>
      </div>
    );
  }

  if (sessionActive) {
    return (
      <DailyRevisionSession
        dueItems={dueItems}
        onExitSession={() => {
          setSessionActive(false);
          fetchOverview();
        }}
        onFinishSession={() => {
          fetchOverview();
        }}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#20212B] tracking-tight">
            Spaced Repetition
          </h1>
          <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#FFF7EC] text-[#9E6752] border border-[#FED7A5]">
            SM-2 Algorithm
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#77756F] mt-1 font-medium">
          Intelligent memory retention schedule tailored to your recall performance
        </p>
      </div>

      <RevisionDashboard
        overview={overview}
        onStartRevision={handleStartRevision}
      />
    </div>
  );
};

export default RevisionPage;
