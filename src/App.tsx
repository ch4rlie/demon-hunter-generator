import { useState } from 'react';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import GallerySection from './components/GallerySection';
import SocialProofFeed from './components/SocialProofFeed';
import HowItWorksSection from './components/HowItWorksSection';
import CTASection from './components/CTASection';
import { transformImage } from './lib/transformApi';

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState<string[]>([]);
  const [currentPredictionId, setCurrentPredictionId] = useState<string | null>(null);

  const handleImageUpload = async (files: File[]) => {
    setIsProcessing(true);
    setProcessedImages([]);

    try {
      const transformedImages: string[] = [];

      for (const file of files) {
        // Transform image without email
        const result = await transformImage(file);
        transformedImages.push(result.imageUrl);
        setCurrentPredictionId(result.predictionId);
      }

      setProcessedImages(transformedImages);
    } catch (error) {
      console.error('Error transforming images:', error);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to transform images. Please try again.';
      
      if (errorMessage.includes('No human face detected')) {
        alert('⚠️ No Face Detected\n\nPlease upload a photo with a clear, visible human face. Make sure:\n• The face is well-lit\n• The person is looking at the camera\n• The face is not obscured');
      } else if (errorMessage.includes('safety filter')) {
        alert('⚠️ Image Not Allowed\n\nYour image was rejected by our safety filter. Please use an appropriate photo.');
      } else {
        alert('❌ Transformation Failed\n\n' + errorMessage + '\n\nTip: Try a different photo with better lighting and a clear face.');
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleEmailSubmit = async (email: string, name?: string) => {
    if (!currentPredictionId) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_WORKER_URL}/update-email/${currentPredictionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save email');
      }
    } catch (error) {
      console.error('Failed to save email:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <HeroSection
        onImageUpload={handleImageUpload}
        onEmailSubmit={handleEmailSubmit}
        isProcessing={isProcessing}
        processedImages={processedImages}
      />
      <FeaturesSection />
      <SocialProofFeed />
      <GallerySection />
      <HowItWorksSection />
      <CTASection onImageUpload={handleImageUpload} />
    </div>
  );
}

export default App;
