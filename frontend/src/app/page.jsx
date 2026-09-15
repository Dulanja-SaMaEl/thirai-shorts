"use client";

import { useState, useEffect, useMemo } from 'react';
import HeroCarousel from '../components/HeroCarousel';
import TokenBanner from '../components/TokenBanner';
import PackagesSection from '../components/PackagesSection';
import WinnerShowcase from '../components/WinnerShowcase';
import AwardShowcase from '../components/AwardShowcase';
import MovieCard from '../components/MovieCard';
import CommunityTimer from '../components/CommunityTimer';
import ContactForm from '../components/ContactForm';
import VotingModal from '../components/VotingModal';
import VideoPlayerModal from '../components/VideoPlayerModal';
import AuthWatchModal from '../components/AuthWatchModal';
import TokenUnlockModal from '../components/TokenUnlockModal';
import NetflixIntro from '../components/NetflixIntro';
import FestivalCountdownBanner from '../components/FestivalCountdownBanner';
import SponsorsSection from '../components/SponsorsSection';
import { Film, TrendingUp, AlertCircle, Sparkles, Search, X, Clapperboard, Filter } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const GENRE_CATEGORIES = [
  { id: 'all', label: 'All Selections' },
  { id: 'winners', label: '🏆 Award Winners' },
  { id: 'tamil', label: 'Tamil Cinema' },
  { id: 'sinhala', label: 'Sinhala Cinema' },
  { id: 'drama', label: 'Drama' },
  { id: 'thriller', label: 'Thriller & Mystery' },
  { id: 'experimental', label: 'Experimental & Arts' },
];

