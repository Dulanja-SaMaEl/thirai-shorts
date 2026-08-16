"use client";

import { useState } from 'react';
import { X, Play, Award, Star, Download, Eye, ThumbsUp, Film, Calendar, Mail } from 'lucide-react';

export default function VideoPlayerModal({ movie, onClose, onOpenVoteModal }) {
  if (!movie) return null;

  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-surface-card border border-gold-500/30 rounded-3xl overflow-hidden shadow-gold-glow-lg glass-panel my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/80 border border-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center hover:scale-110 transition-transform"
        >
          <X className="w-5 h-5" />
        </button>

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
                    <Trophy className="w-3 h-3 fill-black" /> Winner: {movie.winner_category || 'Best Film'}
                  </span>
                )}
                <span className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-md font-mono">
                  {movie.view_count || 1420} Views
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

        </div>
      </div>
    </div>
  );
}
