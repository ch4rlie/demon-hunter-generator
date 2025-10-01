import { Sparkles } from 'lucide-react';
import { useRef } from 'react';
import ImageUploader from './ImageUploader';

interface HeroSectionProps {
  onImageUpload: (files: File[]) => void;
  onEmailSubmit?: (email: string, name?: string) => void;
  isProcessing: boolean;
  processedImages: string[];
}

export default function HeroSection({ onImageUpload, onEmailSubmit, isProcessing, processedImages }: HeroSectionProps) {
  const uploadRef = useRef<HTMLDivElement>(null);

  const scrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-black">
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center space-y-8 max-w-5xl mx-auto animate-fadeIn">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-950/50 backdrop-blur-md border border-red-500/30 rounded-full animate-pulse">
          <Sparkles className="w-5 h-5 text-red-500 animate-spin" />
          <span className="text-sm font-medium text-red-400">✨ Viral on TikTok • 50K+ Transformations</span>
        </div>

        {/* Main heading with more energy */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight">
          <span className="block text-white drop-shadow-2xl">
            From <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Selfie</span> to
          </span>
          <span className="block bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-clip-text text-transparent animate-gradient text-6xl md:text-8xl lg:text-9xl">
            DEMON HUNTER
          </span>
        </h1>

        {/* Subheading with K-pop energy */}
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Your <span className="text-red-400 font-bold">bias</span> meets <span className="text-orange-400 font-bold">demon slayer</span> aesthetics 🔥
          <span className="block mt-3 text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            Upload → Transform → Slay
          </span>
        </p>
        
        {/* Social proof tags */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
          <div className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
            <span className="text-green-400">✓</span> K-pop Style
          </div>
          <div className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
            <span className="text-green-400">✓</span> Anime Vibes
          </div>
          <div className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
            <span className="text-green-400">✓</span> Instant Results
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4">
          <button
            onClick={scrollToUpload}
            className="group relative px-12 py-6 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 rounded-full font-black text-2xl shadow-2xl shadow-red-500/50 hover:shadow-red-500/70 hover:scale-110 transition-all duration-300 overflow-hidden animate-pulse"
          >
            <span className="relative z-10 flex items-center gap-3">
              <span>🔥</span>
              TRANSFORM ME NOW
              <span>🔥</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-gradient"></div>
          </button>
          
          <p className="text-sm text-gray-400 text-center">
            ⚡ Takes 30 seconds • No signup required
          </p>
        </div>

        {/* Trending badge */}
        <div className="pt-4">
          <div className="inline-flex items-center gap-2 text-sm text-gray-400">
            <span className="text-2xl animate-bounce">🔥</span>
            <span>Trending #1 on TikTok</span>
            <span className="text-2xl animate-bounce" style={{ animationDelay: '0.1s' }}>🔥</span>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div ref={uploadRef} className="relative z-10 w-full max-w-4xl mx-auto mt-20 animate-fadeIn delay-700">
        <ImageUploader
          onImageUpload={onImageUpload}
          onEmailSubmit={onEmailSubmit}
          isProcessing={isProcessing}
          processedImages={processedImages}
        />
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full p-1">
          <div className="w-1.5 h-3 bg-red-500 rounded-full mx-auto animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
