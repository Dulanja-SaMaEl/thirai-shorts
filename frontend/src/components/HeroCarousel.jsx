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
      className="relative w-full rounded-2xl overflow-hidden border border-white/[0.08] bg-[#07080B] min-h-[500px] md:min-h-[580px] lg:min-h-[620px] flex flex-col justify-end group transition-all"
    >
      {/* Background Poster / Backdrop with Smooth Transition */}
      <div className="absolute inset-0 z-0">
        <img
          key={currentMovie.id}
          src={currentMovie.thumbnail_url || '/images/logo-wordmark.png'}
          alt={currentMovie.title}
          className="w-full h-full object-cover object-center transform scale-105 transition-all duration-700 ease-out brightness-[0.78] group-hover:scale-100 group-hover:brightness-[0.85]"
        />

        {/* Sophisticated Multi-Layer Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080B] via-[#07080B]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07080B] via-[#07080B]/75 to-transparent max-w-4xl" />
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#07080B]/80 to-transparent" />
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-10 p-6 sm:p-10 md:p-12 max-w-3xl space-y-3.5">
        
        {/* Cinema Metadata Line */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-300">
          {currentMovie.is_winner && (
            <span className="bg-gold-500 text-black text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              {currentMovie.winner_category || 'Festival Winner'}
            </span>
          )}
          <span className="text-zinc-400 font-mono">2026</span>
          <span className="text-zinc-600">•</span>
          {currentMovie.duration && (
            <>
              <span className="text-zinc-300 font-mono">{currentMovie.duration}</span>
              <span className="text-zinc-600">•</span>
            </>
          )}
          {currentMovie.genre && (
            <>
              <span className="text-zinc-300">{currentMovie.genre}</span>
              <span className="text-zinc-600">•</span>
            </>
          )}
          <span className="text-gold-400 font-semibold font-mono">★ {currentMovie.rating || '9.8'}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.05]">
          {currentMovie.title}
        </h1>

        {/* Description */}
        <p className="text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed line-clamp-3 max-w-2xl">
          {currentMovie.description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <button
            onClick={() => onWatchMovie && onWatchMovie(currentMovie)}
            className="gold-btn px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" /> Watch Film
          </button>

          {onWatchTrailer && (
            <button
              onClick={() => onWatchTrailer(currentMovie)}
              className="px-4 py-2.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-white text-xs font-semibold flex items-center gap-2 transition-colors"
              title="Watch Trailer free"
            >
              <Film className="w-3.5 h-3.5 text-gold-400" /> Watch Trailer
            </button>
          )}

          {onOpenVoteModal && (
            <button
              onClick={() => onOpenVoteModal(currentMovie)}
              className="px-4 py-2.5 rounded-lg bg-black/60 hover:bg-black/90 border border-white/[0.1] text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Star className="w-3.5 h-3.5 text-gold-400" /> Vote
            </button>
          )}
        </div>

      </div>

      {/* Navigation Chevrons */}
      <button
        onClick={handlePrev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/[0.12] text-white flex items-center justify-center transition-all opacity-70 hover:opacity-100"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/[0.12] text-white flex items-center justify-center transition-all opacity-70 hover:opacity-100"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Bottom Thumbnail / Filmstrip Indicator Strip */}
      <div className="relative z-10 px-6 sm:px-10 md:px-12 py-3 bg-[#07080B]/90 flex items-center justify-between gap-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {finalMovies.map((movie, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={movie.id || idx}
                onClick={() => setCurrentIndex(idx)}
                className={`group/thumb relative h-11 md:h-12 aspect-video rounded-lg overflow-hidden border transition-all shrink-0 ${
                  isActive
                    ? 'border-gold-400 opacity-100'
                    : 'border-white/[0.08] opacity-45 hover:opacity-80'
                }`}
              >
                <img
                  src={movie.thumbnail_url || '/images/logo-wordmark.png'}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 group-hover/thumb:bg-transparent transition-colors" />
                <span className="absolute bottom-1 left-1.5 right-1.5 text-[9px] font-bold text-white line-clamp-1 text-left">
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
