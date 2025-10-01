import { Upload, Loader2, CheckCircle } from 'lucide-react';
import { useRef, useState, DragEvent } from 'react';

interface ImageUploaderProps {
  onImageUpload: (files: File[]) => void;
  onEmailSubmit?: (email: string, name?: string) => void;
  isProcessing: boolean;
  processedImages: string[];
}

export default function ImageUploader({
  onImageUpload,
  onEmailSubmit,
  isProcessing,
  processedImages,
}: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
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
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    onImageUpload(files);
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {processedImages.map((url, index) => (
            <div
              key={index}
              className="relative group rounded-2xl overflow-hidden border border-red-500/30 shadow-lg shadow-red-500/20"
            >
              <img
                src={url}
                alt={`Processed ${index + 1}`}
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4">
                  <span className="text-white font-bold">Hunter #{index + 1}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={clearImages}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-full font-bold hover:scale-105 transition-transform duration-300"
          >
            Transform Another Photo
          </button>
          <button className="px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full font-bold hover:bg-white/10 transition-all duration-300">
            Download All
          </button>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
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
    );
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative bg-gradient-to-br from-red-950/20 to-orange-950/20 backdrop-blur-md border-2 border-dashed rounded-3xl p-12 transition-all duration-300 ${
        dragActive
          ? 'border-red-500 bg-red-950/40 scale-105'
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
        <div className="text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <Upload className="w-20 h-20 text-red-500" />
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Drop Your Photos Here</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Or click to browse. Supports multiple images. JPG, PNG up to 10MB each.
            </p>
            <p className="text-sm text-orange-400 max-w-md mx-auto pt-2">
              ⚠️ <strong>Important:</strong> Upload photos with clear, visible human faces for best results
            </p>
          </div>

          <button
            onClick={handleButtonClick}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-full font-bold text-lg shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/70 transition-all duration-300 hover:scale-105"
          >
            Select Photos
          </button>
        </div>
      )}
    </div>
  );
}
