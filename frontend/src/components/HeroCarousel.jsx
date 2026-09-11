"use client";

import { useState, useEffect, useRef } from 'react';
import { Play, Star, ChevronLeft, ChevronRight, Trophy, Sparkles, Clock, Eye, Film, Info } from 'lucide-react';

const FALLBACK_HERO_MOVIES = [
  {
    id: 'e0000000-0000-0000-0000-000000000002',
    title: 'The Whispering Palms',
    description: 'A poignant drama set along the sun-drenched shores of Jaffna, following an aging fisherman preserving timeless coastal folklore against rising modern tides.',
    thumbnail_url: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=1600&auto=format&fit=crop&q=80',
    video_url: '/videos/demo-film.mp4',
    view_count: 2850,
    is_winner: true,
    winner_category: 'Golden Thira Award - Best Short Film',
    rating: '9.9',
    duration: '22 min',
    genre: 'Coastal Drama'
  },
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    title: 'Blue End Screen: Winter Outro',
    description: 'A breathtaking visual journey capturing winter landscapes, serene typography, and high-contrast cinematic atmosphere.',
    thumbnail_url: '/images/logo-wordmark.png',
    video_url: '/videos/demo-film.mp4',
    view_count: 1420,
    is_winner: true,
    winner_category: 'Best Cinematography',
    rating: '9.7',
    duration: '14 min',
    genre: 'Experimental Visual'
  },
  {
    id: 'e0000000-0000-0000-0000-000000000005',
    title: 'Shadows in the Mist',
    description: 'A psychological thriller set deep in the central highlands of Sri Lanka as an ancient tea estate mystery slowly unravels among three stranded travelers.',
    thumbnail_url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=1600&auto=format&fit=crop&q=80',
    video_url: '/videos/demo-film.mp4',
    view_count: 3410,
    is_winner: true,
    winner_category: 'Best Sound Design',
    rating: '9.6',
    duration: '19 min',
    genre: 'Psychological Thriller'
  },
  {
    id: 'e0000000-0000-0000-0000-000000000003',
    title: 'Echoes of Silence',
    description: 'An experimental neo-noir short exploring urban isolation in a bustling metropolitan city, portrayed entirely through ambient soundscapes and neon reflections.',
    thumbnail_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&auto=format&fit=crop&q=80',
    video_url: '/videos/demo-film.mp4',
    view_count: 980,
    is_winner: false,
    rating: '9.2',
    duration: '16 min',
    genre: 'Neo-Noir'
  },
  {
    id: 'e0000000-0000-0000-0000-000000000004',
    title: 'The Last Letter',
    description: 'A heart-wrenching historical drama depicting two wartime correspondents separated across borders in 1989, connected only by unsent letters.',
    thumbnail_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1600&auto=format&fit=crop&q=80',
    video_url: '/videos/demo-film.mp4',
    view_count: 1760,
    is_winner: false,
    rating: '9.4',
    duration: '21 min',
    genre: 'Historical Drama'
  }
];

