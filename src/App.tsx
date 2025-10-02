import { useState, useRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import GallerySection from './components/GallerySection';
import SocialProofFeed from './components/SocialProofFeed';
import HowItWorksSection from './components/HowItWorksSection';
import CTASection from './components/CTASection';

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState<string[]>([]);
  const [currentPredictionId, setCurrentPredictionId] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);

  const handleImageUpload = async (files: File[]) => {
    setIsProcessing(true);
    setProcessedImages([]);

    try {
      const transformedImages: string[] = [];

      for (const file of files) {
        const captchaToken = await captchaRef.current?.execute();
        if (!captchaToken) {
          throw new Error('hCaptcha execution failed');
        }
        // Submit transformation and get prediction ID immediately
        const submitResponse = await fetch(`${import.meta.env.VITE_WORKER_URL}/transform`, {
          method: 'POST',
          body: (() => {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('captchaToken', captchaToken);
            return formData;
          })(),
        });

        if (!submitResponse.ok) {
          throw new Error('Failed to submit transformation');
        }

        const { predictionId } = await submitResponse.json();
        
        // Set prediction ID immediately so email form can use it
        setCurrentPredictionId(predictionId);

        // Now poll for completion
        const pollForResult = async (): Promise<string> => {
          for (let i = 0; i < 60; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const statusResponse = await fetch(`${import.meta.env.VITE_WORKER_URL}/status/${predictionId}`);
            const statusData = await statusResponse.json();
            
            if (statusData.status === 'succeeded' && statusData.imageUrl) {
              return statusData.imageUrl;
            }
            
            if (statusData.status === 'failed') {
              throw new Error(statusData.error || 'Transformation failed');
            }
          }
          throw new Error('Transformation timed out');
        };

        const imageUrl = await pollForResult();
        transformedImages.push(imageUrl);
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
    }
    finally {
      setIsProcessing(false);
    }
  };
  
  const handleEmailSubmit = async (email: string, name?: string) => {
    if (!currentPredictionId) {
      console.error('No prediction ID available');
      alert('Error: Please wait for the transformation to start before submitting email');
      return;
    }
    
    console.log('Submitting email for prediction:', currentPredictionId);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_WORKER_URL}/update-email/${currentPredictionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Email submission failed:', errorText);
        throw new Error('Failed to save email');
      }
      
      console.log('Email submitted successfully');
    } catch (error) {
      console.error('Failed to save email:', error);
      alert('Failed to save email. You can still see the result on screen!');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <HCaptcha
        ref={captchaRef}
        sitekey="2cc02a96-b858-43b4-bcf0-9b9c08209cbe"
        size="invisible"
      />
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
      <CTASection />
      
      {/* Footer with disclaimer */}
      <footer className="bg-black border-t border-white/10 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <p className="text-gray-400 text-sm">
            © 2025 KpopDemonz.com • AI-Powered Photo Transformation
          </p>
          <p className="text-gray-500 text-xs">
            Not affiliated with any K-pop entertainment companies, agencies, or artists. 
            All transformations are AI-generated fan art for entertainment purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
