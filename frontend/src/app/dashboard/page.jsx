"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Coins, Film, PlayCircle, Sparkles, User, Calendar, ExternalLink, AlertCircle, LogIn, ArrowRight } from 'lucide-react';
import api from '../../lib/api';
import VideoPlayerModal from '../../components/VideoPlayerModal';
import PackagesSection from '../../components/PackagesSection';

export default function UserDashboardPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

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
    try {
      // 1. Refresh user tokens in background
      await refreshUser();

      // 2. Fetch unlocked movie IDs
      const unlockRes = await api.get('/movies/my/unlocked');
      const unlockedIds = unlockRes.data?.unlocked_ids || [];

      // 3. Fetch all movies to find the unlocked ones
      const moviesRes = await api.get('/movies');
      const allMovies = moviesRes.data?.movies || [];

      // Filter to only unlocked movies (or demo film if unlocked)
      const userUnlocked = allMovies.filter(m => unlockedIds.includes(m.id));
      setUnlockedMovies(userUnlocked);
    } catch (err) {
      console.warn('Error fetching dashboard data:', err);
    } finally {
      setLoadingMovies(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3 font-bold text-gold-400">
          <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-wider">Loading User Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tokenCount = user.tokens_balance ?? 2;

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6 px-4">
      
      {/* 1. Header Greeting & Profile Badge */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gold-500/20 pb-6">
        <div className="flex items-center gap-4">
          <img
            src={user.profile_pic_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt={user.full_name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-gold-400 shadow-gold-glow"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">{user.full_name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/40 text-[10px] font-bold uppercase tracking-wider">
                {user.role === 'admin' ? 'Admin' : (user.role === 'judge' ? 'Jury Judge' : 'Audience Member')}
              </span>
              {user.subscription_status === 'active' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-gold-glow">
                  👑 {user.subscription_tier === 'yearly' ? 'Annual VIP Pass' : 'Monthly VIP Pass'}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] font-semibold uppercase tracking-wider">
                  Free Audience Tier
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-3">
              <span>{user.email}</span>
              <span>•</span>
              <span>Member since {new Date(user.created_at || Date.now()).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="gold-btn py-2.5 px-5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-gold-glow"
        >
          <PlayCircle className="w-4 h-4" /> Explore Gallery
        </Link>
      </div>

      {/* 2. Token Wallet Card & Stats Overview */}
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
            <span>Registration gift: 2 free tokens granted upon signup. Monthly ($4.99) & Annual ($39.99) VIP passes available below.</span>
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
              Short movies currently unlocked and ready for instant playback in your library.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-800/60 text-[11px] text-gold-400 font-semibold">
            {user.subscription_status === 'active' ? '👑 Unlimited VIP Access' : 'Permanent Library Access'}
          </div>
        </div>
      </div>

      {/* 3. VIP Audience Packages & Passes */}
      <PackagesSection onSubscribed={() => fetchUserDashboardData()} />

      {/* 3. My Unlocked Films Collection */}
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
