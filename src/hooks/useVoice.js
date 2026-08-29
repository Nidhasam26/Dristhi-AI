import { useEffect, useState, useCallback } from 'react';
import { voiceService, VOICE_LANGUAGES } from '../services/voiceGuidance.js';

export function useVoice() {
  const [settings, setSettings] = useState({
    enabled: voiceService.enabled,
    language: voiceService.language,
    volume: voiceService.volume,
    muted: voiceService.muted,
    hasSpeech: voiceService.hasSpeech,
  });

  useEffect(() => {
    const unsubscribe = voiceService.subscribe((state) => {
      setSettings(state);
    });
    return unsubscribe;
  }, []);

  const speak = useCallback((promptKey) => {
    voiceService.speak(promptKey);
  }, []);

  const setEnabled = useCallback((val) => voiceService.setEnabled(val), []);
  const setLanguage = useCallback((lang) => voiceService.setLanguage(lang), []);
  const setVolume = useCallback((vol) => voiceService.setVolume(vol), []);
  const setMuted = useCallback((mute) => voiceService.setMuted(mute), []);

  return {
    ...settings,
    speak,
    setEnabled,
    setLanguage,
    setVolume,
    setMuted,
    languages: VOICE_LANGUAGES,
  };
}