export default function HomePage() {
  const { user, updateTokens } = useAuth();

  const [movies, setMovies] = useState([]);
  const [winners, setWinners] = useState([]);
  const [unlockedMovieIds, setUnlockedMovieIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSort, setFilterSort] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  const [selectedVotingMovie, setSelectedVotingMovie] = useState(null);
  const [selectedPlayingMovie, setSelectedPlayingMovie] = useState(null);
  const [selectedAuthPromptMovie, setSelectedAuthPromptMovie] = useState(null);
  const [selectedUnlockMovie, setSelectedUnlockMovie] = useState(null);

  useEffect(() => {
    fetchGalleryData();
  }, [filterSort]);

  useEffect(() => {
    if (user) {
      fetchUnlockedMovies();
    } else {
      setUnlockedMovieIds([]);
    }
  }, [user?.id]);

  const fetchUnlockedMovies = async () => {
    try {
      const res = await api.get('/movies/my/unlocked');
      if (res.data.success && res.data.unlocked_ids) {
        setUnlockedMovieIds(res.data.unlocked_ids);
      }
    } catch (e) {
      console.warn('Notice loading user unlocked movies:', e);
    }
  };

  const fetchGalleryData = async () => {
    setLoading(true);
    try {
      // Fetch Winner Showcase films
      const winnersRes = await api.get('/movies/winners');
      if (winnersRes.data.success) {
        setWinners(winnersRes.data.winners || []);
      }

      // Fetch Gallery Movies
      const moviesRes = await api.get(`/movies?sort=${filterSort}`);
      if (moviesRes.data.success) {
        setMovies(moviesRes.data.movies || []);
      }
    } catch (err) {
      console.error('Error fetching gallery movies:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search computation
  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      // 1. Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inTitle = (movie.title || '').toLowerCase().includes(query);
        const inDesc = (movie.description || '').toLowerCase().includes(query);
        const inDirector = (movie.director_name || '').toLowerCase().includes(query);
        const inGenre = (movie.genre || '').toLowerCase().includes(query);
        if (!inTitle && !inDesc && !inDirector && !inGenre) return false;
      }

      // 2. Category / Genre tag
      if (activeCategory === 'winners') {
        return Boolean(movie.is_winner);
      } else if (activeCategory === 'tamil') {
        const lang = `${movie.language || ''} ${movie.original_language || ''} ${movie.title || ''}`.toLowerCase();
        return lang.includes('tamil') || lang.includes('palms');
      } else if (activeCategory === 'sinhala') {
        const lang = `${movie.language || ''} ${movie.original_language || ''} ${movie.title || ''}`.toLowerCase();
        return lang.includes('sinhala') || lang.includes('mist');
      } else if (activeCategory === 'drama') {
        return (movie.genre || '').toLowerCase().includes('drama');
      } else if (activeCategory === 'thriller') {
        return (movie.genre || '').toLowerCase().includes('thrill');
      } else if (activeCategory === 'experimental') {
        const g = (movie.genre || '').toLowerCase();
        return g.includes('experim') || g.includes('visual') || g.includes('noir');
      }

      return true;
    });
  }, [movies, searchQuery, activeCategory]);

  // Central Gatekeeper for Watching Films
  const handleWatchMovie = (movie) => {
    // 1. Guest: Cannot watch without logging in!
    if (!user) {
      setSelectedAuthPromptMovie(movie);
      return;
    }

    // 2. Admins & Judges have bypass, VIP subscribers bypass, or already unlocked movies can be watched freely
    if (
      user.role === 'admin' ||
      user.role === 'judge' ||
      user.subscription_status === 'active' ||
      unlockedMovieIds.includes(movie.id)
    ) {
      setSelectedPlayingMovie(movie);
      return;
    }

    // 3. Logged-in Viewer must unlock with 1 token
    setSelectedUnlockMovie(movie);
  };

  // Free Trailer Streaming (No Tokens or Authentication Required for anyone)
  const handleWatchTrailer = (movie) => {
    setSelectedPlayingMovie({
      ...movie,
      isTrailer: true,
      video_url: movie.trailer_url || movie.video_url
    });
  };

  const handleConfirmUnlock = (newBalance) => {
    if (selectedUnlockMovie) {
      setUnlockedMovieIds(prev => [...prev, selectedUnlockMovie.id]);
      updateTokens(newBalance);
      setSelectedPlayingMovie(selectedUnlockMovie);
      setSelectedUnlockMovie(null);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-8 space-y-20 sm:space-y-28">
      {/* Netflix-Style Cinematic T+ Intro Splash */}
      <NetflixIntro />
      
      {/* 1. Viewer Token Balance Notification Banner */}
      <TokenBanner />

      {/* 2. Expansive Widescreen Hero Carousel */}
      <section aria-label="Featured Festival Movies">
        <HeroCarousel
          movies={movies}
          onWatchMovie={handleWatchMovie}
          onWatchTrailer={handleWatchTrailer}
          onOpenVoteModal={(m) => setSelectedVotingMovie(m)}
        />
      </section>

      {/* Official Festival Sponsors & Industry Partners Section */}
      <SponsorsSection />

      {/* Festival Date & Submissions Deadline Countdown Banner */}
      <FestivalCountdownBanner />

      {/* 3. Official Selections & Discovery Engine */}
      <section id="movies" className="space-y-8 scroll-mt-24">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.08] pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> Festival Screening Lineup
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Official Selections <span className="gold-text-gradient">& Award Contenders</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl font-normal">
              Explore officially curated short films from across South Asia and international independent creators.
            </p>
          </div>

          {/* Search Input & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Live Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search films, directors..."
                className="w-full sm:w-60 pl-9.5 pr-8 py-2.5 rounded-xl bg-surface-card border border-white/[0.08] focus:border-gold-500/50 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Filter Dropdown */}
            <div className="flex items-center gap-2 bg-surface-card border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-300 shrink-0">
              <TrendingUp className="w-4 h-4 text-gold-400 shrink-0" />
              <span className="font-medium text-zinc-500">Sort:</span>
              <select
                value={filterSort}
                onChange={(e) => setFilterSort(e.target.value)}
                className="bg-transparent text-gold-400 font-bold focus:outline-none cursor-pointer"
              >
                <option value="newest" className="bg-[#0D1017] text-white">Newest Premieres</option>
                <option value="popular" className="bg-[#0D1017] text-white">Most Screened</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {GENRE_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-gold-500/15 text-gold-300 border border-gold-500/35 shadow-[0_0_15px_rgba(229,169,60,0.15)]'
                    : 'bg-surface-card hover:bg-white/[0.06] border border-white/[0.08] text-zinc-300 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Active Search & Count Pill */}
        {(searchQuery || activeCategory !== 'all') && (
          <div className="flex items-center justify-between text-xs text-zinc-400 py-1">
            <span>
              Showing <strong className="text-white font-mono">{filteredMovies.length}</strong> of {movies.length} selections
              {searchQuery && <span> matching "{searchQuery}"</span>}
            </span>
            {(searchQuery || activeCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="text-gold-400 hover:text-gold-300 font-semibold underline underline-offset-4"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-96 bg-surface-card rounded-2xl animate-pulse border border-white/[0.06]" />
            ))}
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-20 bg-surface-card rounded-3xl border border-white/[0.08] space-y-3">
            <AlertCircle className="w-12 h-12 text-gold-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">No Movies Found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
              {searchQuery
                ? `No short films matched your search for "${searchQuery}". Try a different title or clear your filters.`
                : 'No films are currently listed under this genre. Be the first director to submit!'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="mt-2 px-5 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-bold text-white transition-colors"
            >
              Reset Discovery Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isUnlocked={
                  user?.role === 'admin' ||
                  user?.role === 'judge' ||
                  user?.subscription_status === 'active' ||
                  unlockedMovieIds.includes(movie.id)
                }
                isGuest={!user}
                onOpenVoteModal={(m) => setSelectedVotingMovie(m)}
                onOpenPlayerModal={(m) => handleWatchMovie(m)}
                onOpenTrailerModal={handleWatchTrailer}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. VIP Audience Packages & Pass Subscriptions */}
      <PackagesSection onSubscribed={() => fetchUnlockedMovies()} />

      {/* 5. Community Rating Timer Banner */}
      <CommunityTimer />

      {/* 6. Annual Festival 22 Award Showcase & Laurels */}
      <AwardShowcase
        onOpenPlayerModal={(m) => handleWatchMovie(m)}
      />

      {/* 7. Contact & Support Section */}
      <ContactForm />

      {/* Interactive Cinema Video Player Modal */}
      {selectedPlayingMovie && (
        <VideoPlayerModal
          movie={selectedPlayingMovie}
          onClose={() => setSelectedPlayingMovie(null)}
          onOpenVoteModal={(m) => setSelectedVotingMovie(m)}
          onWatchFullMovie={(m) => {
            setSelectedPlayingMovie(null);
            handleWatchMovie(m);
          }}
        />
      )}

      {/* Guest Sign In / Register Prompt Modal */}
      {selectedAuthPromptMovie && (
        <AuthWatchModal
          movie={selectedAuthPromptMovie}
          onClose={() => setSelectedAuthPromptMovie(null)}
        />
      )}

      {/* Viewer Token Deduction Confirmation Modal */}
      {selectedUnlockMovie && (
        <TokenUnlockModal
          movie={selectedUnlockMovie}
          userTokens={user?.tokens_balance ?? 0}
          onConfirmUnlock={handleConfirmUnlock}
          onClose={() => setSelectedUnlockMovie(null)}
        />
      )}

      {/* Community Voting Anti-Spam Modal */}
      {selectedVotingMovie && (
        <VotingModal
          movie={selectedVotingMovie}
          onClose={() => setSelectedVotingMovie(null)}
        />
      )}
    </div>
  );
}

