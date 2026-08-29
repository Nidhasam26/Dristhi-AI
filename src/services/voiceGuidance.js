/**
 * Local Voice Guidance Service
 *
 * Utilizes the browser's native Web Speech API (speechSynthesis) to deliver
 * offline voice guidance for rural health workers without requiring cloud services.
 *
 * Languages: English (en-IN), Hindi (hi-IN), Kannada (kn-IN), Marathi (mr-IN)
 */

export const VOICE_LANGUAGES = [
  { code: 'en-IN', name: 'English (India)', native: 'English' },
  { code: 'hi-IN', name: 'Hindi', native: 'हिन्दी' },
  { code: 'mr-IN', name: 'Marathi', native: 'मराठी' },
  { code: 'kn-IN', name: 'Kannada', native: 'ಕನ್ನಡ' },
];

export const VOICE_PROMPTS = {
  patient_select: {
    'en-IN': 'Please select or register a patient.',
    'hi-IN': 'कृपया मरीज का चयन करें या नया पंजीकरण करें।',
    'mr-IN': 'कृपया रुग्णाची निवड करा किंवा नवीन नोंदणी करा.',
    'kn-IN': 'ದಯವಿಟ್ಟು ರೋಗಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ನೋಂದಾಯಿಸಿ.',
  },
  eye_right: {
    'en-IN': 'Please capture the right eye.',
    'hi-IN': 'कृपया दाहिनी आँख का फोटो लें।',
    'mr-IN': 'कृपया उजव्या डोळ्याचा फोटो घ्या.',
    'kn-IN': 'ದಯವಿಟ್ಟು ಬಲಗಣ್ಣಿನ ಚಿತ್ರವನ್ನು ಸೆರೆಹಿಡಿಯಿರಿ.',
  },
  eye_left: {
    'en-IN': 'Please capture the left eye.',
    'hi-IN': 'कृपया बाईं आँख का फोटो लें।',
    'mr-IN': 'कृपया डाव्या डोळ्याचा फोटो घ्या.',
    'kn-IN': 'ದಯವಿಟ್ಟು ಎಡಗಣ್ಣಿನ ಚಿತ್ರವನ್ನು ಸೆರೆಹಿಡಿಯಿರಿ.',
  },
  image_captured: {
    'en-IN': 'Image captured successfully.',
    'hi-IN': 'फोटो सफलतापूर्वक ले लिया गया है।',
    'mr-IN': 'फोटो यशस्वीरित्या घेतला गेला आहे.',
    'kn-IN': 'ಚಿತ್ರವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸೆರೆಹಿಡಿಯಲಾಗಿದೆ.',
  },
  quality_low: {
    'en-IN': 'Image quality is low. Please capture again.',
    'hi-IN': 'फोटो की गुणवत्ता कम है। कृपया दोबारा फोटो लें।',
    'mr-IN': 'फोटोची गुणवत्ता कमी आहे. कृपया पुन्हा फोटो घ्या.',
    'kn-IN': 'ಚಿತ್ರದ ಗುಣಮಟ್ಟ ಕಡಿಮೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಸೆರೆಹಿಡಿಯಿರಿ.',
  },
  quality_accepted: {
    'en-IN': 'Image quality accepted.',
    'hi-IN': 'फोटो की गुणवत्ता सही है।',
    'mr-IN': 'फोटोची गुणवत्ता मंजूर झाली आहे.',
    'kn-IN': 'ಚಿತ್ರದ ಗುಣಮಟ್ಟ ಸ್ವೀಕಾರಾರ್ಹವಾಗಿದೆ.',
  },
  analyzing: {
    'en-IN': 'AI is analyzing the retinal image. Please wait.',
    'hi-IN': 'एआई आँखों के परदे की जांच कर रहा है। कृपया प्रतीक्षा करें।',
    'mr-IN': 'एआय डोळ्याच्या पडद्याची तपासणी करत आहे. कृपया थांबा.',
    'kn-IN': 'ಎಐ ಕಣ್ಣಿನ ಪರದೆಯನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿದೆ. ದಯವಿಟ್ಟು ಕಾಯಿರಿ.',
  },
  saved_offline: {
    'en-IN': 'Saved offline. It will synchronize when network is available.',
    'hi-IN': 'ऑफलाइन सुरक्षित किया गया। नेटवर्क मिलने पर यह सिंक हो जाएगा।',
    'mr-IN': 'ऑफलाइन सेव्ह केले. नेटवर्क उपलब्ध झाल्यावर सिंक होईल.',
    'kn-IN': 'ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ. ನೆಟ್‌ವರ್ಕ್ ಸಿಕ್ಕಾಗ ಸಿಂಕ್ ಆಗುತ್ತದೆ.',
  },
  referral_required: {
    'en-IN': 'Specialist referral is recommended for this patient.',
    'hi-IN': 'इस मरीज के लिए विशेषज्ञ डॉक्टर से परामर्श आवश्यक है।',
    'mr-IN': 'या रुग्णासाठी नेत्रतज्ज्ञांचा सल्ला आवश्यक आहे.',
    'kn-IN': 'ಈ ರೋಗಿಗೆ ನೇತ್ರ ತಜ್ಞರ ಸಮಾಲೋಚನೆ ಅಗತ್ಯವಿದೆ.',
  },
  sync_completed: {
    'en-IN': 'All offline records have been synchronized.',
    'hi-IN': 'सभी ऑफलाइन रिकॉर्ड सिंक हो गए हैं।',
    'mr-IN': 'सर्व ऑफलाइन नोंदी सिंक झाल्या आहेत.',
    'kn-IN': 'ಎಲ್ಲಾ ಆಫ್‌ಲೈನ್ ದಾಖಲೆಗಳು ಸಿಂಕ್ ಆಗಿವೆ.',
  },
};

