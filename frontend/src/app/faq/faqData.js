export const FAQ_CATEGORIES = [
  { id: 'all', label: 'All Questions', icon: 'HelpCircle' },
  { id: 'submissions', label: 'Filmmakers & Submissions', icon: 'Upload' },
  { id: 'passes', label: 'Passes, Pricing & Tokens', icon: 'CreditCard' },
  { id: 'dates', label: 'Dates & Festival Timeline', icon: 'Calendar' },
  { id: 'jury', label: 'Jury & Community Voting', icon: 'ShieldCheck' },
  { id: 'awards', label: 'Awards & Laurels', icon: 'Trophy' },
  { id: 'tech', label: 'Streaming Tech & Quality', icon: 'Film' },
  { id: 'partners', label: 'Brand Partners & Sponsors', icon: 'Sparkles' },
  { id: 'rights', label: 'Rights, Copyright & Help', icon: 'Lock' }
];

export const FAQ_ITEMS = [
  // ==================== 1. SUBMISSIONS & ELIGIBILITY ====================
  {
    id: 'submission-fee',
    category: 'submissions',
    categoryLabel: 'Filmmakers & Submissions',
    question: 'What is the official submission fee for short films?',
    answerText: 'The official submission fee is $4.99 USD (approx. Rs. 1,550 LKR) per independent film entry. This fee covers digital pre-selection review, 4K DCP cloud transcoding, and server delivery across our global festival network. NOTE: Student submissions are 100% FREE ($0.00 USD) when submitted with an official confirmation letter on school letterhead signed by the Principal.',
    highlight: 'Standard Entry: $4.99 USD • Student Submissions: 100% FREE ($0.00).',
    link: { text: 'Submit Your Film Now', href: '/upload' },
    tags: ['fee', 'price', 'cost', 'submit', 'submission', 'upload', '$4.99', 'lkr', 'entry fee', 'free student']
  },
  {
    id: 'free-student-submissions',
    category: 'submissions',
    categoryLabel: 'Filmmakers & Submissions',
    question: 'Are short film submissions completely free for students? How does verification work?',
    answerText: 'Yes! Submissions for student filmmakers are 100% FREE ($0.00 USD entry fee waiver). To qualify for this opportunity and maintain festival integrity, student filmmakers must provide: (1) An official confirmation letter on school letterhead signed and stamped by the School Principal, Dean, or Head of Department, (2) The official School / College / Institution Name, and (3) The official School Contact Telephone Number. Festival administrators verify the confirmation letter and school contact details through the executive admin panel before approving the verified student entry.',
    highlight: 'Student Submissions: 100% FREE ($0.00 fee) with Principal letterhead confirmation & admin verification.',
    link: { text: 'Submit Free as a Student Filmmaker', href: '/upload' },
    tags: ['student', 'free', 'waiver', 'principal', 'school', 'letterhead', 'zero fee', 'verification', 'college', 'university', 'young filmmaker', 'grant', '$0']
  },
  {
    id: 'maximum-runtime',
    category: 'submissions',
    categoryLabel: 'Filmmakers & Submissions',
    question: 'What is the maximum runtime allowed for submitted short films?',
    answerText: 'The maximum runtime allowed for any short film is 40 minutes, including opening titles and end credits. Films ranging from 1 minute up to 40 minutes are eligible across all genres, including narrative fiction, documentary, animation, and experimental cinema.',
    highlight: 'Maximum Runtime: Up to 40 minutes (including credits).',
    link: { text: 'Review Terms of Submission', href: '/terms' },
    tags: ['runtime', 'duration', 'length', '40 minutes', 'time limit', 'how long', 'minutes']
  },
  {
    id: 'accepted-languages',
    category: 'submissions',
    categoryLabel: 'Filmmakers & Submissions',
    question: 'What languages are accepted for festival submissions?',
    answerText: 'We feature and prioritize films in English, Sinhala, and Tamil (in alphabetical order: English, Sinhala, Tamil). Films produced in any other international or regional language are also warmly accepted, provided they include burnt-in or embedded English subtitles.',
    highlight: 'English, Sinhala, Tamil (or any language with English subtitles).',
    link: { text: 'Start Submission Form', href: '/upload' },
    tags: ['language', 'english', 'sinhala', 'tamil', 'subtitles', 'translation', 'languages']
  },
  {
    id: 'trailers-optional-and-free',
    category: 'submissions',
    categoryLabel: 'Filmmakers & Submissions',
    question: 'Can I add a trailer for my short film, and is it mandatory?',
    answerText: 'Adding a trailer is completely optional! When submitting your short film in Step 5, you have the option to upload an official trailer or provide a direct video URL. Movie trailers are 100% free for everyone to watch on Thirai+ without costing any tokens or requiring a subscription.',
    highlight: 'Trailers are optional, and always 100% free for viewers to watch.',
    link: { text: 'Upload Your Short Film', href: '/upload' },
    tags: ['trailer', 'teaser', 'optional', 'free trailer', 'video link', 'free', 'tokens']
  },
  {
    id: 'mobile-and-student-films',
    category: 'submissions',
    categoryLabel: 'Filmmakers & Submissions',
    question: 'Are mobile phone films and student graduation films eligible?',
    answerText: 'Yes! Thirai+ actively champions grassroots independent and mobile cinema. Films captured on smartphones (iPhone, Samsung Galaxy, etc.) or created as university or film school student projects are fully eligible and compete for both the Grand Jury awards and specialized categories like Best Mobile Short Film and Best Student Film.',
    highlight: 'Smartphone and student films are fully eligible for competition.',
    tags: ['mobile', 'smartphone', 'iphone', 'student', 'graduation', 'indie', 'independent']
  },
  {
    id: 'video-formats-and-codecs',
    category: 'submissions',
    categoryLabel: 'Filmmakers & Submissions',
    question: 'What video file formats, resolutions, and audio standards are accepted?',
    answerText: 'We accept MP4, MOV, and ProRes containers encoded with H.264, H.265 (HEVC), or Apple ProRes 422. Resolutions can range from 1080p Full HD up to 4K Ultra HD (3840×2160) at 24fps, 25fps, or 30fps. Audio should be mixed in stereo or 5.1 surround sound at 48kHz, 24-bit.',
    highlight: 'MP4 / MOV / ProRes up to 4K UHD with 48kHz audio.',
    tags: ['format', 'codec', 'resolution', '4k', '1080p', 'mp4', 'mov', 'prores', 'audio', '5.1']
  },
  {
    id: 'copyright-and-ip-rights',
    category: 'submissions',
    categoryLabel: 'Filmmakers & Submissions',
    question: 'Who owns the copyright and intellectual property rights of submitted films?',
    answerText: 'You retain 100% complete copyright, intellectual property, and artistic ownership of your film, story, music, and cast likenesses. Thirai+ only receives a non-exclusive license to stream your film on the platform for festival judging and audience viewing. We never claim exclusive rights or commercial ownership.',
    highlight: 'Filmmakers retain 100% full copyright and ownership.',
    link: { text: 'Read Submission Terms', href: '/terms' },
    tags: ['copyright', 'ownership', 'rights', 'intellectual property', 'ip', 'license', 'exclusive']
  },

  // ==================== 2. PASSES, PRICING & TOKENS ====================
  {
    id: 'viewer-pass-details',
    category: 'passes',
    categoryLabel: 'Passes, Pricing & Tokens',
    question: 'What is the Only Viewer Pass and how much does it cost?',
    answerText: 'The Only Viewer Pass costs $4.99 per month (regularly $9.99/mo). It provides unlimited streaming of all official festival short films in 4K Ultra HD, zero token deduction on any film, festival community jury voting rights, and the freedom to cancel anytime with 1 click (~Rs. 1,550 LKR/mo).',
    highlight: 'Only Viewer Pass: $4.99 / month for unlimited streaming & voting.',
    link: { text: 'View VIP Passes', href: '/#packages' },
    tags: ['viewer pass', 'monthly', '$4.99', 'pass', 'subscription', 'price', 'cost', 'unlimited']
  },
  {
    id: 'submitter-pass-details',
    category: 'passes',
    categoryLabel: 'Passes, Pricing & Tokens',
    question: 'What is the Submitter Pass and how do filmmakers get the $2.99 rate?',
    answerText: 'The Submitter Pass is an exclusive privilege pass priced at just $2.99 per month (40% discount off the viewer pass). Official Rule: If you have submitted your short film for the Thirai+ Film Festival and got approved, you gain access to the Submitter Pass at just $2.99 monthly to stream unlimited movies, vote in the festival, and receive an Official Submitter badge.',
    highlight: 'Submitter Pass: $2.99 / month for approved festival filmmakers.',
    link: { text: 'Check Filmmaker Status', href: '/#packages' },
    tags: ['submitter pass', '$2.99', 'director', 'filmmaker discount', 'approved film', 'special pass']
  },
  {
    id: 'annual-vip-pass-dec-31',
    category: 'passes',
    categoryLabel: 'Passes, Pricing & Tokens',
    question: 'What is the Annual VIP Pass and what is the December 31st Early Bird promotion?',
    answerText: 'The Annual VIP Cinema Pass is currently $39.99 per year (saving 50% off the standard $79.99/year rate). This limited Early Bird offer is available for the first 1–50 members until December 31st, 2026. It includes 12 full months of unlimited streaming, winner showcases, director statements, full press kits, Grand Jury voting, and an official Festival Digital Pass & Certificate (~Rs. 12,400 LKR/yr).',
    highlight: 'Year Pass: $39.99 / year (50% OFF) until December 31st!',
    link: { text: 'Claim Early Bird Year Pass', href: '/#packages' },
    tags: ['year pass', 'annual', '$39.99', 'december 31', '50% off', 'discount', 'early bird', 'vip']
  },
  {
    id: 'free-viewing-tokens',
    category: 'passes',
    categoryLabel: 'Passes, Pricing & Tokens',
    question: 'How do the Free Viewing Tokens work upon registration?',
    answerText: 'Every new user who registers for a free account automatically receives 2 Free Viewing Tokens. You can use these tokens to unlock and stream any 2 complete short films of your choice. Watching movie trailers never costs any tokens and is always free for all users. If you wish to watch more than 2 films, you can upgrade to a Viewer Pass or Year Pass.',
    highlight: '2 Free Viewing Tokens granted on registration • Trailers always free.',
    link: { text: 'Register Free Account', href: '/register' },
    tags: ['free', 'tokens', 'gift', 'signup', '2 free tokens', 'how tokens work', 'unlock']
  },
  {
    id: 'watch-trailers-for-free',
    category: 'passes',
    categoryLabel: 'Passes, Pricing & Tokens',
    question: 'Can anyone watch short film trailers without paying or using tokens?',
    answerText: 'Yes, absolutely! Anyone visiting Thirai+ can watch movie trailers for all participating short films completely free of charge. No tokens are deducted, and no paid pass or credit card is required to enjoy trailers and teasers.',
    highlight: 'Trailers are 100% free for all audiences worldwide.',
    link: { text: 'Explore Official Selections', href: '/' },
    tags: ['trailer', 'free trailer', 'cost', 'no token', 'free preview', 'teaser']
  },
  {
    id: 'cancel-subscription-policy',
    category: 'passes',
    categoryLabel: 'Passes, Pricing & Tokens',
    question: 'Can I cancel my Viewer Pass or Submitter Pass at any time?',
    answerText: 'Yes! All monthly passes (Viewer Pass at $4.99/mo and Submitter Pass at $2.99/mo) can be canceled at any time from your account settings with a single click. There are no cancellation fees or long-term lock-in contracts, and you retain streaming access until the conclusion of your current billing cycle.',
    highlight: 'Cancel anytime with 1-click in your account dashboard.',
    tags: ['cancel', 'cancellation', 'refund', 'subscription', 'stop', 'recurring']
  },
  {
    id: 'currency-and-payment-methods',
    category: 'passes',
    categoryLabel: 'Passes, Pricing & Tokens',
    question: 'What payment methods are supported, and how is LKR currency handled?',
    answerText: 'Payments are processed securely via Stripe across 135+ global currencies using Visa, Mastercard, American Express, Apple Pay, and Google Pay. Prices are billed in USD, with approximate Sri Lankan Rupee conversions displayed at 1 USD ≈ 310 LKR for reference ($4.99 ≈ Rs. 1,550 LKR; $2.99 ≈ Rs. 930 LKR; $39.99 ≈ Rs. 12,400 LKR).',
    highlight: 'Stripe Global Checkout: Visa, Mastercard, Apple Pay & Google Pay.',
    tags: ['payment', 'stripe', 'credit card', 'lkr', 'currency', 'visa', 'mastercard', 'apple pay']
  },

  // ==================== 3. FESTIVAL SCHEDULE & DATES ====================
  {
    id: 'key-festival-dates',
    category: 'dates',
    categoryLabel: 'Dates & Festival Timeline',
    question: 'What are the key dates and milestones for the Thirai+ Film Festival 2026/2027?',
    answerText: 'Mark these crucial festival dates on your calendar: (1) Submissions Deadline: November 30, 2026 at 11:59 PM GMT; (2) Early Bird Pass Promo Deadline: December 31, 2026; (3) Official Nominations Unveil: January 1, 2027; (4) Global Festival Premiere & Grand Gala: January 16, 2027.',
    highlight: 'Deadline: Nov 30, 2026 • Nominations: Jan 1, 2027 • Premiere: Jan 16, 2027.',
    link: { text: 'View Nominations Portal', href: '/nominations' },
    tags: ['dates', 'schedule', 'timeline', 'deadline', 'premiere', 'gala', 'november 30', 'january 1', 'january 16']
  },
  {
    id: 'when-are-nominations-unveiled',
    category: 'dates',
    categoryLabel: 'Dates & Festival Timeline',
    question: 'When will official nominations be announced and visible?',
    answerText: 'Official festival nominations will be unveiled after January 1st, 2027. Ahead of January 1st, Grand Jury evaluations and verified community voting rounds are actively ongoing. On New Year\'s Day 2027, the shortlist of top 3 nominees across all 22 award categories will be officially published.',
    highlight: 'Nominations will be visible and unveiled after January 1st, 2027.',
    link: { text: 'See Nominations Page', href: '/nominations' },
    tags: ['nominations', 'nominees', 'january 1', 'unveil', 'when nominations', 'shortlist']
  },
  {
    id: 'nominees-per-category',
    category: 'dates',
    categoryLabel: 'Dates & Festival Timeline',
    question: 'How many short films are nominated per award category?',
    answerText: 'Each of the 22 festival award categories showcases exactly 3 nominated films shortlisted by our Grand Jury from global submissions. Category winners are announced and crowned during the Global Festival Premiere on January 16, 2027.',
    highlight: 'Each category showcases exactly 3 nominated films.',
    link: { text: 'Explore Award Categories', href: '/awards' },
    tags: ['nominees', '3 films', 'categories', 'how many', 'shortlist', 'awards']
  },

  // ==================== 4. JURY & COMMUNITY VOTING ====================
  {
    id: 'who-are-the-judges',
    category: 'jury',
    categoryLabel: 'Jury & Community Voting',
    question: 'Who serves on the Thirai+ Grand Jury panel?',
    answerText: 'Our international Grand Jury features world-renowned cinema masters: Judge Steven Spielberg (Honorary International Advisory Chair), Prasanna Vithanage (Grand Jury Co-President • World Cinema, Sri Lanka), Vetri Maaran (Grand Jury Co-President • Social Realism, India), Santosh Sivan (Cinematography), Sreekar Prasad (Editing), Santhosh Narayanan (Original Score), and Resul Pookutty (Sound Design).',
    highlight: 'Chaired by Steven Spielberg, Prasanna Vithanage & Vetri Maaran.',
    link: { text: 'Meet the Full Grand Jury', href: '/judges' },
    tags: ['jury', 'judges', 'steven spielberg', 'prasanna vithanage', 'vetri maaran', 'santosh sivan', 'who judges']
  },
  {
    id: 'hybrid-judging-system',
    category: 'jury',
    categoryLabel: 'Jury & Community Voting',
    question: 'How does the hybrid judging and rating system work?',
    answerText: 'Thirai+ utilizes an innovative hybrid scoring formula: 70% weightage is determined by Grand Jury evaluation across a 1-10 technical rubric, and 30% weightage is determined by verified community audience votes. This ensures high artistic standards while honoring audience popularity.',
    highlight: '70% Grand Jury Evaluation + 30% Verified Audience Votes.',
    link: { text: 'Read Jury Guidelines', href: '/jury-guidelines' },
    tags: ['hybrid', 'rating', 'voting', '70%', '30%', 'audience vote', 'how judging works', 'formula']
  },
  {
    id: 'tamper-proof-voting',
    category: 'jury',
    categoryLabel: 'Jury & Community Voting',
    question: 'How does Thirai+ prevent bot voting, fake reviews, and vote manipulation?',
    answerText: 'Audience voting requires verified email authentication and one-time password (OTP) verification. Every community member is restricted to exactly 1 verified vote per movie. Automated bot attacks, proxy spam, and duplicate submissions are filtered out in real time.',
    highlight: 'OTP verification and strict 1-vote-per-film rule prevent manipulation.',
    tags: ['bot', 'vote manipulation', 'otp', 'fake votes', 'secure voting', 'fair']
  },
  {
    id: 'jury-scoring-criteria',
    category: 'jury',
    categoryLabel: 'Jury & Community Voting',
    question: 'What specific criteria do the judges evaluate in each film?',
    answerText: 'Judges evaluate films using a structured 1-10 rubric covering: (1) Narrative originality and thematic depth, (2) Directorial vision, (3) Cinematography and visual composition, (4) Editing rhythm and pacing, (5) Sound design and musical score, and (6) Emotional impact and acting performances.',
    highlight: 'Evaluated across narrative, visual craft, sound design, editing, and acting.',
    link: { text: 'View 1-10 Scoring Rubric', href: '/jury-guidelines' },
    tags: ['criteria', 'rubric', 'score', 'evaluation', '1-10', 'how films are judged']
  },

  // ==================== 5. AWARDS, LAURELS & PRIZES ====================
  {
    id: 'festival-award-categories',
    category: 'awards',
    categoryLabel: 'Awards & Laurels',
    question: 'What award categories exist in the festival competition?',
    answerText: 'Thirai+ honors 22 official award categories, including Best Short Film (Grand Prix), Best Director, Best Screenplay, Best Cinematography, Best Film Editing, Best Sound Design, Best Original Score, Best Lead Actor, Best Lead Actress, Audience Choice Award, Best Mobile Film, Best Student Film, and Best Debut Director.',
    highlight: '22 prestigious award categories spanning all cinema disciplines.',
    link: { text: 'View All 22 Categories', href: '/awards' },
    tags: ['awards', 'categories', 'best film', 'best director', 'cinematography', 'audience choice', '22 awards']
  },
  {
    id: 'official-selection-laurels',
    category: 'awards',
    categoryLabel: 'Awards & Laurels',
    question: 'Do filmmakers receive official festival laurels and certificates?',
    answerText: 'Yes! Every film officially approved and selected for competition receives downloadable, high-resolution vector and PNG Thirai+ Official Selection Laurels. Nominees and winners receive custom Winner Laurels and a cryptographically verifiable Digital Festival Certificate suitable for posters, press releases, and portfolios.',
    highlight: 'Official Selection & Winner laurels provided in high-res vector/PNG.',
    link: { text: 'Explore Award Laurels', href: '/awards' },
    tags: ['laurel', 'laurels', 'certificate', 'official selection', 'winner laurel', 'poster laurel']
  },
  {
    id: 'prizes-and-distribution',
    category: 'awards',
    categoryLabel: 'Awards & Laurels',
    question: 'What prizes and industry opportunities do winning filmmakers receive?',
    answerText: 'Category winners receive official festival trophies, digital certificates, distribution showcase opportunities, and technology grants sponsored by our partners (including DaVinci Resolve Studio licenses from Blackmagic Design, Sennheiser audio gear, and priority streaming placement).',
    highlight: 'Trophies, tech grants, partner software licenses, and streaming distribution.',
    tags: ['prize', 'prizes', 'cash', 'trophy', 'distribution', 'software', 'grant']
  },

  // ==================== 6. STREAMING TECH & BRAND PARTNERS ====================
  {
    id: 'streaming-infrastructure-and-quality',
    category: 'tech',
    categoryLabel: 'Streaming Tech & Quality',
    question: 'What streaming quality and CDN infrastructure powers Thirai+?',
    answerText: 'Thirai+ streams cinematic content in up to 4K Ultra HD powered by Cloudflare Stream and Cloudflare R2 zero-egress cloud storage. Adaptive bitrate streaming ensures smooth, buffer-free playback across smart TVs, desktop computers, tablets, and smartphones worldwide.',
    highlight: '4K Ultra HD adaptive bitrate streaming powered by Cloudflare R2 & Stream.',
    tags: ['cloudflare', 'cdn', '4k', 'streaming', 'quality', 'buffer', 'hd', 'ultra hd']
  },
  {
    id: 'dolby-atmos-and-vision-support',
    category: 'tech',
    categoryLabel: 'Streaming Tech & Quality',
    question: 'Does Thirai+ support Dolby Vision HDR and Dolby Atmos spatial audio?',
    answerText: 'Yes. Through our technical partnership with Dolby, films mastered in 5.1 surround sound or Dolby Atmos spatial audio, as well as high-dynamic-range color masters, are preserved and streamed with high fidelity.',
    highlight: 'Dolby Vision & Dolby Atmos mastering standards supported.',
    tags: ['dolby', 'atmos', 'dolby vision', 'hdr', 'surround sound', 'audio', 'sound quality']
  },
  {
    id: 'brand-partner-video-uploads',
    category: 'partners',
    categoryLabel: 'Brand Partners & Sponsors',
    question: 'How are brand partner, promotional, and sponsor videos added to Thirai+?',
    answerText: 'Videos will be added by BrandPartner. All promotional, brand showcase, and sponsored cinema segments are uploaded and managed directly by our verified BrandPartner network through their dedicated distribution pipeline.',
    highlight: 'Videos will be added by BrandPartner.',
    tags: ['brand partner', 'brandpartner', 'sponsor videos', 'promotional', 'ads', 'commercials']
  },
  {
    id: 'official-festival-sponsors',
    category: 'partners',
    categoryLabel: 'Brand Partners & Sponsors',
    question: 'Who are the official sponsors and industry partners of Thirai+?',
    answerText: 'Our official festival partners include Cloudflare (Cloud Infrastructure & Global CDN), Dolby (Sound & Color Standards), Blackmagic Design (Post-Production & DaVinci Resolve), ARRI (Optics & Camera Systems), Stripe (Global Payments), Sony CineAlta (Camera Guild), Sennheiser (Acoustics & Microphones), National Film Corporation of Sri Lanka (NFC), and FilmFreeway.',
    highlight: 'Cloudflare, Dolby, Blackmagic Design, ARRI, Stripe, Sony, Sennheiser & NFC.',
    link: { text: 'View Festival Partners', href: '/#sponsors' },
    tags: ['sponsors', 'partners', 'cloudflare', 'dolby', 'blackmagic', 'arri', 'stripe', 'sony', 'sennheiser', 'nfc', 'filmfreeway']
  },

  // ==================== 7. RIGHTS, SECURITY & SUPPORT ====================
  {
    id: 'piracy-and-content-protection',
    category: 'rights',
    categoryLabel: 'Rights, Copyright & Help',
    question: 'How are films protected against piracy, screen recording, and unauthorized downloads?',
    answerText: 'Thirai+ implements encrypted media streaming with tokenized playback URLs, digital rights protection, and dynamic domain whitelisting via Cloudflare Stream. Direct file downloads are disabled to protect filmmakers against unauthorized distribution.',
    highlight: 'Encrypted tokenized streaming with DRM protection and disabled downloads.',
    tags: ['piracy', 'drm', 'protection', 'download', 'screen recording', 'security', 'safe']
  },
  {
    id: 'how-to-contact-support',
    category: 'rights',
    categoryLabel: 'Rights, Copyright & Help',
    question: 'How do I contact the festival committee if I need assistance?',
    answerText: 'You can reach the festival support desk by email at support@thiraiplus.com or contact our admin desk directly for inquiries regarding submissions, press accreditation, jury evaluations, or technical assistance. Our support team typically responds within 24 business hours.',
    highlight: 'Email support@thiraiplus.com — response within 24 hours.',
    tags: ['contact', 'support', 'help', 'email', 'customer service', 'assistance', 'inquiry']
  }
];
