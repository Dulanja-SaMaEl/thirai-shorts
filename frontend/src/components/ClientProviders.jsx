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
        <main className="flex-grow w-full">
          {children}
        </main>
        <Footer />
      </AuthProvider>
    </LanguageProvider>
  );
}
