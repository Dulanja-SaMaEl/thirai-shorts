"use client";

import { useState } from 'react';
import { Eye, Star, Clock, MessageSquare, Play, ThumbsUp, Lock, Coins, Film, X, Award } from 'lucide-react';

export default function MovieCard({
  movie,
  isUnlocked = false,
  isGuest = true,
  onOpenVoteModal,
  onOpenPlayerModal,
  onOpenTrailerModal
}) {
  const [showReviewsModal, setShowReviewsModal] = useState(false);

  const isPending = movie.status === 'pending';
  const reviews = movie.reviews || [];

  // Calculate average judge score
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length).toFixed(1)
    : (movie.rating || '9.5');

  return (
    <>
      <div
        className={`group relative rounded-lg overflow-hidden bg-[#0F131C] border transition-all duration-200 flex flex-col ${
          isPending
            ? 'opacity-65 border-white/[0.04]'
            : 'border-white/[0.06] hover:border-white/[0.18]'
        }`}
      >
        {/* Cinematic 16:9 Thumbnail Header */}
        <div
          onClick={() => onOpenPlayerModal && onOpenPlayerModal(movie)}
          className="relative aspect-video w-full overflow-hidden bg-[#07080B] cursor-pointer"
        >
          <img
            src={movie.thumbnail_url || '/images/logo-wordmark.png'}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F131C] via-transparent to-transparent opacity-70" />

          {/* Centered Hover Play Affordance */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="w-11 h-11 rounded-full bg-black/70 border border-white/20 text-white flex items-center justify-center">
              <Play className="w-4 h-4 fill-white ml-0.5" />
            </div>
          </div>

          {/* Top Left: Status / Award Badge (Only if special) */}
          {movie.is_winner ? (
            <div className="absolute top-2.5 left-2.5 z-10 bg-gold-500 text-black font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded">
              {movie.winner_category ? movie.winner_category.replace(' - Main Award', '') : 'Winner'}
            </div>
          ) : isPending ? (
            <div className="absolute top-2.5 left-2.5 z-10 bg-amber-500/80 text-black font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded">
              QC Pending
            </div>
          ) : null}
        </div>

        {/* Card Content & Metadata */}
        <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3">
          <div className="space-y-1.5">
            {/* Meta tags: Genre, Runtime, Director */}
            <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-400">
              {movie.genre && <span className="uppercase tracking-wider text-zinc-300">{movie.genre}</span>}
              {movie.running_time && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="font-mono">{movie.running_time}</span>
                </>
              )}
              {movie.director_name && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="truncate max-w-[120px]">Dir. {movie.director_name}</span>
                </>
              )}
            </div>

            {/* Film Title */}
            <h3
              onClick={() => onOpenPlayerModal && onOpenPlayerModal(movie)}
              className="text-base font-bold text-white group-hover:text-gold-400 transition-colors line-clamp-1 cursor-pointer"
            >
              {movie.title}
            </h3>

            {/* Film Synopsis */}
            <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">
              {movie.description}
            </p>
          </div>

          {/* Rating & Actions Bar */}
          <div className="pt-3 border-t border-white/[0.06] space-y-2.5">
            {/* Rating Summary */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-gold-400">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="font-bold text-white">{avgRating}</span>
                <span className="text-zinc-500 text-[11px]">
                  {reviews.length > 0 ? `(${reviews.length})` : ''}
                </span>
              </div>

              {reviews.length > 0 && (
                <button
                  onClick={() => setShowReviewsModal(true)}
                  className="text-[11px] text-zinc-400 hover:text-gold-400 transition-colors"
                >
                  Notes
                </button>
              )}
            </div>

            {/* Action Buttons: Watch, Trailer, Rate */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenPlayerModal && onOpenPlayerModal(movie)}
                className={`flex-1 py-2 px-3 rounded-md font-bold text-xs text-center flex items-center justify-center gap-1.5 transition-colors ${
                  isUnlocked
                    ? 'gold-btn'
                    : isGuest
                      ? 'bg-white/[0.08] hover:bg-white/[0.14] text-white'
                      : 'gold-btn'
                }`}
                title="Watch Short Film"
              >
                {isUnlocked ? (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" /> Watch
                  </>
                ) : isGuest ? (
                  <>
                    <Lock className="w-3 h-3 text-zinc-400" /> Watch
                  </>
                ) : (
                  <>
                    <Coins className="w-3 h-3" /> Watch (1 Token)
                  </>
                )}
              </button>

              {/* Free Trailer Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenTrailerModal) {
                    onOpenTrailerModal(movie);
                  } else if (onOpenPlayerModal) {
                    onOpenPlayerModal({ ...movie, isTrailer: true });
                  }
                }}
                className="py-2 px-3 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                title="Watch Trailer"
              >
                <Film className="w-3 h-3 text-zinc-400" />
                <span>Trailer</span>
              </button>

              {!isPending && (
                <button
                  onClick={() => onOpenVoteModal && onOpenVoteModal(movie)}
                  className="p-2 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-gold-400 transition-colors shrink-0"
                  title="Rate Film"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Public Judge Reviews */}
      {showReviewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-[#0D1017] border border-white/[0.1] rounded-xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Jury Notes: <span className="text-gold-400">{movie.title}</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Official evaluations submitted by festival jurors.
                </p>
              </div>
              <button
                onClick={() => setShowReviewsModal(false)}
                className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-3.5 rounded-lg bg-[#07080B] border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rev.users?.profile_pic_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={rev.users?.full_name || 'Judge'}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-semibold text-white">{rev.users?.full_name || 'Official Judge'}</h4>
                        <span className="text-[10px] text-zinc-500">Jury Member</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.06]">
                      <Star className="w-3 h-3 text-gold-400 fill-gold-400" />
                      <span className="text-xs font-bold text-gold-400 font-mono">{rev.score} / 10</span>
                    </div>
                  </div>

                  <p className="text-zinc-300 text-xs italic leading-relaxed pl-2 border-l-2 border-gold-400/40">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowReviewsModal(false)}
                className="px-4 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

