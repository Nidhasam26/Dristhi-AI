import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSync } from '../context/SyncContext.jsx';
import { useConnectivity } from '../context/ConnectivityContext.jsx';
import { notificationService } from '../services/NotificationService.js';
import { onDeviceAI } from '../services/OnDeviceInferenceService.js';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import VoiceGuidancePanel from '../components/ui/VoiceGuidancePanel.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import {
  Settings2,
  RefreshCw,
  Wifi,
  WifiOff,
  Cpu,
  MessageSquare,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Database,
  Radio,
} from 'lucide-react';
import Button from '../components/ui/Button.jsx';

export default function Settings() {
  const { user, isOfflineSession } = useAuth();
  const { pendingCount, status, isProcessing, triggerSync, lastSyncTime, lastError } = useSync();
  const { isOnline, isSlow, effectiveType, latencyMs } = useConnectivity();
  const { language, languages, setLanguage } = useLanguage();

  const [providerInfo, setProviderInfo] = useState(notificationService.getProviderInfo());
  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
    onDeviceAI.checkModelAvailability().then(setModelInfo);
  }, []);

  return (
    <PageWrapper>
      <div className="dr-patient-screen" style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div className="dr-eyebrow">
            <span className="dr-live-dot" /> WORKSTATION PREFERENCES & DIAGNOSTICS
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 3.2vw, 34px)', fontWeight: 800, margin: 0, color: '#f0fdfa' }}>
            System Settings
          </h1>
          <p style={{ color: '#91b4af', fontSize: 14, margin: '4px 0 0 0' }}>
            Configure offline synchronization, rural voice guidance, hardware interfaces, and notification adapters
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: 'rgba(11, 36, 34, 0.6)', border: '1px solid rgba(34, 211, 238, 0.2)', borderRadius: 16, padding: 20 }}>
            <h4 style={{ margin: 0, color: '#f0fdfa', fontSize: 15 }}>App Language</h4>
            <p style={{ margin: '5px 0 12px', color: '#91b4af', fontSize: 12 }}>Change the language used for navigation and voice guidance.</p>
            <select aria-label="Application language" value={language} onChange={(event) => setLanguage(event.target.value)} style={{ minWidth: 220, padding: '9px 12px', borderRadius: 8, background: '#071f2c', color: '#fff', border: '1px solid rgba(34, 211, 238, 0.3)' }}>
              {languages.map((item) => <option key={item.code} value={item.code}>{item.native} ({item.name})</option>)}
            </select>
          </div>

          {/* 1. Voice Guidance Panel */}
          <VoiceGuidancePanel />

          {/* 2. Offline Sync & Local Queue Diagnostics */}
          <div
            style={{
              background: 'rgba(11, 36, 34, 0.6)',
              border: '1px solid rgba(34, 211, 238, 0.2)',
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(8, 145, 178, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                  <HardDrive size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#f0fdfa' }}>Offline Synchronization Engine</h4>
                  <p style={{ margin: 0, fontSize: 12, color: '#91b4af', marginTop: 2 }}>
                    IndexedDB persistent queue · FIFO order · Idempotent server dispatch
                  </p>
                </div>
              </div>

              <Button variant="primary" size="sm" onClick={triggerSync} disabled={isProcessing || !isOnline}>
                <RefreshCw size={14} className={isProcessing ? 'spinner-ai' : ''} />
                {isProcessing ? 'Syncing...' : 'Trigger Sync'}
              </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div>
                <span style={{ fontSize: 11, color: '#91b4af', textTransform: 'uppercase', fontWeight: 600 }}>Local Queue</span>
                <div style={{ fontSize: 18, fontWeight: 800, color: pendingCount > 0 ? '#facc15' : '#4ade80', marginTop: 2 }}>
                  {pendingCount} records pending
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: '#91b4af', textTransform: 'uppercase', fontWeight: 600 }}>Network Connection</span>
                <div style={{ fontSize: 14, fontWeight: 700, color: !isOnline ? '#f87171' : isSlow ? '#facc15' : '#4ade80', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {!isOnline ? <WifiOff size={15} /> : <Wifi size={15} />}
                  {!isOnline ? 'Offline' : isSlow ? `Slow (${effectiveType})` : `Online (${latencyMs ? latencyMs + 'ms' : 'Fast'})`}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: '#91b4af', textTransform: 'uppercase', fontWeight: 600 }}>Last Server Sync</span>
                <div style={{ fontSize: 13, color: '#cbd5e1', marginTop: 4 }}>
                  {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString('en-IN') : 'Not yet synced this session'}
                </div>
              </div>
            </div>

            {lastError && (
              <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={14} /> Last sync issue: {lastError}
              </div>
            )}
          </div>

          {/* 3. On-Device AI Model Status */}
          <div
            style={{
              background: 'rgba(11, 36, 34, 0.6)',
              border: '1px solid rgba(34, 211, 238, 0.2)',
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(8, 145, 178, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                <Cpu size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#f0fdfa' }}>On-Device AI Model Runtime</h4>
                <p style={{ margin: 0, fontSize: 12, color: '#91b4af', marginTop: 2 }}>
                  Edge neural network deployment for zero-connectivity retinal triage
                </p>
              </div>
            </div>

            <div style={{ padding: 14, borderRadius: 10, background: 'rgba(5, 24, 31, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: 13 }}>
              {modelInfo?.available ? (
                <div style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} />
                  <span>ONNX Neural Model Active · Version: {modelInfo.version}</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ color: '#facc15', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Radio size={16} />
                    <span>Inference Mode: Baseline Demonstration (MOCK)</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: '#91b4af' }}>
                    {modelInfo?.message || 'Place drishti_dr_model.onnx in /public/models/ to activate on-device neural tensor inference.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 4. SMS / WhatsApp Reminders Configuration */}
          <div
            style={{
              background: 'rgba(11, 36, 34, 0.6)',
              border: '1px solid rgba(34, 211, 238, 0.2)',
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(8, 145, 178, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                <MessageSquare size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#f0fdfa' }}>SMS & WhatsApp Reminders Gateway</h4>
                <p style={{ margin: 0, fontSize: 12, color: '#91b4af', marginTop: 2 }}>
                  Integration status with Indian SMS aggregators and Meta WhatsApp Business API
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div style={{ padding: 12, borderRadius: 10, background: 'rgba(5, 24, 31, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: 11, color: '#91b4af', textTransform: 'uppercase', fontWeight: 600 }}>SMS Gateway</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: providerInfo.smsProvider !== 'Not Configured' ? '#4ade80' : '#94a3b8', marginTop: 4 }}>
                  {providerInfo.smsProvider}
                </div>
              </div>

              <div style={{ padding: 12, borderRadius: 10, background: 'rgba(5, 24, 31, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: 11, color: '#91b4af', textTransform: 'uppercase', fontWeight: 600 }}>WhatsApp Business API</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: providerInfo.whatsappProvider !== 'Not Configured' ? '#4ade80' : '#94a3b8', marginTop: 4 }}>
                  {providerInfo.whatsappProvider}
                </div>
              </div>
            </div>

            {!providerInfo.isConfigured && (
              <p style={{ margin: '10px 0 0 0', fontSize: 12, color: '#91b4af' }}>
                ℹ Notification provider not configured. Configure <code>VITE_SMS_PROVIDER</code> and <code>VITE_WHATSAPP_PROVIDER</code> on your backend gateway to dispatch live SMS/WhatsApp messages.
              </p>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
