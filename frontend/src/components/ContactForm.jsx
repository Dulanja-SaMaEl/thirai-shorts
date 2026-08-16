"use client";

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <section className="my-16 relative rounded-3xl bg-surface-card border border-gold-500/20 p-8 md:p-12 glass-panel">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Column - Festival Info */}
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Get In Touch</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2 mb-4">
            Have Questions About <span className="gold-text-gradient">Thirai+</span>?
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8">
            Reach out to our festival organizing committee for queries regarding film submissions, jury criteria, partnership opportunities, or technical assistance.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-zinc-300 text-sm">
              <div className="w-10 h-10 rounded-xl bg-black border border-gold-500/30 flex items-center justify-center text-gold-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] text-zinc-500 uppercase">Email Support</span>
                <span className="font-semibold">contact@thiraiplus.com</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-zinc-300 text-sm">
              <div className="w-10 h-10 rounded-xl bg-black border border-gold-500/30 flex items-center justify-center text-gold-400">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] text-zinc-500 uppercase">Festival Hotline</span>
                <span className="font-semibold">+1 (800) 555-THIRAI</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-zinc-300 text-sm">
              <div className="w-10 h-10 rounded-xl bg-black border border-gold-500/30 flex items-center justify-center text-gold-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] text-zinc-500 uppercase">Headquarters</span>
                <span className="font-semibold">Cinema Arts Hub, Los Angeles, CA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="bg-black/70 border border-zinc-800 rounded-2xl p-6 md:p-8">
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Message Received!</h3>
              <p className="text-xs text-zinc-400">
                Thank you for reaching out. Our team will get back to you within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 text-xs text-gold-400 underline font-semibold"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Director Jane Doe"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jane@cinema.com"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Inquiry about submission guidelines"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Message</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your inquiry in detail..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full gold-btn py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
