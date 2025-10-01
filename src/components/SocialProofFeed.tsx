import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface Transformation {
  imageUrl: string;
  timestamp: string;
}

export default function SocialProofFeed() {
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecent();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRecent, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRecent = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_WORKER_URL}/recent`);
      const data = await response.json();
      setTransformations(data.transformations || []);
    } catch (error) {
      console.error('Failed to fetch recent transformations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-gradient-to-b from-black to-red-950/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-white/10 rounded-lg mx-auto mb-4"></div>
            <div className="h-4 w-96 bg-white/5 rounded mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (transformations.length === 0) {
    return null; // Don't show section if no transformations yet
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-black to-red-950/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.05),transparent_70%)]"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-red-500 animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Recent Transformations
            </h2>
            <Sparkles className="w-6 h-6 text-red-500 animate-pulse" />
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Join {transformations.length}+ hunters who've unlocked their demon slayer persona
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live feed • Updates every 30 seconds</span>
          </div>
        </div>

        {/* Feed Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {transformations.slice(0, 20).map((transformation, index) => (
            <div
              key={`${transformation.timestamp}-${index}`}
              className="group relative aspect-square rounded-xl overflow-hidden border border-red-500/20 hover:border-red-500/50 transition-all duration-300 hover:scale-105 animate-fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <img
                src={transformation.imageUrl}
                alt="Demon Hunter"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Overlay with time */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="text-xs text-white/80 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                    {getTimeAgo(transformation.timestamp)}
                  </div>
                </div>
              </div>
              
              {/* New badge for recent ones */}
              {index < 3 && (
                <div className="absolute top-2 right-2 bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  NEW
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">Ready to join them?</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-full font-bold text-lg shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/70 transition-all duration-300 hover:scale-105"
          >
            Transform Your Photo Now 🔥
          </button>
        </div>
      </div>
    </section>
  );
}
