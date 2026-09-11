"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, SkipForward } from 'lucide-react';

export default function NetflixIntro({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    // Check if intro was already played in this browser session
    const hasPlayed = sessionStorage.getItem('thirai_intro_played');
    if (hasPlayed) {
      setIsVisible(false);
      if (onComplete) onComplete();
      return;
    }

    // Attempt audio playback if audio asset is present
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    // Auto-complete intro after 2.4 seconds
    const timer = setTimeout(() => {
      handleComplete();
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  const handleComplete = () => {
    sessionStorage.setItem('thirai_intro_played', 'true');
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  const toggleSound = (e) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (isMuted) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none"
        onClick={handleComplete}
      >
        {/* Sound placeholder element ready for user's audio file */}
        <audio
          ref={audioRef}
          src="/sounds/thirai-intro.mp3"
          preload="auto"
          muted={isMuted}
        />

        {/* Ambient Cinema Lighting & Flares */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.18)_0%,rgba(0,0,0,0.95)_75%)] pointer-events-none" />
        
        {/* Horizontal Anamorphic Lens Flare Line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: [0, 1.8, 1], opacity: [0, 0.8, 0.2] }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-gold-400 to-transparent pointer-events-none"
        />

        {/* Vertical Beam Center */}
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: [0, 1.4, 0.4], opacity: [0, 0.7, 0.1] }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          className="absolute w-[2px] h-full bg-gradient-to-b from-transparent via-gold-400 to-transparent pointer-events-none"
        />

        {/* Main Netflix-style "T+" Monogram & Typography Animation */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
          
          {/* Glowing Aura Ring */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.8, 1.3, 1.1], opacity: [0.2, 0.6, 0.3] }}
            transition={{ duration: 2.2, ease: "easeInOut" }}
            className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full bg-gold-500/20 blur-3xl pointer-events-none"
          />

          {/* Official T+ 3D Logo from User */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0, filter: "brightness(0.5) blur(10px)" }}
            animate={{
              scale: [0.5, 1.1, 1],
              opacity: [0, 1, 1],
              filter: ["brightness(2) blur(8px)", "brightness(1.3) blur(0px)", "brightness(1) blur(0px)"]
            }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center justify-center"
          >
            <div className="relative p-4 flex items-center justify-center">
              <img
                src="/images/logo-splash.png"
                alt="Thirai+"
                className="w-52 sm:w-64 md:w-72 h-auto object-contain drop-shadow-[0_0_45px_rgba(234,179,8,0.55)] select-none pointer-events-none"
              />
            </div>
          </motion.div>

          {/* Official Tagline: Future of Cinema */}
          <motion.div
            initial={{ opacity: 0, y: 25, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, y: 0, letterSpacing: "0.35em" }}
            transition={{ delay: 0.6, duration: 1.1, ease: "easeOut" }}
            className="mt-4 space-y-2 text-center"
          >
            <p className="text-xs sm:text-sm md:text-base font-extrabold uppercase tracking-[0.35em] text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-gold-400 to-gold-200 drop-shadow-[0_2px_12px_rgba(234,179,8,0.6)]">
              Future of Cinema
            </p>
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 0.6 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="w-32 h-[1px] bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto"
            />
          </motion.div>
        </div>

        {/* Top Controls Bar */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
          {/* Sound Toggle (Ready for upcoming sound file) */}
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-full bg-zinc-900/80 border border-gold-500/30 text-gold-400 hover:text-white hover:bg-gold-500/20 transition-all text-xs flex items-center gap-1.5"
            title={isMuted ? "Audio muted (sound will play when provided)" : "Mute audio"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span className="text-[10px] uppercase font-bold hidden sm:inline">
              {isMuted ? "Sound Off" : "Sound On"}
            </span>
          </button>

          {/* Skip Button */}
          <button
            onClick={handleComplete}
            className="px-3.5 py-2 rounded-full bg-zinc-900/80 border border-gold-500/30 text-zinc-300 hover:text-white hover:border-gold-400 transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
          >
            <span>Skip</span>
            <SkipForward className="w-3.5 h-3.5 text-gold-400" />
          </button>
        </div>

        {/* Bottom subtle tip */}
        <div className="absolute bottom-6 text-[10px] text-zinc-500 uppercase tracking-widest pointer-events-none">
          Click anywhere to skip
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
