import { FAQ_ITEMS } from './faqData';

export const metadata = {
  title: 'Frequently Asked Questions (FAQ) | Thirai+ Short Film Festival 2026/2027',
  description: 'Everything you need to know about Thirai+ Short Film Festival: $4.99 submission fee, 40-min runtime, English, Sinhala & Tamil languages, 100% free trailers, $4.99 Viewer Pass, $2.99 Submitter Pass, $39.99 Year Pass, hybrid jury judging, and 22 awards.',
  keywords: [
    'Thirai+ FAQ',
    'Thirai Shorts FAQ',
    'short film festival FAQ',
    'short film submission fee',
    'Thirai+ submission rules',
    '40 minute short film festival',
    'English Sinhala Tamil film festival',
    'Sri Lanka short film festival',
    'Viewer Pass Thirai',
    'Submitter Pass Thirai',
    'free movie trailers',
    'short film festival awards',
    'Steven Spielberg Thirai',
    'Prasanna Vithanage',
    'Vetri Maaran',
    'hybrid festival voting'
  ],
  openGraph: {
    title: 'Frequently Asked Questions (FAQ) | Thirai+ Short Film Festival 2026/2027',
    description: 'Find clear answers on film submissions, entry fees, maximum runtime (40 mins), festival passes, hybrid jury voting, and premiere dates.',
    url: 'https://thiraiplus.com/faq',
    siteName: 'Thirai+ Short Film Festival',
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frequently Asked Questions (FAQ) | Thirai+ Short Film Festival',
    description: 'Everything about submissions, $4.99 entry fee, 40 min runtime, passes, and jury judging at Thirai+.'
  },
  alternates: {
    canonical: 'https://thiraiplus.com/faq'
  }
};

export default function FAQLayout({ children }) {
  // Generate Schema.org FAQPage JSON-LD structured data for Google Search rich snippets
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.answerText || item.answer
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
