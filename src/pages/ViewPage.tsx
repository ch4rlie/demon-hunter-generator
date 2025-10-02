import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function ViewPage() {
  const { shortId } = useParams<{ shortId: string }>();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState('Friend');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransformation = async () => {
      if (!shortId) {
        setError('Invalid transformation link');
        setLoading(false);
        return;
      }

      try {
        // Fetch from worker
        const response = await fetch(`${import.meta.env.VITE_WORKER_URL}/view/${shortId}`);
        
        if (!response.ok) {
          throw new Error('Transformation not found or expired');
        }

        // The worker returns HTML, but we need JSON for the React app
        // Let's make a direct DB query instead
        const text = await response.text();
        
        // Parse image URL from HTML (temporary solution)
        const imgMatch = text.match(/src="([^"]+)"/);
        const nameMatch = text.match(/Hey ([^,]+),/);
        
        if (imgMatch && imgMatch[1]) {
          setImageUrl(imgMatch[1]);
        }
        
        if (nameMatch && nameMatch[1]) {
          setUserName(nameMatch[1]);
        } else {
          setUserName('Friend');
        }
        
        if (!imgMatch) {
          throw new Error('Could not load image');
        }
        
      } catch (err) {
        console.error('Error loading transformation:', err);
        setError(err instanceof Error ? err.message : 'Failed to load transformation');
      } finally {
        setLoading(false);
      }
    };

    fetchTransformation();
  }, [shortId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-950 via-black to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading your transformation...</p>
        </div>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-950 via-black to-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-orange-500 mb-4">⚠️ Not Found</h1>
          <p className="text-white text-lg mb-8">{error || 'Transformation not found or expired'}</p>
          <a 
            href="/"
            className="inline-block bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition"
          >
            Create Your Own
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-950 via-black to-black flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 mb-4">
          🔥 Your Demon Hunter is Ready! 🔥
        </h1>
        <p className="text-white text-xl mb-8 opacity-80">
          Hey {userName}, your transformation is complete!
        </p>
        
        <div className="mb-8">
          <img 
            src={imageUrl} 
            alt="K-Pop Demon Hunter Transformation" 
            className="max-w-full max-h-[70vh] rounded-3xl shadow-2xl shadow-orange-500/30 mx-auto"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={imageUrl}
            download
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition"
          >
            Download Image
          </a>
          <a
            href="/"
            className="bg-white/10 text-white px-8 py-4 rounded-full font-bold text-lg border-2 border-white/20 hover:bg-white/20 transition"
          >
            Create Your Own
          </a>
        </div>
      </div>
    </div>
  );
}
