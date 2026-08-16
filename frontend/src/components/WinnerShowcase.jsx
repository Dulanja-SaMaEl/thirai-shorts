"use client";

import { Trophy, Star, Eye, Play } from 'lucide-react';
import { useState } from 'react';

export default function WinnerShowcase({ winners = [] }) {
  const [activeMovie, setActiveMovie] = useState(winners[0] || null);

  if (!winners || winners.length === 0) {
    return (
      <div className="relative w-full rounded-2xl bg-surface-card border border-gold-500/30 p-8 text-center my-8 glass-panel shadow-gold-glow">
        <Trophy className="w-12 h-12 text-gold-400 mx-auto mb-3 animate-bounce" />
        <h3 className="text-xl font-bold text-white mb-2">Annual Thirai+ Festival Winners</h3>
        <p className="text-zinc-400 text-sm max-w-lg mx-auto">
          Winners will be officially crowned by our grand jury panel after community ratings close. Stay tuned!
        </p>
      </div>
    );
  }

  const current = activeMovie || winners[0];

  return (
    <section className="relative w-full rounded-3xl overflow-hidden border border-gold-500/40 my-8 shadow-gold-glow-lg bg-black">
      
      {/* Background Banner Image with Dark Gradient Overlay */}
      <div className="relative h-[480px] w-full">
        <img
          src={current.thumbnail_url || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200'}
          alt={current.title}
          className="w-full h-full object-cover brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />

        {/* Floating Winner Info */}
        <div className="absolute bottom-0 left-0 p-8 md:p-12 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-gradient text-black font-extrabold text-xs uppercase tracking-widest mb-4 shadow-gold-glow">
            <Trophy className="w-4 h-4 fill-black" /> {current.winner_category || 'Grand Jury Winner'}
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
            {current.title}
          </h2>

          <p className="text-zinc-300 text-sm md:text-base line-clamp-3 mb-6 font-light">
            {current.description}
          </p>

          <div className="flex items-center gap-6">
            <a
              href={current.video_url}
              target="_blank"
              rel="noreferrer"
              className="gold-btn px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-black" /> Watch Winner Film
            </a>

            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <Eye className="w-4 h-4 text-gold-400" />
              <span>{current.view_count || 0} views</span>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnails list if multiple winners */}
      {winners.length > 1 && (
        <div className="bg-surface-card p-4 border-t border-gold-500/20 flex gap-4 overflow-x-auto">
          {winners.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMovie(m)}
              className={`flex-shrink-0 flex items-center gap-3 p-2 rounded-xl transition-all border ${
                current.id === m.id
                  ? 'border-gold-400 bg-gold-500/10 shadow-gold-glow'
                  : 'border-zinc-800 bg-black/50 hover:border-zinc-700'
              }`}
            >
              <img
                src={m.thumbnail_url}
                alt={m.title}
                className="w-16 h-12 rounded-lg object-cover"
              />
              <div className="text-left pr-2">
                <h4 className="text-xs font-bold text-white line-clamp-1">{m.title}</h4>
                <span className="text-[10px] text-gold-400 font-semibold">{m.winner_category || 'Winner'}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
