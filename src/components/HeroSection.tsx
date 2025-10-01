import { Upload, Sparkles, Zap } from 'lucide-react';
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1),transparent_50%)]"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="relative z-10 max-w-6xl mx-auto text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/20 border border-red-500/30 backdrop-blur-sm animate-fadeIn">
          <Sparkles className="w-4 h-4 text-red-400" />
          <span className="text-sm font-medium text-red-300">Transform Your Reality</span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight animate-fadeIn">
          <span className="block bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-clip-text text-transparent animate-gradient">
            Become a
          </span>
          <span className="block mt-2 text-white">K-Pop Demon Hunter</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto animate-fadeIn delay-200">
          Upload your photo and watch as AI transforms you into an elite demon hunter from the most exclusive K-Pop universe.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeIn delay-300">
          <button
            onClick={scrollToUpload}
            className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-full font-bold text-lg shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/70 transition-all duration-300 hover:scale-105"
          >
            <span className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Your Photo
            </span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
          </button>

          <button
            onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-400" />
              See Examples
            </span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto animate-fadeIn delay-500">
          <div className="space-y-1">
            <div className="text-3xl md:text-4xl font-bold text-red-500">50K+</div>
            <div className="text-sm text-gray-400">Transformations</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl md:text-4xl font-bold text-orange-500">AI-Powered</div>
            <div className="text-sm text-gray-400">Technology</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl md:text-4xl font-bold text-red-500">Instant</div>
            <div className="text-sm text-gray-400">Results</div>
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
