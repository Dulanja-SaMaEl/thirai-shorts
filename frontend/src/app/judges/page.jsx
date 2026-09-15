"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award, Star, Clapperboard, Camera, Music, Scissors, Globe,
  Sparkles, ShieldCheck, ChevronRight, X, ExternalLink, Film,
  UserCheck, ArrowRight, BookOpen, Trophy, Quote
} from 'lucide-react';
import api from '../../lib/api';
import { useLanguage } from '../../context/LanguageContext';
import { DEFAULT_JUDGES, JURY_DIVISIONS } from './judgesData';

export default function JudgesPage() {
  const { currentLanguage, t } = useLanguage();
  const [judgesList, setJudgesList] = useState(DEFAULT_JUDGES);
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [activeModalJudge, setActiveModalJudge] = useState(null);

  // Load custom judges from localStorage and sync with backend API
  useEffect(() => {
    // 1. Instant cache load from localStorage
    try {
      const cached = localStorage.getItem('thirai_custom_judges');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setJudgesList(parsed);
        }
      }
    } catch (e) {}

    // 2. Fetch fresh judges from API
    fetchJudges();

    // 3. Listen for cross-tab or admin storage updates
    const handleStorageChange = (e) => {
      if (e.key === 'thirai_custom_judges' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setJudgesList(parsed);
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fetchJudges = async () => {
    try {
      const res = await api.get('/judges');
      if (res.data?.success && Array.isArray(res.data.judges) && res.data.judges.length > 0) {
        setJudgesList(res.data.judges);
        try {
          localStorage.setItem('thirai_custom_judges', JSON.stringify(res.data.judges));
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Using default judges fallback:', err);
    }
  };

  // Dynamic Tallying Metrics
  const totalJurorsCount = judgesList.length;
  const uniqueNationsCount = new Set(judgesList.map(j => j.country).filter(Boolean)).size || 1;

  // Dynamically tallied divisions with counts
  const divisions = JURY_DIVISIONS.map(div => {
    const count = div.id === 'all'
      ? judgesList.length
      : judgesList.filter(j => j.division === div.id).length;
    const label = t(`jury.${div.labelKey}`, div.defaultLabel);
    return {
      id: div.id,
      label: `${label} (${count})`
    };
  });

  const filteredJudges = selectedDivision === 'all'
    ? judgesList
    : judgesList.filter(j => j.division === selectedDivision);

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* ========================================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-gold-500/20 bg-gradient-to-b from-zinc-950 via-black to-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/15 border border-gold-400/40 text-gold-300 text-xs font-mono tracking-wider shadow-gold-glow">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            {t('jury.heroBadge', 'OFFICIAL FESTIVAL JURY BOARD • 2026-2027')}
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
            {t('jury.heroTitle', 'Meet Our')}{' '}
            <span className="gold-text-gradient">{t('jury.heroTitleHighlight', 'Grand Jury')}</span>
          </h1>

          {/* Description */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-350 font-normal leading-relaxed">
            {t('jury.heroDesc', 'Distinguished filmmakers, National Award winners, and Academy laureates united to discover, evaluate, and honor the visionary creators of contemporary short cinema.')}
          </p>

          {/* Dynamically Tallied Festival Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6">
            <div className="bg-surface-card border border-gold-500/20 rounded-2xl p-4 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-gold-400 font-mono">
                {totalJurorsCount}
              </span>
              <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
                {t('jury.grandJurors', 'Grand Jurors')}
              </span>
            </div>
            <div className="bg-surface-card border border-gold-500/20 rounded-2xl p-4 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-white font-mono">
                {uniqueNationsCount}
              </span>
              <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
                {t('jury.nationsRepresented', 'Nations Represented')}
              </span>
            </div>
            <div className="bg-surface-card border border-gold-500/20 rounded-2xl p-4 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-amber-400 font-mono">22</span>
              <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
                {t('jury.awardCategories', 'Award Categories')}
              </span>
            </div>
            <div className="bg-surface-card border border-gold-500/20 rounded-2xl p-4 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-emerald-400 font-mono">100%</span>
              <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
                {t('jury.rubricScoring', 'Blind Rubric Scoring')}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* CATEGORY FILTER TABS (Dynamically Tallied) */}
      {/* ========================================================================= */}
      <section className="py-6 px-4 border-b border-zinc-850 bg-black/60 sticky top-16 z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-center flex-wrap gap-2">
          {divisions.map((div) => (
            <button
              key={div.id}
              onClick={() => setSelectedDivision(div.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedDivision === div.id
                  ? 'bg-gold-500 text-black font-bold shadow-gold-glow scale-105'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {div.label}
            </button>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* JURY ROSTER / TEAM GRID */}
      {/* ========================================================================= */}
      <section className="py-12 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredJudges.map((judge) => {
            const isSinhalaOrTamil = currentLanguage === 'si' || currentLanguage === 'ta';
            const showNativeProminent = isSinhalaOrTamil && judge.nativeName && judge.nativeName !== judge.name;

            return (
              <div
                key={judge.id}
                className="group bg-surface-card border border-zinc-800 hover:border-gold-500/60 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-gold-glow flex flex-col justify-between"
              >
                <div>
                  {/* Photo Frame (supports local base64 or remote URL) */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900">
                    <img
                      src={judge.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'}
                      alt={judge.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    
                    {/* Country Flag Pill */}
                    {judge.country && (
                      <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-zinc-700/80 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white flex items-center gap-1.5 shadow-sm">
                        <span>{judge.countryFlag || '🌐'}</span>
                        <span>{judge.country}</span>
                      </div>
                    )}

                    {/* Division Badge */}
                    {judge.divisionLabel && (
                      <div className="absolute top-3 right-3 bg-gold-500/20 backdrop-blur-md border border-gold-400/50 rounded-full px-2.5 py-1 text-[10px] font-mono text-gold-300 font-bold">
                        {judge.divisionLabel.split(' ')[0]}
                      </div>
                    )}

                    {/* Name Overlay with Native Script & Position */}
                    <div className="absolute bottom-3 left-3 right-3 text-left">
                      {showNativeProminent ? (
                        <>
                          <h3 className="text-base font-extrabold text-white group-hover:text-gold-300 transition-colors leading-tight">
                            {judge.nativeName}
                          </h3>
                          <span className="text-[11px] text-zinc-300 font-medium block">
                            {judge.name}
                          </span>
                        </>
                      ) : (
                        <>
                          <h3 className="text-base font-extrabold text-white group-hover:text-gold-300 transition-colors leading-tight">
                            {judge.name}
                          </h3>
                          {judge.nativeName && judge.nativeName !== judge.name && (
                            <span className="text-[11px] text-gold-400 font-medium block">
                              {judge.nativeName}
                            </span>
                          )}
                        </>
                      )}
                      <span className="text-xs text-gold-300/90 font-medium block mt-0.5 line-clamp-1">
                        {judge.role}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3 text-left">
                    
                    {/* Quote Snippet */}
                    {judge.quote && (
                      <div className="p-2.5 rounded-xl bg-black/60 border border-zinc-850 text-[11px] text-zinc-300 italic flex gap-2">
                        <Quote className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                        <p className="line-clamp-2">"{judge.quote}"</p>
                      </div>
                    )}

                    {/* Key Accolade */}
                    {judge.achievements && judge.achievements.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                          Distinctions
                        </span>
                        <p className="text-[11px] text-zinc-300 font-medium line-clamp-2">
                          • {judge.achievements[0]}
                        </p>
                      </div>
                    )}

                    {/* Specialization Tags */}
                    {judge.specializations && judge.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {judge.specializations.map((spec, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-mono"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}

                  </div>
                </div>

                {/* View Bio Button */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => setActiveModalJudge(judge)}
                    className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-gold-500 hover:text-black border border-zinc-800 hover:border-gold-400 text-xs font-bold text-zinc-300 transition-all flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> {t('jury.viewProfile', 'View Juror Profile & Criteria')}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* JUDGING RUBRIC & EVALUATION STANDARDS */}
      {/* ========================================================================= */}
      <section className="py-16 bg-zinc-950 border-t border-zinc-850">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10 text-center">
          
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-mono">
              <Award className="w-3.5 h-3.5" /> JURY CODE OF ETHICS & SCORING PILLARS
            </div>
            <h2 className="text-3xl font-extrabold text-white">How the Grand Jury Evaluates Submissions</h2>
            <p className="text-xs text-zinc-400 max-w-xl mx-auto">
              Our judges uphold the highest festival standards through a double-blind, 1-to-10 numerical rubric evaluating four core creative pillars.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="p-5 rounded-2xl bg-surface-card border border-zinc-800 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
                <Film className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">1. Screenplay & Arc</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Story originality, character depth, economy of dialogue, and narrative impact within the 40-minute limit.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-card border border-zinc-800 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
                <Camera className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">2. Visual Directing</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Intentional framing, lighting architecture, color palette control, and visual storytelling without dialogue crutches.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-card border border-zinc-800 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
                <Music className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">3. Audiography & Score</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Foley immersion, dialogue clarity, environmental spatial mixing, and emotive musical orchestration.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-card border border-zinc-800 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
                <Scissors className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">4. Editing & Pacing</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Rhythm of scene transitions, temporal momentum, avoidance of filler, and structural cohesion.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/jury-guidelines"
              className="inline-flex items-center gap-2 text-xs font-bold text-gold-400 hover:text-gold-300 underline underline-offset-4 transition-colors"
            >
              <BookOpen className="w-4 h-4" /> Read the Complete Official Jury Guidelines & Code of Ethics <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SUBMISSION CALLOUT BANNER */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 border-t border-gold-500/20 bg-gradient-to-r from-zinc-950 via-black to-zinc-950">
        <div className="max-w-4xl mx-auto rounded-3xl bg-surface-card border border-gold-500/40 p-8 sm:p-12 text-center space-y-6 glass-panel shadow-gold-glow">
          <div className="w-12 h-12 rounded-2xl bg-gold-gradient p-0.5 mx-auto flex items-center justify-center shadow-gold-glow">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
              <Trophy className="w-6 h-6 text-gold-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Have Your Film Screened & Evaluated by World-Class Jurors
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
              Submissions for the 2026-2027 season close on <strong className="text-amber-400 font-bold">November 30th, 2026</strong>. Compete across 22 official awards with cash prizes and global distribution opportunities.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/upload"
              className="gold-btn py-3 px-8 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-gold-glow hover:scale-105 transition-all"
            >
              <Clapperboard className="w-4 h-4" /> Submit Short Film ($4.99)
            </Link>
            <a
              href="/#packages"
              className="py-3 px-8 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-gold-400 text-xs font-bold text-zinc-300 hover:text-white uppercase tracking-wider transition-all"
            >
              VIP Passes ($4.99/mo)
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* DETAILED JUROR DOSSIER MODAL */}
      {/* ========================================================================= */}
      {activeModalJudge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-3xl bg-zinc-950 border border-gold-500/50 rounded-3xl overflow-hidden shadow-gold-glow-lg max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-500/20 border border-gold-400/50 flex items-center justify-center text-gold-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {activeModalJudge.name}
                  </h3>
                  {activeModalJudge.nativeName && activeModalJudge.nativeName !== activeModalJudge.name && (
                    <span className="text-xs text-gold-400 font-semibold block">
                      {activeModalJudge.nativeName}
                    </span>
                  )}
                  <span className="text-xs text-zinc-400 font-medium">
                    {activeModalJudge.role} • {activeModalJudge.country} {activeModalJudge.countryFlag}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveModalJudge(null)}
                className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Scrollable Area */}
            <div className="p-6 overflow-y-auto space-y-6 text-left">
              
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <img
                  src={activeModalJudge.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'}
                  alt={activeModalJudge.name}
                  className="w-32 h-40 sm:w-40 sm:h-48 rounded-2xl object-cover border-2 border-gold-500/40 shadow-gold-glow shrink-0"
                />
                
                <div className="space-y-3 flex-grow">
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-zinc-800 text-xs text-zinc-300 italic flex gap-2.5">
                    <Quote className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                    <p>"{activeModalJudge.quote}"</p>
                  </div>

                  <div>
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-gold-400 mb-1.5">
                      {t('jury.specializations', 'Core Specializations')}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {activeModalJudge.specializations?.map((s, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-750 text-xs font-mono text-zinc-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Biography */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-zinc-400">
                  Biography & Background
                </h4>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {activeModalJudge.bio}
                </p>
              </div>

              {/* Key Achievements */}
              {activeModalJudge.achievements && activeModalJudge.achievements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-zinc-400">
                    {t('jury.keyAchievements', 'Key Career Honors & Achievements')}
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {activeModalJudge.achievements.map((ach, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400 shrink-0" />
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Judging Criteria */}
              {activeModalJudge.criteria && (
                <div className="p-4 rounded-2xl bg-gold-500/10 border border-gold-500/30 space-y-1">
                  <h4 className="text-xs font-bold text-gold-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-gold-400" /> {t('jury.judgingCriteria', 'Evaluation & Screening Criteria')}
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {activeModalJudge.criteria}
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end">
              <button
                onClick={() => setActiveModalJudge(null)}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors"
              >
                {t('jury.closeDossier', 'Close Juror Dossier')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
