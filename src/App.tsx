import { useState } from 'react';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import GallerySection from './components/GallerySection';
import HowItWorksSection from './components/HowItWorksSection';
import CTASection from './components/CTASection';
import { transformImage } from './lib/transformApi';

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState<string[]>([]);

  const handleImageUpload = async (files: File[]) => {
    setIsProcessing(true);
    setProcessedImages([]);

    try {
      const transformedImages: string[] = [];

      for (const file of files) {
        // Transform image with progress updates
        const imageUrl = await transformImage(file, (status) => {
          console.log(`Processing ${file.name}:`, status.status);
        });
        
        transformedImages.push(imageUrl);
      }

      setProcessedImages(transformedImages);
    } catch (error) {
      console.error('Error transforming images:', error);
      alert(error instanceof Error ? error.message : 'Failed to transform images. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <HeroSection
        onImageUpload={handleImageUpload}
        isProcessing={isProcessing}
        processedImages={processedImages}
      />
      <FeaturesSection />
      <GallerySection />
      <HowItWorksSection />
      <CTASection onImageUpload={handleImageUpload} />
    </div>
  );
}

export default App;
