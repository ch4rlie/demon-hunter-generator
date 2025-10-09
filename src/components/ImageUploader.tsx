import { Upload, Loader2, CheckCircle } from 'lucide-react';
import { useRef, useState, DragEvent } from 'react';

interface ImageUploaderProps {
  onImageUpload: (files: File[], style: 'kpop' | 'hunter') => void;
  onEmailSubmit?: (email: string, name?: string) => void;
  isProcessing: boolean;
  processedImages: string[];
  currentStyle?: 'kpop' | 'hunter';
  originalFile?: File;
}

export default function ImageUploader({
  onImageUpload,
  onEmailSubmit,
  isProcessing,
  processedImages,
  currentStyle,
  originalFile,
}: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<'kpop' | 'hunter' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    if (!selectedStyle) {
      alert('Please select a style first!');
      return;
    }
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    onImageUpload(files, selectedStyle);
  };
  
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && onEmailSubmit) {
      onEmailSubmit(email, name);
      setEmailSubmitted(true);
    }
  };

  const clearImages = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `demon-hunter-${index + 1}.webp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(url, '_blank');
    }
  };

  const handleShare = async (url: string) => {
    if (navigator.share) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], 'demon-hunter.webp', { type: 'image/webp' });
        
        await navigator.share({
          files: [file],
          title: 'My K-Pop Demon Hunter Transformation',
          text: 'Check out my demon hunter transformation!',
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  if (processedImages.length > 0) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h3 className="text-2xl font-bold text-white">Your Transformation is Complete!</h3>
          </div>
          <p className="text-gray-400">You are now a K-Pop Demon Hunter</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {processedImages.map((url, index) => (
            <div key={index} className="space-y-4">
              <div className="relative group rounded-2xl overflow-hidden border border-red-500/30 shadow-lg shadow-red-500/20">
                <img
                  src={url}
                  alt={`Processed ${index + 1}`}
                  className="w-full h-auto object-cover"
                />
              </div>
              
              {/* Mobile-friendly action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleDownload(url, index)}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl font-bold text-lg hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Image
                </button>
                
                <button
                  onClick={() => handleShare(url)}
                  className="flex-1 px-6 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </button>
              </div>
              
              <p className="text-xs text-center text-gray-500">
                💡 Tip: Long-press the image to save on mobile
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
          {/* Try other style button */}
          {currentStyle && originalFile && (
            <button
              onClick={() => {
                const otherStyle = currentStyle === 'kpop' ? 'hunter' : 'kpop';
                onImageUpload([originalFile], otherStyle);
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>{currentStyle === 'kpop' ? '🔥' : '✨'}</span>
              Try {currentStyle === 'kpop' ? 'Hunter' : 'K-Pop'} Style
            </button>
          )}
          
          <button
            onClick={clearImages}
            className="px-8 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full font-bold hover:bg-white/10 transition-all duration-300"
          >
            Transform Another Photo
          </button>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="space-y-6">
        {/* Show existing processed images while generating new one */}
        {processedImages.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {processedImages.map((url, index) => (
              <div key={index} className="space-y-4">
                <div className="relative group rounded-2xl overflow-hidden border border-green-500/30 shadow-lg shadow-green-500/20">
                  <img
                    src={url}
                    alt={`Processed ${index + 1}`}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-green-500/90 text-white text-xs px-2 py-1 rounded-full">
                    ✓ Complete
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="bg-gradient-to-br from-red-950/30 to-orange-950/30 backdrop-blur-md border border-red-500/30 rounded-3xl p-12">
          <div className="text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <Loader2 className="w-24 h-24 text-red-500 animate-spin" />
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Summoning Your Inner Hunter...</h3>
            <p className="text-gray-400">Our AI is crafting your demon hunter persona (~30 seconds)</p>
          </div>
          <div className="w-full max-w-md mx-auto h-2 bg-black/50 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-600 to-orange-600 rounded-full animate-loading"></div>
          </div>
          
          {!emailSubmitted && onEmailSubmit && (
            <div className="mt-8 pt-8 border-t border-red-500/20">
              <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto space-y-4">
                <p className="text-white text-sm">💌 Want us to email you when it's ready?</p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com (optional)"
                  className="w-full px-4 py-3 bg-black/50 border border-red-500/30 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full px-4 py-3 bg-black/50 border border-red-500/30 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-full font-bold hover:scale-105 transition-transform duration-300"
                >
                  Notify Me 📧
                </button>
              </form>
            </div>
          )}
          
          {emailSubmitted && (
            <div className="mt-8 pt-8 border-t border-red-500/20">
              <p className="text-green-400">✅ We'll email you at {email} when it's ready!</p>
            </div>
          )}
        </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative bg-gradient-to-br from-red-950/20 to-orange-950/20 backdrop-blur-md border-2 border-dashed rounded-2xl p-6 md:p-8 transition-all duration-300 ${
        dragActive
          ? 'border-red-500 bg-red-950/40 scale-[1.02]'
          : 'border-red-500/30 hover:border-red-500/50'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      {previewUrls.length > 0 ? null : (
        <div className="text-center space-y-4">
          {/* Style Selection */}
          {!selectedStyle ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-lg md:text-xl font-bold text-white">Choose Your Style</h3>
                <p className="text-xs md:text-sm text-gray-400">
                  Pick your demon hunter aesthetic
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedStyle('kpop')}
                  className="group relative overflow-hidden rounded-xl border-2 border-purple-500/30 hover:border-purple-500 transition-all duration-300 active:scale-95"
                >
                  <div className="relative aspect-square">
                    <img 
                      src="/prompt-helpers/pop2.webp" 
                      alt="K-Pop Style Example"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                      <span className="block text-lg font-bold text-white">✨ K-Pop</span>
                      <span className="block text-xs text-purple-300">Idol Vibes</span>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setSelectedStyle('hunter')}
                  className="group relative overflow-hidden rounded-xl border-2 border-red-500/30 hover:border-red-500 transition-all duration-300 active:scale-95"
                >
                  <div className="relative aspect-square">
                    <img 
                      src="/prompt-helpers/hunters.png" 
                      alt="Hunter Style Example"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                      <span className="block text-lg font-bold text-white">🔥 Hunter</span>
                      <span className="block text-xs text-red-300">Warrior Mode</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedStyle === 'kpop' ? '✨' : '🔥'}</span>
                  <span className="font-bold text-white">
                    {selectedStyle === 'kpop' ? 'K-Pop Style' : 'Hunter Style'}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedStyle(null)}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Change
                </button>
              </div>
              
              <div className="relative w-12 h-12 md:w-14 md:h-14 mx-auto">
                <Upload className="w-12 h-12 md:w-14 md:h-14 text-red-500" />
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-lg"></div>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg md:text-xl font-bold text-white">Upload Your Selfie</h3>
                <p className="text-xs md:text-sm text-gray-400 max-w-sm mx-auto">
                  Tap to select or drag & drop • JPG/PNG
                </p>
              </div>

              <button
                onClick={handleButtonClick}
                className="w-full px-6 py-3 md:py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl font-bold text-base md:text-lg shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/70 transition-all duration-300 active:scale-95"
              >
                Choose Photo
              </button>
              
              <p className="text-xs text-orange-400/80 pt-1">
                💡 Use a clear front-facing photo
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
