"use client";

import { useState } from 'react';
import {
  Upload, Film, Image as ImageIcon, FileText, CheckCircle2, AlertCircle,
  Loader2, Sparkles, Plus, Trash2, ArrowRight, ArrowLeft, Users,
  Clapperboard, UserCheck, FolderUp, Award, Camera, ShieldCheck, PenTool, Calendar
} from 'lucide-react';
import axios from 'axios';
import api from '../../lib/api';

export default function UploadPage() {
  // Step Navigation (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);

  // --- Step 1: Film Information ---
  const [title, setTitle] = useState('');
  const [originalLanguage, setOriginalLanguage] = useState('Tamil');
  const [subtitleLanguage, setSubtitleLanguage] = useState('English');
  const [genre, setGenre] = useState('Drama');
  const [runningTime, setRunningTime] = useState('');
  const [yearOfProduction, setYearOfProduction] = useState(new Date().getFullYear().toString());
  const [countryOfProduction, setCountryOfProduction] = useState('Sri Lanka');
  const [synopsis, setSynopsis] = useState('');

  // --- Step 2: Key Cast & Crew Credits ---
  const [directorName, setDirectorName] = useState('');
  const [directorEmail, setDirectorEmail] = useState('');
  const [directorPhone, setDirectorPhone] = useState('');

  const [producerName, setProducerName] = useState('');
  const [producerEmail, setProducerEmail] = useState('');
  const [producerPhone, setProducerPhone] = useState('');

  const [writerName, setWriterName] = useState('');
  const [cinematographerName, setCinematographerName] = useState('');
  const [editorName, setEditorName] = useState('');
  const [soundDesignerName, setSoundDesignerName] = useState('');
  const [musicComposerName, setMusicComposerName] = useState('');

  const [leadCasts, setLeadCasts] = useState([
    { id: 1, actor: '', character: '' }
  ]);

  // --- Step 3: Production & Festival Details ---
  const [productionCompany, setProductionCompany] = useState('');
  const [budgetRange, setBudgetRange] = useState('Under $5,000');
  const [shootingFormat, setShootingFormat] = useState('Cinema Camera');
  const [editingSoftware, setEditingSoftware] = useState('DaVinci Resolve');

  const [premiereStatus, setPremiereStatus] = useState('World Premiere');
  const [productionDate, setProductionDate] = useState('');
  const [appliedFestivals, setAppliedFestivals] = useState('');
  const [filmType, setFilmType] = useState('Independent Film');

  // --- Step 4: Primary Contact Person ---
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [socialMediaLinks, setSocialMediaLinks] = useState('');

  // --- Step 5: Media Files & Declaration ---
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [directorPhotoFile, setDirectorPhotoFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);

  // Legal Declaration
  const [declarationContent, setDeclarationContent] = useState(false);
  const [declarationCopyright, setDeclarationCopyright] = useState(false);
  const [declarationScreening, setDeclarationScreening] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState('');
  const [signatureDate, setSignatureDate] = useState(new Date().toISOString().split('T')[0]);

  // Upload Progress & UI State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0); // 0 - 100%
  const [successState, setSuccessState] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dynamic Cast Management
  const addCastMember = () => {
    setLeadCasts(prev => [...prev, { id: Date.now(), actor: '', character: '' }]);
  };

  const removeCastMember = (id) => {
    if (leadCasts.length > 1) {
      setLeadCasts(prev => prev.filter(c => c.id !== id));
    }
  };

  const updateCastMember = (id, field, val) => {
    setLeadCasts(prev => prev.map(c => c.id === id ? { ...c, [field]: val } : c));
  };

  // Synopsis word counter
  const synopsisWordCount = synopsis.trim() ? synopsis.trim().split(/\s+/).length : 0;

  // Step Validation
  const validateStep = (step) => {
    setErrorMsg('');
    if (step === 1) {
      if (!title.trim()) {
        setErrorMsg('Please enter the film title.');
        return false;
      }
      if (!synopsis.trim()) {
        setErrorMsg('Please provide a synopsis for your film.');
        return false;
      }
      if (!runningTime.trim()) {
        setErrorMsg('Please specify the running time (e.g., 15 mins).');
        return false;
      }
      const extractedMins = parseInt(runningTime.replace(/\D/g, ''), 10);
      if (extractedMins && extractedMins > 20) {
        setErrorMsg('Festival eligibility rule: Maximum short film runtime is 20 minutes.');
        return false;
      }
    }
    if (step === 2) {
      if (!directorName.trim()) {
        setErrorMsg("Please provide the Director's full name.");
        return false;
      }
      if (!directorEmail.trim()) {
        setErrorMsg("Please provide the Director's email address.");
        return false;
      }
      if (!directorPhone.trim()) {
        setErrorMsg("Please provide the Director's phone number.");
        return false;
      }
    }
    if (step === 4) {
      if (!contactName.trim() && directorName.trim()) setContactName(directorName);
      if (!contactEmail.trim() && directorEmail.trim()) setContactEmail(directorEmail);
      if (!contactPhone.trim() && directorPhone.trim()) setContactPhone(directorPhone);
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Upload single file directly to Cloudflare R2 via Presigned PUT URL
  const uploadFileToR2 = async (file, category, onProgress) => {
    // 1. Request presigned URL from express backend
    const presignedRes = await api.post('/upload/presigned-url', {
      fileName: file.name,
      fileType: file.type,
      fileCategory: category
    });

    const { presignedUrl, publicUrl } = presignedRes.data;

    // 2. Upload file directly to Cloudflare R2 bucket with real-time percentage tracking
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });

    return publicUrl;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Media validations
    if (!thumbnailFile) {
      setErrorMsg('Please select a thumbnail / poster image for your film.');
      return;
    }

    if (!videoFile) {
      setErrorMsg('Please select the film video file.');
      return;
    }

    const validVideoCodecs = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!validVideoCodecs.includes(videoFile.type.toLowerCase())) {
      setErrorMsg('Invalid video format. Accepted video codecs: MP4 (.mp4), WebM (.webm), and MOV (.mov).');
      return;
    }

    // Legal Declaration validation
    if (!declarationContent || !declarationCopyright || !declarationScreening) {
      setErrorMsg('Please review and check all three declaration boxes to confirm rights clearance before submitting.');
      return;
    }

    const effectiveSignature = (digitalSignature || directorName || contactName).trim();
    if (!effectiveSignature) {
      setErrorMsg('Please enter your Applicant Digital Signature (full legal name).');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Upload Thumbnail to R2 (20% weight)
      setUploadStatusText('Uploading Poster Thumbnail to Cloudflare R2...');
      const thumbnailUrl = await uploadFileToR2(thumbnailFile, 'thumbnail', (pct) => {
        setUploadProgress(Math.round(pct * 0.20));
      });

      // Step 1.5: Upload Director Photograph to R2 if provided (15% weight)
      let directorPhotoUrl = null;
      if (directorPhotoFile) {
        setUploadStatusText('Uploading Director Photograph to Cloudflare R2...');
        directorPhotoUrl = await uploadFileToR2(directorPhotoFile, 'director_photo', (pct) => {
          setUploadProgress(20 + Math.round(pct * 0.15));
        });
      }

      // Step 2: Upload Video to R2 (55% weight)
      setUploadStatusText('Uploading Cinema Video File directly to Cloudflare R2...');
      const videoBase = directorPhotoFile ? 35 : 20;
      const videoUrl = await uploadFileToR2(videoFile, 'video', (pct) => {
        setUploadProgress(videoBase + Math.round(pct * 0.55));
      });

      // Step 3: Upload Optional Attachment if provided
      let attachmentsList = [];
      if (attachmentFile) {
        setUploadStatusText('Uploading Supplemental Press Kit & Attachments...');
        const attachmentUrl = await uploadFileToR2(attachmentFile, 'attachment', () => {});
        attachmentsList.push({
          name: attachmentFile.name,
          url: attachmentUrl,
          type: attachmentFile.type
        });
      }

      setUploadProgress(95);
      setUploadStatusText('Saving Complete Festival Submission Dossier...');

      // Filter clean cast entries
      const cleanLeadCasts = leadCasts
        .filter(c => c.actor.trim() || c.character.trim())
        .map(c => ({ actor: c.actor.trim(), character: c.character.trim() }));

      // Step 4: Save to Database via Backend
      const submitPayload = {
        title: title.trim(),
        description: synopsis.trim(),
        synopsis: synopsis.trim(),
        thumbnail_url: thumbnailUrl,
        video_url: videoUrl,
        attachments: attachmentsList,

        // Film Information
        original_language: originalLanguage,
        subtitle_language: subtitleLanguage,
        genre,
        running_time: runningTime,
        year_of_production: yearOfProduction,
        country_of_production: countryOfProduction,

        // Cast & Crew Credits
        director_name: directorName.trim(),
        director_email: directorEmail.trim(),
        director_phone: directorPhone.trim(),
        producer_name: producerName.trim(),
        producer_email: producerEmail.trim(),
        producer_phone: producerPhone.trim(),
        writer_name: writerName.trim(),
        cinematographer_name: cinematographerName.trim(),
        editor_name: editorName.trim(),
        sound_designer_name: soundDesignerName.trim(),
        music_composer_name: musicComposerName.trim(),
        lead_casts: cleanLeadCasts,

        // Production Details
        production_company: productionCompany.trim(),
        budget_range: budgetRange,
        shooting_format: shootingFormat,
        editing_software: editingSoftware,

        // Festival-Specific Questions
        premiere_status: premiereStatus,
        production_date: productionDate,
        applied_festivals: appliedFestivals.trim(),
        film_type: filmType,

        // Primary Contact Person
        contact_name: (contactName || directorName).trim(),
        contact_email: (contactEmail || directorEmail).trim(),
        contact_phone: (contactPhone || directorPhone).trim(),
        social_media_links: socialMediaLinks.trim(),

        // Director Photograph & Legal Declaration
        director_photo_url: directorPhotoUrl || null,
        declaration_content_permission: declarationContent,
        declaration_copyright_compliant: declarationCopyright,
        declaration_screening_allowed: declarationScreening,
        declaration_confirmed: declarationContent && declarationCopyright && declarationScreening,
        digital_signature: effectiveSignature,
        signature_date: signatureDate || new Date().toISOString().split('T')[0],

        // Backward compatibility
        uploader_email: (directorEmail || contactEmail).trim(),
        uploader_phone: (directorPhone || contactPhone).trim()
      };

      const submitRes = await api.post('/movies', submitPayload);

      if (submitRes.data.success) {
        setUploadProgress(100);
        setIsUploading(false);
        setSuccessState(true);
      }
    } catch (err) {
      console.error('Submission Upload Error:', err);
      setErrorMsg(err.response?.data?.error || err.message || 'Direct upload to Cloudflare R2 failed.');
      setIsUploading(false);
    }
  };

  const stepsList = [
    { id: 1, title: 'Film Info', icon: Film },
    { id: 2, title: 'Cast & Crew', icon: Users },
    { id: 3, title: 'Production & Festival', icon: Clapperboard },
    { id: 4, title: 'Contact Person', icon: UserCheck },
    { id: 5, title: 'Media & Submit', icon: FolderUp },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 px-3 sm:px-6">
      
      {/* Page Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 font-semibold text-xs uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Official Festival Entry Form
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Submit Your Short Film to <span className="gold-text-gradient">Thirai+</span>
        </h1>
        <p className="text-xs md:text-sm text-zinc-400 mt-2 max-w-xl mx-auto">
          Complete official film dossier & direct Cloudflare R2 cinema storage pipeline.
        </p>
      </div>

      {/* Step Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-800 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-gold-gradient -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (stepsList.length - 1)) * 100}%` }}
          />

          {stepsList.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (step.id < currentStep) {
                    setCurrentStep(step.id);
                  } else if (validateStep(currentStep)) {
                    setCurrentStep(step.id);
                  }
                }}
                className="relative z-10 flex flex-col items-center group focus:outline-none transition-all"
              >
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                    isCurrent
                      ? 'bg-gold-gradient text-black shadow-gold-glow scale-110'
                      : isCompleted
                      ? 'bg-emerald-500 text-black shadow-md'
                      : 'bg-surface-card border border-zinc-800 text-zinc-400 group-hover:border-zinc-700'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-semibold mt-2 text-center transition-colors hidden md:block ${
                    isCurrent ? 'text-gold-400 font-bold' : isCompleted ? 'text-zinc-200' : 'text-zinc-500'
                  }`}
                >
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Success State Screen */}
      {successState ? (
        <div className="bg-surface-card border border-gold-500/40 rounded-3xl p-8 md:p-12 text-center shadow-gold-glow glass-panel animate-fade-in">
          <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto mb-4 animate-bounce" />
          <h2 className="text-3xl font-extrabold text-white mb-2">Film Successfully Submitted!</h2>
          <p className="text-zinc-300 text-sm max-w-lg mx-auto mb-2">
            Your short film <strong>"{title}"</strong> and complete festival dossier have been received and transferred to Cloudflare R2 storage.
          </p>
          <p className="text-zinc-400 text-xs max-w-md mx-auto mb-8 font-light">
            Your entry is queued for Festival Jury scoring and Administrator review. You will receive updates via email.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                setSuccessState(false);
                setCurrentStep(1);
                setTitle('');
                setSynopsis('');
                setRunningTime('');
                setDirectorName('');
                setDirectorEmail('');
                setDirectorPhone('');
                setProducerName('');
                setProducerEmail('');
                setProducerPhone('');
                setLeadCasts([{ id: 1, actor: '', character: '' }]);
                setThumbnailFile(null);
                setVideoFile(null);
                setAttachmentFile(null);
              }}
              className="gold-btn px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-gold-glow"
            >
              Submit Another Film
            </button>
            <a
              href="/"
              className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
            >
              Explore Festival Gallery
            </a>
          </div>
        </div>
      ) : (
        /* Multi-Step Submission Form */
        <form onSubmit={handleFormSubmit} className="bg-surface-card border border-gold-500/20 rounded-3xl p-6 sm:p-8 space-y-6 glass-panel shadow-2xl">
          
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: Film Information */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-zinc-800 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-gold-400" /> Step 1: Film Information
                </h3>
                <p className="text-xs text-zinc-400 mt-1">General film identity, linguistic details, category, and synopsis.</p>
              </div>

              {/* Official Eligibility Rules Callout */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-gold-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-850 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-gold-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Official Festival Eligibility Rules
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-[10px] font-mono font-bold">
                    Submission Fee: $4.99 USD
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <span className="text-gold-400 text-xs font-bold">✓</span>
                    <span><strong>Worldwide:</strong> Open to all filmmakers worldwide.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gold-400 text-xs font-bold">✓</span>
                    <span><strong>Mobile Films:</strong> Mobile phone films are accepted.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gold-400 text-xs font-bold">✓</span>
                    <span><strong>Runtime:</strong> Maximum runtime: <strong>20 minutes</strong>.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gold-400 text-xs font-bold">✓</span>
                    <span><strong>Timeline:</strong> Completed within the last year.</span>
                  </div>
                  <div className="col-span-full flex items-center gap-2">
                    <span className="text-gold-400 text-xs font-bold">✓</span>
                    <span><strong>Languages:</strong> Any language accepted with English subtitles.</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-850/80 flex flex-wrap items-center justify-between text-[11px] text-zinc-400">
                  <span>Official Submission Fee: <strong className="text-gold-400 font-bold">$4.99 USD</strong></span>
                  <span>Viewer Membership (after 2 free films): <strong className="text-zinc-200 font-semibold">$4.99 USD</strong></span>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Film Title <span className="text-gold-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Whispering Palms"
                  className="w-full bg-black/80 border border-zinc-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>

              {/* Language and Subtitles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Original Language <span className="text-gold-400">*</span>
                  </label>
                  <select
                    required
                    value={originalLanguage}
                    onChange={(e) => setOriginalLanguage(e.target.value)}
                    className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                  >
                    <optgroup label="Popular & Regional">
                      <option value="Tamil">Tamil (தமிழ்)</option>
                      <option value="Sinhala">Sinhala (සිංහල)</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi (हिन्दी)</option>
                      <option value="Telugu">Telugu (తెలుగు)</option>
                      <option value="Malayalam">Malayalam (മലയാളം)</option>
                      <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                      <option value="Bengali">Bengali (বাংলা)</option>
                      <option value="Marathi">Marathi (मराठी)</option>
                      <option value="Urdu">Urdu (اردو)</option>
                    </optgroup>
                    <optgroup label="International Languages">
                      <option value="Arabic">Arabic (العربية)</option>
                      <option value="Chinese (Mandarin)">Chinese - Mandarin (中文)</option>
                      <option value="Chinese (Cantonese)">Chinese - Cantonese (粵語)</option>
                      <option value="Czech">Czech (Čeština)</option>
                      <option value="Danish">Danish (Dansk)</option>
                      <option value="Dutch">Dutch (Nederlands)</option>
                      <option value="Finnish">Finnish (Suomi)</option>
                      <option value="French">French (Français)</option>
                      <option value="German">German (Deutsch)</option>
                      <option value="Greek">Greek (Ελληνικά)</option>
                      <option value="Hebrew">Hebrew (עברית)</option>
                      <option value="Hungarian">Hungarian (Magyar)</option>
                      <option value="Indonesian">Indonesian (Bahasa Indonesia)</option>
                      <option value="Italian">Italian (Italiano)</option>
                      <option value="Japanese">Japanese (日本語)</option>
                      <option value="Korean">Korean (한국어)</option>
                      <option value="Malay">Malay (Bahasa Melayu)</option>
                      <option value="Norwegian">Norwegian (Norsk)</option>
                      <option value="Persian (Farsi)">Persian / Farsi (فارسی)</option>
                      <option value="Polish">Polish (Polski)</option>
                      <option value="Portuguese">Portuguese (Português)</option>
                      <option value="Romanian">Romanian (Română)</option>
                      <option value="Russian">Russian (Русский)</option>
                      <option value="Spanish">Spanish (Español)</option>
                      <option value="Swahili">Swahili (Kiswahili)</option>
                      <option value="Swedish">Swedish (Svenska)</option>
                      <option value="Tagalog">Tagalog / Filipino</option>
                      <option value="Thai">Thai (ไทย)</option>
                      <option value="Turkish">Turkish (Türkçe)</option>
                      <option value="Ukrainian">Ukrainian (Українська)</option>
                      <option value="Vietnamese">Vietnamese (Tiếng Việt)</option>
                    </optgroup>
                    <optgroup label="Other">
                      <option value="Silent Film">Silent Film (No Spoken Dialogue)</option>
                      <option value="Other">Other / Indigenous Language</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Subtitle Language(s)
                  </label>
                  <input
                    type="text"
                    value={subtitleLanguage}
                    onChange={(e) => setSubtitleLanguage(e.target.value)}
                    placeholder="e.g. English, French, None"
                    className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* Genre, Running Time, Year, Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Genre <span className="text-gold-400">*</span>
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="Drama">Drama</option>
                    <option value="Thriller">Thriller</option>
                    <option value="Neo-Noir">Neo-Noir</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Documentary">Documentary</option>
                    <option value="Animation">Animation</option>
                    <option value="Experimental">Experimental</option>
                    <option value="Historical">Historical</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Running Time <span className="text-gold-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={runningTime}
                    onChange={(e) => setRunningTime(e.target.value)}
                    placeholder="e.g. 18 mins"
                    className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Year of Production <span className="text-gold-400">*</span>
                  </label>
                  <select
                    required
                    value={yearOfProduction}
                    onChange={(e) => setYearOfProduction(e.target.value)}
                    className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                  >
                    {Array.from({ length: 2026 - 2000 + 1 }, (_, i) => 2026 - i).map((yr) => (
                      <option key={yr} value={yr.toString()}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Country of Production <span className="text-gold-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={countryOfProduction}
                    onChange={(e) => setCountryOfProduction(e.target.value)}
                    placeholder="e.g. Sri Lanka"
                    className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* Synopsis (100–300 words) with real-time counter */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Synopsis (100–300 words recommended) <span className="text-gold-400">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
                      synopsisWordCount >= 100 && synopsisWordCount <= 300
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : synopsisWordCount > 300
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {synopsisWordCount} words {synopsisWordCount >= 100 && synopsisWordCount <= 300 ? '✓ Optimal' : ''}
                  </span>
                </div>
                <textarea
                  required
                  rows={5}
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  placeholder="Provide a compelling narrative overview, logline, and themes of your short film..."
                  className="w-full bg-black/80 border border-zinc-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-gold-500 resize-y leading-relaxed font-light"
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: Key Cast & Crew Credits */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-zinc-800 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-gold-400" /> Step 2: Key Cast & Crew Credits
                </h3>
                <p className="text-xs text-zinc-400 mt-1">Official artistic, directorial, and technical credits for jury evaluation.</p>
              </div>

              {/* Director Details */}
              <div className="p-4 rounded-2xl bg-black/60 border border-gold-500/20 space-y-3">
                <h4 className="text-xs font-bold text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Director Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Full Name <span className="text-gold-400">*</span></label>
                    <input
                      type="text"
                      required
                      value={directorName}
                      onChange={(e) => setDirectorName(e.target.value)}
                      placeholder="e.g. Mani Ratnam"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Email <span className="text-gold-400">*</span></label>
                    <input
                      type="email"
                      required
                      value={directorEmail}
                      onChange={(e) => setDirectorEmail(e.target.value)}
                      placeholder="director@cinema.com"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Phone Number <span className="text-gold-400">*</span></label>
                    <input
                      type="tel"
                      required
                      value={directorPhone}
                      onChange={(e) => setDirectorPhone(e.target.value)}
                      placeholder="+94 77 123 4567"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
              </div>

              {/* Producer Details */}
              <div className="p-4 rounded-2xl bg-black/60 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Producer Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={producerName}
                      onChange={(e) => setProducerName(e.target.value)}
                      placeholder="e.g. Madras Talkies"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={producerEmail}
                      onChange={(e) => setProducerEmail(e.target.value)}
                      placeholder="producer@film.com"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={producerPhone}
                      onChange={(e) => setProducerPhone(e.target.value)}
                      placeholder="+94 77 987 6543"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
              </div>

              {/* Technical Department Heads */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gold-400 uppercase tracking-wider">Creative & Technical Crew</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Writer / Screenwriter</label>
                    <input
                      type="text"
                      value={writerName}
                      onChange={(e) => setWriterName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Cinematographer / DOP</label>
                    <input
                      type="text"
                      value={cinematographerName}
                      onChange={(e) => setCinematographerName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Editor</label>
                    <input
                      type="text"
                      value={editorName}
                      onChange={(e) => setEditorName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Sound Designer / Engineer</label>
                    <input
                      type="text"
                      value={soundDesignerName}
                      onChange={(e) => setSoundDesignerName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Music Composer</label>
                    <input
                      type="text"
                      value={musicComposerName}
                      onChange={(e) => setMusicComposerName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
              </div>

              {/* Lead Casts - Dynamic List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gold-400 uppercase tracking-wider">
                    Lead Casts — Main Actor(s) and Character Names
                  </h4>
                  <button
                    type="button"
                    onClick={addCastMember}
                    className="text-xs font-bold text-gold-400 hover:text-gold-300 flex items-center gap-1 bg-gold-500/10 px-3 py-1 rounded-lg border border-gold-500/30 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Actor
                  </button>
                </div>

                <div className="space-y-2.5">
                  {leadCasts.map((castItem, idx) => (
                    <div key={castItem.id} className="flex items-center gap-2 bg-black/70 border border-zinc-800 rounded-xl p-2.5">
                      <span className="text-[11px] font-mono text-zinc-500 w-5 text-center">#{idx + 1}</span>
                      <input
                        type="text"
                        value={castItem.actor}
                        onChange={(e) => updateCastMember(castItem.id, 'actor', e.target.value)}
                        placeholder="Main Actor Name (e.g. Arvind Swami)"
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-gold-500"
                      />
                      <span className="text-xs text-zinc-500 font-serif italic">as</span>
                      <input
                        type="text"
                        value={castItem.character}
                        onChange={(e) => updateCastMember(castItem.id, 'character', e.target.value)}
                        placeholder="Character Name (e.g. The Traveler)"
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-gold-500"
                      />
                      {leadCasts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCastMember(castItem.id)}
                          className="p-2 text-zinc-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: Production Details & Festival Questions */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-zinc-800 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clapperboard className="w-5 h-5 text-gold-400" /> Step 3: Production & Festival Details
                </h3>
                <p className="text-xs text-zinc-400 mt-1">Technical pipeline, premiere context, and festival competition track record.</p>
              </div>

              {/* Production Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gold-400 uppercase tracking-wider">Production Details</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Production Company (if applicable)
                    </label>
                    <input
                      type="text"
                      value={productionCompany}
                      onChange={(e) => setProductionCompany(e.target.value)}
                      placeholder="e.g. Northern Cinema Collective"
                      className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Budget Range (Optional)
                    </label>
                    <select
                      value={budgetRange}
                      onChange={(e) => setBudgetRange(e.target.value)}
                      className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                    >
                      <option value="Under $1,000">Micro-Budget (Under $1,000)</option>
                      <option value="Under $5,000">$1,000 - $5,000</option>
                      <option value="$5,000 - $15,000">$5,000 - $15,000</option>
                      <option value="$15,000 - $30,000">$15,000 - $30,000</option>
                      <option value="$30,000+">$30,000+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Shooting Format (DSLR, Cinema Camera, Mobile, etc.)
                    </label>
                    <input
                      type="text"
                      value={shootingFormat}
                      onChange={(e) => setShootingFormat(e.target.value)}
                      placeholder="e.g. Cinema Camera (Arri Alexa / RED / Sony FX)"
                      className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Editing Software Used (Optional)
                    </label>
                    <input
                      type="text"
                      value={editingSoftware}
                      onChange={(e) => setEditingSoftware(e.target.value)}
                      placeholder="e.g. DaVinci Resolve, Adobe Premiere Pro, Final Cut Pro"
                      className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
              </div>

              {/* Festival-Specific Questions */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h4 className="text-xs font-bold text-gold-400 uppercase tracking-wider">Festival-Specific Questions</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Premiere Status <span className="text-gold-400">*</span>
                    </label>
                    <select
                      value={premiereStatus}
                      onChange={(e) => setPremiereStatus(e.target.value)}
                      className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                    >
                      <option value="World Premiere">World Premiere</option>
                      <option value="National Premiere">National Premiere</option>
                      <option value="Regional Premiere">Regional Premiere</option>
                      <option value="Not Premiered">Not Premiered</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Production Completion Date
                    </label>
                    <input
                      type="date"
                      value={productionDate}
                      onChange={(e) => setProductionDate(e.target.value)}
                      className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Category: Student Film or Independent Film <span className="text-gold-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Independent Film', 'Student Film'].map((typeOption) => (
                      <button
                        type="button"
                        key={typeOption}
                        onClick={() => setFilmType(typeOption)}
                        className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${
                          filmType === typeOption
                            ? 'bg-gold-gradient text-black border-gold-400 shadow-gold-glow'
                            : 'bg-black/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        {typeOption}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Applied Festivals / Competitions (Past or concurrent entries)
                  </label>
                  <textarea
                    rows={2}
                    value={appliedFestivals}
                    onChange={(e) => setAppliedFestivals(e.target.value)}
                    placeholder="List other film festivals this work has been submitted to or screened at (or 'None')..."
                    className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500 resize-none font-light"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: Primary Contact Person */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-zinc-800 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-gold-400" /> Step 4: Primary Contact Person
                </h3>
                <p className="text-xs text-zinc-400 mt-1">Official delegate representing the film for communications, agreements, and awards.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Primary Contact Name <span className="text-gold-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName || directorName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Lead Producer or Director"
                    className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Email Address <span className="text-gold-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail || directorEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@production.com"
                    className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Phone Number <span className="text-gold-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone || directorPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Social Media Links (Optional)
                </label>
                <input
                  type="text"
                  value={socialMediaLinks}
                  onChange={(e) => setSocialMediaLinks(e.target.value)}
                  placeholder="Instagram, Twitter/X, IMDb, or Official Website URL"
                  className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: Media Files & Review */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-zinc-800 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FolderUp className="w-5 h-5 text-gold-400" /> Step 5: Media Files & Submission Review
                </h3>
                <p className="text-xs text-zinc-400 mt-1">Upload official poster artwork, video master, and supplemental press attachments.</p>
              </div>

              {/* Dossier Quick Summary */}
              <div className="p-4 rounded-2xl bg-black/60 border border-gold-500/20 space-y-2">
                <h4 className="text-xs font-bold text-gold-400 uppercase tracking-wider">Submission Dossier Recap</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                  <div><span className="text-zinc-500">Title:</span> <span className="text-white font-semibold">{title || 'Untitled'}</span></div>
                  <div><span className="text-zinc-500">Genre:</span> <span className="text-white font-semibold">{genre}</span></div>
                  <div><span className="text-zinc-500">Duration:</span> <span className="text-white font-semibold">{runningTime || 'N/A'}</span></div>
                  <div><span className="text-zinc-500">Premiere:</span> <span className="text-white font-semibold">{premiereStatus}</span></div>
                  <div><span className="text-zinc-500">Director:</span> <span className="text-white font-semibold">{directorName || 'N/A'}</span></div>
                  <div><span className="text-zinc-500">Category:</span> <span className="text-white font-semibold">{filmType}</span></div>
                  <div><span className="text-zinc-500">Language:</span> <span className="text-white font-semibold">{originalLanguage}</span></div>
                  <div><span className="text-zinc-500">Cast:</span> <span className="text-white font-semibold">{leadCasts.filter(c => c.actor).length} actors</span></div>
                  <div><span className="text-zinc-500">Entry Fee:</span> <span className="text-gold-400 font-bold">$4.99 USD</span></div>
                  <div><span className="text-zinc-500">Eligibility:</span> <span className="text-emerald-400 font-semibold">Max 20m • Verified</span></div>
                </div>
              </div>

              {/* Media File Uploads */}
              <div className="space-y-4">
                
                {/* Thumbnail Upload */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Poster Thumbnail (JPG, PNG, WebP) <span className="text-gold-400">*</span>
                  </label>
                  <div className="relative border-2 border-dashed border-zinc-800 hover:border-gold-500/50 rounded-xl p-5 text-center bg-black/50 transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => setThumbnailFile(e.target.files[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="flex flex-col items-center">
                      <ImageIcon className="w-8 h-8 text-gold-400 mb-1" />
                      <span className="text-xs text-zinc-300 font-semibold">
                        {thumbnailFile ? thumbnailFile.name : 'Click or Drag to Upload Poster Thumbnail'}
                      </span>
                      <span className="text-[10px] text-zinc-500 mt-0.5">Recommended 16:9 cinematic aspect ratio</span>
                    </div>
                  </div>
                </div>

                {/* Director Photograph Upload */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>Director Photograph (JPG, PNG, WebP)</span>
                    <span className="text-[10px] text-gold-400/80 font-normal">Official Headshot / Portrait</span>
                  </label>
                  <div className="relative border-2 border-dashed border-zinc-800 hover:border-gold-500/50 rounded-xl p-4 text-center bg-black/50 transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => setDirectorPhotoFile(e.target.files[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="flex flex-col items-center">
                      <Camera className="w-7 h-7 text-gold-400 mb-1" />
                      <span className="text-xs text-zinc-300 font-semibold">
                        {directorPhotoFile ? directorPhotoFile.name : 'Click or Drag to Upload Director Photograph'}
                      </span>
                      <span className="text-[10px] text-zinc-500 mt-0.5">High-resolution portrait photo for festival badges and program catalog</span>
                    </div>
                  </div>
                </div>

                {/* Video File Upload */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Video Master File (MP4, WebM, MOV) <span className="text-gold-400">*</span>
                  </label>
                  <div className="relative border-2 border-dashed border-zinc-800 hover:border-gold-500/50 rounded-xl p-6 text-center bg-black/50 transition-colors">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={(e) => setVideoFile(e.target.files[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="flex flex-col items-center">
                      <Film className="w-9 h-9 text-gold-400 mb-1" />
                      <span className="text-xs text-zinc-300 font-semibold">
                        {videoFile ? `${videoFile.name} (${(videoFile.size / (1024 * 1024)).toFixed(1)} MB)` : 'Click or Drag Film Video File'}
                      </span>
                      <span className="text-[10px] text-zinc-500 mt-0.5">Direct Cloudflare R2 Presigned Cloud Upload</span>
                    </div>
                  </div>
                </div>

                {/* Optional Attachments */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Supplemental Press Kit & Documents (Optional - PDF, Word)
                  </label>
                  <div className="relative border border-zinc-800 rounded-xl p-3 bg-black/50 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-zinc-500 shrink-0" />
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={(e) => setAttachmentFile(e.target.files[0] || null)}
                      className="text-xs text-zinc-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-gold-400 hover:file:bg-zinc-700 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Official Festival Declaration & Rights Clearance */}
              <div className="p-5 sm:p-6 rounded-2xl bg-zinc-950 border border-gold-500/30 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-gold-400 shrink-0" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white tracking-wider uppercase">
                        DECLARATION
                      </h4>
                      <p className="text-[11px] text-zinc-400">
                        Please review and confirm all legal declarations prior to submission.
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                      declarationContent && declarationCopyright && declarationScreening
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {declarationContent && declarationCopyright && declarationScreening
                      ? '✓ All Confirmed'
                      : 'Required'}
                  </span>
                </div>

                {/* 3 Checkboxes */}
                <div className="space-y-2.5">
                  <label
                    onClick={() => setDeclarationContent(!declarationContent)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all select-none ${
                      declarationContent
                        ? 'bg-gold-500/10 border-gold-500/50 text-white'
                        : 'bg-black/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={declarationContent}
                      onChange={(e) => setDeclarationContent(e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 w-4 h-4 rounded border-zinc-700 text-gold-500 focus:ring-gold-500 bg-black cursor-pointer shrink-0"
                    />
                    <span className="text-xs font-medium leading-relaxed">
                      All content used in this film belongs to me or has proper permission.
                    </span>
                  </label>

                  <label
                    onClick={() => setDeclarationCopyright(!declarationCopyright)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all select-none ${
                      declarationCopyright
                        ? 'bg-gold-500/10 border-gold-500/50 text-white'
                        : 'bg-black/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={declarationCopyright}
                      onChange={(e) => setDeclarationCopyright(e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 w-4 h-4 rounded border-zinc-700 text-gold-500 focus:ring-gold-500 bg-black cursor-pointer shrink-0"
                    />
                    <span className="text-xs font-medium leading-relaxed">
                      The film does not violate copyright laws.
                    </span>
                  </label>

                  <label
                    onClick={() => setDeclarationScreening(!declarationScreening)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all select-none ${
                      declarationScreening
                        ? 'bg-gold-500/10 border-gold-500/50 text-white'
                        : 'bg-black/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={declarationScreening}
                      onChange={(e) => setDeclarationScreening(e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 w-4 h-4 rounded border-zinc-700 text-gold-500 focus:ring-gold-500 bg-black cursor-pointer shrink-0"
                    />
                    <span className="text-xs font-medium leading-relaxed">
                      The organizers may screen the film during festival events and promotional activities.
                    </span>
                  </label>
                </div>

                {/* Digital Signature & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-800/80">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5 text-gold-400" />
                      Applicant Signature: (Digital Signature) <span className="text-gold-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={digitalSignature}
                      onChange={(e) => setDigitalSignature(e.target.value)}
                      placeholder={directorName || 'Type your full legal name'}
                      className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                    {digitalSignature.trim() && (
                      <span className="text-[11px] text-gold-400/90 font-serif italic mt-1.5 block">
                        Digitally signed by: &ldquo;{digitalSignature.trim()}&rdquo;
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gold-400" />
                      Date: <span className="text-gold-400">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={signatureDate}
                      onChange={(e) => setSignatureDate(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
              </div>

              {/* Real-time R2 Progress Bar */}
              {isUploading && (
                <div className="space-y-2 p-4 rounded-2xl bg-black border border-gold-500/40 animate-pulse">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gold-300 font-semibold flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                      {uploadStatusText}
                    </span>
                    <span className="font-mono font-bold text-gold-400">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold-gradient transition-all duration-300 shadow-gold-glow"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* Form Actions (Previous / Next / Submit) */}
          {/* ========================================================================= */}
          <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
            {currentStep > 1 ? (
              <button
                type="button"
                disabled={isUploading}
                onClick={handlePrevStep}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous Step
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="gold-btn px-6 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-gold-glow"
              >
                Continue to {stepsList[currentStep]?.title} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isUploading}
                className="gold-btn px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-glow"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading to R2 Cloud...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" /> Finalize & Submit Entry
                  </>
                )}
              </button>
            )}
          </div>

        </form>
      )}
    </div>
  );
}
