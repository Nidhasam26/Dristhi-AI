

import { useVoice } from '../../hooks/useVoice.js';
import { Volume2, VolumeX, Globe, Radio } from 'lucide-react';

export default function VoiceGuidancePanel() {
  const { enabled, language, volume, muted, languages, hasSpeech, voiceCount, voiceError, setEnabled, setLanguage, setVolume, setMuted, enableAndSpeak } =
    useVoice();

  return (
    <div
      style={{
        background: 'rgba(11, 36, 34, 0.6)',
        border: '1px solid rgba(34, 211, 238, 0.2)',
        borderRadius: 16,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(8, 145, 178, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
            }}
          >
            <Volume2 size={18} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#f0fdfa' }}>
              Local Voice Guidance
            </h4>
            <p style={{ margin: 0, fontSize: 12, color: '#91b4af', marginTop: 2 }}>
              Offline multi-language spoken instructions for screening steps
            </p>
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: '#0891b2', cursor: 'pointer' }}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: enabled ? '#38bdf8' : '#91b4af' }}>
            {enabled ? 'Active' : 'Disabled'}
          </span>
        </label>
      </div>

      {!enabled && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <span style={{ fontSize: 12, color: '#facc15' }}>
            {!hasSpeech ? 'Speech is not supported in this browser.' : voiceCount === 0 ? 'Install a system voice to hear guidance.' : 'Tap the button to hear spoken guidance.'}
          </span>
          <button
            type="button"
            onClick={() => enableAndSpeak('welcome')}
            disabled={!hasSpeech || voiceCount === 0}
            style={{ padding: '9px 14px', borderRadius: 8, background: hasSpeech && voiceCount > 0 ? '#0891b2' : '#475569', border: 0, color: '#fff', fontWeight: 700, cursor: hasSpeech && voiceCount > 0 ? 'pointer' : 'not-allowed' }}
          >
            <Volume2 size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Enable Voice
          </button>
        </div>
      )}

      {enabled && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {/* Language Selection */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#91b4af', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Globe size={13} /> Spoken Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(5, 24, 31, 0.8)',
                border: '1px solid rgba(34, 211, 238, 0.3)',
                color: '#fff',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 13,
                outline: 'none',
              }}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} style={{ background: '#071f2c' }}>
                  {lang.native} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* Volume Control */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#91b4af', display: 'flex', alignItems: 'center', gap: 6 }}>
                {muted ? <VolumeX size={13} color="#f87171" /> : <Volume2 size={13} />} Volume ({Math.round(volume * 100)}%)
              </label>
              <button
                type="button"
                onClick={() => setMuted(!muted)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: muted ? '#f87171' : '#38bdf8',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {muted ? 'Unmute' : 'Mute'}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              disabled={muted}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#0891b2', cursor: muted ? 'not-allowed' : 'pointer' }}
            />
          </div>

          {/* Test Voice Button */}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="button"
              onClick={() => enableAndSpeak('eye_right')}
              style={{
                width: '100%',
                padding: '8px 14px',
                borderRadius: 8,
                background: 'rgba(8, 145, 178, 0.2)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                color: '#38bdf8',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Radio size={14} /> Test Voice Prompt
            </button>
          </div>
        </div>
      )}

      {voiceError && (
        <p style={{ margin: 0, padding: 10, borderRadius: 8, background: 'rgba(250, 204, 21, 0.12)', border: '1px solid rgba(250, 204, 21, 0.3)', color: '#fde68a', fontSize: 12 }}>
          {voiceError}
        </p>
      )}
    </div>
  );
}
