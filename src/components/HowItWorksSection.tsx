import { Upload, Cpu, Download, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    number: '01',
    title: 'Upload Your Photo',
    description: 'Drag and drop or select your best selfie. Multiple photos? Even better.',
    color: 'from-red-500 to-orange-500',
  },
  {
    icon: Cpu,
    number: '02',
    title: 'AI Works Its Magic',
    description: 'Our advanced neural networks analyze and transform your image with K-Pop demon hunter aesthetics.',
    color: 'from-orange-500 to-yellow-500',
  },
  {
    icon: CheckCircle2,
    number: '03',
    title: 'Instant Transformation',
    description: 'Watch in real-time as you become an elite hunter with stunning visual effects and details.',
    color: 'from-yellow-500 to-red-500',
  },
  {
    icon: Download,
    number: '04',
    title: 'Download & Share',
    description: 'Get your high-res transformed images ready for social media, profile pics, or printing.',
    color: 'from-red-500 to-pink-500',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/10 to-black"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-6xl font-black text-white">
            How It <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Four simple steps to becoming a legendary demon hunter
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
              style={{
                animationDelay: `${index * 150}ms`,
              }}
            >
              {/* Connecting line (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-red-500/50 to-transparent -z-10"></div>
              )}

              {/* Card */}
              <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-red-500/50 transition-all duration-500 hover:scale-105 h-full">
                {/* Number badge */}
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-black to-red-950 border-2 border-red-500 flex items-center justify-center font-black text-red-500">
                  {step.number}
                </div>

                <div className="space-y-4">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} p-0.5`}>
                    <div className="w-full h-full bg-black rounded-2xl flex items-center justify-center">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {/* Glow effect on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500 -z-10 blur-xl`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center space-y-6">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-red-950/50 to-orange-950/50 backdrop-blur-sm border border-red-500/30 rounded-full">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 border-2 border-black flex items-center justify-center font-bold text-sm"
                >
                  {i}
                </div>
              ))}
            </div>
            <span className="text-white font-semibold">Less than 30 seconds, start to finish</span>
          </div>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            No signup required. No credit card. No waiting. Just pure transformation magic.
          </p>
        </div>
      </div>
    </section>
  );
}
