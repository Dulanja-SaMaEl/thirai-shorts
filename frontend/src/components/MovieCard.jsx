"use client";

import { useState } from 'react';
import { Eye, Star, Clock, MessageSquare, ExternalLink, ThumbsUp } from 'lucide-react';

export default function MovieCard({ movie, onOpenVoteModal }) {
  const [showReviewsModal, setShowReviewsModal] = useState(false);

  const isPending = movie.status === 'pending';
  const reviews = movie.reviews || [];

  // Calculate average judge score
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length).toFixed(1)
    : 'N/A';

  return (
    <>
      <div
        className={`group relative rounded-2xl overflow-hidden bg-surface-card border transition-all duration-300 ${
          isPending
            ? 'faded-card hover:opacity-80'
            : 'border-gold-500/20 hover:border-gold-500/60 hover:shadow-gold-glow'
        }`}
      >
        {/* Thumbnail Header */}
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          <img
            src={movie.thumbnail_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600'}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            {isPending ? (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 backdrop-blur-md">
                <Clock className="w-3 h-3" /> Moderation Pending
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                Approved Selection
              </span>
            )}
          </div>

          {/* View Count Badge */}
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md border border-zinc-800 px-2.5 py-1 rounded-full text-[11px] font-mono text-zinc-300 flex items-center gap-1">
            <Eye className="w-3 h-3 text-gold-400" />
            <span>{movie.view_count || 0}</span>
          </div>

          {/* Winner Ribbon if applicable */}
          {movie.is_winner && (
            <div className="absolute bottom-3 left-3 bg-gold-gradient text-black font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-gold-glow">
              🏆 Winner
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-5 flex flex-col justify-between h-[210px]">
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors line-clamp-1">
              {movie.title}
            </h3>
            <p className="text-zinc-400 text-xs mt-1.5 line-clamp-2 font-light">
              {movie.description}
            </p>
          </div>

          <div>
            {/* Judge Score & Review Summary */}
            <div className="flex items-center justify-between py-3 border-t border-zinc-800/80 my-2">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-gold-400 fill-gold-400" />
                <span className="text-sm font-bold text-white">{avgRating}</span>
                <span className="text-[11px] text-zinc-500">({reviews.length} judge reviews)</span>
              </div>

              {reviews.length > 0 && (
                <button
                  onClick={() => setShowReviewsModal(true)}
                  className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1 font-semibold underline underline-offset-4"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Read Notes
                </button>
              )}
            </div>

            {/* Actions: Watch & Vote */}
            <div className="flex items-center gap-2">
              <a
                href={movie.video_url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-gold-400 text-zinc-200 hover:text-white text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Watch Film
              </a>

              {!isPending && (
                <button
                  onClick={() => onOpenVoteModal(movie)}
                  className="py-2 px-3 rounded-lg bg-gold-500/10 border border-gold-500/40 hover:bg-gold-500/20 text-gold-300 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5" /> Rate Film
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Public Judge Reviews */}
      {showReviewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-surface-card border border-gold-500/30 rounded-2xl p-6 shadow-gold-glow max-h-[85vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-1">
              Jury Reviews: <span className="gold-text-gradient">{movie.title}</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-6">
              Official evaluations and constructive notes submitted by verified festival judges.
            </p>

            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl bg-black/60 border border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.users?.profile_pic_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={rev.users?.full_name || 'Judge'}
                        className="w-8 h-8 rounded-full object-cover border border-gold-400"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{rev.users?.full_name || 'Official Judge'}</h4>
                        <span className="text-[10px] text-zinc-500">Verified Jury Member</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-gold-500/10 border border-gold-500/30 px-2.5 py-1 rounded-full">
                      <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
                      <span className="text-xs font-bold text-gold-400">{rev.score} / 10</span>
                    </div>
                  </div>

                  <p className="text-zinc-300 text-xs italic leading-relaxed pl-2 border-l-2 border-gold-500/40">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowReviewsModal(false)}
                className="px-5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
              >
                Close Reviews
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
