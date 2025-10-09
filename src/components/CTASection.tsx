import { Upload, Sparkles, Zap } from 'lucide-react';

export default function CTASection() {
  const handleButtonClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-black to-orange-950/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.15),transparent_70%)]"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-red-500/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-xl animate-pulse delay-700"></div>
      <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-red-500/10 rounded-full blur-xl animate-pulse delay-300"></div>

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-12">
        {/* Main content */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/30 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="text-sm font-medium text-red-300">Ready to Transform?</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-black text-white leading-tight">
            Become the Hunter
            <br />
            <span className="bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-clip-text text-transparent animate-gradient">
              You Were Meant to Be
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Join 50,000+ people who have discovered their inner demon hunter. Your transformation is just one click away.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button
            onClick={handleButtonClick}
            className="group relative px-10 py-5 bg-gradient-to-r from-red-600 to-orange-600 rounded-full font-bold text-xl shadow-2xl shadow-red-500/50 hover:shadow-red-500/70 transition-all duration-300 hover:scale-110"
          >
            <span className="flex items-center gap-3">
              <Upload className="w-6 h-6" />
              Start Your Transformation
            </span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-600 to-orange-600 opacity-30 group-hover:opacity-50 blur-lg transition-opacity duration-300 -z-20"></div>
          </button>

          <button
            onClick={handleButtonClick}
            className="group px-10 py-5 bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-full font-bold text-xl hover:bg-white/10 hover:border-white/30 transition-all duration-300"
          >
            <span className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-orange-400 group-hover:animate-pulse" />
              See More Examples
            </span>
          </button>
        </div>

        {/* Trust indicators */}
        <div className="pt-12 space-y-6">
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">No signup required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Process in seconds</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">100% secure</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Free to try</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-6 border-t border-white/10">
            <div className="space-y-1">
              <div className="text-3xl font-black bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                50K+
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Hunters Created</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                4.9/5
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Average Rating</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                &lt;30s
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Processing Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
    </section>
  );
}
