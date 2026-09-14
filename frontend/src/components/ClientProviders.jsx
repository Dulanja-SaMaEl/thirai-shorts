"use client";

import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import Header from './Header';
import Footer from './Footer';
import SubmitterPerksModal from './SubmitterPerksModal';

export default function ClientProviders({ children }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Header />
        <SubmitterPerksModal />
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-6 py-6">
          {children}
        </main>
        <Footer />
      </AuthProvider>
    </LanguageProvider>
  );
}
