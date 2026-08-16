"use client";

import { useState, useEffect } from 'react';
import WinnerShowcase from '../components/WinnerShowcase';
import MovieCard from '../components/MovieCard';
import CommunityTimer from '../components/CommunityTimer';
import ContactForm from '../components/ContactForm';
import VotingModal from '../components/VotingModal';
import { Film, Filter, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import api from '../lib/api';

import SystemStatusWidget from '../components/SystemStatusWidget';

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSort, setFilterSort] = useState('newest');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedVotingMovie, setSelectedVotingMovie] = useState(null);

  useEffect(() => {
    fetchGalleryData();
  }, [filterSort, filterStatus]);

  const fetchGalleryData = async () => {
    setLoading(true);
    try {
      // Fetch Winner Showcase films
      const winnersRes = await api.get('/movies/winners');
      if (winnersRes.data.success) {
        setWinners(winnersRes.data.winners || []);
      }

      // Fetch Gallery Movies
      let url = `/movies?sort=${filterSort}`;
      if (filterStatus !== 'all') {
        url += `&status=${filterStatus}`;
      }
      const moviesRes = await api.get(url);
      if (moviesRes.data.success) {
        setMovies(moviesRes.data.movies || []);
      }
    } catch (err) {
      console.error('Error fetching gallery movies:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      
      {/* Hero Section / Winner Showcase */}
      <WinnerShowcase winners={winners} />

      {/* Community Rating Timer Banner */}
      <CommunityTimer />

      {/* Movie Gallery Section Header */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gold-500/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-gold-400" />
              <h2 className="text-2xl font-extrabold text-white">Film Festival Gallery</h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Browse official selections and newly submitted entries. Pending movies appear faded during jury moderation.
            </p>
          </div>

          {/* Sort & Filter Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-surface-card border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300">
              <TrendingUp className="w-3.5 h-3.5 text-gold-400" />
              <span>Sort:</span>
              <select
                value={filterSort}
                onChange={(e) => setFilterSort(e.target.value)}
                className="bg-transparent text-gold-400 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="newest" className="bg-black text-white">Newest Additions</option>
                <option value="popular" className="bg-black text-white">Most Viewed</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-surface-card border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300">
              <Filter className="w-3.5 h-3.5 text-gold-400" />
              <span>State:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-gold-400 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-black text-white">All Submissions</option>
                <option value="approved" className="bg-black text-white">Approved Only</option>
                <option value="pending" className="bg-black text-white">Pending Moderation</option>
              </select>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-80 bg-surface-card rounded-2xl animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-16 bg-surface-card rounded-2xl border border-zinc-800">
            <AlertCircle className="w-10 h-10 text-gold-400 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-white">No Movies Found</h3>
            <p className="text-xs text-zinc-400 mt-1">Be the first director to submit a short film!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onOpenVoteModal={(m) => setSelectedVotingMovie(m)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Live System Diagnostics Status Widget */}
      <SystemStatusWidget />

      {/* Contact Us Section */}
      <ContactForm />

      {/* Community Voting Anti-Spam Modal */}
      {selectedVotingMovie && (
        <VotingModal
          movie={selectedVotingMovie}
          onClose={() => setSelectedVotingMovie(null)}
        />
      )}
    </div>
  );
}
