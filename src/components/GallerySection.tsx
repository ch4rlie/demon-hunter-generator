import { ArrowRight, Star } from 'lucide-react';

const examples = [
  {
    before: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800',
    name: 'Minjun',
    role: 'Shadow Blade',
    rating: 5,
    quote: 'I never knew I could look this fierce!',
  },
  {
    before: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=800',
    name: 'Yuna',
    role: 'Flame Dancer',
    rating: 5,
    quote: 'My friends thought it was a professional photoshoot.',
  },
  {
    before: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=800',
    name: 'Jihoon',
    role: 'Storm Bringer',
    rating: 5,
    quote: 'This is cooler than any filter out there.',
  },
  {
    before: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=800',
    name: 'Soyeon',
    role: 'Frost Queen',
    rating: 5,
    quote: 'Perfect for my social media profile!',
  },
  {
    before: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=800',
    name: 'Taehyung',
    role: 'Dark Phoenix',
    rating: 5,
    quote: 'The details are absolutely insane.',
  },
  {
    before: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=800',
    name: 'Chaeyoung',
    role: 'Eclipse Warrior',
    rating: 5,
    quote: 'I want to transform all my photos now!',
  },
];

export default function GallerySection() {
  return (
    <section id="gallery" className="relative py-32 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-orange-950/10 to-black"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-6xl font-black text-white">
            See the <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Transformation</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Real people. Real transformations. Unreal results.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {examples.map((example, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all duration-500"
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={example.before}
                  alt={example.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>

                {/* Before/After indicator */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-xs font-bold text-white border border-white/20">
                  TRANSFORMED
                </div>

                {/* Arrow indicator */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/50">
                    <ArrowRight className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(example.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />
                    ))}
                  </div>
                  <h3 className="text-xl font-bold text-white">{example.name}</h3>
                  <p className="text-sm text-orange-400 font-semibold">{example.role}</p>
                  <p className="text-sm text-gray-300 italic opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    "{example.quote}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-full font-bold text-lg shadow-lg shadow-orange-500/50 hover:shadow-xl hover:shadow-orange-500/70 transition-all duration-300 hover:scale-105"
          >
            <span className="flex items-center gap-2">
              Create Your Transformation
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
