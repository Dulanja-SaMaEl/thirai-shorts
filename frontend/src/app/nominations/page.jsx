"use client";

import { useState } from 'react';
import { Trophy, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AwardShowcase from '../../components/AwardShowcase';
import VideoPlayerModal from '../../components/VideoPlayerModal';

export default function NominationsPage() {
  const [selectedPlayingMovie, setSelectedPlayingMovie] = useState(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-gold-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cinema Home
        </Link>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-extrabold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" /> Official Festival Nominations
        </div>
      </div>

      {/* Main Nominations Showcase */}
      <AwardShowcase onOpenPlayerModal={(m) => setSelectedPlayingMovie(m)} />

      {/* Interactive Cinema Video Player Modal */}
      {selectedPlayingMovie && (
        <VideoPlayerModal
          movie={selectedPlayingMovie}
          onClose={() => setSelectedPlayingMovie(null)}
        />
      )}
    </div>
  );
}