class VoiceGuidanceService {
  constructor() {
    this.enabled = localStorage.getItem('drishti_voice_enabled') === 'true';
    this.language = localStorage.getItem('drishti_voice_lang') || 'en-IN';
    this.volume = parseFloat(localStorage.getItem('drishti_voice_vol') || '1.0');
    this.muted = localStorage.getItem('drishti_voice_muted') === 'true';
    this.listeners = new Set();
    this.hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  setEnabled(val) {
    this.enabled = !!val;
    localStorage.setItem('drishti_voice_enabled', this.enabled ? 'true' : 'false');
    this.notify();
  }

  setLanguage(lang) {
    this.language = lang;
    localStorage.setItem('drishti_voice_lang', lang);
    this.notify();
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('drishti_voice_vol', String(this.volume));
    this.notify();
  }

  setMuted(mute) {
    this.muted = !!mute;
    localStorage.setItem('drishti_voice_muted', this.muted ? 'true' : 'false');
    if (this.muted && this.hasSpeech) {
      window.speechSynthesis.cancel();
    }
    this.notify();
  }

  speak(promptKey) {
    if (!this.enabled || this.muted) return;

    const promptObj = VOICE_PROMPTS[promptKey];
    if (!promptObj) return;

    const text = promptObj[this.language] || promptObj['en-IN'];
    if (!text) return;

    // Trigger haptic feedback where supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }

    if (!this.hasSpeech) return;

    try {
      window.speechSynthesis.cancel(); // cancel pending speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.language;
      utterance.volume = this.volume;
      utterance.rate = 0.95; // slightly slower for rural clarity

      // Attempt to pick a matching localized voice
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find((v) => v.lang.replace('_', '-') === this.language);
      if (match) utterance.voice = match;

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Voice speech synthesis error:', err);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener({
      enabled: this.enabled,
      language: this.language,
      volume: this.volume,
      muted: this.muted,
      hasSpeech: this.hasSpeech,
    });
    return () => this.listeners.delete(listener);
  }

  notify() {
    const payload = {
      enabled: this.enabled,
      language: this.language,
      volume: this.volume,
      muted: this.muted,
      hasSpeech: this.hasSpeech,
    };
    this.listeners.forEach((fn) => fn(payload));
  }
}

export const voiceService = new VoiceGuidanceService();
