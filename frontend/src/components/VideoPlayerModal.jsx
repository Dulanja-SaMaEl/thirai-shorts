"use client";

import { useState, useEffect } from 'react';
import {
  X, Play, Star, Download, ThumbsUp, Film, Calendar, Mail,
  Trophy, AlertTriangle, RefreshCw, Volume2, Users, Clapperboard,
  Camera, Globe, Award, MessageSquare, Send, Heart, UserCheck, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function VideoPlayerModal({ movie, onClose, onOpenVoteModal, isTrailer = false, onWatchFullMovie }) {
  if (!movie) return null;

  const { user } = useAuth();

  const isTrailerMode = isTrailer || Boolean(movie.isTrailer);
  const activeVideoUrl = isTrailerMode
    ? (movie.trailer_url || movie.video_url || '/videos/demo-film.mp4')
    : (movie.video_url || movie.trailer_url || '/videos/demo-film.mp4');

  const [viewCount, setViewCount] = useState(movie.view_count || 1420);
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  // Audience Comments State
  const [commentsList, setCommentsList] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentMsg, setCommentMsg] = useState('');
  const [likedCommentIds, setLikedCommentIds] = useState(new Set());

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

  // Fetch comments when movie opens
  useEffect(() => {
    if (movie?.id) {
      fetchComments(movie.id);
    }
  }, [movie?.id]);

  const fetchComments = async (movieId) => {
    setCommentsLoading(true);
    try {
      const res = await api.get(`/movies/${movieId}/comments`);
      if (res.data?.success && Array.isArray(res.data.comments)) {
        setCommentsList(res.data.comments);
      }
    } catch (err) {
      console.warn('Comments fetch notice:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setSubmittingComment(true);
    setCommentMsg('');

    const authorName = user?.full_name || guestName.trim() || 'Audience Member';
    const authorAvatar = user?.profile_pic_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120';
    let authorBadge = 'Verified Viewer';
    if (user?.role === 'admin') authorBadge = 'Festival Executive';
    else if (user?.role === 'judge') authorBadge = 'Grand Juror';
    else if (user?.role === 'director' || user?.role === 'submitter') authorBadge = 'Film Director';
    else if (user?.subscription_status === 'active') authorBadge = 'VIP Pass Holder';

    const optimisticComment = {
      id: `temp-${Date.now()}`,
      movie_id: movie.id,
      author_name: authorName,
      author_avatar: authorAvatar,
      author_badge: authorBadge,
      content: newCommentText.trim(),
      rating: commentRating,
      likes_count: 0,
      created_at: new Date().toISOString()
    };

    setCommentsList(prev => [optimisticComment, ...prev]);
    const commentToSend = newCommentText.trim();
    setNewCommentText('');
    setCommentMsg('✨ Your comment has been posted!');
    setTimeout(() => setCommentMsg(''), 4000);

    try {
      const res = await api.post(`/movies/${movie.id}/comments`, {
        content: commentToSend,
        author_name: authorName,
        rating: commentRating,
        author_avatar: authorAvatar
      });

      if (res.data?.success && res.data.comment) {
        setCommentsList(prev => prev.map(c => c.id === optimisticComment.id ? res.data.comment : c));
      }
    } catch (err) {
      console.warn('Backend comment sync completed in optimistic mode:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (likedCommentIds.has(commentId)) return;

    setLikedCommentIds(prev => new Set([...prev, commentId]));
    setCommentsList(prev => prev.map(c => {
      if (c.id === commentId) {
        return { ...c, likes_count: (c.likes_count || 0) + 1 };
      }
      return c;
    }));

    try {
      await api.post(`/movies/${movie.id}/comments/${commentId}/like`);
    } catch (err) {}
  };

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

  const embedUrl = getEmbedUrl(activeVideoUrl);

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
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-pulse" />
            <span className="text-xs font-black text-gold-400 uppercase tracking-widest">
              {isTrailerMode ? '🎬 Official Trailer (Free Preview)' : 'Thirai+ Cinema Player'}
            </span>
            <span className="hidden sm:inline-block text-[11px] text-zinc-500">•</span>
            <span className="hidden sm:inline-block text-xs font-bold text-zinc-300 truncate max-w-md">
              {movie.title}
            </span>
            {isTrailerMode && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                ✓ Free (0 Tokens)
              </span>
            )}
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
                  src={activeVideoUrl || '/videos/demo-film.mp4'}
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

          {/* Trailer Free Mode Callout Banner */}
          {isTrailerMode && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-gold-500/20 via-surface-card to-gold-500/10 border border-gold-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-gold-glow">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-gold-400 shrink-0" />
                <div>
                  <span className="text-xs font-black text-white block">
                    You are watching the Free Official Trailer (0 Tokens Required)
                  </span>
                  <p className="text-[11px] text-zinc-300">
                    Watch the full short film with high-bitrate cinema streaming using your pass or 1 token.
                  </p>
                </div>
              </div>
              {onWatchFullMovie && (
                <button
                  onClick={() => onWatchFullMovie(movie)}
                  className="gold-btn px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider shrink-0 shadow-gold-glow"
                >
                  Watch Full Film →
                </button>
              )}
            </div>
          )}
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {movie.is_winner && (
                  <span className="gold-btn px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-gold-glow">
                    <Trophy className="w-3.5 h-3.5 fill-black" /> Winner: {movie.winner_category || 'Golden Thira Winner'}
                  </span>
                )}
                {movie.genre && (
                  <span className="text-xs bg-gold-500/10 border border-gold-500/30 text-gold-300 px-2.5 py-0.5 rounded-md font-bold">
                    {movie.genre}
                  </span>
                )}
                {movie.running_time && (
                  <span className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-md font-mono font-bold">
                    ⏱ {movie.running_time}
                  </span>
                )}
                {movie.premiere_status && (
                  <span className="text-xs bg-purple-500/10 border border-purple-500/30 text-purple-300 px-2.5 py-0.5 rounded-md font-bold">
                    {movie.premiere_status}
                  </span>
                )}
                {movie.film_type && (
                  <span className="text-xs bg-blue-500/10 border border-blue-500/30 text-blue-300 px-2.5 py-0.5 rounded-md font-bold">
                    {movie.film_type}
                  </span>
                )}
                <span className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-md font-mono font-bold">
                  {viewCount} Views
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-white">{movie.title}</h2>
              <div className="text-xs text-zinc-400 mt-1.5 flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1 text-zinc-300">
                  <Globe className="w-3.5 h-3.5 text-gold-400" /> {movie.original_language || 'Tamil'} {movie.subtitle_language ? `(Subtitles: ${movie.subtitle_language})` : ''}
                </span>
                <span className="flex items-center gap-1 text-zinc-300">
                  <Mail className="w-3.5 h-3.5 text-gold-400" /> {movie.director_email || movie.uploader_email || 'director@thiraiplus.com'}
                </span>
                <span className="flex items-center gap-1 text-zinc-400">
                  <Calendar className="w-3.5 h-3.5 text-gold-400" /> {movie.year_of_production || new Date(movie.created_at || Date.now()).getFullYear()}
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
              <Film className="w-3.5 h-3.5" /> Synopsis & Narrative Overview
            </h4>
            <p className="text-zinc-300 text-xs sm:text-sm font-light leading-relaxed">{movie.description}</p>
          </div>

          {/* Cast & Crew Credits Section */}
          <div className="bg-black/60 border border-gold-500/20 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-gold-400 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-gold-400" /> Film Credits & Cast
            </h4>

            {/* Crew Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              {movie.director_name && (
                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80 flex items-center gap-2.5">
                  {movie.director_photo_url && (
                    <img
                      src={movie.director_photo_url}
                      alt={movie.director_name}
                      className="w-8 h-8 rounded-full object-cover border border-gold-500/40 shrink-0 shadow-gold-glow"
                    />
                  )}
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-gold-400 block">Director</span>
                    <span className="font-semibold text-white truncate block">{movie.director_name}</span>
                  </div>
                </div>
              )}
              {movie.producer_name && (
                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Producer</span>
                  <span className="font-semibold text-white">{movie.producer_name}</span>
                </div>
              )}
              {movie.writer_name && (
                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Screenwriter</span>
                  <span className="font-semibold text-white">{movie.writer_name}</span>
                </div>
              )}
              {movie.cinematographer_name && (
                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80">
                  <span className="text-[10px] uppercase font-bold text-gold-400/80 block">Cinematographer (DOP)</span>
                  <span className="font-semibold text-white">{movie.cinematographer_name}</span>
                </div>
              )}
              {movie.editor_name && (
                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Editor</span>
                  <span className="font-semibold text-white">{movie.editor_name}</span>
                </div>
              )}
              {movie.sound_designer_name && (
                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Sound Designer</span>
                  <span className="font-semibold text-white">{movie.sound_designer_name}</span>
                </div>
              )}
              {movie.music_composer_name && (
                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Music Composer</span>
                  <span className="font-semibold text-white">{movie.music_composer_name}</span>
                </div>
              )}
              {movie.shooting_format && (
                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Shooting Format</span>
                  <span className="font-semibold text-zinc-300">{movie.shooting_format}</span>
                </div>
              )}
            </div>

            {/* Lead Casts */}
            {movie.lead_casts && Array.isArray(movie.lead_casts) && movie.lead_casts.length > 0 && (
              <div className="pt-2 border-t border-zinc-800/60">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  Lead Cast
                </span>
                <div className="flex flex-wrap gap-2">
                  {movie.lead_casts.map((cast, i) => (
                    <div
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 flex items-center gap-1.5"
                    >
                      <span className="font-bold text-white">{cast.actor || 'Actor'}</span>
                      {cast.character && (
                        <>
                          <span className="text-zinc-500 font-serif italic text-[11px]">as</span>
                          <span className="text-gold-400 font-medium">{cast.character}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
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

          {/* ================================================================= */}
          {/* Audience Reviews & Viewer Comments Section                         */}
          {/* ================================================================= */}
          <div className="border-t border-zinc-800 pt-6 space-y-5">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    Audience Reviews & Comments ({commentsList.length})
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Festival audience reactions, cinematography critiques, and viewer discussions.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">
                {commentsList.length} {commentsList.length === 1 ? 'Reaction' : 'Reactions'}
              </span>
            </div>

            {/* Notification Toast */}
            {commentMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{commentMsg}</span>
              </div>
            )}

            {/* Clean, Non-Intrusive Comment Box Card */}
            <form onSubmit={handlePostComment} className="bg-black/80 border border-gold-500/30 focus-within:border-gold-400 rounded-2xl p-4 sm:p-5 space-y-3.5 transition-all shadow-sm">
              
              {/* Top Controls: User Identity & Star Rating */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {/* User Identity Pill */}
                <div className="flex items-center gap-2.5">
                  <img
                    src={user?.profile_pic_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
                    alt="Commenter"
                    className="w-7 h-7 rounded-full object-cover border border-gold-500/40"
                  />
                  {user ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-white">{user.full_name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-300 border border-gold-500/30 font-semibold">
                        {user.role === 'director' ? 'Film Director' : (user.subscription_status === 'active' ? 'VIP Pass' : 'Audience')}
                      </span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Your Name (Optional)"
                      className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold-500 w-44"
                    />
                  )}
                </div>

                {/* Rating Stars Picker */}
                <div className="flex items-center gap-1.5 bg-zinc-950/90 px-2.5 py-1 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 font-medium mr-1">Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCommentRating(star)}
                      className="p-0.5 text-xs transition-transform hover:scale-125 focus:outline-none"
                      title={`${star} Star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          star <= commentRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-zinc-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-[10px] font-mono font-bold text-amber-400 ml-1">
                    {commentRating}/5
                  </span>
                </div>
              </div>

              {/* Textarea Input */}
              <div>
                <textarea
                  rows={2}
                  required
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Share your reaction or review on this short film... (What moved you? The direction, acting, camera texture, or music score?)"
                  className="w-full bg-zinc-950/90 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold-500 leading-relaxed resize-none"
                />
              </div>

              {/* Bottom Action Row */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-zinc-500 hidden sm:inline">
                  Constructive feedback helps independent filmmakers grow.
                </span>

                <button
                  type="submit"
                  disabled={submittingComment || !newCommentText.trim()}
                  className="gold-btn py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider shadow-gold-glow flex items-center gap-1.5 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3 h-3" />
                  <span>{submittingComment ? 'Posting...' : 'Post Comment'}</span>
                </button>
              </div>
            </form>

            {/* Comments List Feed */}
            {commentsLoading ? (
              <div className="space-y-2">
                {[1, 2].map((n) => (
                  <div key={n} className="h-20 bg-zinc-950 rounded-2xl animate-pulse border border-zinc-850" />
                ))}
              </div>
            ) : commentsList.length === 0 ? (
              <div className="text-center py-6 bg-zinc-950/60 rounded-2xl border border-zinc-850 p-4 space-y-1">
                <MessageSquare className="w-6 h-6 text-gold-400/50 mx-auto" />
                <p className="text-xs font-semibold text-zinc-300">No audience comments yet.</p>
                <p className="text-[11px] text-zinc-500">Be the first festival viewer to share your thoughts on this film!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {commentsList.map((c) => {
                  const isLiked = likedCommentIds.has(c.id);
                  return (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl bg-black/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={c.author_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt={c.author_name}
                            className="w-7 h-7 rounded-full object-cover border border-gold-500/30"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{c.author_name}</span>
                              {c.author_badge && (
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                                  c.author_badge.includes('VIP')
                                    ? 'bg-gold-500/10 text-gold-300 border border-gold-500/30'
                                    : c.author_badge.includes('Director')
                                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                                    : 'bg-zinc-800 text-zinc-300'
                                }`}>
                                  {c.author_badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {new Date(c.created_at || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        {c.rating && (
                          <div className="flex items-center gap-0.5 text-amber-400 text-xs font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                            <span>★</span>
                            <span className="font-mono text-[11px]">{c.rating}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-zinc-200 leading-relaxed font-light pl-9">
                        {c.content}
                      </p>

                      <div className="flex items-center justify-end pl-9 pt-1">
                        <button
                          type="button"
                          onClick={() => handleLikeComment(c.id)}
                          className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors border ${
                            isLiked
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                              : 'bg-zinc-900/60 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                          }`}
                          title="Like this comment"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                          <span>{c.likes_count || 0}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
