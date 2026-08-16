"use client";

import { useState, useEffect } from 'react';
import { X, Play, Star, Download, ThumbsUp, Film, Calendar, Mail, Trophy } from 'lucide-react';
import api from '../lib/api';

export default function VideoPlayerModal({ movie, onClose, onOpenVoteModal }) {
  if (!movie) return null;

  const [viewCount, setViewCount] = useState(movie.view_count || 1420);

  useEffect(() => {
    // 1. Optimistic view count increment (+1)
    setViewCount(prev => prev + 1);

    // 2. Persist view count in backend
    api.post(`/movies/${movie.id}/view`)
      .then(res => {
        if (res.data.success && res.data.view_count) {
          setViewCount(res.data.view_count);
        }
      })
      .catch(err => console.warn('View count increment note:', err));
  }, [movie.id]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg animate-fade-in overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-surface-card border border-gold-500/40 rounded-3xl overflow-hidden shadow-gold-glow-lg glass-panel my-8"
      >
        
        {/* Top Header Bar with Close Button */}
        <div className="flex items-center justify-between px-6 py-4 bg-black/80 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-pulse" />
            <span className="text-xs font-bold text-gold-400 uppercase tracking-widest">
              Thirai+ Cinema Player
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/40 text-gold-300 hover:text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-gold-glow"
          >
            <X className="w-4 h-4" /> CLOSE PLAYER
          </button>
        </div>

        {/* Cinema HTML5 Video Player */}
        <div className="relative aspect-video w-full bg-black border-b border-zinc-800 flex items-center justify-center">
          <video
            controls
            autoPlay
            src={movie.video_url || '/videos/demo-film.mp4'}
            poster={movie.thumbnail_url || '/images/logo-wordmark.png'}
            className="w-full h-full object-contain"
          >
            Your browser does not support HTML5 video playback.
          </video>
        </div>

        {/* Film Details & Metadata Section */}
        <div className="p-6 md:p-8 space-y-6">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {movie.is_winner && (
                  <span className="gold-btn px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                    <Trophy className="w-3 h-3 fill-black" /> Winner: {movie.winner_category || 'Grand Winner'}
                  </span>
                )}
                <span className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-md font-mono">
                  {viewCount} Views
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-white">{movie.title}</h2>
              <p className="text-xs text-zinc-400 mt-1 font-light flex items-center gap-4">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-gold-400" /> {movie.uploader_email || 'director@thiraiplus.com'}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gold-400" /> {new Date(movie.created_at || Date.now()).toLocaleDateString()}</span>
              </p>
            </div>

            {onOpenVoteModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenVoteModal(movie);
                }}
                className="gold-btn py-2.5 px-5 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-gold-glow shrink-0"
              >
                <ThumbsUp className="w-4 h-4" /> Cast Public Vote
              </button>
            )}
          </div>

          {/* Description */}
          <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4 text-xs text-zinc-300 leading-relaxed">
            <h4 className="text-[11px] font-bold text-gold-400 uppercase tracking-widest mb-1">Synopsis / Director Statement</h4>
            <p>{movie.description}</p>
          </div>

          {/* Attachments / Downloads */}
          {movie.attachments && movie.attachments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> Film Attachments & Press Kit
              </h4>
              <div className="flex flex-wrap gap-2">
                {movie.attachments.map((att, idx) => (
                  <a
                    key={idx}
                    href={att.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-zinc-900 border border-zinc-700 hover:border-gold-500 rounded-xl text-xs text-zinc-200 flex items-center gap-2 transition-colors"
                  >
                    <Film className="w-3.5 h-3.5 text-gold-400" />
                    <span>{att.name || `Attachment ${idx + 1}`}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Jury Reviews Section */}
          {movie.reviews && movie.reviews.length > 0 && (
            <div className="border-t border-zinc-800 pt-5 space-y-3">
              <h4 className="text-xs font-bold text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
                <Star className="w-4 h-4 text-gold-400 fill-gold-400" /> Official Jury Reviews ({movie.reviews.length})
              </h4>
              <div className="space-y-3">
                {movie.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-black/80 border border-gold-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.users?.profile_pic_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                          alt="Judge"
                          className="w-7 h-7 rounded-full object-cover border border-gold-400"
                        />
                        <span className="text-xs font-bold text-white">{rev.users?.full_name || 'Festival Judge'}</span>
                      </div>
                      <span className="text-xs font-extrabold text-gold-400 bg-gold-500/10 px-2.5 py-0.5 rounded-full border border-gold-500/30">
                        ⭐ {rev.score} / 10
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 italic">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Footer Close Button */}
          <div className="pt-4 border-t border-zinc-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-gold-500 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all"
            >
              <X className="w-4 h-4 text-gold-400" /> Close Video Stream
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
