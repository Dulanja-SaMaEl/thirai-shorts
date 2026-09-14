"use client";

import { useState } from 'react';
import Link from 'next/link';
import {
  Award, Star, Clapperboard, Camera, Music, Scissors, Globe,
  Sparkles, ShieldCheck, ChevronRight, X, ExternalLink, Film,
  UserCheck, ArrowRight, BookOpen, Trophy, Quote
} from 'lucide-react';

const JUDGES = [
  {
    id: 'steven-spielberg',
    name: 'Judge Steven Spielberg',
    nativeName: 'Steven Spielberg',
    role: 'Honorary International Advisory Chair',
    division: 'advisory',
    divisionLabel: 'International Advisory',
    country: 'United States',
    countryFlag: '🇺🇸',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    achievements: [
      '3× Academy Award Winner (Best Director & Best Picture)',
      'AFI Life Achievement Award Laureate',
      'Director of Schindler\'s List, Saving Private Ryan, Jurassic Park'
    ],
    specializations: ['Master Directing', 'Narrative Arc', 'Universal Storytelling'],
    quote: 'A great short film doesn\'t waste a single frame. In ten or twenty minutes, it has to touch the human condition in a way that stays with you forever.',
    bio: 'Renowned worldwide as one of the most influential filmmakers in cinema history, Steven Spielberg serves as the Honorary Advisory Chair for the Thirai+ Film Festival. His mentorship champions visionary emerging storytellers who harness the power of visual cinema to unite diverse audiences across cultures.',
    criteria: 'Emotional resonance, clarity of visual perspective, and mastery of narrative economy.'
  },
  {
    id: 'prasanna-vithanage',
    name: 'Prasanna Vithanage',
    nativeName: 'ප්‍රසන්න විතානගේ',
    role: 'Grand Jury Co-President • World Cinema',
    division: 'direction',
    divisionLabel: 'Direction & Screenplay',
    country: 'Sri Lanka',
    countryFlag: '🇱🇰',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    achievements: [
      'Winner of 35+ International Festival Awards',
      'Rotterdam, Amiens, Fribourg & IFFK Grand Prix Laureate',
      'Acclaimed Director of Death on a Full Moon Day & Gaadi'
    ],
    specializations: ['Poetic Realism', 'Political Subtext', 'Humanistic Cinema'],
    quote: 'Cinema begins where political borders end. We look for short films that dare to speak unvarnished truth with quiet, poetic restraint.',
    bio: 'Prasanna Vithanage is widely hailed as a pioneer of contemporary Sri Lankan independent cinema. His films have screened at premier festivals worldwide, confronting challenging historical, social, and human realities with profound lyrical sensitivity and rigorous craft.',
    criteria: 'Subtextual richness, authentic character psychology, and original voice.'
  },
  {
    id: 'vetri-maaran',
    name: 'Vetri Maaran',
    nativeName: 'வெற்றி மாறன்',
    role: 'Grand Jury Co-President • Social Realism',
    division: 'direction',
    divisionLabel: 'Direction & Screenplay',
    country: 'India',
    countryFlag: '🇮🇳',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&auto=format&fit=crop&q=80',
    achievements: [
      '5× National Film Award Winner',
      'Venice International Film Festival Orizzonti Nominee',
      'Visionary Director of Asuran, Visaranai, and Vadachennai'
    ],
    specializations: ['Gritty Realism', 'Screenplay Craft', 'Sociopolitical Drama'],
    quote: 'The rawest and most potent stories belong to the soil. We celebrate filmmakers who refuse to compromise their creative instincts for superficial gloss.',
    bio: 'Vetri Maaran stands among India\'s most celebrated cinematic auteurs. His groundbreaking work has earned five National Film Awards and represented India at the Oscars. Known for visceral authenticity, complex multi-layered scripts, and unrelenting dramatic power.',
    criteria: 'Organic screenwriting, fearless thematic courage, and dramatic pacing.'
  },
  {
    id: 'santosh-sivan',
    name: 'Santosh Sivan ASC, ISC',
    nativeName: 'சந்தோஷ் சிவன்',
    role: 'Head of Cinematography Jury',
    division: 'craft',
    divisionLabel: 'Cinematography & Craft',
    country: 'India',
    countryFlag: '🇮🇳',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80',
    achievements: [
      'Pierre Angénieux Tribute Laureate (Cannes 2024)',
      '12× National Film Awards for Cinematography & Direction',
      'First South Asian Member of the American Society of Cinematographers'
    ],
    specializations: ['Visual Composition', 'Natural Lighting', 'Cinematic Texture'],
    quote: 'Every shadow tells a secret. The visual language of a short film should speak deeply to the viewer even before the characters utter a word.',
    bio: 'Santosh Sivan ASC, ISC is a global luminary of visual cinematography. Honored at the Cannes Film Festival with the prestigious Pierre Angénieux Tribute, his visionary lens work on The Terrorist, Iruvar, and Asoka redefined visual poetry in world cinema.',
    criteria: 'Lighting architecture, intentional aspect ratios, and visual storytelling without reliance on dialogue.'
  },
  {
    id: 'resul-pookutty',
    name: 'Resul Pookutty CAS',
    nativeName: 'റസൂൽ പൂക്കുട്ടി',
    role: 'Head of Sound Design & Audiography',
    division: 'sound',
    divisionLabel: 'Sound & Editing',
    country: 'India',
    countryFlag: '🇮🇳',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
    achievements: [
      'Academy Award Winner (Best Sound Mixing)',
      'BAFTA Award & Cinema Audio Society Award Laureate',
      'National Film Award for Best Audiography'
    ],
    specializations: ['Foley Artistry', 'Immersive Soundscapes', 'Acoustic Clarity'],
    quote: 'Sound is fifty percent of cinematic emotion. In short films, subtle acoustic nuances can turn an ordinary scene into pure visual poetry.',
    bio: 'Oscar-winner Resul Pookutty CAS is an internationally revered sound designer and mixer. His historic Academy Award and BAFTA wins for Slumdog Millionaire brought global attention to acoustic storytelling. He leads the evaluation for Thirai+\'s Best Sound Design category.',
    criteria: 'Spatial sound depth, dialogue intelligibility, dynamic audio range, and musical balance.'
  },
  {
    id: 'bina-paul',
    name: 'Bina Paul',
    nativeName: 'ബീന പോൾ',
    role: 'Head of Editing & Narrative Rhythm',
    division: 'sound',
    divisionLabel: 'Sound & Editing',
    country: 'India',
    countryFlag: '🇮🇳',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    achievements: [
      '2× National Film Award for Best Film Editing',
      'Long-serving Artistic Director of IFFK',
      'Vice Chairperson of Kerala State Chalachitra Academy'
    ],
    specializations: ['Montage Theory', 'Tempo & Cadence', 'Documentary Structure'],
    quote: 'Editing is the rhythm of thought. In a short film, the exact timing between two cuts can make the entire universe breathe.',
    bio: 'Two-time National Award-winning editor Bina Paul is celebrated as a transformative force in independent Indian and regional cinema. Having edited over 50 acclaimed features and documentaries, she serves as a leading champion for progressive narrative structures.',
    criteria: 'Cutting discipline, temporal flow, elliptical storytelling, and elimination of narrative flab.'
  },
  {
    id: 'niranjani-shanmugaraja',
    name: 'Niranjani Shanmugaraja',
    nativeName: 'நிரஞ்சனி சண்முகராஜா',
    role: 'Jury Member • Dramatic Arts & Performance',
    division: 'direction',
    divisionLabel: 'Direction & Screenplay',
    country: 'Sri Lanka',
    countryFlag: '🇱🇰',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80',
    achievements: [
      'Derana Lux Film Award for Best Actress',
      'Sarasaviya Award Winner',
      'Lead Actress in Ini Avan & acclaimed theatrical drama works'
    ],
    specializations: ['Actor Direction', 'Authentic Expression', 'Subtle Emotional Delivery'],
    quote: 'Acting is the bridge between human pain and empathy. We seek performances that feel truly lived, never performed.',
    bio: 'Niranjani Shanmugaraja is an award-winning Sri Lankan film and theatrical actress. Her lead role in Asoka Handagama\'s Cannes-selected Ini Avan cemented her stature as one of South Asia\'s most compelling acting talents, bringing immense insight to judging performance categories.',
    criteria: 'Actor authenticity, emotional restraint, chemistry, and non-verbal vulnerability.'
  },
  {
    id: 'claire-dubois',
    name: 'Claire Dubois',
    nativeName: 'Claire Dubois',
    role: 'Senior Jury Member • International Programming',
    division: 'advisory',
    divisionLabel: 'International Advisory',
    country: 'France / UK',
    countryFlag: '🇫🇷',
    image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=600&auto=format&fit=crop&q=80',
    achievements: [
      'Clermont-Ferrand Short Film Festival Selection Committee',
      'European Film Academy (EFA) Member',
      'Curator of Global Independent Shorts & Documentary Showcases'
    ],
    specializations: ['Short Film Format', 'Global Curation', 'Experimental Cinema'],
    quote: 'Short cinema is not a training ground for feature films — it is an autonomous, fearless art form with boundless creative audacity.',
    bio: 'Claire Dubois has dedicated over 15 years to programming short-form cinema across Europe\'s most revered festivals, including Clermont-Ferrand and London Short Film Festival. Her keen eye discovers original cinematic voices across world territories.',
    criteria: 'Inventive use of the short form, cultural specificity with universal resonance, and daring concepts.'
  }
];

