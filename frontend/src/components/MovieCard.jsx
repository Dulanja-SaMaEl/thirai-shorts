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
        className={`group relative rounded-2xl overflow-hidden bg-surface-card border transition-all duration-300 flex flex-col ${
          isPending
            ? 'faded-card hover:opacity-80 border-white/[0.06]'
            : 'border-white/[0.07] hover:border-gold-500/40 hover:shadow-cinema-card hover:-translate-y-1'
        }`}
      >
        {/* Cinematic 16:9 Thumbnail Header */}
        <div
          onClick={() => onOpenPlayerModal && onOpenPlayerModal(movie)}
          className="relative aspect-video w-full overflow-hidden bg-[#0A0D14] cursor-pointer"
        >
          <img
            src={movie.thumbnail_url || '/images/logo-wordmark.png'}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Cinematic Atmospheric Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#131722] via-transparent to-black/40 opacity-80 group-hover:opacity-60 transition-opacity" />

          {/* Centered Hover Play Affordance */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-gold-gradient p-0.5 shadow-gold-glow">
              <div className="w-full h-full bg-[#07080B] rounded-full flex items-center justify-center">
                <Play className="w-6 h-6 text-gold-400 fill-gold-400 ml-1" />
              </div>
            </div>
          </div>

          {/* Top Left: Moderation / Selection Badge */}
          <div className="absolute top-3 left-3 z-10">
            {isPending ? (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 backdrop-blur-md">
                <Clock className="w-3 h-3" /> QC Pending
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-black/60 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                ✓ Official Selection
              </span>
            )}
          </div>

          {/* Top Right: View Count Pill */}
          <div className="absolute top-3 right-3 z-10 bg-black/65 backdrop-blur-md border border-white/[0.08] px-2.5 py-1 rounded-full text-[11px] font-mono text-zinc-300 flex items-center gap-1.5 shadow-sm">
            <Eye className="w-3 h-3 text-gold-400" />
            <span>{movie.view_count || 1420}</span>
          </div>

          {/* Bottom Left: Winner Crown/Laurel Pill */}
          {movie.is_winner && (
            <div className="absolute bottom-3 left-3 z-10 bg-gold-gradient text-[#07080B] font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-lg shadow-gold-glow flex items-center gap-1 max-w-[200px] truncate">
              <Award className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{movie.winner_category ? movie.winner_category.replace(' - Main Award', '') : 'Winner'}</span>
            </div>
          )}

          {/* Bottom Right: Access Status Pill */}
          <div className="absolute bottom-3 right-3 z-10">
            {isUnlocked ? (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-[#07080B] text-[10px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1">
                ✓ Unlocked
              </span>
            ) : isGuest ? (
              <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-gold-500/30 text-gold-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-2.5 h-2.5 text-gold-400" /> Sign In
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-gold-500/30 text-gold-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Coins className="w-2.5 h-2.5 text-gold-400" /> 1 Token
              </span>
            )}
          </div>
        </div>

        {/* Card Content & Metadata */}
        <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 gap-4">
          <div className="space-y-2">
            {/* Meta tags: Genre, Runtime, Director */}
            <div className="flex items-center gap-2 text-[11px] font-medium text-gold-400/90 tracking-wide">
              {movie.genre && <span className="uppercase font-bold tracking-wider">{movie.genre}</span>}
              {movie.running_time && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-400 font-mono">{movie.running_time}</span>
                </>
              )}
              {movie.director_name && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-400 truncate max-w-[130px]">Dir. {movie.director_name}</span>
                </>
              )}
            </div>

            {/* Film Title */}
            <h3
              onClick={() => onOpenPlayerModal && onOpenPlayerModal(movie)}
              className="text-lg font-extrabold text-white group-hover:text-gold-300 transition-colors line-clamp-1 cursor-pointer leading-tight"
            >
              {movie.title}
            </h3>

            {/* Film Synopsis */}
            <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2 font-normal">
              {movie.description}
            </p>
          </div>

          {/* Scores & Interactive Actions */}
          <div className="pt-3 border-t border-white/[0.06] space-y-3">
            {/* Jury Score & Reviews Summary */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
                <span className="text-xs font-bold text-white">{avgRating}</span>
                <span className="text-[11px] text-zinc-500 font-medium">
                  ({reviews.length > 0 ? `${reviews.length} jury critiques` : 'Festival Rating'})
                </span>
              </div>

              {reviews.length > 0 && (
                <button
                  onClick={() => setShowReviewsModal(true)}
                  className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1 font-semibold transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Read Notes
                </button>
              )}
            </div>

            {/* Action Buttons: Watch, Trailer, Rate */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenPlayerModal && onOpenPlayerModal(movie)}
                className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs text-center flex items-center justify-center gap-1.5 transition-all duration-200 ${
                  isUnlocked
                    ? 'gold-btn'
                    : isGuest
                      ? 'bg-surface-elevated border border-gold-500/30 text-gold-300 hover:bg-gold-500/15'
                      : 'gold-btn'
                }`}
                title="Stream Full Short Film"
              >
                {isUnlocked ? (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" /> Watch Film
                  </>
                ) : isGuest ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-gold-400" /> Watch Film
                  </>
                ) : (
                  <>
                    <Coins className="w-3.5 h-3.5" /> Watch (1 Token)
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
                className="py-2.5 px-3 rounded-xl bg-surface-elevated hover:bg-white/[0.08] border border-white/[0.08] hover:border-gold-500/40 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
                title="Watch Movie Trailer completely free (0 Tokens)"
              >
                <Film className="w-3.5 h-3.5 text-gold-400" />
                <span className="hidden sm:inline">Trailer</span>
              </button>

              {!isPending && (
                <button
                  onClick={() => onOpenVoteModal && onOpenVoteModal(movie)}
                  className="p-2.5 rounded-xl bg-surface-elevated border border-white/[0.08] hover:border-gold-500/40 text-zinc-400 hover:text-gold-300 text-xs font-bold flex items-center justify-center transition-colors shrink-0"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-xl bg-surface-card border border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-cinema-elevated max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-extrabold text-white">
                  Jury Critiques: <span className="gold-text-gradient">{movie.title}</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Official evaluations submitted by verified festival grand jurors.
                </p>
              </div>
              <button
                onClick={() => setShowReviewsModal(false)}
                className="p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 mt-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-[#0B0D13] border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.users?.profile_pic_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={rev.users?.full_name || 'Judge'}
                        className="w-8 h-8 rounded-full object-cover border border-gold-400/80"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">{rev.users?.full_name || 'Official Judge'}</h4>
                        <span className="text-[10px] text-zinc-500">Verified Jury Member</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-gold-500/10 border border-gold-500/25 px-2.5 py-1 rounded-full">
                      <Star className="w-3 h-3 text-gold-400 fill-gold-400" />
                      <span className="text-xs font-bold text-gold-400 font-mono">{rev.score} / 10</span>
                    </div>
                  </div>

                  <p className="text-zinc-300 text-xs italic leading-relaxed pl-2.5 border-l-2 border-gold-500/40">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowReviewsModal(false)}
                className="px-5 py-2 rounded-xl bg-surface-elevated hover:bg-white/[0.1] border border-white/[0.08] text-white text-xs font-bold transition-colors"
              >
                Close Critiques
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

