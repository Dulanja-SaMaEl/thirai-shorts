"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Film, Search, X, Filter, Sparkles, Trophy, GraduationCap, Play,
  Star, Clock, Eye, SlidersHorizontal, LayoutGrid, List, Check,
  ArrowLeft, ArrowUpRight, ShieldCheck, Heart, ThumbsUp, MessageSquare,
  Clapperboard, Calendar, Globe, User, Award, Camera, Music, Volume2,
  Share2, Info, ChevronRight, Lock, Coins, AlertCircle, RefreshCw
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import VideoPlayerModal from '../../components/VideoPlayerModal';
import AuthWatchModal from '../../components/AuthWatchModal';
import TokenUnlockModal from '../../components/TokenUnlockModal';
import VotingModal from '../../components/VotingModal';

const GENRE_CATEGORIES = [
  { id: 'all', label: 'All Films', icon: Film },
  { id: 'winners', label: 'Award Winners', icon: Trophy },
  { id: 'students', label: 'Student Films', icon: GraduationCap },
  { id: 'drama', label: 'Drama' },
  { id: 'thriller', label: 'Thriller' },
  { id: 'action', label: 'Action' },
  { id: 'comedy', label: 'Comedy' },
  { id: 'experimental', label: 'Experimental' },
  { id: 'documentary', label: 'Documentary' },
  { id: 'scifi', label: 'Sci-Fi' },
  { id: 'mobile', label: 'Mobile Cinema' },
  { id: 'ai', label: 'AI Cinema' },
];

