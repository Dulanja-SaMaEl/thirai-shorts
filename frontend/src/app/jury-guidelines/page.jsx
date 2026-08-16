"use client";

import { Award, Star, BookOpen, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function JuryGuidelinesPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      
      {/* Page Header */}
      <div className="bg-surface-card border border-gold-500/30 rounded-3xl p-8 text-center space-y-3 glass-panel shadow-gold-glow">
        <div className="w-14 h-14 rounded-2xl bg-gold-gradient p-0.5 shadow-gold-glow mx-auto flex items-center justify-center">
          <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
            <Award className="w-7 h-7 text-gold-400" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Official Jury Evaluation Guidelines</h1>
        <p className="text-xs text-zinc-400 max-w-xl mx-auto">
          Ethical code, 1-10 scoring rubric, and critique standards for appointed Thirai+ festival judges.
        </p>
        <span className="inline-block text-[11px] font-mono text-gold-400 bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/30">
          Jury Code of Ethics & Rubric
        </span>
      </div>

      {/* Guidelines Content */}
      <div className="space-y-6 text-xs text-zinc-300 leading-relaxed">
        
        <section className="bg-surface-card border border-zinc-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-gold-400 fill-gold-400" /> 1. The 1 to 10 Scoring Rubric
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-black/60 border border-zinc-800 p-3 rounded-xl">
              <span className="text-gold-400 font-extrabold text-sm block">9.0 - 10.0</span>
              <span className="text-white font-bold block text-xs mt-1">Masterpiece</span>
              <p className="text-[11px] text-zinc-400 mt-1">Exceptional narrative execution, breathtaking visual composition, and outstanding sound design.</p>
            </div>
            <div className="bg-black/60 border border-zinc-800 p-3 rounded-xl">
              <span className="text-amber-400 font-extrabold text-sm block">7.0 - 8.9</span>
              <span className="text-white font-bold block text-xs mt-1">High Quality</span>
              <p className="text-[11px] text-zinc-400 mt-1">Strong performances, creative direction, and polished technical editing.</p>
            </div>
            <div className="bg-black/60 border border-zinc-800 p-3 rounded-xl">
              <span className="text-zinc-400 font-extrabold text-sm block">1.0 - 6.9</span>
              <span className="text-white font-bold block text-xs mt-1">Developing Work</span>
              <p className="text-[11px] text-zinc-400 mt-1">Promising concepts requiring technical refinement in pacing, lighting, or audio mixing.</p>
            </div>
          </div>
        </section>

        <section className="bg-surface-card border border-zinc-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gold-400" /> 2. Key Criteria for Evaluation
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <li className="p-3 bg-black/60 border border-zinc-800 rounded-xl">
              <strong className="text-white block text-xs">Narrative & Screenplay</strong>
              <span className="text-zinc-400 text-[11px]">Originality of story arc, dialogue pacing, and emotional impact.</span>
            </li>
            <li className="p-3 bg-black/60 border border-zinc-800 rounded-xl">
              <strong className="text-white block text-xs">Cinematography & Visuals</strong>
              <span className="text-zinc-400 text-[11px]">Camera movement, framing, lighting design, and color grading palette.</span>
            </li>
            <li className="p-3 bg-black/60 border border-zinc-800 rounded-xl">
              <strong className="text-white block text-xs">Sound Design & Score</strong>
              <span className="text-zinc-400 text-[11px]">Clarity of dialogue mix, atmospheric soundscapes, and musical score.</span>
            </li>
            <li className="p-3 bg-black/60 border border-zinc-800 rounded-xl">
              <strong className="text-white block text-xs">Acting & Direction</strong>
              <span className="text-zinc-400 text-[11px]">Cast believability, character depth, and directorial vision.</span>
            </li>
          </ul>
        </section>

        <section className="bg-surface-card border border-zinc-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-gold-400" /> 3. Code of Ethics & Objectivity
          </h2>
          <p>
            Jury members must remain impartial and disclose any direct personal or professional relationships with filmmakers. Review notes must be constructive and respectful, aimed at nurturing independent cinema talents.
          </p>
        </section>

      </div>

      <div className="text-center pt-4">
        <Link href="/judge" className="gold-btn py-3.5 px-8 rounded-xl text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-2 shadow-gold-glow">
          <Award className="w-4 h-4" /> Go to Jury Evaluation Portal
        </Link>
      </div>
    </div>
  );
}
