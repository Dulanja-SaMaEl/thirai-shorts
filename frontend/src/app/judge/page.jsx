"use client";

import { useState, useEffect } from 'react';
import { Award, Star, MessageSquare, CheckCircle, ShieldAlert, Film, Play } from 'lucide-react';
import api from '../../lib/api';

export default function JudgePanelPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  
  // Review Form State
  const [score, setScore] = useState(8);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchAssignedMovies();
  }, []);

  const fetchAssignedMovies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/judge/assigned-movies');
      if (res.data.success) {
        setMovies(res.data.movies || []);
        if (res.data.movies?.length > 0) {
          selectMovieForJudging(res.data.movies[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching judge movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectMovieForJudging = (movie) => {
    setSelectedMovie(movie);
    setSaveSuccess(false);
    setErrorMsg('');
    if (movie.my_review) {
      setScore(movie.my_review.score);
      setComment(movie.my_review.comment);
    } else {
      setScore(8);
      setComment('');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedMovie) return;

    setSaving(true);
    setErrorMsg('');
    setSaveSuccess(false);

    try {
      const res = await api.post('/judge/reviews', {
        movie_id: selectedMovie.id,
        score,
        comment
      });

      if (res.data.success) {
        setSaveSuccess(true);
        // Refresh assigned movies list
        fetchAssignedMovies();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to submit judge evaluation.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 py-4">
      
      {/* Header Banner */}
      <div className="bg-surface-card border border-gold-500/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 glass-panel shadow-gold-glow">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gold-gradient p-0.5 shadow-gold-glow flex items-center justify-center">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
              <Award className="w-7 h-7 text-gold-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Official Jury Evaluation Portal</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Review assigned short films, submit 1-10 scores, and write public jury notes for the community.
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-xl bg-black/60 border border-gold-500/40 text-gold-400 font-mono text-xs flex items-center gap-2">
          <Star className="w-4 h-4 fill-gold-400" /> Verified Jury Member
        </div>
      </div>

      {/* Main Grid: Left Movie List, Right Review Form */}
      {loading ? (
        <div className="h-96 bg-surface-card rounded-2xl animate-pulse border border-zinc-800" />
      ) : movies.length === 0 ? (
        <div className="text-center py-16 bg-surface-card rounded-2xl border border-zinc-800">
          <ShieldAlert className="w-10 h-10 text-gold-400 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-white">No Movies Assigned</h3>
          <p className="text-xs text-zinc-400">There are currently no approved short films awaiting your evaluation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Assigned Movie List */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold text-gold-400 uppercase tracking-widest px-1">
              Assigned Film Catalogue ({movies.length})
            </h3>

            <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
              {movies.map((m) => {
                const hasReviewed = !!m.my_review;
                const isSelected = selectedMovie?.id === m.id;

                return (
                  <button
                    key={m.id}
                    onClick={() => selectMovieForJudging(m)}
                    className={`w-full text-left p-4 rounded-2xl transition-all border flex gap-4 ${
                      isSelected
                        ? 'bg-gold-500/10 border-gold-400 shadow-gold-glow'
                        : 'bg-surface-card border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <img
                      src={m.thumbnail_url}
                      alt={m.title}
                      className="w-20 h-14 rounded-xl object-cover shrink-0"
                    />

                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white truncate">{m.title}</h4>
                        {hasReviewed && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md font-bold">
                            Evaluated ({m.my_review.score}/10)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-1 mt-1 font-light">{m.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Movie Video & Judging Form */}
          {selectedMovie && (
            <div className="lg:col-span-7 bg-surface-card border border-gold-500/20 rounded-3xl p-6 md:p-8 space-y-6 glass-panel">
              
              {/* Selected Movie Info & Video Embed */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-white">{selectedMovie.title}</h2>
                  <a
                    href={selectedMovie.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="gold-btn px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" /> Open Stream
                  </a>
                </div>

                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 relative">
                  <img
                    src={selectedMovie.thumbnail_url}
                    alt={selectedMovie.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <a
                      href={selectedMovie.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-16 h-16 rounded-full bg-gold-gradient p-0.5 shadow-gold-glow-lg flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-gold-400 fill-gold-400 ml-1" />
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              {/* Jury Evaluation Form */}
              <form onSubmit={handleSubmitReview} className="space-y-5 border-t border-zinc-800 pt-6">
                <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider flex items-center gap-2">
                  <Star className="w-4 h-4 text-gold-400" /> Submit Official Score & Review Note
                </h3>

                {saveSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Review saved successfully and published to the Home Showcase gallery!</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    {errorMsg}
                  </div>
                )}

                {/* 1 to 10 Score Selector */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">Numerical Score (1 - 10 Scale)</label>
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setScore(num)}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          score === num
                            ? 'bg-gold-gradient text-black border-gold-400 shadow-gold-glow'
                            : 'bg-black/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Public Review Note */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Constructive Review & Evaluation Note (Publicly Displayed)
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Provide cinematic feedback on cinematography, narrative flow, acting performances..."
                    className="w-full bg-black/80 border border-zinc-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-gold-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full gold-btn py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  {saving ? 'Publishing Review...' : 'Publish Official Jury Review'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
