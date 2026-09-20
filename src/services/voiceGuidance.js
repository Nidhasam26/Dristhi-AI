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
  language_changed: {
    'en-IN': 'Language changed. Voice guidance is now in English.',
    'hi-IN': 'भाषा बदल गई है। आवाज़ मार्गदर्शन अब हिंदी में है।',
    'mr-IN': 'भाषा बदलली आहे. आवाज मार्गदर्शन आता मराठीत आहे.',
    'kn-IN': 'ಭಾಷೆ ಬದಲಾಗಿದೆ. ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ ಈಗ ಕನ್ನಡದಲ್ಲಿದೆ.',
  },
  welcome: {
    'en-IN': 'Voice guidance is ready. You can choose English, Hindi, or Kannada.',
    'hi-IN': 'आवाज़ मार्गदर्शन तैयार है। आप अंग्रेज़ी, हिंदी या कन्नड़ चुन सकते हैं।',
    'mr-IN': 'आवाज मार्गदर्शन तयार आहे. तुम्ही इंग्रजी, हिंदी किंवा कन्नड निवडू शकता.',
    'kn-IN': 'ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ ಸಿದ್ಧವಾಗಿದೆ. ನೀವು ಇಂಗ್ಲಿಷ್, ಹಿಂದಿ ಅಥವಾ ಕನ್ನಡವನ್ನು ಆಯ್ಕೆ ಮಾಡಬಹುದು.',
  },
  patient_select: {
    'en-IN': 'Please select or register a patient.',
    'hi-IN': 'कृपया मरीज का चयन करें या नया पंजीकरण करें।',
    'mr-IN': 'कृपया रुग्णाची निवड करा किंवा नवीन नोंदणी करा.',
    'kn-IN': 'ದಯವಿಟ್ಟು ರೋಗಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ನೋಂದಾಯಿಸಿ.',
  },
  patient_selected: {
    'en-IN': 'Patient selected. Please choose the right eye or left eye and capture a clear retinal image.',
    'hi-IN': 'मरीज चुना गया है। दाईं या बाईं आँख चुनें और रेटिना की साफ तस्वीर लें।',
    'mr-IN': 'रुग्ण निवडला आहे. उजवा किंवा डावा डोळा निवडा आणि रेटिनाचा स्पष्ट फोटो घ्या.',
    'kn-IN': 'ರೋಗಿಯನ್ನು ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ. ಬಲ ಅಥವಾ ಎಡ ಕಣ್ಣನ್ನು ಆಯ್ಕೆ ಮಾಡಿ ರೆಟಿನಾದ ಸ್ಪಷ್ಟ ಚಿತ್ರವನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ.',
  },
  register_patient: {
    'en-IN': 'Please enter the patient details, then press Register Patient.',
    'hi-IN': 'कृपया मरीज की जानकारी भरें और फिर मरीज पंजीकृत करें दबाएं।',
    'mr-IN': 'कृपया रुग्णाची माहिती भरा आणि रुग्ण नोंदणी दाबा.',
    'kn-IN': 'ದಯವಿಟ್ಟು ರೋಗಿಯ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ, ನಂತರ ರೋಗಿಯನ್ನು ನೋಂದಾಯಿಸಿ ಒತ್ತಿರಿ.',
  },
  capture_image: {
    'en-IN': 'Please upload a retinal photo or use the camera. Make sure the image is clear.',
    'hi-IN': 'रेटिना की तस्वीर अपलोड करें या कैमरा इस्तेमाल करें। तस्वीर साफ होनी चाहिए।',
    'mr-IN': 'रेटिनाचा फोटो अपलोड करा किंवा कॅमेरा वापरा. फोटो स्पष्ट असावा.',
    'kn-IN': 'ರೆಟಿನಾದ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಕ್ಯಾಮೆರಾ ಬಳಸಿ. ಚಿತ್ರವು ಸ್ಪಷ್ಟವಾಗಿರಲಿ.',
  },
  start_analysis: {
    'en-IN': 'The image is ready. Press Start AI Analysis to continue.',
    'hi-IN': 'तस्वीर तैयार है। आगे बढ़ने के लिए एआई जांच शुरू करें दबाएं।',
    'mr-IN': 'फोटो तयार आहे. पुढे जाण्यासाठी एआय तपासणी सुरू करा दाबा.',
    'kn-IN': 'ಚಿತ್ರ ಸಿದ್ಧವಾಗಿದೆ. ಮುಂದುವರಿಯಲು ಎಐ ವಿಶ್ಲೇಷಣೆ ಪ್ರಾರಂಭಿಸಿ ಒತ್ತಿರಿ.',
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
  nav_dashboard: {
    'en-IN': 'Opening the command center.',
    'hi-IN': 'कमांड सेंटर खोला जा रहा है।',
    'mr-IN': 'कमांड सेंटर उघडत आहे.',
    'kn-IN': 'ಕಮಾಂಡ್ ಸೆಂಟರ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
  },
  nav_scan: {
    'en-IN': 'Opening new screening.',
    'hi-IN': 'नई जांच खोली जा रही है।',
    'mr-IN': 'नवीन तपासणी उघडत आहे.',
    'kn-IN': 'ಹೊಸ ತಪಾಸಣೆ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
  },
  nav_appointments: {
    'en-IN': 'Opening appointments.',
    'hi-IN': 'अपॉइंटमेंट खोले जा रहे हैं।',
    'mr-IN': 'अपॉइंटमेंट उघडत आहेत.',
    'kn-IN': 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳನ್ನು ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
  },
  nav_patients: {
    'en-IN': 'Opening the patient registry.',
    'hi-IN': 'मरीजों का रजिस्टर खोला जा रहा है।',
    'mr-IN': 'रुग्ण नोंदणी उघडत आहे.',
    'kn-IN': 'ರೋಗಿಗಳ ನೋಂದಣಿ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
  },
  nav_analytics: {
    'en-IN': 'Opening district analytics.',
    'hi-IN': 'जिला विश्लेषण खोला जा रहा है।',
    'mr-IN': 'जिल्हा विश्लेषण उघडत आहे.',
    'kn-IN': 'ಜಿಲ್ಲಾ ವಿಶ್ಲೇಷಣೆ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
  },
  nav_dataset: {
    'en-IN': 'Opening the dataset explorer.',
    'hi-IN': 'डेटासेट एक्सप्लोरर खोला जा रहा है।',
    'mr-IN': 'डेटासेट एक्सप्लोरर उघडत आहे.',
    'kn-IN': 'ಡೇಟಾಸೆಟ್ ಎಕ್ಸ್‌ಪ್ಲೋರರ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
  },
  nav_validation: {
    'en-IN': 'Opening clinical validation.',
    'hi-IN': 'क्लिनिकल वैलिडेशन खोला जा रहा है।',
    'mr-IN': 'क्लिनिकल व्हॅलिडेशन उघडत आहे.',
    'kn-IN': 'ಕ್ಲಿನಿಕಲ್ ಪರಿಶೀಲನೆ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
  },
  nav_settings: {
    'en-IN': 'Opening system settings.',
    'hi-IN': 'सिस्टम सेटिंग्स खोली जा रही हैं।',
    'mr-IN': 'सिस्टम सेटिंग्ज उघडत आहेत.',
    'kn-IN': 'ಸಿಸ್ಟಮ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
  },
  nav_admin: {
    'en-IN': 'Opening the admin workstation.',
    'hi-IN': 'एडमिन वर्कस्टेशन खोला जा रहा है।',
    'mr-IN': 'अॅडमिन वर्कस्टेशन उघडत आहे.',
    'kn-IN': 'ಅಡ್ಮಿನ್ ವರ್ಕ್‌ಸ್ಟೇಷನ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
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
    this.voiceCount = this.hasSpeech ? window.speechSynthesis.getVoices().length : 0;
    this.voiceError = '';

    if (this.hasSpeech) {
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        this.voiceCount = window.speechSynthesis.getVoices().length;
        this.notify();
      });
    }
  }

  setEnabled(val) {
    this.enabled = !!val;
    localStorage.setItem('drishti_voice_enabled', this.enabled ? 'true' : 'false');
    if (!this.enabled && this.hasSpeech) {
      window.speechSynthesis.cancel();
    }
    this.notify();
  }

  setLanguage(lang) {
    this.language = lang;
    this.voiceError = '';
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
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.language;
      utterance.volume = this.volume;
      utterance.rate = 0.95; // slightly slower for rural clarity

      // Attempt to pick a matching localized voice
      const voices = window.speechSynthesis.getVoices();
      this.voiceCount = voices.length;
      const normalizedLanguage = this.language.toLowerCase().replace('_', '-');
      const languageCode = normalizedLanguage.slice(0, 2);
      const match = voices.find((v) => v.lang.toLowerCase().replace('_', '-') === normalizedLanguage)
        || voices.find((v) => v.lang.toLowerCase().replace('_', '-').split('-')[0] === languageCode);

      if (!match) {
        this.voiceError = `No ${this.language} voice is installed. Install the matching system text-to-speech voice.`;
        this.notify();
        return;
      }

      this.voiceError = '';
      utterance.voice = match;

      utterance.onerror = (event) => {
        console.warn(`Voice playback failed (${event.error}). Install a ${this.language} system voice.`);
        this.notify();
      };
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
      voiceCount: this.voiceCount,
      voiceError: this.voiceError,
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
      voiceCount: this.voiceCount,
      voiceError: this.voiceError,
    };
    this.listeners.forEach((fn) => fn(payload));
  }
}

export const voiceService = new VoiceGuidanceService();
