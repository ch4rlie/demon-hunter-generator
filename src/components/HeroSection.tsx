import { Sparkles } from 'lucide-react';
import ImageUploader from './ImageUploader';

interface HeroSectionProps {
  onImageUpload: (files: File[], style: 'kpop' | 'hunter') => void;
  onEmailSubmit?: (email: string, name?: string) => void;
  isProcessing: boolean;
  processedImages: string[];
  currentStyle?: 'kpop' | 'hunter';
  originalFile?: File;
}

export default function HeroSection({ onImageUpload, onEmailSubmit, isProcessing, processedImages, currentStyle, originalFile }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 md:py-16 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-black"></div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center space-y-4 md:space-y-6 max-w-5xl mx-auto w-full animate-fadeIn">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-950/50 backdrop-blur-md border border-red-500/30 rounded-full">
          <Sparkles className="w-4 h-4 text-red-500" />
          <span className="text-xs md:text-sm font-medium text-red-400">✨ 50K+ Transformations</span>
        </div>

        {/* Main heading - more compact */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
          <span className="block text-white drop-shadow-2xl">
            From <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Selfie</span> to
          </span>
          <span className="block bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-clip-text text-transparent animate-gradient text-5xl md:text-7xl lg:text-8xl">
            DEMON HUNTER
          </span>
        </h1>

        {/* Subheading - more compact */}
        <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto">
          Your <span className="text-red-400 font-bold">bias</span> meets <span className="text-orange-400 font-bold">demon slayer</span> aesthetics 🔥
        </p>
        
        {/* Social proof tags - compact */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm">
          <div className="px-3 py-1.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
            <span className="text-green-400">✓</span> K-pop Style
          </div>
          <div className="px-3 py-1.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
            <span className="text-green-400">✓</span> Anime Vibes
          </div>
          <div className="px-3 py-1.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
            <span className="text-green-400">✓</span> ~30 Seconds
          </div>
        </div>

        {/* Upload Section - immediately visible */}
        <div className="relative z-10 w-full max-w-3xl mx-auto pt-4 md:pt-6">
          <ImageUploader
            onImageUpload={onImageUpload}
            onEmailSubmit={onEmailSubmit}
            isProcessing={isProcessing}
            processedImages={processedImages}
            currentStyle={currentStyle}
            originalFile={originalFile}
          />
        </div>

        {/* Quick info */}
        <p className="text-xs md:text-sm text-gray-400 pt-2">
          ⚡ Free • No signup • Ready in 30 seconds
        </p>
      </div>
    </section>
  );
}