export default function HeroCarousel({ movies = [], onWatchMovie, onOpenVoteModal, onWatchTrailer }) {
  // Use approved movies up to 5, fallback to curated list if none available
  const displayMovies = movies && movies.length > 0
    ? movies.filter(m => m.status === 'approved').slice(0, 5)
    : FALLBACK_HERO_MOVIES;

  const finalMovies = displayMovies.length >= 2 ? displayMovies : FALLBACK_HERO_MOVIES;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);

  const currentMovie = finalMovies[currentIndex] || finalMovies[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % finalMovies.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + finalMovies.length) % finalMovies.length);
  };

  // Autoplay carousel every 6.5 seconds when not hovered
  useEffect(() => {
    if (!isHovered) {
      timerRef.current = setInterval(() => {
        handleNext();
      }, 6500);
    }
    return () => clearInterval(timerRef.current);
  }, [isHovered, currentIndex, finalMovies.length]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-gold-500/30 bg-black min-h-[480px] md:min-h-[580px] flex flex-col justify-end group transition-all"
    >
      {/* Background Poster / Backdrop with Smooth Transition */}
      <div className="absolute inset-0 z-0">
        <img
          key={currentMovie.id}
          src={currentMovie.thumbnail_url || '/images/logo-wordmark.png'}
          alt={currentMovie.title}
          className="w-full h-full object-cover object-center transform scale-105 transition-all duration-1000 ease-out brightness-75 group-hover:scale-100 group-hover:brightness-90"
        />

        {/* Netflix-style Cinematic Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-10 p-6 md:p-12 max-w-3xl space-y-4">
        
        {/* Badges Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {currentMovie.is_winner ? (
            <span className="gold-btn px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-gold-glow">
              <Trophy className="w-3.5 h-3.5 fill-black" />
              {currentMovie.winner_category || 'Official Winner'}
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-gold-500/20 text-gold-300 border border-gold-500/40 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              Official Festival Selection
            </span>
          )}

          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-zinc-900/90 text-zinc-300 border border-zinc-700">
            4K ULTRA HD
          </span>

          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-zinc-900/90 text-zinc-300 border border-zinc-700 flex items-center gap-1">
            <Eye className="w-3 h-3 text-gold-400" /> {currentMovie.view_count || 1420} views
          </span>

          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-gold-500/10 text-gold-300 border border-gold-500/30 flex items-center gap-1">
            ⭐ {currentMovie.rating || '9.8'} / 10
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
          {currentMovie.title}
        </h1>

        {/* Description */}
        <p className="text-xs sm:text-sm md:text-base text-zinc-300 font-normal leading-relaxed line-clamp-3 max-w-2xl drop-shadow">
          {currentMovie.description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => onWatchMovie && onWatchMovie(currentMovie)}
            className="gold-btn px-6 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2.5 shadow-gold-glow hover:scale-105 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-black" /> Watch Short Film
          </button>

          {onWatchTrailer && (
            <button
              onClick={() => onWatchTrailer(currentMovie)}
              className="px-5 py-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-gold-500/50 hover:border-gold-400 text-gold-300 hover:text-white text-xs sm:text-sm font-black flex items-center gap-2 transition-all shadow-gold-glow backdrop-blur-md"
              title="Watch Trailer completely free (0 Tokens)"
            >
              <Film className="w-4 h-4 text-gold-400" /> Watch Free Trailer
            </button>
          )}

          {onOpenVoteModal && (
            <button
              onClick={() => onOpenVoteModal(currentMovie)}
              className="px-5 py-3 rounded-2xl bg-black/70 hover:bg-black border border-zinc-700 hover:border-gold-400 text-zinc-300 hover:text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all backdrop-blur-md"
            >
              <Star className="w-4 h-4 text-gold-400" /> Public Vote
            </button>
          )}
        </div>

      </div>

      {/* Navigation Chevrons */}
      <button
        onClick={handlePrev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 border border-gold-500/30 hover:border-gold-400 text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 shadow-lg"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 border border-gold-500/30 hover:border-gold-400 text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 shadow-lg"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Bottom Thumbnail / Indicator Strip */}
      <div className="relative z-10 px-6 md:px-12 py-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex items-center justify-between gap-4 border-t border-zinc-800/60">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {finalMovies.map((movie, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={movie.id || idx}
                onClick={() => setCurrentIndex(idx)}
                className={`group/thumb relative h-12 md:h-14 aspect-video rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  isActive
                    ? 'border-gold-400 ring-2 ring-gold-400/40 scale-105'
                    : 'border-zinc-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={movie.thumbnail_url || '/images/logo-wordmark.png'}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 group-hover/thumb:bg-transparent transition-colors" />
                <span className="absolute bottom-0.5 left-1 text-[9px] font-extrabold text-white line-clamp-1 drop-shadow">
                  {movie.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Slide Counter */}
        <div className="text-right shrink-0 hidden sm:block">
          <span className="text-xs font-mono font-bold text-gold-400">
            0{currentIndex + 1}
          </span>
          <span className="text-xs font-mono text-zinc-500"> / 0{finalMovies.length}</span>
        </div>
      </div>

    </div>
  );
}
