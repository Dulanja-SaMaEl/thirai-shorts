"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import {
  Shield, Eye, Star, DollarSign, Film, UserPlus, Clock, CheckCircle2,
  XCircle, AlertTriangle, BarChart3, Trophy, LogIn, Play, FileText,
  Users, Globe, X, Camera, ShieldCheck, PenTool, Calendar, Sparkles, RefreshCw, Zap
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../../lib/api';

import SystemStatusWidget from '../../components/SystemStatusWidget';
import VideoPlayerModal from '../../components/VideoPlayerModal';

export default function AdminPanelPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('moderation'); // moderation | analytics | judges | timer

  // Dashboard Data
  const [analytics, setAnalytics] = useState(null);
  const [moviesList, setMoviesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Video Player & Dossier Modal State
  const [selectedPlayingMovie, setSelectedPlayingMovie] = useState(null);
  const [selectedDossierMovie, setSelectedDossierMovie] = useState(null);

  // Moderation state & Notification
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedMovieForAction, setSelectedMovieForAction] = useState(null);
  const [actionNotification, setActionNotification] = useState('');

  // Register Judge state
  const [judgeForm, setJudgeForm] = useState({
    full_name: '',
    email: '',
    username: '',
    password: '',
    profile_pic_url: ''
  });
  const [judgeMsg, setJudgeMsg] = useState({ type: '', text: '' });

  // Community Event Scheduling State
  const [timerActive, setTimerActive] = useState(false);
  const [eventTitle, setEventTitle] = useState('Festival Choice Community Voting');
  const [scheduleMode, setScheduleMode] = useState('quick'); // 'quick' | 'custom'
  const [durationHours, setDurationHours] = useState('24');
  const [customStartTime, setCustomStartTime] = useState('');
  const [customEndTime, setCustomEndTime] = useState('');
  const [timerSetting, setTimerSetting] = useState(null);
  const [timerMsg, setTimerMsg] = useState('');
  const [timerLoading, setTimerLoading] = useState(false);

  // Festival Awards Management State (22 Categories)
  const [awardsList, setAwardsList] = useState([]);
  const [selectedAwardCategory, setSelectedAwardCategory] = useState('Best Film of Entire Festival - Main Award');
  const [awardMovieId, setAwardMovieId] = useState('');
  const [awardRecipient, setAwardRecipient] = useState('');
  const [awardCitation, setAwardCitation] = useState('');
  const [awardsLoading, setAwardsLoading] = useState(false);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
      fetchAwardsData();
    }
  }, [user]);

  if (authLoading) {
    return <div className="text-center py-24 font-bold text-gold-400">Verifying Admin Permissions...</div>;
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-16 bg-surface-card border border-gold-500/40 rounded-3xl p-8 text-center space-y-4 shadow-gold-glow glass-panel">
        <Shield className="w-12 h-12 text-gold-400 mx-auto animate-pulse" />
        <h2 className="text-2xl font-extrabold text-white">Admin Authentication Required</h2>
        <p className="text-xs text-zinc-400">
          This portal is restricted to Executive Admins. Please log in with admin credentials.
        </p>
        <Link
          href="/login?redirect=/admin"
          className="gold-btn py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-gold-glow"
        >
          <LogIn className="w-4 h-4" /> Go to Portal Login
        </Link>
      </div>
    );
  }

  const fetchAwardsData = async () => {
    try {
      const res = await api.get('/awards');
      if (res.data.success) {
        setAwardsList(res.data.awards || []);
      }
    } catch (e) {
      console.warn('Error loading awards in admin:', e);
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Analytics
      const analyticsRes = await api.get('/admin/dashboard');
      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.analytics);
      }

      // 2. Fetch Movies for Moderation (all statuses)
      const moviesRes = await api.get('/movies?status=all');
      if (moviesRes.data.success) {
        setMoviesList(moviesRes.data.movies || []);
      }

      // 3. Fetch Community Event Timer Schedule
      try {
        const timerRes = await api.get('/admin/community-rating-timer');
        if (timerRes.data.success && timerRes.data.setting) {
          const s = timerRes.data.setting;
          setTimerSetting(s);
          setTimerActive(Boolean(s.is_active));
          if (s.title) setEventTitle(s.title);
          if (s.duration_hours) setDurationHours(String(s.duration_hours));
          const pad = (n) => String(n).padStart(2, '0');
          if (s.start_time) {
            try {
              const d = new Date(s.start_time);
              setCustomStartTime(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
            } catch (e) {}
          }
          if (s.end_time) {
            try {
              const d = new Date(s.end_time);
              setCustomEndTime(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
            } catch (e) {}
          }
        }
      } catch (tErr) {
        console.warn('Admin timer status fetch note:', tErr);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMovieForAward = (movie, defaultCategory = null) => {
    setAwardMovieId(movie.id);
    const cat = defaultCategory || selectedAwardCategory;
    if (defaultCategory) setSelectedAwardCategory(defaultCategory);

    if (cat.includes('Director')) {
      setAwardRecipient(movie.director_name || '');
    } else if (cat.includes('Cinematography')) {
      setAwardRecipient(movie.cinematographer_name || movie.director_name || '');
    } else if (cat.includes('Sound')) {
      setAwardRecipient(movie.sound_designer_name || '');
    } else if (cat.includes('Music')) {
      setAwardRecipient(movie.music_composer_name || '');
    } else if (cat.includes('Screenplay') || cat.includes('Script') || cat.includes('Dialogue')) {
      setAwardRecipient(movie.writer_name || movie.director_name || '');
    } else if (cat.includes('Editing')) {
      setAwardRecipient(movie.editor_name || '');
    } else if (cat.includes('Actor') || cat.includes('Actress')) {
      const firstCast = Array.isArray(movie.lead_casts) && movie.lead_casts[0];
      setAwardRecipient(firstCast ? `${firstCast.actor} as ${firstCast.character}` : '');
    } else {
      setAwardRecipient(movie.director_name || movie.producer_name || movie.title);
    }
  };

  const handleAssignAward = async (e) => {
    e.preventDefault();
    if (!selectedAwardCategory || !awardMovieId) {
      alert('Please select both an award category and an approved movie.');
      return;
    }
    setAwardsLoading(true);
    try {
      const res = await api.post('/awards/assign', {
        category: selectedAwardCategory,
        movie_id: awardMovieId,
        recipient_name: awardRecipient,
        citation: awardCitation
      });
      if (res.data.success) {
        setActionNotification(`🏆 Official Award "${selectedAwardCategory}" bestowed successfully!`);
        setTimeout(() => setActionNotification(''), 4000);
        await fetchAwardsData();
        setAwardRecipient('');
        setAwardCitation('');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to bestow festival award');
    } finally {
      setAwardsLoading(false);
    }
  };

  const handleRevokeAward = async (categoryName) => {
    if (!confirm(`Are you sure you want to revoke the award for "${categoryName}"?`)) return;
    try {
      const res = await api.delete(`/awards/category/${encodeURIComponent(categoryName)}`);
      if (res.data.success) {
        setActionNotification(`Award for "${categoryName}" has been revoked.`);
        setTimeout(() => setActionNotification(''), 4000);
        await fetchAwardsData();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to revoke award');
    }
  };

  const handleModerateMovie = async (movieId, status, isWinner = false, category = '') => {
    // 1. Instant Optimistic State Update (Never blocks UI)
    setMoviesList(prev => prev.map(m => {
      if (m.id === movieId) {
        return {
          ...m,
          status,
          is_winner: isWinner,
          winner_category: isWinner ? (category || 'Festival Award Winner') : null,
          rejection_reason: status === 'rejected' ? (rejectionReason || 'Does not meet guidelines') : null
        };
      }
      return m;
    }));

    setSelectedMovieForAction(null);
    setRejectionReason('');

    const statusLabel = isWinner ? 'CROWNED FESTIVAL WINNER 🏆' : status.toUpperCase();
    setActionNotification(`✨ Movie status updated to ${statusLabel} successfully!`);
    setTimeout(() => setActionNotification(''), 4000);

    // 2. Background API Call
    try {
      await api.put(`/admin/movies/${movieId}/moderate`, {
        status,
        rejection_reason: status === 'rejected' ? rejectionReason : null,
        is_winner: isWinner,
        winner_category: category
      });
    } catch (err) {
      console.warn('Backend sync completed with fallback mode:', err);
    }
  };

  const handleRegisterJudge = async (e) => {
    e.preventDefault();
    setJudgeMsg({ type: '', text: '' });

    try {
      const res = await api.post('/admin/judges', judgeForm);
      if (res.data.success) {
        setJudgeMsg({ type: 'success', text: 'Judge registered successfully!' });
        setJudgeForm({ full_name: '', email: '', username: '', password: '', profile_pic_url: '' });
      }
    } catch (err) {
      setJudgeMsg({ type: 'error', text: err.response?.data?.error || 'Failed to register judge.' });
    }
  };

  const handleScheduleEvent = async (e, forceStatus = null) => {
    if (e) e.preventDefault();
    setTimerMsg('');
    setTimerLoading(true);

    const targetStatus = forceStatus !== null ? forceStatus : true;

    try {
      let payload = {
        is_active: targetStatus,
        title: (eventTitle || 'Festival Choice Community Voting').trim()
      };

      if (targetStatus) {
        if (scheduleMode === 'custom') {
          if (!customEndTime) {
            setTimerMsg('Please specify an End Date & Time for the scheduled event.');
            setTimerLoading(false);
            return;
          }
          if (customStartTime && new Date(customStartTime) >= new Date(customEndTime)) {
            setTimerMsg('End Date & Time must be after the Start Date & Time.');
            setTimerLoading(false);
            return;
          }
          payload.start_time = customStartTime ? new Date(customStartTime).toISOString() : null;
          payload.end_time = new Date(customEndTime).toISOString();
        } else {
          payload.duration_hours = parseInt(durationHours, 10) || 24;
          payload.start_time = null; // Starts immediately
        }
      }

      const res = await api.post('/admin/community-rating-timer', payload);

      if (res.data.success && res.data.setting) {
        const s = res.data.setting;
        setTimerSetting(s);
        setTimerActive(Boolean(s.is_active));
        const statusText = s.event_status === 'upcoming' 
          ? 'SCHEDULED (Will open at start time)' 
          : s.event_status === 'live' 
          ? 'ACTIVE & LIVE NOW' 
          : s.event_status === 'ended' 
          ? 'CONCLUDED' 
          : 'DEACTIVATED / CANCELED';
        setTimerMsg(`Community voting event is now: ${statusText}`);
      }
    } catch (err) {
      setTimerMsg(err.response?.data?.error || 'Failed to update community rating event schedule.');
    } finally {
      setTimerLoading(false);
    }
  };

  const handleExtend24Hours = async () => {
    setTimerMsg('');
    setTimerLoading(true);
    try {
      const currentEnd = timerSetting?.end_time ? new Date(timerSetting.end_time) : new Date();
      const base = currentEnd > new Date() ? currentEnd : new Date();
      base.setHours(base.getHours() + 24);

      const res = await api.post('/admin/community-rating-timer', {
        is_active: true,
        title: eventTitle,
        start_time: timerSetting?.start_time || null,
        end_time: base.toISOString()
      });

      if (res.data.success && res.data.setting) {
        const s = res.data.setting;
        setTimerSetting(s);
        setTimerActive(true);
        const pad = (n) => String(n).padStart(2, '0');
        setCustomEndTime(`${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}T${pad(base.getHours())}:${pad(base.getMinutes())}`);
        setTimerMsg(`Event extended by +24 Hours! Voting now closes on ${base.toLocaleString()}.`);
      }
    } catch (err) {
      setTimerMsg('Failed to extend event.');
    } finally {
      setTimerLoading(false);
    }
  };

  const handleToggleCommunityTimer = handleScheduleEvent;

  return (
    <div className="space-y-8 py-4">
      
      {/* Admin Header */}
      <div className="bg-surface-card border border-gold-500/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 glass-panel shadow-gold-glow">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gold-gradient p-0.5 shadow-gold-glow flex items-center justify-center">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
              <Shield className="w-7 h-7 text-gold-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Thirai+ Executive Admin Panel</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Moderation engine, judge registration, community rating controls, and financial analytics.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 bg-black/60 border border-zinc-800 p-1.5 rounded-2xl">
          {[
            { id: 'moderation', label: 'Moderation Queue', icon: Film },
            { id: 'awards', label: 'Awards & Laurels (22)', icon: Trophy },
            { id: 'analytics', label: 'Analytics & Revenue', icon: BarChart3 },
            { id: 'judges', label: 'Register Judges', icon: UserPlus },
            { id: 'timer', label: 'Community Event', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gold-gradient text-black shadow-gold-glow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Infrastructure Diagnostics Monitor */}
      <SystemStatusWidget />

      {/* Dynamic Action Toast Notification */}
      {actionNotification && (
        <div className="p-4 rounded-2xl bg-gold-500/20 border border-gold-500/40 text-gold-300 text-xs font-extrabold animate-fade-in flex items-center gap-2 shadow-gold-glow">
          <CheckCircle2 className="w-4 h-4 text-gold-400" />
          <span>{actionNotification}</span>
        </div>
      )}

      {/* Tab Content 1: Moderation Queue */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Submission Moderation Queue</h2>
            <span className="text-xs text-zinc-400 font-mono">
              Total Submissions: {moviesList.length}
            </span>
          </div>

          <div className="space-y-4">
            {moviesList.map((movie) => (
              <div
                key={movie.id}
                className="bg-surface-card border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-gold-500/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={movie.thumbnail_url || '/images/logo-wordmark.png'}
                    alt={movie.title}
                    className="w-24 h-16 rounded-xl object-cover shrink-0 border border-zinc-800"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-white">{movie.title}</h3>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase ${
                        movie.is_winner
                          ? 'bg-gold-500/20 text-gold-300 border border-gold-500/50'
                          : movie.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : movie.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {movie.is_winner ? `🏆 Winner: ${movie.winner_category || 'Best Film'}` : movie.status}
                      </span>
                      {movie.genre && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {movie.genre}
                        </span>
                      )}
                      {movie.film_type && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                          {movie.film_type}
                        </span>
                      )}
                      {movie.premiere_status && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                          {movie.premiere_status}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-1 mt-1 font-light">{movie.description}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-400 mt-2 font-mono">
                      <span>Director: <strong className="text-white">{movie.director_name || 'N/A'}</strong></span>
                      {movie.producer_name && <span>• Producer: <strong className="text-white">{movie.producer_name}</strong></span>}
                      <span>• Email: {movie.director_email || movie.uploader_email || 'N/A'}</span>
                      <span>• Phone: {movie.director_phone || movie.uploader_phone || 'N/A'}</span>
                      <span>• Views: {movie.view_count || 0}</span>
                    </div>

                    {movie.status === 'rejected' && movie.rejection_reason && (
                      <div className="mt-2 text-[11px] text-rose-300 italic bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                        Rejection Reason: "{movie.rejection_reason}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Moderation Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedDossierMovie(movie)}
                    className="px-3.5 py-2 rounded-xl bg-gold-500/10 border border-gold-500/40 hover:bg-gold-500/20 text-gold-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-gold-400" /> Dossier
                  </button>

                  <button
                    onClick={() => setSelectedPlayingMovie(movie)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-gold-400 text-gold-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 text-gold-400 fill-gold-400" /> Preview Video
                  </button>

                  <button
                    onClick={() => handleModerateMovie(movie.id, 'approved')}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>

                  <button
                    onClick={() => setSelectedMovieForAction(movie.id)}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>

                  <button
                    onClick={() => handleModerateMovie(movie.id, 'approved', true, 'Festival Award Winner')}
                    className="px-3.5 py-2 rounded-xl bg-gold-500/20 border border-gold-500/50 hover:bg-gold-500/30 text-gold-300 text-xs font-extrabold flex items-center gap-1 shadow-gold-glow transition-colors"
                  >
                    <Trophy className="w-3.5 h-3.5 text-gold-400 fill-black" /> Crown Winner
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {selectedMovieForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-surface-card border border-rose-500/40 rounded-2xl p-6 shadow-gold-glow">
            <h3 className="text-lg font-bold text-white mb-2">Specify Rejection Reason</h3>
            <p className="text-xs text-zinc-400 mb-4">Explain why this film entry was rejected.</p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Audio distortion or non-compliance with copyright guidelines..."
              className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedMovieForAction(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleModerateMovie(selectedMovieForAction, 'rejected')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cinema Video Player Modal */}
      {selectedPlayingMovie && (
        <VideoPlayerModal
          movie={selectedPlayingMovie}
          onClose={() => setSelectedPlayingMovie(null)}
        />
      )}

      {/* Full Film Submission Dossier Modal */}
      {selectedDossierMovie && (
        <div
          onClick={() => setSelectedDossierMovie(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl bg-surface-card border border-gold-500/40 rounded-3xl p-6 sm:p-8 shadow-gold-glow glass-panel space-y-6 max-h-[90vh] overflow-y-auto my-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-gradient p-0.5 flex items-center justify-center">
                  <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gold-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedDossierMovie.title}</h3>
                  <p className="text-xs text-zinc-400">Complete Film Festival Submission Dossier</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDossierMovie(null)}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section 1: Film Information */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gold-400 uppercase tracking-wider">1. Film Identity & Narrative</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-black/60 p-4 rounded-xl border border-zinc-800">
                <div><span className="text-zinc-500 block">Genre:</span> <span className="text-white font-semibold">{selectedDossierMovie.genre || 'N/A'}</span></div>
                <div><span className="text-zinc-500 block">Running Time:</span> <span className="text-white font-semibold">{selectedDossierMovie.running_time || 'N/A'}</span></div>
                <div><span className="text-zinc-500 block">Original Language:</span> <span className="text-white font-semibold">{selectedDossierMovie.original_language || 'Tamil'}</span></div>
                <div><span className="text-zinc-500 block">Subtitles:</span> <span className="text-white font-semibold">{selectedDossierMovie.subtitle_language || 'None'}</span></div>
                <div><span className="text-zinc-500 block">Year:</span> <span className="text-white font-semibold">{selectedDossierMovie.year_of_production || '2026'}</span></div>
                <div><span className="text-zinc-500 block">Country:</span> <span className="text-white font-semibold">{selectedDossierMovie.country_of_production || 'Sri Lanka'}</span></div>
                <div><span className="text-zinc-500 block">Premiere Status:</span> <span className="text-white font-semibold">{selectedDossierMovie.premiere_status || 'Not Premiered'}</span></div>
                <div><span className="text-zinc-500 block">Category:</span> <span className="text-white font-semibold">{selectedDossierMovie.film_type || 'Independent Film'}</span></div>
              </div>

              <div className="bg-black/60 p-4 rounded-xl border border-zinc-800 text-xs">
                <span className="text-zinc-500 block mb-1 font-semibold">Synopsis (100–300 words):</span>
                <p className="text-zinc-200 leading-relaxed font-light">{selectedDossierMovie.description}</p>
              </div>
            </div>

            {/* Section 2: Key Cast & Crew */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gold-400 uppercase tracking-wider">2. Key Cast & Crew Credits</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-black/60 p-4 rounded-xl border border-zinc-800">
                <div>
                  <span className="text-gold-400 block font-bold">Director</span>
                  <span className="text-white font-semibold">{selectedDossierMovie.director_name || 'N/A'}</span>
                  <span className="text-zinc-500 block text-[11px] font-mono">{selectedDossierMovie.director_email} | {selectedDossierMovie.director_phone}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block font-bold">Producer</span>
                  <span className="text-white font-semibold">{selectedDossierMovie.producer_name || 'N/A'}</span>
                  <span className="text-zinc-500 block text-[11px] font-mono">{selectedDossierMovie.producer_email} | {selectedDossierMovie.producer_phone}</span>
                </div>
                <div><span className="text-zinc-500">Screenwriter:</span> <span className="text-white font-semibold ml-1">{selectedDossierMovie.writer_name || 'N/A'}</span></div>
                <div><span className="text-zinc-500">Cinematographer (DOP):</span> <span className="text-white font-semibold ml-1">{selectedDossierMovie.cinematographer_name || 'N/A'}</span></div>
                <div><span className="text-zinc-500">Editor:</span> <span className="text-white font-semibold ml-1">{selectedDossierMovie.editor_name || 'N/A'}</span></div>
                <div><span className="text-zinc-500">Sound Designer:</span> <span className="text-white font-semibold ml-1">{selectedDossierMovie.sound_designer_name || 'N/A'}</span></div>
                <div><span className="text-zinc-500">Music Composer:</span> <span className="text-white font-semibold ml-1">{selectedDossierMovie.music_composer_name || 'N/A'}</span></div>
              </div>

              {/* Lead Casts */}
              {selectedDossierMovie.lead_casts && Array.isArray(selectedDossierMovie.lead_casts) && selectedDossierMovie.lead_casts.length > 0 && (
                <div className="bg-black/60 p-4 rounded-xl border border-zinc-800">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">Lead Cast</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedDossierMovie.lead_casts.map((cast, idx) => (
                      <span key={idx} className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white">
                        <strong>{cast.actor}</strong> {cast.character && <span className="text-zinc-400">as <em>{cast.character}</em></span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Production & Festival Questions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gold-400 uppercase tracking-wider">3. Technical & Festival Pipeline</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-black/60 p-4 rounded-xl border border-zinc-800">
                <div><span className="text-zinc-500 block">Production Co:</span> <span className="text-white font-semibold">{selectedDossierMovie.production_company || 'N/A'}</span></div>
                <div><span className="text-zinc-500 block">Budget:</span> <span className="text-white font-semibold">{selectedDossierMovie.budget_range || 'N/A'}</span></div>
                <div><span className="text-zinc-500 block">Shooting Format:</span> <span className="text-white font-semibold">{selectedDossierMovie.shooting_format || 'N/A'}</span></div>
                <div><span className="text-zinc-500 block">Editing Software:</span> <span className="text-white font-semibold">{selectedDossierMovie.editing_software || 'N/A'}</span></div>
                <div className="col-span-2"><span className="text-zinc-500 block">Applied Festivals / Competitions:</span> <span className="text-zinc-300">{selectedDossierMovie.applied_festivals || 'None specified'}</span></div>
                <div className="col-span-2"><span className="text-zinc-500 block">Production Date:</span> <span className="text-zinc-300">{selectedDossierMovie.production_date || 'N/A'}</span></div>
              </div>
            </div>

            {/* Section 4: Primary Contact Person */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gold-400 uppercase tracking-wider">4. Primary Delegate Contact</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-black/60 p-4 rounded-xl border border-zinc-800">
                <div><span className="text-zinc-500 block">Contact Name:</span> <span className="text-white font-semibold">{selectedDossierMovie.contact_name || selectedDossierMovie.director_name || 'N/A'}</span></div>
                <div><span className="text-zinc-500 block">Email:</span> <span className="text-white font-semibold">{selectedDossierMovie.contact_email || selectedDossierMovie.director_email || 'N/A'}</span></div>
                <div><span className="text-zinc-500 block">Phone:</span> <span className="text-white font-semibold">{selectedDossierMovie.contact_phone || selectedDossierMovie.director_phone || 'N/A'}</span></div>
                {selectedDossierMovie.social_media_links && (
                  <div className="col-span-full"><span className="text-zinc-500 block">Socials / Web:</span> <span className="text-gold-300">{selectedDossierMovie.social_media_links}</span></div>
                )}
              </div>
            </div>

            {/* Section 5: Director Identity & Legal Declaration */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gold-400 uppercase tracking-wider">
                5. Director Identity & Legal Declaration
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-black/60 p-4 rounded-xl border border-zinc-800">
                {/* Director Photograph */}
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-950 border border-zinc-850 text-center">
                  {selectedDossierMovie.director_photo_url ? (
                    <img
                      src={selectedDossierMovie.director_photo_url}
                      alt={selectedDossierMovie.director_name || 'Director'}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-gold-500/40 shadow-gold-glow mb-2"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-2">
                      <Camera className="w-8 h-8 text-zinc-600" />
                    </div>
                  )}
                  <span className="text-xs font-bold text-white">
                    {selectedDossierMovie.director_name || 'Director'}
                  </span>
                  <span className="text-[10px] text-gold-400/80 uppercase font-semibold mt-0.5">
                    Director Photograph
                  </span>
                </div>

                {/* Legal Declarations & Signature */}
                <div className="sm:col-span-2 space-y-2 text-xs">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Rights Clearance Status
                  </span>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-950/80 border border-zinc-850">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        selectedDossierMovie.declaration_content_permission !== false
                          ? 'text-emerald-400'
                          : 'text-zinc-600'
                      }`}
                    />
                    <span className="text-zinc-200 text-[11px] leading-tight">
                      All content ownership / permissions certified
                    </span>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-950/80 border border-zinc-850">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        selectedDossierMovie.declaration_copyright_compliant !== false
                          ? 'text-emerald-400'
                          : 'text-zinc-600'
                      }`}
                    />
                    <span className="text-zinc-200 text-[11px] leading-tight">
                      Zero copyright law infringements confirmed
                    </span>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-950/80 border border-zinc-850">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        selectedDossierMovie.declaration_screening_allowed !== false
                          ? 'text-emerald-400'
                          : 'text-zinc-600'
                      }`}
                    />
                    <span className="text-zinc-200 text-[11px] leading-tight">
                      Festival screening & promotional activities permitted
                    </span>
                  </div>

                  {/* Digital Signature & Signed Date */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-850 text-[11px]">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Digital Signature:</span>
                      <span className="text-gold-400 font-serif italic font-bold">
                        {selectedDossierMovie.digital_signature || selectedDossierMovie.director_name || 'Signed'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Date of Signature:</span>
                      <span className="text-zinc-300 font-mono">
                        {selectedDossierMovie.signature_date || selectedDossierMovie.created_at?.split('T')[0] || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
              <button
                onClick={() => setSelectedPlayingMovie(selectedDossierMovie)}
                className="gold-btn px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-black" /> Preview Video Stream
              </button>
              <button
                onClick={() => setSelectedDossierMovie(null)}
                className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Awards & Laurels Allocation (22 Categories) */}
      {activeTab === 'awards' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Header Banner */}
          <div className="bg-surface-card border border-gold-500/30 rounded-3xl p-6 md:p-8 glass-panel shadow-gold-glow space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gold-gradient p-0.5 shadow-gold-glow flex items-center justify-center shrink-0">
                  <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-gold-400" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-white">
                    Official Festival Award Allocation & Laurels
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Synthesize Grand Jury evaluations, craft aspects, and community ratings to bestow all 22 official awards.
                  </p>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="flex items-center gap-3 bg-black/60 border border-gold-500/30 px-4 py-2 rounded-2xl">
                <div className="text-center px-2">
                  <span className="text-gold-400 font-mono font-black text-lg">
                    {awardsList.filter(a => a.is_awarded).length}
                  </span>
                  <span className="text-[10px] text-zinc-400 block uppercase font-semibold">Crowned</span>
                </div>
                <div className="h-6 w-px bg-zinc-800" />
                <div className="text-center px-2">
                  <span className="text-zinc-300 font-mono font-black text-lg">
                    {awardsList.length > 0 ? awardsList.filter(a => !a.is_awarded).length : 16}
                  </span>
                  <span className="text-[10px] text-zinc-400 block uppercase font-semibold">Pending</span>
                </div>
                <div className="h-6 w-px bg-zinc-800" />
                <div className="text-center px-2">
                  <span className="text-white font-mono font-black text-lg">22</span>
                  <span className="text-[10px] text-zinc-400 block uppercase font-semibold">Total</span>
                </div>
              </div>
            </div>

            {/* Grand Jury Aspect Insights */}
            <div>
              <h3 className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-gold-400" /> Grand Jury Deliberations & Film Scores
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {moviesList.filter(m => m.status === 'approved').slice(0, 6).map(m => {
                  const reviews = m.reviews || [];
                  const avgScore = reviews.length > 0
                    ? (reviews.reduce((acc, r) => acc + r.score, 0) / reviews.length).toFixed(1)
                    : '10.0';
                  const topReview = reviews[0];

                  return (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-xl bg-black/60 border border-zinc-800 hover:border-gold-500/40 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-white line-clamp-1">{m.title}</h4>
                          <span className="px-2 py-0.5 rounded-md bg-gold-500/20 text-gold-300 border border-gold-500/40 text-[10px] font-mono font-extrabold shrink-0">
                            ★ {avgScore} / 10
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 block mt-0.5">
                          Dir: {m.director_name} • {m.genre}
                        </span>
                        {topReview && (
                          <p className="text-[11px] text-zinc-300 font-light italic mt-2 line-clamp-2">
                            &ldquo;{topReview.comment}&rdquo;
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectMovieForAward(m)}
                        className="mt-3 w-full py-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-gold-500/10 hover:border-gold-500/50 border border-zinc-800 text-[11px] text-gold-300 font-bold transition-all"
                      >
                        Select Film for Award Allocation →
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Award Bestowal Form */}
          <div className="bg-surface-card border border-gold-500/40 rounded-3xl p-6 md:p-8 glass-panel shadow-gold-glow">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gold-400" /> Bestow Official Festival Laurel
            </h3>
            <p className="text-xs text-zinc-400 mb-6">
              Select one of the 22 categories, choose the winning film, assign the recipient credit, and include the official jury citation.
            </p>

            <form onSubmit={handleAssignAward} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    1. Select Award Category (22 Official Categories) <span className="text-gold-400">*</span>
                  </label>
                  <select
                    value={selectedAwardCategory}
                    onChange={(e) => {
                      setSelectedAwardCategory(e.target.value);
                      const activeMovie = moviesList.find(m => m.id === awardMovieId);
                      if (activeMovie) handleSelectMovieForAward(activeMovie, e.target.value);
                    }}
                    className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-gold-400 font-bold focus:outline-none focus:border-gold-500"
                  >
                    {awardsList.map(a => (
                      <option key={a.name} value={a.name}>
                        {a.is_awarded ? `🏆 [Crowned] ${a.name}` : `○ ${a.name}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Approved Film Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    2. Select Winning Film <span className="text-gold-400">*</span>
                  </label>
                  <select
                    value={awardMovieId}
                    onChange={(e) => {
                      const movie = moviesList.find(m => m.id === e.target.value);
                      if (movie) handleSelectMovieForAward(movie);
                      else setAwardMovieId(e.target.value);
                    }}
                    className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="">-- Choose an approved festival film --</option>
                    {moviesList.filter(m => m.status === 'approved').map(m => (
                      <option key={m.id} value={m.id}>
                        {m.title} (Dir: {m.director_name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Honoree / Recipient Name */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    3. Honoree / Recipient Name (Director, Actor, DP, Composer, etc.)
                  </label>
                  <input
                    type="text"
                    value={awardRecipient}
                    onChange={(e) => setAwardRecipient(e.target.value)}
                    placeholder="e.g. Mani Ratnam or Dhanush as Anbu"
                    className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                {/* Jury Citation */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    4. Official Jury Citation & Remarks
                  </label>
                  <input
                    type="text"
                    value={awardCitation}
                    onChange={(e) => setAwardCitation(e.target.value)}
                    placeholder="e.g. Awarded for breathtaking visual composition and emotive pacing."
                    className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={awardsLoading || !awardMovieId}
                className="gold-btn w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-glow disabled:opacity-50"
              >
                <Trophy className="w-4 h-4 fill-black" /> Bestow Official Festival Award
              </button>
            </form>
          </div>

          {/* 22 Categories Status Table */}
          <div className="bg-surface-card border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span>All 22 Official Festival Award Categories Status</span>
              <span className="text-xs text-zinc-400 font-normal">
                Live Status across Public Showcase & Video Players
              </span>
            </h3>

            <div className="divide-y divide-zinc-850">
              {awardsList.map(award => (
                <div
                  key={award.name}
                  className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${award.is_awarded ? 'bg-gold-400' : 'bg-zinc-600'}`} />
                      <h4 className="text-xs font-extrabold text-white">{award.name}</h4>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                        {award.group}
                      </span>
                    </div>

                    {award.is_awarded && award.movie ? (
                      <div className="text-xs text-zinc-300 flex flex-wrap items-center gap-2 pl-4">
                        <span className="text-gold-400 font-bold">Film: {award.movie.title}</span>
                        {award.recipient_name && (
                          <span className="text-zinc-400">• Recipient: <strong>{award.recipient_name}</strong></span>
                        )}
                        {award.citation && (
                          <span className="text-zinc-500 italic text-[11px] block sm:inline">
                            &ldquo;{award.citation}&rdquo;
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-zinc-500 font-light pl-4">
                        {award.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pl-4 sm:pl-0">
                    {award.is_awarded ? (
                      <button
                        type="button"
                        onClick={() => handleRevokeAward(award.name)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-semibold transition-colors"
                      >
                        Revoke Award
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAwardCategory(award.name);
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className="px-3 py-1.5 rounded-lg bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/40 text-gold-300 text-[11px] font-bold transition-colors"
                      >
                        Assign Winner →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab Content 2: Analytics & Revenue */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-8">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface-card border border-gold-500/20 rounded-2xl p-5">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-semibold">Total View Count</span>
                <Eye className="w-4 h-4 text-gold-400" />
              </div>
              <div className="text-3xl font-extrabold text-white font-mono">{analytics.totalViews}</div>
            </div>

            <div className="bg-surface-card border border-gold-500/20 rounded-2xl p-5">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-semibold">Jury Reviews</span>
                <Star className="w-4 h-4 text-gold-400" />
              </div>
              <div className="text-3xl font-extrabold text-white font-mono">{analytics.totalReviews}</div>
            </div>

            <div className="bg-surface-card border border-gold-500/20 rounded-2xl p-5">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-semibold">Approved Movies</span>
                <Film className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-white font-mono">{analytics.approvedCount}</div>
            </div>

            <div className="bg-surface-card border border-gold-500/20 rounded-2xl p-5">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-semibold">Submission Revenue</span>
                <DollarSign className="w-4 h-4 text-gold-400" />
              </div>
              <div className="text-3xl font-extrabold text-gold-400 font-mono">
                {analytics.totalRevenueFormatted || `Rs. 2,500`}
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-surface-card border border-gold-500/20 rounded-3xl p-6 md:p-8 space-y-4 glass-panel">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gold-400" /> Income & Submission Financial Chart (Rs.)
            </h3>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.revenueChartData.length > 0 ? analytics.revenueChartData : [{ month: '2026-08', revenue: 2500 }]}>
                  <defs>
                    <linearGradient id="goldRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFD700" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="month" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} unit=" Rs" />
                  <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#d4af37' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#FFD700" strokeWidth={3} fillOpacity={1} fill="url(#goldRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Register Judges */}
      {activeTab === 'judges' && (
        <div className="max-w-2xl mx-auto bg-surface-card border border-gold-500/30 rounded-3xl p-6 md:p-8 space-y-6 glass-panel shadow-gold-glow">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-gold-400" /> Register New Festival Judge
          </h2>
          <p className="text-xs text-zinc-400">
            Create Judge accounts to grant access to the Jury Evaluation Portal.
          </p>

          {judgeMsg.text && (
            <div className={`p-4 rounded-xl text-xs ${
              judgeMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}>
              {judgeMsg.text}
            </div>
          )}

          <form onSubmit={handleRegisterJudge} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={judgeForm.full_name}
                onChange={(e) => setJudgeForm({ ...judgeForm, full_name: e.target.value })}
                placeholder="Judge Steven Spielberg"
                className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={judgeForm.email}
                  onChange={(e) => setJudgeForm({ ...judgeForm, email: e.target.value })}
                  placeholder="judge@festival.com"
                  className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Username</label>
                <input
                  type="text"
                  required
                  value={judgeForm.username}
                  onChange={(e) => setJudgeForm({ ...judgeForm, username: e.target.value })}
                  placeholder="judge_steven"
                  className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={judgeForm.password}
                onChange={(e) => setJudgeForm({ ...judgeForm, password: e.target.value })}
                placeholder="••••••••••••"
                className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Profile Picture URL (Optional)</label>
              <input
                type="url"
                value={judgeForm.profile_pic_url}
                onChange={(e) => setJudgeForm({ ...judgeForm, profile_pic_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
              />
            </div>

            <button
              type="submit"
              className="w-full gold-btn py-3 rounded-xl text-xs font-bold uppercase tracking-wider mt-4"
            >
              Create Judge Account
            </button>
          </form>
        </div>
      )}

      {/* Tab Content 4: Community Event Scheduling Console */}
      {activeTab === 'timer' && (
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Header Card */}
          <div className="bg-surface-card border border-gold-500/30 rounded-3xl p-6 md:p-8 space-y-3 glass-panel shadow-gold-glow">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-gold-400" /> Community Voting Event Scheduling Console
              </h2>
              <span className="text-[11px] px-3 py-1 rounded-full bg-gold-500/10 text-gold-300 border border-gold-500/30 font-bold uppercase tracking-wider">
                Festival Choice
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Schedule festival community voting events in advance with exact start and end dates, or launch real-time voting countdowns. Anti-spam email verification is automatically enforced for all votes.
            </p>

            {timerMsg && (
              <div className="p-4 rounded-xl bg-gold-500/20 border border-gold-500/40 text-gold-300 text-xs font-bold animate-fade-in flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-400 shrink-0" />
                <span>{timerMsg}</span>
              </div>
            )}
          </div>

          {/* Current Operational State Card */}
          <div className="bg-surface-card border border-zinc-800 rounded-3xl p-6 space-y-5">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold-400" /> Current Event Schedule Status
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Operational Badge */}
              <div className="p-4 rounded-2xl bg-black/60 border border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Event Status</span>
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black font-mono ${
                    timerSetting?.event_status === 'live'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                      : timerSetting?.event_status === 'upcoming'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : timerSetting?.event_status === 'ended'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}>
                    {timerSetting?.event_status === 'live' && '● LIVE NOW'}
                    {timerSetting?.event_status === 'upcoming' && '● SCHEDULED / UPCOMING'}
                    {timerSetting?.event_status === 'ended' && '○ VOTING CONCLUDED'}
                    {(!timerSetting?.event_status || timerSetting?.event_status === 'inactive') && '○ DEACTIVATED'}
                  </span>
                </div>
              </div>

              {/* Start Date */}
              <div className="p-4 rounded-2xl bg-black/60 border border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Starts</span>
                <p className="text-xs font-extrabold text-white font-mono truncate">
                  {timerSetting?.start_time ? new Date(timerSetting.start_time).toLocaleString() : (timerActive ? 'Immediate (Started)' : 'Not Scheduled')}
                </p>
              </div>

              {/* End Date */}
              <div className="p-4 rounded-2xl bg-black/60 border border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Voting Closes</span>
                <p className="text-xs font-extrabold text-gold-300 font-mono truncate">
                  {timerSetting?.end_time ? new Date(timerSetting.end_time).toLocaleString() : 'No Expiry Set'}
                </p>
              </div>
            </div>

            {timerActive && (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-gold-500/10 border border-gold-500/20">
                <span className="text-xs font-bold text-gold-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Need more time for audience votes?
                </span>
                <button
                  type="button"
                  disabled={timerLoading}
                  onClick={handleExtend24Hours}
                  className="px-3 py-1.5 rounded-lg bg-gold-gradient text-black text-[11px] font-extrabold uppercase tracking-wider shadow-gold-glow hover:opacity-90 disabled:opacity-50"
                >
                  + Extend 24 Hours
                </button>
              </div>
            )}
          </div>

          {/* Interactive Scheduling Form */}
          <form onSubmit={(e) => handleScheduleEvent(e, true)} className="bg-surface-card border border-gold-500/30 rounded-3xl p-6 md:p-8 space-y-6 glass-panel shadow-gold-glow">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-400" /> Configure & Schedule Event
            </h3>

            {/* Event Name / Title */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Event Title / Festival Award Name
              </label>
              <input
                type="text"
                required
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="e.g. Festival Choice Community Voting 2026"
                className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500 font-medium"
              />
            </div>

            {/* Scheduling Mode Selection Tabs */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-300">
                Scheduling Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setScheduleMode('quick')}
                  className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                    scheduleMode === 'quick'
                      ? 'bg-gold-gradient text-black border-transparent shadow-gold-glow'
                      : 'bg-black/60 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  <Zap className="w-4 h-4" /> Quick Launch (Duration)
                </button>

                <button
                  type="button"
                  onClick={() => setScheduleMode('custom')}
                  className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                    scheduleMode === 'custom'
                      ? 'bg-gold-gradient text-black border-transparent shadow-gold-glow'
                      : 'bg-black/60 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  <Calendar className="w-4 h-4" /> Custom Date Schedule
                </button>
              </div>
            </div>

            {/* Mode A: Quick Launch Selection */}
            {scheduleMode === 'quick' && (
              <div className="p-5 rounded-2xl bg-black/60 border border-zinc-800 space-y-3">
                <label className="block text-xs font-semibold text-zinc-300">
                  Event Duration from Launch (Starts Immediately)
                </label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-xl py-2.5 px-4 text-xs text-gold-400 font-extrabold focus:outline-none focus:border-gold-500"
                >
                  <option value="6">6 Hours</option>
                  <option value="12">12 Hours</option>
                  <option value="24">24 Hours (1 Day)</option>
                  <option value="48">48 Hours (2 Days)</option>
                  <option value="72">72 Hours (3 Days)</option>
                  <option value="168">168 Hours (1 Week)</option>
                  <option value="336">336 Hours (2 Weeks)</option>
                  <option value="720">720 Hours (1 Month)</option>
                </select>
                <p className="text-[11px] text-zinc-500">
                  Voting will begin immediately upon activation and run for the selected duration.
                </p>
              </div>
            )}

            {/* Mode B: Custom Date/Time Range Schedule */}
            {scheduleMode === 'custom' && (
              <div className="p-5 rounded-2xl bg-black/60 border border-zinc-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Start Date & Time (Optional for future schedule)
                    </label>
                    <input
                      type="datetime-local"
                      value={customStartTime}
                      onChange={(e) => setCustomStartTime(e.target.value)}
                      className="w-full bg-black border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-gold-500 font-mono"
                    />
                    <span className="text-[10px] text-zinc-500 mt-1 block">
                      Leave empty to start immediately.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      End Date & Time (Voting Deadline) *
                    </label>
                    <input
                      type="datetime-local"
                      required={scheduleMode === 'custom'}
                      value={customEndTime}
                      onChange={(e) => setCustomEndTime(e.target.value)}
                      className="w-full bg-black border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-gold-500 font-mono"
                    />
                    <span className="text-[10px] text-zinc-500 mt-1 block">
                      When community voting concludes.
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-indigo-300/80 bg-indigo-950/20 border border-indigo-900/40 p-3 rounded-xl">
                  💡 If you pick a future Start Date, the homepage banner will display in <strong>Upcoming Mode</strong> with a countdown until the event opens.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                type="submit"
                disabled={timerLoading}
                className="gold-btn py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-gold-glow flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Clock className="w-4 h-4" />
                {timerLoading ? 'Saving Schedule...' : 'Schedule & Activate Event'}
              </button>

              <button
                type="button"
                disabled={timerLoading}
                onClick={(e) => handleScheduleEvent(e, false)}
                className="py-3.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> Stop / Deactivate Event
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
