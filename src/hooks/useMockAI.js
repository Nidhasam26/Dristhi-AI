/**
 * useMockAI — routes through OnDeviceInferenceService for AI prediction flow.
 * Returns classification result stamped with explicit inference_mode.
 */
import { useState, useCallback } from 'react';
import { onDeviceAI } from '../services/OnDeviceInferenceService.js';

export function useMockAI() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const analyze = useCallback(async (imageDataUrl) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await onDeviceAI.runInference(imageDataUrl);
      setIsAnalyzing(false);
      return { success: true, result };
    } catch (err) {
      setIsAnalyzing(false);
      setError('Analysis failed. Please try again.');
      return { success: false, result: null };
    }
  }, []);

  return { analyze, isAnalyzing, error };
}