export default function JudgesPage() {
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [activeModalJudge, setActiveModalJudge] = useState(null);

  const divisions = [
    { id: 'all', label: 'All Jurors (8)' },
    { id: 'direction', label: 'Direction & Screenplay (3)' },
    { id: 'craft', label: 'Cinematography & Craft (1)' },
    { id: 'sound', label: 'Sound & Editing (2)' },
    { id: 'advisory', label: 'International Advisory (2)' }
  ];

  const filteredJudges = selectedDivision === 'all'
    ? JUDGES
    : JUDGES.filter(j => j.division === selectedDivision);

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
            OFFICIAL FESTIVAL JURY BOARD • 2026-2027
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
            Meet Our <span className="gold-text-gradient">Grand Jury</span>
          </h1>

          {/* Description */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-350 font-normal leading-relaxed">
            Distinguished filmmakers, National Award winners, and Academy laureates united to discover, evaluate, and honor the visionary creators of contemporary short cinema.
          </p>

          {/* Festival Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6">
            <div className="bg-surface-card border border-gold-500/20 rounded-2xl p-4 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-gold-400 font-mono">8</span>
              <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Grand Jurors</span>
            </div>
            <div className="bg-surface-card border border-gold-500/20 rounded-2xl p-4 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-white font-mono">5</span>
              <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Nations Represented</span>
            </div>
            <div className="bg-surface-card border border-gold-500/20 rounded-2xl p-4 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-amber-400 font-mono">22</span>
              <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Award Categories</span>
            </div>
            <div className="bg-surface-card border border-gold-500/20 rounded-2xl p-4 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-emerald-400 font-mono">100%</span>
              <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Blind Rubric Scoring</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* CATEGORY FILTER TABS */}
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
          {filteredJudges.map((judge) => (
            <div
              key={judge.id}
              className="group bg-surface-card border border-zinc-800 hover:border-gold-500/60 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-gold-glow flex flex-col justify-between"
            >
              <div>
                {/* Photo Frame */}
                <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900">
                  <img
                    src={judge.image}
                    alt={judge.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  
                  {/* Country Flag Pill */}
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-zinc-700/80 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white flex items-center gap-1.5 shadow-sm">
                    <span>{judge.countryFlag}</span>
                    <span>{judge.country}</span>
                  </div>

                  {/* Division Badge */}
                  <div className="absolute top-3 right-3 bg-gold-500/20 backdrop-blur-md border border-gold-400/50 rounded-full px-2.5 py-1 text-[10px] font-mono text-gold-300 font-bold">
                    {judge.divisionLabel.split(' ')[0]}
                  </div>

                  {/* Name Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 text-left">
                    <h3 className="text-base font-extrabold text-white group-hover:text-gold-300 transition-colors leading-tight">
                      {judge.name}
                    </h3>
                    {judge.nativeName && judge.nativeName !== judge.name && (
                      <span className="text-[11px] text-gold-400 font-medium block">
                        {judge.nativeName}
                      </span>
                    )}
                    <span className="text-xs text-zinc-400 font-medium block mt-0.5 line-clamp-1">
                      {judge.role}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 text-left">
                  
                  {/* Quote Snippet */}
                  <div className="p-2.5 rounded-xl bg-black/60 border border-zinc-855 text-[11px] text-zinc-300 italic flex gap-2">
                    <Quote className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                    <p className="line-clamp-2">"{judge.quote}"</p>
                  </div>

                  {/* Key Accolade */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                      Distinctions
                    </span>
                    <p className="text-[11px] text-zinc-300 font-medium line-clamp-2">
                      • {judge.achievements[0]}
                    </p>
                  </div>

                  {/* Tags */}
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

                </div>
              </div>

              {/* View Bio Button */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => setActiveModalJudge(judge)}
                  className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-gold-500 hover:text-black border border-zinc-800 hover:border-gold-400 text-xs font-bold text-zinc-300 transition-all flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" /> View Full Biography
                </button>
              </div>

            </div>
          ))}
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
              <Sparkles className="w-4 h-4" /> Submit Short Film ($4.99 USD)
            </Link>
            <Link
              href="/"
              className="py-3 px-6 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white transition-all inline-flex items-center gap-2"
            >
              Explore Official Selections
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* JUDGE BIO MODAL POPUP */}
      {/* ========================================================================= */}
      {activeModalJudge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setActiveModalJudge(null)}
        >
          <div
            className="bg-zinc-950 border border-gold-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveModalJudge(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-zinc-800 pb-5">
              <img
                src={activeModalJudge.image}
                alt={activeModalJudge.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-gold-400/60 shadow-gold-glow shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">{activeModalJudge.countryFlag}</span>
                  <span className="text-[11px] font-mono text-gold-400 uppercase tracking-wider">
                    {activeModalJudge.divisionLabel}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white">{activeModalJudge.name}</h3>
                {activeModalJudge.nativeName && activeModalJudge.nativeName !== activeModalJudge.name && (
                  <span className="text-xs text-zinc-400 font-medium block">
                    {activeModalJudge.nativeName}
                  </span>
                )}
                <p className="text-xs text-gold-300 font-semibold">{activeModalJudge.role}</p>
              </div>
            </div>

            {/* Quote */}
            <div className="p-4 rounded-2xl bg-black/60 border border-gold-500/20 text-xs text-zinc-300 italic flex items-start gap-3">
              <Quote className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
              <p>"{activeModalJudge.quote}"</p>
            </div>

            {/* Biography */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-gold-400" /> Biography & Career Highlights
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {activeModalJudge.bio}
              </p>
            </div>

            {/* Distinctions & Awards */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-gold-400" /> Notable Distinctions
              </h4>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {activeModalJudge.achievements.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-gold-400 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Judging Evaluation Focus */}
            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold text-gold-400 uppercase tracking-wider block">
                Primary Evaluation Focus
              </span>
              <p className="text-xs text-zinc-300">
                {activeModalJudge.criteria}
              </p>
            </div>

            {/* Close CTA */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModalJudge(null)}
                className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
