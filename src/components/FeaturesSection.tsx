import { Zap, Shield, Sparkles, Wand2, Clock, Users } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Advanced AI processes your photos in seconds, delivering studio-quality transformations instantly.',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Elite Quality',
    description: 'Military-grade rendering technology ensures every detail is perfected for your demon hunter persona.',
    gradient: 'from-red-500 to-pink-500',
  },
  {
    icon: Sparkles,
    title: 'Authentic K-Pop Style',
    description: 'Trained on exclusive K-Pop aesthetics to capture that perfect idol-meets-warrior vibe.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Wand2,
    title: 'Magic Touch',
    description: 'Our AI adds dramatic lighting, intense eyes, and battle-ready styling automatically.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Clock,
    title: 'Instant Results',
    description: 'No waiting around. Upload and transform in under 30 seconds. Ready for social media immediately.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Users,
    title: 'Join the Legion',
    description: '50,000+ hunters have already discovered their inner warrior. Be part of the movement.',
    gradient: 'from-orange-500 to-red-500',
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/10 to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(220,38,38,0.08),transparent_70%)]"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/20 border border-red-500/30 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-300">Why Choose Us</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white">
            Unleash Your <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Inner Hunter</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Cutting-edge technology meets K-Pop aesthetics to create the ultimate transformation experience
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-red-500/50 transition-all duration-500 hover:scale-105"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 to-orange-600/0 group-hover:from-red-600/10 group-hover:to-orange-600/10 rounded-2xl transition-all duration-500"></div>

              <div className="relative space-y-4">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.gradient} p-0.5`}>
                  <div className="w-full h-full bg-black rounded-xl flex items-center justify-center">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-500/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
