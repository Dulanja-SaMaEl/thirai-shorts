"use client";

import { useState, useEffect } from 'react';
import { X, Play, Star, Download, ThumbsUp, Film, Calendar, Mail, Trophy, AlertTriangle, RefreshCw, Volume2 } from 'lucide-react';
import api from '../lib/api';

export default function VideoPlayerModal({ movie, onClose, onOpenVoteModal }) {
  if (!movie) return null;

  const [viewCount, setViewCount] = useState(movie.view_count || 1420);
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  // Keyboard shortcut (Escape to close) & Body scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  // View count increment
  useEffect(() => {
    setViewCount(prev => prev + 1);

    api.post(`/movies/${movie.id}/view`)
      .then(res => {
        if (res.data.success && res.data.view_count) {
          setViewCount(res.data.view_count);
        }
      })
      .catch(err => console.warn('View count increment notice:', err));
  }, [movie.id]);

  // Helper: check if URL is YouTube or Vimeo
  const getEmbedUrl = (url) => {
    if (!url) return null;
    const clean = url.trim();

    // YouTube regex
    const ytMatch = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`;
    }

    // Vimeo regex
    const vimeoMatch = clean.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/);
    if (vimeoMatch && vimeoMatch[3]) {
      return `https://player.vimeo.com/video/${vimeoMatch[3]}?autoplay=1`;
    }

    return null;
  };

  const embedUrl = getEmbedUrl(movie.video_url);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-2xl animate-fade-in overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl bg-surface-card border border-gold-500/40 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(255,215,0,0.18)] glass-panel my-auto"
      >
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-black/90 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-pulse" />
            <span className="text-xs font-black text-gold-400 uppercase tracking-widest">
              Thirai+ Cinema Player
            </span>
            <span className="hidden sm:inline-block text-[11px] text-zinc-500">•</span>
            <span className="hidden sm:inline-block text-xs font-bold text-zinc-300 truncate max-w-md">
              {movie.title}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-full bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/40 text-gold-300 hover:text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-gold-glow"
          >
            <X className="w-4 h-4" /> CLOSE (ESC)
          </button>
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video w-full bg-black border-b border-zinc-800 flex items-center justify-center shadow-inner overflow-hidden">
          
          {embedUrl ? (
            // YouTube / Vimeo Iframe Embed
            <iframe
              src={embedUrl}
              title={movie.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
              onLoad={() => setVideoLoading(false)}
            />
          ) : (
            // HTML5 Cinema Video Player
            <div className="relative w-full h-full flex items-center justify-center">
              {videoError ? (
                <div className="p-8 text-center space-y-3">
                  <AlertTriangle className="w-10 h-10 text-gold-400 mx-auto" />
                  <h3 className="text-sm font-bold text-white">Video Playback Stream Unavailable</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    The short film media stream could not be loaded directly. Please check your network connection or verify the source link.
                  </p>
                  <button
                    onClick={() => setVideoError(false)}
                    className="gold-btn px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retry Playback
                  </button>
                </div>
              ) : (
                <video
                  controls
                  autoPlay
                  playsInline
                  src={movie.video_url || '/videos/demo-film.mp4'}
                  poster={movie.thumbnail_url || '/images/logo-wordmark.png'}
                  onError={() => setVideoError(true)}
                  onLoadedData={() => setVideoLoading(false)}
                  className="w-full h-full object-contain"
                >
                  Your browser does not support HTML5 video streaming.
                </video>
              )}
            </div>
          )}

        </div>

        {/* Film Details & Metadata Section */}
        <div className="p-6 md:p-8 space-y-6 max-h-[45vh] overflow-y-auto">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {movie.is_winner && (
                  <span className="gold-btn px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-gold-glow">
                    <Trophy className="w-3.5 h-3.5 fill-black" /> Winner: {movie.winner_category || 'Golden Thira Winner'}
                  </span>
                )}
                <span className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-md font-mono font-bold">
                  {viewCount} Views
                </span>
                <span className="text-xs bg-gold-500/10 border border-gold-500/30 text-gold-300 px-2.5 py-0.5 rounded-md font-bold">
                  ⭐ 9.8 / 10 Rating
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-white">{movie.title}</h2>
              <div className="text-xs text-zinc-400 mt-1 flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1 text-zinc-300">
                  <Mail className="w-3.5 h-3.5 text-gold-400" /> {movie.uploader_email || 'director@thiraiplus.com'}
                </span>
                <span className="flex items-center gap-1 text-zinc-400">
                  <Calendar className="w-3.5 h-3.5 text-gold-400" /> {new Date(movie.created_at || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>

            {onOpenVoteModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenVoteModal(movie);
                }}
                className="gold-btn py-2.5 px-5 rounded-2xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 shadow-gold-glow shrink-0 hover:scale-105 active:scale-95 transition-all"
              >
                <ThumbsUp className="w-4 h-4" /> Cast Public Vote
              </button>
            )}
          </div>

          {/* Description / Synopsis */}
          <div className="bg-black/60 border border-zinc-800 rounded-2xl p-5 text-xs text-zinc-300 leading-relaxed space-y-1.5">
            <h4 className="text-[11px] font-bold text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5" /> Synopsis & Director Statement
            </h4>
            <p className="text-zinc-300 text-xs sm:text-sm">{movie.description}</p>
          </div>

          {/* Film Attachments & Press Kit */}
          {movie.attachments && movie.attachments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> Official Press Kit & Attachments
              </h4>
              <div className="flex flex-wrap gap-2">
                {movie.attachments.map((att, idx) => (
                  <a
                    key={idx}
                    href={att.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 bg-zinc-900 border border-zinc-700 hover:border-gold-500 rounded-xl text-xs text-zinc-200 flex items-center gap-2 transition-colors hover:text-gold-300"
                  >
                    <Download className="w-3.5 h-3.5 text-gold-400" />
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
