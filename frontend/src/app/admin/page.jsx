"use client";

import { useState, useEffect } from 'react';
import { Shield, Eye, Star, DollarSign, Film, UserPlus, Clock, CheckCircle2, XCircle, AlertTriangle, BarChart3, Trophy } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../../lib/api';

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState('moderation'); // moderation | analytics | judges | timer

  // Dashboard Data
  const [analytics, setAnalytics] = useState(null);
  const [moviesList, setMoviesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Moderation state
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedMovieForAction, setSelectedMovieForAction] = useState(null);

  // Register Judge state
  const [judgeForm, setJudgeForm] = useState({
    full_name: '',
    email: '',
    username: '',
    password: '',
    profile_pic_url: ''
  });
  const [judgeMsg, setJudgeMsg] = useState({ type: '', text: '' });

  // Community Timer state
  const [timerActive, setTimerActive] = useState(false);
  const [durationHours, setDurationHours] = useState('24');
  const [timerMsg, setTimerMsg] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

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

      // 3. Fetch Timer Status
      const timerRes = await api.get('/vote/timer-status');
      if (timerRes.data.success && timerRes.data.setting) {
        setTimerActive(timerRes.data.setting.is_active);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerateMovie = async (movieId, status, isWinner = false, category = '') => {
    try {
      const res = await api.put(`/admin/movies/${movieId}/moderate`, {
        status,
        rejection_reason: status === 'rejected' ? rejectionReason : null,
        is_winner: isWinner,
        winner_category: category
      });

      if (res.data.success) {
        setSelectedMovieForAction(null);
        setRejectionReason('');
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to moderate movie.');
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

  const handleToggleCommunityTimer = async (e) => {
    e.preventDefault();
    setTimerMsg('');

    try {
      const res = await api.post('/admin/community-rating-timer', {
        is_active: timerActive,
        duration_hours: durationHours
      });

      if (res.data.success) {
        setTimerMsg(`Community timer setting saved! Status: ${timerActive ? 'ACTIVE' : 'INACTIVE'}`);
      }
    } catch (err) {
      setTimerMsg('Failed to update timer status.');
    }
  };

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
                    src={movie.thumbnail_url}
                    alt={movie.title}
                    className="w-24 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{movie.title}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        movie.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : movie.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {movie.status}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-1 mt-1 font-light">{movie.description}</p>
                    <div className="flex items-center gap-4 text-[11px] text-zinc-500 mt-2 font-mono">
                      <span>Email: {movie.uploader_email}</span>
                      <span>•</span>
                      <span>Phone: {movie.uploader_phone}</span>
                      <span>•</span>
                      <span>Views: {movie.view_count || 0}</span>
                    </div>

                    {movie.status === 'rejected' && movie.rejection_reason && (
                      <div className="mt-2 text-[11px] text-rose-300 italic bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                        Rejection Reason: "{movie.rejection_reason}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Moderation Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={movie.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-semibold hover:border-gold-400"
                  >
                    Preview Video
                  </a>

                  <button
                    onClick={() => handleModerateMovie(movie.id, 'approved')}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>

                  <button
                    onClick={() => setSelectedMovieForAction(movie.id)}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>

                  <button
                    onClick={() => handleModerateMovie(movie.id, 'approved', true, 'Festival Award Winner')}
                    className="px-3 py-2 rounded-xl bg-gold-500/20 border border-gold-500/50 hover:bg-gold-500/30 text-gold-300 text-xs font-bold flex items-center gap-1"
                  >
                    <Trophy className="w-3.5 h-3.5 text-gold-400" /> Crown Winner
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
              <div className="text-3xl font-extrabold text-gold-400 font-mono">${analytics.totalRevenueUSD}</div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-surface-card border border-gold-500/20 rounded-3xl p-6 md:p-8 space-y-4 glass-panel">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gold-400" /> Income & Submission Financial Chart
            </h3>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.revenueChartData.length > 0 ? analytics.revenueChartData : [{ month: '2026-08', revenue: 750 }]}>
                  <defs>
                    <linearGradient id="goldRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFD700" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="month" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} unit="$" />
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

      {/* Tab Content 4: Community Timer Control */}
      {activeTab === 'timer' && (
        <div className="max-w-2xl mx-auto bg-surface-card border border-gold-500/30 rounded-3xl p-6 md:p-8 space-y-6 glass-panel shadow-gold-glow">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold-400" /> Community Choice Rating Timer Controls
          </h2>
          <p className="text-xs text-zinc-400">
            Control the live voting countdown timer displayed on the Home Page. Anti-spam email verification is automatically enforced for voters.
          </p>

          {timerMsg && (
            <div className="p-4 rounded-xl bg-gold-500/20 border border-gold-500/40 text-gold-300 text-xs font-bold">
              {timerMsg}
            </div>
          )}

          <form onSubmit={handleToggleCommunityTimer} className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-black border border-zinc-800">
              <div>
                <h4 className="text-sm font-bold text-white">Enable Community Rating Event</h4>
                <p className="text-xs text-zinc-400">When enabled, the public can submit verified 1-10 scores.</p>
              </div>
              <input
                type="checkbox"
                checked={timerActive}
                onChange={(e) => setTimerActive(e.target.checked)}
                className="w-6 h-6 accent-gold-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Event Duration (Hours)</label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-gold-400 font-bold focus:outline-none focus:border-gold-500"
              >
                <option value="6">6 Hours</option>
                <option value="12">12 Hours</option>
                <option value="24">24 Hours (1 Day)</option>
                <option value="48">48 Hours (2 Days)</option>
                <option value="72">72 Hours (3 Days)</option>
                <option value="168">168 Hours (1 Week)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full gold-btn py-3 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Update Event Status & Timer
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
