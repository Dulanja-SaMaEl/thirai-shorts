"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Coins, Film, PlayCircle, Sparkles, User, Calendar, ExternalLink,
  AlertCircle, LogIn, ArrowRight, BarChart3, TrendingUp, Award, Star,
  Eye, Clock, Share2, CheckCircle2, ChevronDown, ChevronUp, Sliders,
  Play, MessageSquare, Layers, ShieldCheck, Flame, Trophy, Upload, Info
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import api from '../../lib/api';
import VideoPlayerModal from '../../components/VideoPlayerModal';
import PackagesSection from '../../components/PackagesSection';

export default function UserDashboardPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  // Active Tab: 'analytics' (Filmmaker Movie Analytics) | 'library' (Audience Library & Passes)
  const [activeDashboardTab, setActiveDashboardTab] = useState('analytics');

  // Director Analytics State
  const [directorAnalytics, setDirectorAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [expandedCritiquesMovieId, setExpandedCritiquesMovieId] = useState(null);
  const [shareToast, setShareToast] = useState('');

  // Audience Library State
  const [unlockedMovies, setUnlockedMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [selectedPlayingMovie, setSelectedPlayingMovie] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchUserDashboardData();
    }
  }, [user?.id]);

  const fetchUserDashboardData = async () => {
    setLoadingMovies(true);
    setLoadingAnalytics(true);

    try {
      // 1. Refresh user session & tokens
      await refreshUser();

      // 2. Fetch all dashboard resources concurrently
      const [unlockRes, moviesRes, analyticsRes] = await Promise.allSettled([
        api.get('/movies/my/unlocked'),
        api.get('/movies'),
        api.get('/movies/director/analytics')
      ]);

      // Process Unlocked Movies
      if (unlockRes.status === 'fulfilled' && moviesRes.status === 'fulfilled') {
        const unlockedIds = unlockRes.value.data?.unlocked_ids || [];
        const allMovies = moviesRes.value.data?.movies || [];
        const userUnlocked = allMovies.filter(m => unlockedIds.includes(m.id));
        setUnlockedMovies(userUnlocked);
      }

      // Process Director Analytics
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data?.success) {
        setDirectorAnalytics(analyticsRes.value.data);
        if (analyticsRes.value.data.has_submissions || user.role === 'director' || user.role === 'submitter' || user.role === 'admin') {
          setActiveDashboardTab('analytics');
        } else {
          setActiveDashboardTab('library');
        }
      }
    } catch (err) {
      console.warn('Error loading dashboard data:', err);
    } finally {
      setLoadingMovies(false);
      setLoadingAnalytics(false);
    }
  };

  const handleCopyShareLink = (movieId, movieTitle) => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/?film=${movieId}`;
      navigator.clipboard.writeText(url);
      setShareToast(`🔗 Share link for "${movieTitle}" copied to clipboard!`);
      setTimeout(() => setShareToast(''), 3500);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3 font-bold text-gold-400">
          <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-wider">Loading Filmmaker Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tokenCount = user.tokens_balance ?? 2;
  const kpis = directorAnalytics?.kpis || {
    totalSubmissions: 2,
    approvedCount: 2,
    pendingCount: 0,
    winnersCount: 1,
    totalViews: 4270,
    totalWatchHours: 1044.8,
    avgCompletionRate: 87.5,
    totalCommunityVotes: 412,
    avgCommunityRating: 4.88,
    avgJuryScore: 9.3
  };

  const charts = directorAnalytics?.charts;
  const submittedMovies = directorAnalytics?.movies || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-6 px-4">
      
      {/* 1. Header Greeting & Director Profile Badge */}
      <div className="bg-surface-card border border-gold-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 glass-panel shadow-gold-glow">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={user.profile_pic_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
              alt={user.full_name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-gold-400 shadow-gold-glow"
            />
            <div className="absolute -bottom-1 -right-1 bg-gold-gradient text-black p-1 rounded-lg shadow-sm">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{user.full_name}</h1>
              <span className="px-3 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/40 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-gold-glow">
                🎬 Film Director & Submitter
              </span>
              {user.subscription_status === 'active' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  👑 {user.subscription_tier?.includes('yearly') ? 'Annual VIP Pass' : 'Submitter VIP Pass ($2.99/mo)'}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold uppercase tracking-wider">
                  Submitter Pass Eligible ($2.99/mo)
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-1.5 flex items-center gap-2.5 flex-wrap">
              <span>{user.email}</span>
              <span>•</span>
              <span className="text-zinc-500 font-mono">
                {kpis.totalSubmissions} {kpis.totalSubmissions === 1 ? 'Film Submitted' : 'Films Submitted'}
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Festival Submitter Privileges Active
              </span>
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <Link
            href="/upload"
            className="gold-btn py-2.5 px-5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-gold-glow w-full sm:w-auto justify-center"
          >
            <Upload className="w-4 h-4" /> Submit Another Film
          </Link>
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl bg-black/60 border border-zinc-700 hover:border-gold-400 text-xs font-bold text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 w-full sm:w-auto justify-center"
          >
            <PlayCircle className="w-4 h-4 text-gold-400" /> Explore Festival
          </Link>
        </div>
      </div>

      {/* Share Toast Notification */}
      {shareToast && (
        <div className="p-3.5 rounded-2xl bg-gold-500/20 border border-gold-500/40 text-gold-300 text-xs font-extrabold animate-fade-in flex items-center gap-2 shadow-gold-glow">
          <CheckCircle2 className="w-4 h-4 text-gold-400" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* 2. Top-Level Tab Switcher */}
      <div className="flex items-center gap-2 bg-black/60 border border-zinc-800 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveDashboardTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeDashboardTab === 'analytics'
              ? 'bg-gold-gradient text-black shadow-gold-glow'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>🎬 Filmmaker Movie Analytics</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase ${
            activeDashboardTab === 'analytics' ? 'bg-black/20 text-black' : 'bg-gold-500/20 text-gold-300'
          }`}>
            Live Insights
          </span>
        </button>

        <button
          onClick={() => setActiveDashboardTab('library')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeDashboardTab === 'library'
              ? 'bg-gold-gradient text-black shadow-gold-glow'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>🎟️ Audience Library & Passes</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
            activeDashboardTab === 'library' ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-400'
          }`}>
            {unlockedMovies.length} Unlocked
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: DIRECTOR MOVIE ANALYTICS CONSOLE                                    */}
      {/* ========================================================================= */}
      {activeDashboardTab === 'analytics' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Sample Benchmark Notice if User Has No Live Submissions Yet */}
          {directorAnalytics?.is_sample && (
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 text-indigo-300 text-xs flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2.5">
                <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  <strong>Interactive Filmmaker Preview:</strong> You are previewing festival benchmark analytics. When you submit your short film, live festival screenings, audience votes, and jury critiques will populate in real time!
                </span>
              </div>
              <Link
                href="/upload"
                className="px-3.5 py-1.5 rounded-xl bg-gold-gradient text-black font-extrabold text-[11px] uppercase tracking-wider shrink-0 shadow-sm"
              >
                Submit Your Film Now
              </Link>
            </div>
          )}

          {/* 6 Executive KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            
            {/* KPI 1: Screenings / Views */}
            <div className="bg-surface-card border border-gold-500/30 hover:border-gold-500/60 rounded-2xl p-4 flex flex-col justify-between transition-colors shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Views</span>
                <Eye className="w-4 h-4 text-gold-400" />
              </div>
              <div className="my-2">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono block">
                  {kpis.totalViews.toLocaleString()}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +24.8% this week
              </span>
            </div>

            {/* KPI 2: Community Rating */}
            <div className="bg-surface-card border border-gold-500/30 hover:border-gold-500/60 rounded-2xl p-4 flex flex-col justify-between transition-colors shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Audience Score</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                    {kpis.avgCommunityRating}
                  </span>
                  <span className="text-xs text-zinc-500 font-bold">/ 5.0</span>
                </div>
              </div>
              <span className="text-[10px] text-zinc-400">
                {kpis.totalCommunityVotes} verified votes
              </span>
            </div>

            {/* KPI 3: Grand Jury Score */}
            <div className="bg-surface-card border border-gold-500/30 hover:border-gold-500/60 rounded-2xl p-4 flex flex-col justify-between transition-colors shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Grand Jury Score</span>
                <Award className="w-4 h-4 text-gold-400" />
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-gold-400 font-mono">
                    {kpis.avgJuryScore}
                  </span>
                  <span className="text-xs text-zinc-500 font-bold">/ 10.0</span>
                </div>
              </div>
              <span className="text-[10px] text-gold-300/80 font-semibold">
                Mastery Evaluation
              </span>
            </div>

            {/* KPI 4: Festival Honors */}
            <div className="bg-surface-card border border-gold-500/30 hover:border-gold-500/60 rounded-2xl p-4 flex flex-col justify-between transition-colors shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Laurels & Wins</span>
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <div className="my-2">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono block">
                  {kpis.winnersCount > 0 ? `${kpis.winnersCount} Crown` : 'Nominated'}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold truncate block">
                Golden Thira Contender
              </span>
            </div>

            {/* KPI 5: Watch Hours */}
            <div className="bg-surface-card border border-gold-500/30 hover:border-gold-500/60 rounded-2xl p-4 flex flex-col justify-between transition-colors shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Watch Duration</span>
                <Clock className="w-4 h-4 text-blue-400" />
              </div>
              <div className="my-2">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono block">
                  {kpis.totalWatchHours} <span className="text-xs text-zinc-500 font-normal">hrs</span>
                </span>
              </div>
              <span className="text-[10px] text-zinc-400">
                Total audience streaming
              </span>
            </div>

            {/* KPI 6: Completion Rate */}
            <div className="bg-surface-card border border-gold-500/30 hover:border-gold-500/60 rounded-2xl p-4 flex flex-col justify-between transition-colors shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Completion Rate</span>
                <Flame className="w-4 h-4 text-rose-400" />
              </div>
              <div className="my-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono block">
                  {kpis.avgCompletionRate}%
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">
                Top 5% Audience Retention
              </span>
            </div>

          </div>

          {/* Interactive Visual Analytics Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart 1: 14-Day Viewership Trajectory (2 Columns Wide) */}
            <div className="lg:col-span-2 bg-surface-card border border-gold-500/30 rounded-3xl p-6 glass-panel shadow-gold-glow space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Screenings & Viewership Momentum (Last 14 Days)
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Daily stream volume, total watch hours, and community vote engagement trajectory.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px]">
                  <div className="flex items-center gap-1.5 text-gold-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-gold-400" /> Daily Screenings
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Watch Hours
                  </div>
                </div>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts?.viewsTrendData || []}>
                    <defs>
                      <linearGradient id="goldViewsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFD700" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#FFD700" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="blueHoursGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="date" stroke="#888" fontSize={11} />
                    <YAxis stroke="#888" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0a0a0a',
                        borderColor: '#d4af37',
                        borderRadius: '12px',
                        fontSize: '11px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      name="Daily Views"
                      stroke="#FFD700"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#goldViewsGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="watchHours"
                      name="Watch Hours"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#blueHoursGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Grand Jury Craft Pillars (1 Column) */}
            <div className="bg-surface-card border border-gold-500/30 rounded-3xl p-6 glass-panel shadow-gold-glow space-y-4">
              <div className="flex items-center gap-2.5 border-b border-zinc-800 pb-3">
                <div className="w-8 h-8 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Jury Craft Pillars
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Grand Jury evaluation score breakdown (out of 10.0).
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 pt-1">
                {(charts?.craftBreakdown || [
                  { pillar: 'Directorial Vision & Tone', score: 9.6 },
                  { pillar: 'Screenplay & Narrative Arc', score: 9.2 },
                  { pillar: 'Cinematography & Texture', score: 9.5 },
                  { pillar: 'Acoustic Sound & Music', score: 9.1 },
                  { pillar: 'Emotional Resonance', score: 9.7 }
                ]).map((craft) => (
                  <div key={craft.pillar} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-medium">{craft.pillar}</span>
                      <span className="text-gold-400 font-bold font-mono">{craft.score} / 10</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                      <div
                        className="h-full bg-gold-gradient rounded-full shadow-gold-glow transition-all duration-700"
                        style={{ width: `${(craft.score / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Secondary Analytics: Rating Distribution & Audience Demographics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card A: Community Star Rating Distribution (BarChart) */}
            <div className="bg-surface-card border border-gold-500/30 rounded-3xl p-6 glass-panel space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Audience Rating Breakdown
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Verified community ratings submitted during festival screening window.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full">
                  {kpis.avgCommunityRating} ★ Avg
                </span>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts?.ratingDistribution || []} layout="vertical">
                    <XAxis type="number" stroke="#888" fontSize={11} />
                    <YAxis dataKey="stars" type="category" stroke="#888" fontSize={11} width={100} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#000',
                        borderColor: '#d4af37',
                        borderRadius: '10px',
                        fontSize: '11px'
                      }}
                    />
                    <Bar dataKey="count" name="Verified Votes" fill="#f59e0b" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Card B: Language Reach & Traffic Discovery */}
            <div className="bg-surface-card border border-gold-500/30 rounded-3xl p-6 glass-panel space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Audience Languages & Discovery Channels
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Territory language reach and audience streaming origins.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Languages */}
                <div className="space-y-2.5 bg-black/60 border border-zinc-850 p-3.5 rounded-2xl">
                  <span className="text-[10px] font-bold text-gold-400 uppercase tracking-wider block">
                    Language Portals
                  </span>
                  {(charts?.audienceLanguages || [
                    { language: 'Tamil (தமிழ்)', percentage: 52 },
                    { language: 'Sinhala (සිංහල)', percentage: 28 },
                    { language: 'English & World', percentage: 20 }
                  ]).map((lang) => (
                    <div key={lang.language} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-300 font-medium text-[11px]">{lang.language}</span>
                        <span className="text-white font-mono font-bold text-[11px]">{lang.percentage}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-gold-400 rounded-full" style={{ width: `${lang.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Discovery Channels */}
                <div className="space-y-2.5 bg-black/60 border border-zinc-850 p-3.5 rounded-2xl">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                    Discovery Channels
                  </span>
                  {(charts?.trafficSources || [
                    { source: 'VIP Pass Streams', percentage: 48 },
                    { source: 'Showcase Gallery', percentage: 32 },
                    { source: 'Community Voting', percentage: 20 }
                  ]).map((src) => (
                    <div key={src.source} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-300 font-medium text-[11px]">{src.source}</span>
                        <span className="text-white font-mono font-bold text-[11px]">{src.percentage}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${src.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Film-by-Film Detailed Dossier Section */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-gold-400" /> Submitted Films & Festival Competition Roster
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Detailed analytics, Grand Jury evaluations, laurels, and audience reception for each submitted short film.
                </p>
              </div>
              <span className="text-xs bg-zinc-900 border border-zinc-700 px-3 py-1 rounded-full text-gold-300 font-mono font-bold">
                {submittedMovies.length} {submittedMovies.length === 1 ? 'Film' : 'Films'} Active
              </span>
            </div>

            <div className="space-y-4">
              {submittedMovies.map((movie) => {
                const isCritiquesOpen = expandedCritiquesMovieId === movie.id;
                return (
                  <div
                    key={movie.id}
                    className="bg-surface-card border border-gold-500/30 hover:border-gold-500/60 rounded-3xl p-5 sm:p-6 glass-panel transition-all space-y-4 shadow-sm"
                  >
                    {/* Top Row: Thumbnail, Film Info, Status Pills, Actions */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                      
                      <div className="flex items-start sm:items-center gap-4">
                        {/* Film Thumbnail with Instant Stream Trigger */}
                        <div
                          onClick={() => setSelectedPlayingMovie(movie)}
                          className="relative w-28 sm:w-36 aspect-video rounded-2xl overflow-hidden bg-black border border-gold-500/40 shadow-sm cursor-pointer shrink-0 group"
                        >
                          <img
                            src={movie.thumbnail_url || '/images/logo-wordmark.png'}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gold-gradient p-0.5 shadow-gold-glow flex items-center justify-center">
                              <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                            </div>
                          </div>
                        </div>

                        {/* Title & Metadata */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base sm:text-lg font-bold text-white hover:text-gold-300 transition-colors">
                              {movie.title}
                            </h3>
                            {movie.is_winner && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold flex items-center gap-1">
                                🏆 {movie.winner_category || 'Festival Winner'}
                              </span>
                            )}
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              movie.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : movie.status === 'rejected'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}>
                              {movie.status === 'approved' ? '✓ In Official Competition' : movie.status === 'rejected' ? 'Needs Revision' : 'Pending QC'}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-400 line-clamp-1 max-w-xl">
                            {movie.description}
                          </p>

                          <div className="flex items-center gap-3 text-[11px] text-zinc-400 flex-wrap">
                            <span>⏱️ {movie.running_time || '16 mins'}</span>
                            <span>•</span>
                            <span>🎭 {movie.genre || 'Drama'}</span>
                            <span>•</span>
                            <span>🌐 {movie.original_language || 'Tamil'}</span>
                            <span>•</span>
                            <span>🎬 Directed by {movie.director_name}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Quick KPIs & Action Buttons */}
                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-zinc-800 pt-3 md:pt-0">
                        {/* Metrics Mini Tally */}
                        <div className="flex items-center gap-4 text-center">
                          <div className="px-2">
                            <span className="text-sm sm:text-base font-mono font-black text-white block">
                              {movie.view_count.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-zinc-400 uppercase font-semibold">Views</span>
                          </div>
                          <div className="h-6 w-px bg-zinc-800" />
                          <div className="px-2">
                            <span className="text-sm sm:text-base font-mono font-black text-amber-400 block">
                              {movie.community_rating} ★
                            </span>
                            <span className="text-[10px] text-zinc-400 uppercase font-semibold">Rating</span>
                          </div>
                          <div className="h-6 w-px bg-zinc-800" />
                          <div className="px-2">
                            <span className="text-sm sm:text-base font-mono font-black text-gold-400 block">
                              {movie.jury_score} / 10
                            </span>
                            <span className="text-[10px] text-zinc-400 uppercase font-semibold">Jury</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedPlayingMovie(movie)}
                            className="gold-btn px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                            title="Play full stream"
                          >
                            <Play className="w-3.5 h-3.5 fill-black" /> Stream
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyShareLink(movie.id, movie.title)}
                            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-gold-400 text-zinc-300 hover:text-white transition-colors"
                            title="Copy share link"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedCritiquesMovieId(isCritiquesOpen ? null : movie.id)}
                            className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-gold-400 text-xs font-semibold text-zinc-300 hover:text-gold-300 transition-colors flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-gold-400" />
                            <span className="hidden sm:inline">Jury Feedback</span>
                            {isCritiquesOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Grand Jury Feedback & Festival Timeline Drawer */}
                    {isCritiquesOpen && (
                      <div className="pt-4 border-t border-zinc-800/80 space-y-4 animate-fade-in">
                        
                        {/* Section 1: Grand Jury Written Critiques */}
                        <div className="space-y-2.5">
                          <h4 className="text-xs font-bold text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5" /> Official Grand Jury Written Critiques & Scores
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                            {(movie.jury_reviews || []).map((review, rIdx) => (
                              <div
                                key={review.id || rIdx}
                                className="bg-black/60 border border-zinc-800 p-4 rounded-2xl space-y-2.5"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5">
                                    <img
                                      src={review.judge_avatar || review.users?.profile_pic_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                                      alt={review.judge_name || review.users?.full_name || 'Juror'}
                                      className="w-8 h-8 rounded-full object-cover border border-gold-500/40"
                                    />
                                    <div>
                                      <span className="text-xs font-bold text-white block leading-tight">
                                        {review.judge_name || review.users?.full_name || 'Festival Juror'}
                                      </span>
                                      <span className="text-[10px] text-gold-400 font-medium">
                                        {review.judge_role || 'Grand Jury Member'}
                                      </span>
                                    </div>
                                  </div>
                                  <span className="text-xs font-mono font-black text-gold-400 bg-gold-500/10 border border-gold-500/30 px-2 py-0.5 rounded-lg">
                                    {review.score} / 10
                                  </span>
                                </div>

                                <p className="text-xs text-zinc-300 italic bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-850 leading-relaxed">
                                  "{review.comment}"
                                </p>

                                {review.criteria_scores && (
                                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] text-zinc-400 font-mono">
                                    <div>Direction: <strong className="text-white">{review.criteria_scores.direction}</strong></div>
                                    <div>Cinema: <strong className="text-white">{review.criteria_scores.cinematography}</strong></div>
                                    <div>Sound: <strong className="text-white">{review.criteria_scores.sound}</strong></div>
                                    <div>Resonance: <strong className="text-white">{review.criteria_scores.emotional}</strong></div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Section 2: Festival Milestone Progress Tracker */}
                        <div className="bg-black/60 border border-zinc-800 p-4 rounded-2xl space-y-3">
                          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Festival Progress Pipeline
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                            {(movie.timeline || [
                              { step: 'Film Submitted', status: 'completed' },
                              { step: 'Technical QC Pass', status: 'completed' },
                              { step: 'Jury Deliberation', status: 'completed' },
                              { step: 'Official Festival Premiere', status: 'completed' },
                              { step: 'Award Gala Bestowal', status: movie.is_winner ? 'completed' : 'upcoming' }
                            ]).map((step, sIdx) => (
                              <div
                                key={sIdx}
                                className={`p-2.5 rounded-xl border text-center space-y-1 ${
                                  step.status === 'completed'
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                    : step.status === 'in_progress'
                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-500'
                                }`}
                              >
                                <span className="text-[10px] font-bold uppercase tracking-wider block">
                                  Step {sIdx + 1}
                                </span>
                                <span className="text-xs font-semibold block leading-tight">
                                  {step.step}
                                </span>
                                <span className="text-[9px] block opacity-80">
                                  {step.status === 'completed' ? '✓ Finished' : step.status === 'in_progress' ? '⏳ Under Review' : '📅 Scheduled'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submitter Pass Exclusive Benefit Banner */}
          <div className="bg-gradient-to-r from-amber-950/40 via-surface-card to-amber-950/20 border border-gold-500/40 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-gold-glow">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Exclusive Director Benefit
              </span>
              <h3 className="text-xl font-extrabold text-white">
                Filmmaker Submitter Pass: $2.99 / month (40% OFF)
              </h3>
              <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
                As a director who has submitted an approved short film to the Thirai+ Film Festival, you unlock the exclusive Submitter Pass tier at just $2.99/mo (regular $4.99/mo). Enjoy unlimited cinema streaming across all competitor movies, casting verified festival votes, and exploring filmmaker masterclasses.
              </p>
            </div>

            <button
              onClick={() => setActiveDashboardTab('library')}
              className="gold-btn py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-wider shadow-gold-glow shrink-0 flex items-center gap-2"
            >
              <span>Claim Submitter Pass</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: AUDIENCE LIBRARY & PASSES CONSOLE                                  */}
      {/* ========================================================================= */}
      {activeDashboardTab === 'library' && (
        <div className="space-y-10 animate-fade-in">
          
          {/* Token Wallet Card & Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Main Token Wallet */}
            <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-surface-card border border-gold-500/40 p-6 md:p-8 shadow-gold-glow glass-panel">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5" /> Cinema Token Wallet
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black text-white font-mono">{tokenCount}</span>
                    <span className="text-sm font-bold text-gold-300 uppercase tracking-wider">
                      {tokenCount === 1 ? 'Token Available' : 'Tokens Available'}
                    </span>
                    {user.subscription_status === 'active' && (
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                        ✨ Unlimited VIP Streaming Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 max-w-md leading-relaxed pt-1">
                    {user.subscription_status === 'active'
                      ? 'Your VIP Pass gives you unlimited streaming on all short movies without consuming tokens.'
                      : 'Use 1 token to unlock any short film from the festival gallery. Once unlocked, you can re-watch it indefinitely with zero restrictions.'}
                  </p>
                </div>

                <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                  <Link
                    href="/"
                    className="py-3 px-5 rounded-xl bg-gold-gradient text-black font-extrabold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-gold-glow hover:opacity-90 transition-opacity"
                  >
                    <Film className="w-4 h-4" /> Unlock Films
                  </Link>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center gap-2 text-[11px] text-zinc-400">
                <Sparkles className="w-4 h-4 text-gold-400 shrink-0" />
                <span>Registration gift: 2 free tokens granted upon signup. Monthly ($4.99 / $2.99 submitter) & Annual ($39.99) VIP passes available below.</span>
              </div>
            </div>

            {/* Unlocked Films Quick Counter */}
            <div className="rounded-3xl bg-surface-card border border-zinc-800 p-6 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-gold-400" /> Unlocked Films
                </span>
                <div className="text-4xl font-black text-white font-mono">
                  {unlockedMovies.length}
                </div>
                <p className="text-xs text-zinc-400">
                  Short movies currently unlocked and ready for instant playback in your personal library.
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-800/60 text-[11px] text-gold-400 font-semibold">
                {user.subscription_status === 'active' ? '👑 Unlimited VIP Access' : 'Permanent Library Access'}
              </div>
            </div>
          </div>

          {/* VIP Audience Packages & Passes */}
          <PackagesSection onSubscribed={() => fetchUserDashboardData()} />

          {/* My Unlocked Films Collection */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-gold-400" /> My Unlocked Cinema Collection
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Short films you have unlocked with your tokens. Stream anytime without consuming more tokens.
                </p>
              </div>
              <span className="text-xs bg-zinc-900 border border-zinc-700 px-3 py-1 rounded-full text-zinc-300 font-mono">
                {unlockedMovies.length} Unlocked
              </span>
            </div>

            {loadingMovies ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2].map((n) => (
                  <div key={n} className="h-64 bg-surface-card rounded-2xl animate-pulse border border-zinc-800" />
                ))}
              </div>
            ) : unlockedMovies.length === 0 ? (
              <div className="text-center py-16 bg-surface-card rounded-3xl border border-zinc-800 p-8 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto text-gold-400">
                  <Coins className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">No Movies Unlocked Yet</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    You currently have <strong className="text-gold-400 font-mono">{tokenCount} tokens</strong> ready to use. Explore the official festival gallery and pick your first short film to unlock!
                  </p>
                </div>
                <Link
                  href="/"
                  className="gold-btn py-2.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-gold-glow"
                >
                  <Film className="w-4 h-4" /> Browse Gallery Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unlockedMovies.map((movie) => (
                  <div
                    key={movie.id}
                    className="group rounded-2xl overflow-hidden bg-surface-card border border-gold-500/30 hover:border-gold-500/70 transition-all shadow-gold-glow"
                  >
                    <div
                      onClick={() => setSelectedPlayingMovie(movie)}
                      className="relative aspect-video w-full overflow-hidden bg-black cursor-pointer"
                    >
                      <img
                        src={movie.thumbnail_url || '/images/logo-wordmark.png'}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-gold-gradient p-0.5 shadow-gold-glow group-hover:scale-110 transition-transform">
                          <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                            <PlayCircle className="w-6 h-6 text-gold-400 fill-gold-400 ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-3 left-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full backdrop-blur-md">
                        ✓ Unlocked
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <h3
                          onClick={() => setSelectedPlayingMovie(movie)}
                          className="text-base font-bold text-white group-hover:text-gold-400 transition-colors line-clamp-1 cursor-pointer"
                        >
                          {movie.title}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                          {movie.description}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedPlayingMovie(movie)}
                        className="w-full py-2 px-3 rounded-lg bg-gold-gradient text-black font-extrabold text-xs text-center flex items-center justify-center gap-1.5 shadow-gold-glow hover:opacity-90 transition-opacity"
                      >
                        <PlayCircle className="w-4 h-4" /> Watch Cinema Stream
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      )}

      {/* Cinema Player Modal when playing from dashboard */}
      {selectedPlayingMovie && (
        <VideoPlayerModal
          movie={selectedPlayingMovie}
          onClose={() => setSelectedPlayingMovie(null)}
        />
      )}
    </div>
  );
}
