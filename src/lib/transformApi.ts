// API client for Cloudflare Worker image transformation service

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787';

export interface TransformResponse {
  success: boolean;
  predictionId: string;
  status: string;
  statusUrl: string;
}

export interface StatusResponse {
  id: string;
  status: 'processing' | 'succeeded' | 'failed';
  imageUrl?: string;
  processingTime?: number;
  error?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Submit an image for transformation
 */
export async function submitTransformation(file: File, email?: string, name?: string): Promise<TransformResponse> {
  const formData = new FormData();
  formData.append('image', file);
  if (email) {
    formData.append('email', email);
  }
  if (name) {
    formData.append('name', name);
  }

  const response = await fetch(`${WORKER_URL}/transform`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to submit transformation');
  }

  return response.json();
}

/**
 * Check the status of a transformation
 */
export async function checkStatus(predictionId: string): Promise<StatusResponse> {
  const response = await fetch(`${WORKER_URL}/status/${predictionId}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to check status');
  }

  return response.json();
}

/**
 * Poll for transformation completion
 * @param predictionId - The prediction ID to poll
 * @param onProgress - Optional callback for progress updates
 * @param maxAttempts - Maximum number of polling attempts (default: 60)
 * @param pollInterval - Interval between polls in ms (default: 2000)
 */
export async function pollForCompletion(
  predictionId: string,
  onProgress?: (status: StatusResponse) => void,
  maxAttempts: number = 60,
  pollInterval: number = 2000
): Promise<StatusResponse> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const status = await checkStatus(predictionId);

    // Call progress callback if provided
    if (onProgress) {
      onProgress(status);
    }

    // Check if completed
    if (status.status === 'succeeded') {
      return status;
    }

    if (status.status === 'failed') {
      throw new Error(status.error || 'Transformation failed');
    }

    // Still processing, wait and try again
    await new Promise(resolve => setTimeout(resolve, pollInterval));
    attempts++;
  }

  throw new Error('Transformation timed out. Please try again.');
}

/**
 * Transform an image and wait for completion
 * Convenience function that combines submit + poll
 */
export async function transformImage(
  file: File,
  onProgress?: (status: StatusResponse) => void
): Promise<{ imageUrl: string; predictionId: string }> {
  // Submit the transformation (without email)
  const submitResponse = await submitTransformation(file, '', undefined);

  // Poll for completion
  const result = await pollForCompletion(
    submitResponse.predictionId,
    onProgress
  );

  if (!result.imageUrl) {
    throw new Error('No image URL in response');
  }

  return {
    imageUrl: result.imageUrl,
    predictionId: submitResponse.predictionId,
  };
}
