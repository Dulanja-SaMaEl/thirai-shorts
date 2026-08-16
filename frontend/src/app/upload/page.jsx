"use client";

import { useState } from 'react';
import { Upload, Film, Image as ImageIcon, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';
import api from '../../lib/api';

export default function UploadPage() {
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploaderEmail, setUploaderEmail] = useState('');
  const [uploaderPhone, setUploaderPhone] = useState('');

  // File States
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);

  // Upload Progress & UI State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0); // 0 - 100%
  const [successState, setSuccessState] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

    // Codec & Format Validation
    if (!thumbnailFile) {
      setErrorMsg('Please select a thumbnail image for your movie.');
      return;
    }

    if (!videoFile) {
      setErrorMsg('Please select a video file.');
      return;
    }

    const validVideoCodecs = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!validVideoCodecs.includes(videoFile.type.toLowerCase())) {
      setErrorMsg('Invalid video format. Accepted video codecs: MP4 (.mp4), WebM (.webm), and MOV (.mov).');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Upload Thumbnail to R2 (30% weight of total progress)
      setUploadStatusText('Uploading Thumbnail to Cloudflare R2 storage...');
      const thumbnailUrl = await uploadFileToR2(thumbnailFile, 'thumbnail', (pct) => {
        setUploadProgress(Math.round(pct * 0.25));
      });

      // Step 2: Upload Video File to R2 (65% weight of total progress)
      setUploadStatusText('Uploading Main Video File directly to Cloudflare R2...');
      const videoUrl = await uploadFileToR2(videoFile, 'video', (pct) => {
        setUploadProgress(25 + Math.round(pct * 0.65));
      });

      // Step 3: Upload Optional Attachment if provided
      let attachmentsList = [];
      if (attachmentFile) {
        setUploadStatusText('Uploading Supplemental Attachments...');
        const attachmentUrl = await uploadFileToR2(attachmentFile, 'attachment', () => {});
        attachmentsList.push({
          name: attachmentFile.name,
          url: attachmentUrl,
          type: attachmentFile.type
        });
      }

      setUploadProgress(95);
      setUploadStatusText('Finalizing Submission & Saving Metadata...');

      // Step 4: Save metadata to Supabase DB via Backend
      const submitRes = await api.post('/movies', {
        title,
        description,
        thumbnail_url: thumbnailUrl,
        video_url: videoUrl,
        attachments: attachmentsList,
        uploader_email: uploaderEmail,
        uploader_phone: uploaderPhone
      });

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

  return (
    <div className="max-w-3xl mx-auto py-6">
      
      {/* Page Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 font-semibold text-xs uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Submitter Entry Form
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white">
          Submit Your Short Movie to <span className="gold-text-gradient">Thirai+</span>
        </h1>
        <p className="text-xs md:text-sm text-zinc-400 mt-2">
          Direct cloud video upload powered by Cloudflare R2 infrastructure.
        </p>
      </div>

      {/* Success State Screen */}
      {successState ? (
        <div className="bg-surface-card border border-gold-500/40 rounded-3xl p-8 text-center shadow-gold-glow glass-panel">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-white mb-2">Film Successfully Uploaded!</h2>
          <p className="text-zinc-300 text-sm max-w-md mx-auto mb-6">
            Your short film <strong>"{title}"</strong> has been saved and transferred to Cloudflare R2 storage. It is now queued for Admin & Jury moderation.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setSuccessState(false);
                setTitle('');
                setDescription('');
                setThumbnailFile(null);
                setVideoFile(null);
                setAttachmentFile(null);
              }}
              className="gold-btn px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Submit Another Movie
            </button>
            <a
              href="/"
              className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
            >
              Back to Gallery
            </a>
          </div>
        </div>
      ) : (
        /* Upload Form */
        <form onSubmit={handleFormSubmit} className="bg-surface-card border border-gold-500/20 rounded-3xl p-6 md:p-8 space-y-6 glass-panel">
          
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mandatory Fields: Title & Description */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider">1. General Information</h3>
            
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Movie Title <span className="text-gold-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Echoes of Silence"
                className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Description / Synopsis <span className="text-gold-400">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief logline and story overview..."
                className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500 resize-none"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4 border-t border-zinc-800 pt-6">
            <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider">2. Director / Submitter Contact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Uploader Email Address <span className="text-gold-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={uploaderEmail}
                  onChange={(e) => setUploaderEmail(e.target.value)}
                  placeholder="director@cinema.com"
                  className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Mobile Phone Number <span className="text-gold-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={uploaderPhone}
                  onChange={(e) => setUploaderPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>
          </div>

          {/* Media File Uploads */}
          <div className="space-y-4 border-t border-zinc-800 pt-6">
            <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider">3. Media Files & Storage</h3>
            
            {/* Thumbnail Upload */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Thumbnail Image (JPG, PNG, WebP) <span className="text-gold-400">*</span>
              </label>
              <div className="relative border-2 border-dashed border-zinc-800 hover:border-gold-500/50 rounded-xl p-4 text-center bg-black/50 transition-colors">
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
                  <span className="text-[10px] text-zinc-500 mt-0.5">Recommended 16:9 ratio</span>
                </div>
              </div>
            </div>

            {/* Video File Upload */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Video File (MP4, WebM, MOV Codecs) <span className="text-gold-400">*</span>
              </label>
              <div className="relative border-2 border-dashed border-zinc-800 hover:border-gold-500/50 rounded-xl p-5 text-center bg-black/50 transition-colors">
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={(e) => setVideoFile(e.target.files[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center">
                  <Film className="w-9 h-9 text-gold-400 mb-1" />
                  <span className="text-xs text-zinc-300 font-semibold">
                    {videoFile ? `${videoFile.name} (${(videoFile.size / (1024 * 1024)).toFixed(1)} MB)` : 'Click or Drag Main Video File'}
                  </span>
                  <span className="text-[10px] text-zinc-500 mt-0.5">Direct Cloudflare R2 Presigned Upload</span>
                </div>
              </div>
            </div>

            {/* Optional Attachments */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Supplemental Attachments (Optional - PDF, Word, Excel)
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

          {/* Real-time R2 Progress Bar */}
          {isUploading && (
            <div className="space-y-2 p-4 rounded-2xl bg-black border border-gold-500/40">
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

          {/* Form Action */}
          <button
            type="submit"
            disabled={isUploading}
            className="w-full gold-btn py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-glow"
          >
            {isUploading ? 'Uploading to R2 Cloud...' : 'Upload Film & Submit Entry'}
          </button>
        </form>
      )}
    </div>
  );
}
