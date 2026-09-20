import { createContext, useContext, useMemo, useState } from 'react';
import { voiceService, VOICE_LANGUAGES } from '../services/voiceGuidance.js';

const LanguageContext = createContext(null);
const LANGUAGE_KEY = 'drishti_app_language';

const LABELS = {
  'en-IN': {
    language: 'Language', commandCenter: 'Command Center', newScreening: 'New Screening',
    appointments: 'Appointments', patientRegistry: 'Patient Registry', analytics: 'District Analytics',
    dataset: 'Dataset Explorer', validation: 'Clinical Validation', settings: 'System Settings',
    admin: 'Admin Workstation', enableVoice: 'Enable voice', hear: 'Hear',
  },
  'hi-IN': {
    language: 'भाषा', commandCenter: 'कमांड सेंटर', newScreening: 'नई जांच',
    appointments: 'अपॉइंटमेंट', patientRegistry: 'मरीज रजिस्टर', analytics: 'जिला विश्लेषण',
    dataset: 'डेटासेट', validation: 'क्लिनिकल जांच', settings: 'सिस्टम सेटिंग्स',
    admin: 'एडमिन वर्कस्टेशन', enableVoice: 'आवाज़ चालू करें', hear: 'सुनें',
  },
  'kn-IN': {
    language: 'ಭಾಷೆ', commandCenter: 'ಕಮಾಂಡ್ ಸೆಂಟರ್', newScreening: 'ಹೊಸ ತಪಾಸಣೆ',
    appointments: 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು', patientRegistry: 'ರೋಗಿಗಳ ನೋಂದಣಿ', analytics: 'ಜಿಲ್ಲಾ ವಿಶ್ಲೇಷಣೆ',
    dataset: 'ಡೇಟಾಸೆಟ್', validation: 'ಕ್ಲಿನಿಕಲ್ ಪರಿಶೀಲನೆ', settings: 'ಸಿಸ್ಟಮ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    admin: 'ಅಡ್ಮಿನ್ ವರ್ಕ್‌ಸ್ಟೇಷನ್', enableVoice: 'ಧ್ವನಿ ಸಕ್ರಿಯಗೊಳಿಸಿ', hear: 'ಕೇಳಿ',
  },
  'mr-IN': {
    language: 'भाषा', commandCenter: 'कमांड सेंटर', newScreening: 'नवीन तपासणी',
    appointments: 'अपॉइंटमेंट', patientRegistry: 'रुग्ण नोंदणी', analytics: 'जिल्हा विश्लेषण',
    dataset: 'डेटासेट', validation: 'क्लिनिकल तपासणी', settings: 'सिस्टम सेटिंग्ज',
    admin: 'अॅडमिन वर्कस्टेशन', enableVoice: 'आवाज सुरू करा', hear: 'ऐका',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem(LANGUAGE_KEY) || 'en-IN');

  const setLanguage = (nextLanguage) => {
    const wasAudible = voiceService.enabled && !voiceService.muted;
    setLanguageState(nextLanguage);
    localStorage.setItem(LANGUAGE_KEY, nextLanguage);
    voiceService.setLanguage(nextLanguage);
    if (wasAudible) voiceService.speak('language_changed');
  };

  const value = useMemo(() => ({
    language,
    languages: VOICE_LANGUAGES,
    labels: LABELS[language] || LABELS['en-IN'],
    setLanguage,
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}