const LANGUAGE_OPTIONS = [
  { id: 'all', label: 'All Languages' },
  { id: 'Tamil', label: 'Tamil' },
  { id: 'Sinhala', label: 'Sinhala' },
  { id: 'English', label: 'English' },
  { id: 'Hindi', label: 'Hindi' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest Additions' },
  { id: 'popular', label: 'Most Viewed / Popular' },
  { id: 'top_rated', label: 'Top Jury Rating' },
  { id: 'duration_asc', label: 'Runtime: Shortest First' },
  { id: 'duration_desc', label: 'Runtime: Longest First' },
  { id: 'title_asc', label: 'Alphabetical (A - Z)' },
];

function GalleryContent() {
  const { user, updateTokens } = useAuth();
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  const [movies, setMovies] = useState([]);
  const [unlockedMovieIds, setUnlockedMovieIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams?.get('category') || 'all');
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams?.get('lang') || 'all');
  const [selectedFilmType, setSelectedFilmType] = useState('all'); // 'all' | 'Student Film' | 'Independent Film'
  const [sortOption, setSortOption] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Modals & Action State
  const [selectedPlayingMovie, setSelectedPlayingMovie] = useState(null);
  const [selectedAuthPromptMovie, setSelectedAuthPromptMovie] = useState(null);
  const [selectedUnlockMovie, setSelectedUnlockMovie] = useState(null);
  const [selectedVotingMovie, setSelectedVotingMovie] = useState(null);
  const [selectedDossierMovie, setSelectedDossierMovie] = useState(null);
  const [shareToast, setShareToast] = useState('');

  // Fetch all movies & unlocked movies
  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUnlockedMovies();
    } else {
      setUnlockedMovieIds([]);
    }
  }, [user?.id]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/movies');
      if (res.data?.success && Array.isArray(res.data.movies)) {
        setMovies(res.data.movies);
      }
    } catch (err) {
      console.warn('Notice loading gallery movies, fallback loaded:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnlockedMovies = async () => {
    try {
      const res = await api.get('/movies/my/unlocked');
      if (res.data?.success && res.data.unlocked_ids) {
        setUnlockedMovieIds(res.data.unlocked_ids);
      }
    } catch (e) {
      console.warn('Notice loading unlocked films:', e);
    }
  };

  // Central Gatekeeper for Full Movie Playback
  const handleWatchMovie = (movie) => {
    // 1. Guest: Requires Login
    if (!user) {
      setSelectedAuthPromptMovie(movie);
      return;
    }

    // 2. VIP Member, Admin, Judge, or Already Unlocked
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

  // Free Trailer Streaming (100% Free for Everyone)
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

  const handleShareMovie = (movie, e) => {
    e?.stopPropagation();
    const url = typeof window !== 'undefined' ? `${window.location.origin}/gallery?movie=${movie.id}` : '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setShareToast(`Link to "${movie.title}" copied to clipboard!`);
      setTimeout(() => setShareToast(''), 3000);
    }
  };

  // Helper to calculate runtime in minutes
  const parseRuntimeMinutes = (runtimeStr) => {
    if (!runtimeStr) return 0;
    const match = String(runtimeStr).match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // Helper to calculate average review score
  const getAverageScore = (movie) => {
    const revs = movie.reviews || [];
    if (revs.length > 0) {
      return (revs.reduce((sum, r) => sum + r.score, 0) / revs.length);
    }
    return parseFloat(movie.rating) || 8.5;
  };

  // Filtered & Sorted Movie Catalogue
  const filteredMovies = useMemo(() => {
    return movies
      .filter((movie) => {
        // 1. Text Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const inTitle = (movie.title || '').toLowerCase().includes(q);
          const inDesc = (movie.description || '').toLowerCase().includes(q);
          const inDirector = (movie.director_name || '').toLowerCase().includes(q);
          const inWriter = (movie.writer_name || '').toLowerCase().includes(q);
          const inGenre = (movie.genre || '').toLowerCase().includes(q);
          const inCountry = (movie.country_of_production || '').toLowerCase().includes(q);
          const inCast = Array.isArray(movie.lead_casts) && movie.lead_casts.some(c =>
            (c.actor || '').toLowerCase().includes(q) || (c.character || '').toLowerCase().includes(q)
          );
          if (!inTitle && !inDesc && !inDirector && !inWriter && !inGenre && !inCountry && !inCast) {
            return false;
          }
        }

        // 2. Category / Genre
        if (activeCategory === 'winners') {
          if (!movie.is_winner) return false;
        } else if (activeCategory === 'students') {
          if (!movie.is_student && movie.film_type !== 'Student Film') return false;
        } else if (activeCategory !== 'all') {
          const g = (movie.genre || '').toLowerCase();
          if (!g.includes(activeCategory.toLowerCase())) return false;
        }

        // 3. Language
        if (selectedLanguage !== 'all') {
          const origLang = (movie.original_language || '').toLowerCase();
          if (!origLang.includes(selectedLanguage.toLowerCase())) return false;
        }

        // 4. Film Type
        if (selectedFilmType !== 'all') {
          const fType = movie.is_student || movie.film_type === 'Student Film' ? 'Student Film' : 'Independent Film';
          if (fType !== selectedFilmType) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case 'popular':
            return (b.view_count || 0) - (a.view_count || 0);
          case 'top_rated':
            return getAverageScore(b) - getAverageScore(a);
          case 'duration_asc':
            return parseRuntimeMinutes(a.running_time) - parseRuntimeMinutes(b.running_time);
          case 'duration_desc':
            return parseRuntimeMinutes(b.running_time) - parseRuntimeMinutes(a.running_time);
          case 'title_asc':
            return (a.title || '').localeCompare(b.title || '');
          case 'newest':
          default:
            return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        }
      });
  }, [movies, searchQuery, activeCategory, selectedLanguage, selectedFilmType, sortOption]);

  // Dynamic Tallying Metrics
  const metrics = useMemo(() => {
    const totalRuntimeMins = movies.reduce((sum, m) => sum + parseRuntimeMinutes(m.running_time), 0);
    const winnersCount = movies.filter(m => m.is_winner).length;
    const studentsCount = movies.filter(m => m.is_student || m.film_type === 'Student Film').length;
    const uniqueCountries = new Set(movies.map(m => m.country_of_production).filter(Boolean)).size || 1;

    return {
      totalFilms: movies.length,
      totalHours: (totalRuntimeMins / 60).toFixed(1),
      winnersCount,
      studentsCount,
      uniqueCountries
    };
  }, [movies]);

  const hasActiveFilters = searchQuery || activeCategory !== 'all' || selectedLanguage !== 'all' || selectedFilmType !== 'all';

  const resetAllFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
    setSelectedLanguage('all');
    setSelectedFilmType('all');
    setSortOption('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-gold-500/20 border border-gold-500/40 text-gold-300 text-xs font-extrabold shadow-gold-glow animate-fade-in flex items-center gap-2.5 backdrop-blur-xl">
          <Check className="w-4 h-4 text-gold-400" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. CINEMA GALLERY HERO BANNER                                             */}
      {/* ========================================================================= */}
      <div className="bg-surface-card border border-gold-500/25 rounded-3xl p-6 sm:p-10 glass-panel shadow-gold-glow relative overflow-hidden">
        {/* Subtle Background Glow Accent */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-mono font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Official Festival Cinema Archive</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Film Gallery & <span className="gold-text-gradient">Screenings</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl">
              Immerse yourself in award-winning short films, visionary student debuts, and masterclass indie cinema across South Asia and global competition categories.
            </p>
          </div>

          {/* Quick Metrics Tally Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/60 border border-zinc-800/90 p-4 rounded-2xl shrink-0">
            <div className="text-center px-2 py-1">
              <span className="block text-2xl font-mono font-black text-white">{metrics.totalFilms}</span>
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Films</span>
            </div>

            <div className="text-center px-2 py-1 border-l border-zinc-800">
              <span className="block text-2xl font-mono font-black text-gold-400">{metrics.totalHours}h</span>
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Screen Time</span>
            </div>

            <div className="text-center px-2 py-1 border-l border-zinc-800">
              <span className="block text-2xl font-mono font-black text-amber-400">{metrics.winnersCount}</span>
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Winners</span>
            </div>

            <div className="text-center px-2 py-1 border-l border-zinc-800">
              <span className="block text-2xl font-mono font-black text-cyan-400">{metrics.studentsCount}</span>
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Student Films</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DISCOVERY & MULTI-FACETED FILTER CONTROLS                              */}
      {/* ========================================================================= */}
      <div className="space-y-5">
        
        {/* Top Control Bar: Search Input, View Mode, Filter Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Live Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, director, cast, synopsis..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#0F131C] border border-white/[0.08] focus:border-gold-500/50 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-white"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Toolbar: Sort Dropdown & Layout Mode Switcher */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
            
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#0F131C] border border-white/[0.08] px-3 py-2 rounded-xl text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-zinc-950 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Layout Toggle (Grid vs List) */}
            <div className="flex items-center bg-[#0F131C] border border-white/[0.08] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-gold-gradient text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-gold-gradient text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
                title="Cinematic Reel / List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Advanced Filters Expand Toggle */}
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isFilterDrawerOpen || selectedLanguage !== 'all' || selectedFilmType !== 'all'
                  ? 'bg-gold-500/10 border-gold-500/40 text-gold-300'
                  : 'bg-[#0F131C] border-white/[0.08] text-zinc-300 hover:text-white'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {(selectedLanguage !== 'all' || selectedFilmType !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-gold-400" />
              )}
            </button>
          </div>
        </div>

        {/* Primary Genre / Category Horizontal Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {GENRE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                  isActive
                    ? 'bg-gold-gradient text-black shadow-gold-glow scale-[1.02]'
                    : 'bg-[#0F131C] border border-white/[0.06] text-zinc-400 hover:text-white hover:border-white/[0.16]'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Collapsible Secondary Filters (Language, Film Type, Reset) */}
        {isFilterDrawerOpen && (
          <div className="bg-[#0D1017] border border-white/[0.08] rounded-2xl p-4 sm:p-5 flex flex-wrap items-center gap-4 sm:gap-6 animate-fade-in">
            {/* Language Selection */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-zinc-500" /> Language:
              </span>
              <div className="flex items-center gap-1 flex-wrap">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setSelectedLanguage(lang.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selectedLanguage === lang.id
                        ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40 font-bold'
                        : 'bg-black/60 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Film Type Selection */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                <Clapperboard className="w-3.5 h-3.5 text-zinc-500" /> Entry Type:
              </span>
              <div className="flex items-center gap-1 flex-wrap">
                {[
                  { id: 'all', label: 'All Types' },
                  { id: 'Independent Film', label: 'Independent' },
                  { id: 'Student Film', label: 'Student (Free)' },
                ].map((ft) => (
                  <button
                    key={ft.id}
                    type="button"
                    onClick={() => setSelectedFilmType(ft.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selectedFilmType === ft.id
                        ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40 font-bold'
                        : 'bg-black/60 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {ft.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="ml-auto text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        )}

        {/* Results Counter & Active Filter Pills */}
        <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span>Showing <strong className="text-white">{filteredMovies.length}</strong> of {movies.length} short films</span>

            {activeCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-[11px]">
                {GENRE_CATEGORIES.find(c => c.id === activeCategory)?.label}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setActiveCategory('all')} />
              </span>
            )}

            {selectedLanguage !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-[11px]">
                Lang: {selectedLanguage}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedLanguage('all')} />
              </span>
            )}

            {selectedFilmType !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-[11px]">
                Type: {selectedFilmType}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedFilmType('all')} />
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-[11px]">
                "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="text-gold-400 hover:text-white transition-colors underline text-xs"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FILM CATALOGUE DISPLAY: GRID OR LIST MODE                             */}
      {/* ========================================================================= */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="rounded-2xl bg-surface-card border border-zinc-800/80 p-4 space-y-4 animate-pulse">
              <div className="aspect-video w-full rounded-xl bg-zinc-900" />
              <div className="space-y-2">
                <div className="h-4 bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-zinc-850 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredMovies.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 sm:py-24 bg-surface-card/60 border border-zinc-800/80 rounded-3xl p-8 space-y-4 glass-panel shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-700/60 flex items-center justify-center mx-auto text-gold-400/80 shadow-gold-glow">
            <Film className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-white tracking-tight">No Short Films Found</h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              We couldn't find any short films matching your current filter criteria. Try clearing search keywords or resetting your genre and language preferences.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={resetAllFilters}
              className="gold-btn py-2.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-gold-glow"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset All Filters ({movies.length} Films)</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW (3 to 4 Column Poster Cards) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => {
            const isUnlocked = Boolean(
              user && (
                user.role === 'admin' ||
                user.role === 'judge' ||
                user.subscription_status === 'active' ||
                unlockedMovieIds.includes(movie.id)
              )
            );
            const isGuest = !user;
            const avgRating = getAverageScore(movie).toFixed(1);

            return (
              <div
                key={movie.id}
                className="group relative rounded-2xl overflow-hidden bg-[#0F131C] border border-white/[0.06] hover:border-gold-500/40 transition-all duration-300 flex flex-col shadow-sm hover:shadow-gold-glow"
              >
                {/* 16:9 Thumbnail Header */}
                <div
                  onClick={() => handleWatchMovie(movie)}
                  className="relative aspect-video w-full overflow-hidden bg-[#07080B] cursor-pointer"
                >
                  <img
                    src={movie.thumbnail_url || '/images/logo-wordmark.png'}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F131C] via-transparent to-transparent opacity-70" />

                  {/* Play Affordance */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="w-11 h-11 rounded-full bg-black/75 border border-gold-400 text-white flex items-center justify-center shadow-gold-glow">
                      <Play className="w-4 h-4 fill-gold-400 text-gold-400 ml-0.5" />
                    </div>
                  </div>

                  {/* Top Left Badges */}
                  <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
                    {movie.is_winner && (
                      <span className="bg-gold-500 text-black font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                        <Trophy className="w-2.5 h-2.5" />
                        {movie.winner_category ? movie.winner_category.replace(' - Main Award', '') : 'Winner'}
                      </span>
                    )}
                    {(movie.is_student || movie.film_type === 'Student Film') && (
                      <span className="bg-cyan-500 text-black font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                        <GraduationCap className="w-2.5 h-2.5" />
                        Student Film
                      </span>
                    )}
                  </div>

                  {/* Top Right Duration Pill */}
                  {movie.running_time && (
                    <div className="absolute top-2.5 right-2.5 z-10 bg-black/80 backdrop-blur-md text-zinc-300 font-mono text-[10px] px-2 py-0.5 rounded-md border border-white/[0.1]">
                      {movie.running_time}
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3">
                  <div className="space-y-1.5">
                    {/* Meta info row */}
                    <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-400">
                      {movie.genre && <span className="uppercase tracking-wider text-gold-400/90 font-semibold">{movie.genre}</span>}
                      {movie.original_language && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <span>{movie.original_language}</span>
                        </>
                      )}
                      {movie.country_of_production && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <span className="truncate max-w-[80px]">{movie.country_of_production}</span>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => handleWatchMovie(movie)}
                      className="text-base font-bold text-white group-hover:text-gold-300 transition-colors line-clamp-1 cursor-pointer"
                    >
                      {movie.title}
                    </h3>

                    {/* Director */}
                    <p className="text-xs text-zinc-400">
                      Dir. <strong className="text-zinc-200">{movie.director_name || 'Independent Filmmaker'}</strong>
                    </p>

                    {/* Synopsis */}
                    <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2 pt-0.5">
                      {movie.description}
                    </p>
                  </div>

                  {/* Action Footer */}
                  <div className="pt-3 border-t border-white/[0.06] space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-gold-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-bold text-white">{avgRating}</span>
                        {movie.reviews?.length > 0 && (
                          <span className="text-zinc-500 text-[10px]">({movie.reviews.length})</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedDossierMovie(movie)}
                          className="text-[11px] text-zinc-400 hover:text-gold-300 transition-colors flex items-center gap-1"
                        >
                          <Info className="w-3 h-3" /> Details
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleShareMovie(movie, e)}
                          className="text-zinc-500 hover:text-white transition-colors"
                          title="Share Film Link"
                        >
                          <Share2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Stream, Trailer, Rate Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleWatchMovie(movie)}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs text-center flex items-center justify-center gap-1.5 transition-all ${
                          isUnlocked
                            ? 'gold-btn'
                            : isGuest
                            ? 'bg-white/[0.08] hover:bg-white/[0.14] text-white'
                            : 'gold-btn'
                        }`}
                      >
                        {isUnlocked ? (
                          <>
                            <Play className="w-3.5 h-3.5 fill-black text-black" />
                            <span>Watch</span>
                          </>
                        ) : isGuest ? (
                          <>
                            <Lock className="w-3 h-3 text-zinc-400" />
                            <span>Watch</span>
                          </>
                        ) : (
                          <>
                            <Coins className="w-3 h-3" />
                            <span>Watch (1 Token)</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleWatchTrailer(movie)}
                        className="py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                        title="Free Trailer Stream"
                      >
                        <Film className="w-3 h-3 text-zinc-400" />
                        <span>Trailer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedVotingMovie(movie)}
                        className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-gold-400 transition-colors shrink-0"
                        title="Rate & Vote"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST / CINEMATIC REEL VIEW */
        <div className="space-y-4">
          {filteredMovies.map((movie) => {
            const isUnlocked = Boolean(
              user && (
                user.role === 'admin' ||
                user.role === 'judge' ||
                user.subscription_status === 'active' ||
                unlockedMovieIds.includes(movie.id)
              )
            );
            const isGuest = !user;
            const avgRating = getAverageScore(movie).toFixed(1);

            return (
              <div
                key={movie.id}
                className="group rounded-2xl bg-[#0F131C] border border-white/[0.06] hover:border-gold-500/40 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all shadow-sm hover:shadow-gold-glow"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 flex-1 min-w-0">
                  {/* Thumbnail */}
                  <div
                    onClick={() => handleWatchMovie(movie)}
                    className="relative aspect-video w-full sm:w-48 sm:h-28 rounded-xl overflow-hidden bg-black shrink-0 cursor-pointer"
                  >
                    <img
                      src={movie.thumbnail_url || '/images/logo-wordmark.png'}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-9 h-9 rounded-full bg-gold-gradient text-black flex items-center justify-center shadow-gold-glow">
                        <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                      </div>
                    </div>
                    {movie.is_winner && (
                      <span className="absolute top-2 left-2 bg-gold-500 text-black font-extrabold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded">
                        Winner
                      </span>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap text-[11px]">
                      <span className="text-gold-400 font-bold uppercase tracking-wider">{movie.genre || 'Cinema'}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="font-mono text-zinc-400">{movie.running_time || 'Short'}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-zinc-400">{movie.original_language || 'Tamil'}</span>
                      {movie.country_of_production && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <span className="text-zinc-400">{movie.country_of_production}</span>
                        </>
                      )}
                    </div>

                    <h3
                      onClick={() => handleWatchMovie(movie)}
                      className="text-lg font-bold text-white group-hover:text-gold-300 transition-colors cursor-pointer truncate"
                    >
                      {movie.title}
                    </h3>

                    <p className="text-xs text-zinc-400 font-light line-clamp-2 max-w-2xl leading-relaxed">
                      {movie.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-zinc-400 pt-1 flex-wrap">
                      <span>Director: <strong className="text-white">{movie.director_name || 'N/A'}</strong></span>
                      {movie.writer_name && <span>• Writer: <strong className="text-zinc-300">{movie.writer_name}</strong></span>}
                      <span className="inline-flex items-center gap-1 text-gold-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" /> {avgRating}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions on the right */}
                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setSelectedDossierMovie(movie)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
                  >
                    Dossier
                  </button>

                  <button
                    type="button"
                    onClick={() => handleWatchTrailer(movie)}
                    className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <Film className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Trailer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleWatchMovie(movie)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isUnlocked ? 'gold-btn' : isGuest ? 'bg-white/[0.08] text-white hover:bg-white/[0.14]' : 'gold-btn'
                    }`}
                  >
                    {isUnlocked ? (
                      <>
                        <Play className="w-3.5 h-3.5 fill-black text-black" />
                        <span>Watch Movie</span>
                      </>
                    ) : isGuest ? (
                      <>
                        <Lock className="w-3 h-3 text-zinc-400" />
                        <span>Watch</span>
                      </>
                    ) : (
                      <>
                        <Coins className="w-3.5 h-3.5" />
                        <span>Watch (1 Token)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedVotingMovie(movie)}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-gold-400 transition-colors"
                    title="Rate Film"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FILM DOSSIER & TECHNICAL SPECIFICATIONS MODAL                          */}
      {/* ========================================================================= */}
      {selectedDossierMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl bg-[#0D1017] border border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            
            {/* Header & Close */}
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gold-gradient p-0.5 flex items-center justify-center shrink-0">
                  <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
                    <Clapperboard className="w-6 h-6 text-gold-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl sm:text-2xl font-bold text-white">{selectedDossierMovie.title}</h3>
                    {selectedDossierMovie.is_winner && (
                      <span className="bg-gold-500 text-black font-extrabold text-[9px] uppercase px-2 py-0.5 rounded">
                        🏆 Winner
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Official Film Dossier, Cast & Crew Credits, and Technical Specifications
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDossierMovie(null)}
                className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Poster & Synopsis Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-3">
                <img
                  src={selectedDossierMovie.thumbnail_url || '/images/logo-wordmark.png'}
                  alt={selectedDossierMovie.title}
                  className="w-full aspect-video rounded-2xl object-cover border border-zinc-800 shadow-md"
                />
                <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800/80 space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Runtime:</span>
                    <strong className="text-white font-mono">{selectedDossierMovie.running_time || 'N/A'}</strong>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Language:</span>
                    <strong className="text-white">{selectedDossierMovie.original_language || 'Tamil'}</strong>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtitles:</span>
                    <strong className="text-zinc-300">{selectedDossierMovie.subtitle_language || 'English'}</strong>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Year:</span>
                    <strong className="text-white">{selectedDossierMovie.year_of_production || '2026'}</strong>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Country:</span>
                    <strong className="text-white">{selectedDossierMovie.country_of_production || 'Sri Lanka'}</strong>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-1">Synopsis</h4>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
                    {selectedDossierMovie.description}
                  </p>
                </div>

                {/* Director Spotlight */}
                <div className="p-4 rounded-2xl bg-black/60 border border-zinc-800/80 flex items-center gap-4">
                  {selectedDossierMovie.director_photo_url ? (
                    <img
                      src={selectedDossierMovie.director_photo_url}
                      alt={selectedDossierMovie.director_name}
                      className="w-14 h-14 rounded-xl object-cover border border-gold-500/40 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-gold-400 shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider block">Director & Filmmaker</span>
                    <h5 className="text-sm font-bold text-white">{selectedDossierMovie.director_name || 'Independent Submitter'}</h5>
                    {selectedDossierMovie.producer_name && (
                      <span className="text-xs text-zinc-400 block">Producer: {selectedDossierMovie.producer_name}</span>
                    )}
                  </div>
                </div>

                {/* Technical Specifications */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-2">Technical Aspects</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-black/60 border border-zinc-850">
                      <span className="text-[10px] text-zinc-500 block">Camera Format</span>
                      <span className="text-white font-semibold">{selectedDossierMovie.shooting_format || 'Cinema Digital'}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/60 border border-zinc-850">
                      <span className="text-[10px] text-zinc-500 block">Post-Production</span>
                      <span className="text-white font-semibold">{selectedDossierMovie.editing_software || 'DaVinci Resolve'}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/60 border border-zinc-850">
                      <span className="text-[10px] text-zinc-500 block">Premiere Status</span>
                      <span className="text-white font-semibold">{selectedDossierMovie.premiere_status || 'Festival Selection'}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/60 border border-zinc-850">
                      <span className="text-[10px] text-zinc-500 block">Production Tier</span>
                      <span className="text-white font-semibold">{selectedDossierMovie.film_type || 'Independent Film'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/[0.08]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const m = selectedDossierMovie;
                    setSelectedDossierMovie(null);
                    handleWatchTrailer(m);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-zinc-200 transition-colors flex items-center gap-1.5"
                >
                  <Film className="w-3.5 h-3.5 text-gold-400" />
                  <span>Preview Trailer</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const m = selectedDossierMovie;
                    setSelectedDossierMovie(null);
                    setSelectedVotingMovie(m);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-zinc-200 transition-colors flex items-center gap-1.5"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Rate Film</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  const m = selectedDossierMovie;
                  setSelectedDossierMovie(null);
                  handleWatchMovie(m);
                }}
                className="gold-btn py-2.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-gold-glow w-full sm:w-auto justify-center"
              >
                <Play className="w-3.5 h-3.5 fill-black text-black" />
                <span>Stream Full Movie</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CINEMA STREAMING & GATEKEEPER MODALS                                   */}
      {/* ========================================================================= */}

      {/* Custom Cinema Player Modal */}
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

      {/* Guest Authentication Prompt Modal */}
      {selectedAuthPromptMovie && (
        <AuthWatchModal
          movie={selectedAuthPromptMovie}
          onClose={() => setSelectedAuthPromptMovie(null)}
        />
      )}

      {/* Token Unlock Modal */}
      {selectedUnlockMovie && (
        <TokenUnlockModal
          movie={selectedUnlockMovie}
          userTokens={user?.tokens_balance ?? 0}
          onConfirmUnlock={handleConfirmUnlock}
          onClose={() => setSelectedUnlockMovie(null)}
        />
      )}

      {/* Community Audience Voting Modal */}
      {selectedVotingMovie && (
        <VotingModal
          movie={selectedVotingMovie}
          onClose={() => setSelectedVotingMovie(null)}
        />
      )}
    </div>
  );
}

export default function MovieGalleryPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 font-bold text-gold-400">Loading Cinema Gallery...</div>}>
      <GalleryContent />
    </Suspense>
  );
}
