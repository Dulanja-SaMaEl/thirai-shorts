"use client";

import { useState, useEffect } from 'react';
import {
  Trophy, Award, Star, Play, Sparkles, Filter,
  Clock, CheckCircle2, Clapperboard, Film, ChevronRight, Eye
} from 'lucide-react';
import api from '../lib/api';

export default function AwardShowcase({ onOpenPlayerModal }) {
  const [awardsData, setAwardsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState('all');
  const [stats, setStats] = useState({ total: 22, awarded: 6 });

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    setLoading(true);
    try {
      const res = await api.get('/awards');
      if (res.data.success) {
        setAwardsData(res.data.awards || []);
        setStats({
          total: res.data.total_categories || 22,
          awarded: res.data.total_awarded || 0
        });
      }
    } catch (err) {
      console.warn('Failed to load awards, using fallback store:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterTabs = [
    { id: 'all', label: 'All 22 Categories' },
    { id: 'grand', label: 'Grand Festival Honors' },
    { id: 'directing_writing', label: 'Directing & Writing' },
    { id: 'performance', label: 'Acting & Performance' },
    { id: 'craft', label: 'Craft & Technical' },
    { id: 'formats', label: 'Formats & Innovation' }
  ];

  const filteredAwards = awardsData.filter(award => {
    if (activeGroup === 'all') return true;
    return award.group === activeGroup;
  });

  return (
    <section id="awards" className="relative w-full my-12 scroll-mt-24 space-y-8">
      
      {/* Golden Section Banner */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black border border-gold-500/40 shadow-[0_0_50px_rgba(255,215,0,0.12)] overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-gold-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 border-b border-gold-500/20 pb-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 font-extrabold text-xs uppercase tracking-widest mb-3">
              <Trophy className="w-3.5 h-3.5 fill-gold-400" /> Official Festival Laurels
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Thirai+ Festival <span className="gold-text-gradient">Award Showcase</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-3 leading-relaxed">
              Celebrating cinematic distinction across <strong>22 official categories</strong>. As the festival concludes, honors are bestowed by the festival directors synthesized from Grand Jury evaluations and verified community ratings.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-4 bg-black/70 border border-gold-500/30 p-4 rounded-2xl shrink-0">
            <div className="text-center px-3 border-r border-zinc-800">
              <div className="text-2xl font-black text-gold-400 font-mono">{stats.awarded}</div>
              <div className="text-[10px] uppercase font-bold text-zinc-400">Laurels Crowned</div>
            </div>
            <div className="text-center px-3 border-r border-zinc-800">
              <div className="text-2xl font-black text-zinc-300 font-mono">{stats.total - stats.awarded}</div>
              <div className="text-[10px] uppercase font-bold text-zinc-400">In Deliberation</div>
            </div>
            <div className="text-center px-3">
              <div className="text-2xl font-black text-white font-mono">{stats.total}</div>
              <div className="text-[10px] uppercase font-bold text-zinc-400">Categories</div>
            </div>
          </div>
        </div>

        {/* Filter Category Tabs */}
        <div className="relative z-10 pt-6 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveGroup(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeGroup === tab.id
                  ? 'bg-gold-gradient text-black shadow-gold-glow font-black'
                  : 'bg-black/60 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 rounded-2xl bg-zinc-950/70 border border-zinc-850 animate-pulse" />
          ))}
        </div>
      ) : (
        /* Award Category Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAwards.map(award => {
            const isAwarded = award.is_awarded && award.movie;

            if (isAwarded) {
              return (
                <div
                  key={award.name}
                  className="group relative rounded-2xl bg-surface-card border border-gold-500/40 p-5 space-y-4 shadow-gold-glow hover:border-gold-400 transition-all flex flex-col justify-between"
                >
                  {/* Card Header & Laurels Title */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gold-gradient p-0.5 shrink-0 flex items-center justify-center">
                          <div className="w-full h-full bg-black rounded-[9px] flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-gold-400" />
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gold-400 block tracking-wider">
                            Official Winner Laurel
                          </span>
                          <h4 className="text-sm font-extrabold text-white leading-tight">
                            {award.name}
                          </h4>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/40 text-gold-400 text-[10px] font-mono font-bold shrink-0">
                        {award.year || '2026'}
                      </span>
                    </div>

                    {/* Movie Showcase Mini Banner */}
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-zinc-800 bg-black group-hover:border-gold-500/40 transition-colors">
                      <img
                        src={award.movie.thumbnail_url || '/images/logo-wordmark.png'}
                        alt={award.movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      
                      <div className="absolute bottom-2.5 left-2.5 right-2.5">
                        <div className="text-xs font-bold text-white truncate">
                          {award.movie.title}
                        </div>
                        <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span>Dir: {award.movie.director_name}</span>
                          {award.movie.running_time && (
                            <>
                              <span>•</span>
                              <span>{award.movie.running_time}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Floating Play Button */}
                      <button
                        onClick={() => onOpenPlayerModal && onOpenPlayerModal(award.movie)}
                        className="absolute inset-0 m-auto w-11 h-11 rounded-full bg-gold-gradient text-black flex items-center justify-center shadow-gold-glow opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all"
                        title="Watch Cinema Stream"
                      >
                        <Play className="w-5 h-5 fill-black ml-0.5" />
                      </button>
                    </div>

                    {/* Recipient & Citation */}
                    <div className="mt-3.5 space-y-1.5">
                      {award.recipient_name && (
                        <div className="text-xs">
                          <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">
                            Honoree / Recipient
                          </span>
                          <span className="text-gold-300 font-bold text-xs">
                            {award.recipient_name}
                          </span>
                        </div>
                      )}

                      {award.citation && (
                        <p className="text-[11px] text-zinc-300 font-light italic leading-relaxed bg-black/60 p-2.5 rounded-xl border border-zinc-850">
                          &ldquo;{award.citation}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Official Award Bestowed
                    </span>

                    <button
                      onClick={() => onOpenPlayerModal && onOpenPlayerModal(award.movie)}
                      className="text-xs font-bold text-gold-400 hover:text-gold-300 flex items-center gap-1 transition-colors"
                    >
                      Watch Film <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }

            // Pending / In Deliberation Category Card
            return (
              <div
                key={award.name}
                className="relative rounded-2xl bg-zinc-950/70 border border-zinc-800/80 p-5 space-y-3 flex flex-col justify-between hover:border-zinc-700 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4 text-zinc-500" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-500 block tracking-wider">
                          Official Award Category
                        </span>
                        <h4 className="text-sm font-bold text-zinc-200 leading-tight">
                          {award.name}
                        </h4>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 text-[10px] font-mono shrink-0">
                      2026
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 font-light leading-relaxed mt-2">
                    {award.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-900 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" /> Under Jury Deliberation
                  </span>

                  <span className="text-[10px] text-zinc-500">
                    Grand Finale Release
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </section>
  );
}
