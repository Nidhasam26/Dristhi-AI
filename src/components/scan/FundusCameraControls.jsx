import { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, AlertCircle, Video, CheckCircle2, ShieldAlert } from 'lucide-react';
import { fundusCameraService, CameraMode } from '../../services/FundusCameraService.js';
import Button from '../ui/Button.jsx';

export default function FundusCameraControls({ onCapture, onCancel }) {
  const [mode, setMode] = useState(CameraMode.WEBCAM);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  const adapter = fundusCameraService.getAdapter(mode);

  const startCamera = async (selectedMode) => {
    setError(null);
    setConnecting(true);
    const targetAdapter = fundusCameraService.getAdapter(selectedMode);

    try {
      if (selectedMode === CameraMode.WEBCAM) {
        await targetAdapter.connect(videoRef.current);
        setConnected(true);
        setStatusMessage('Live camera stream active');
      } else if (selectedMode === CameraMode.MOCK) {
        await targetAdapter.connect();
        setConnected(true);
        setStatusMessage('Connected to Virtual Fundus Scope (Simulation)');
      } else if (selectedMode === CameraMode.VENDOR) {
        const res = await targetAdapter.connect();
        setConnected(false);
        setStatusMessage(res.message);
      }
    } catch (err) {
      setError(err.message);
      setConnected(false);
    } finally {
      setConnecting(false);
    }
  };

  const stopCamera = async () => {
    if (adapter) {
      await adapter.disconnect();
    }
    setConnected(false);
    setStatusMessage('');
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [mode]);

  const handleCapture = async () => {
    if (!adapter) return;
    try {
      const res = await adapter.captureImage();
      if (res.success && res.imageDataUrl) {
        await stopCamera();
        onCapture(res.imageDataUrl);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        background: 'rgba(5, 24, 31, 0.7)',
        border: '1px solid rgba(34, 211, 238, 0.25)',
        borderRadius: 16,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h4 style={{ margin: 0, color: '#f0fdfa', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Camera size={18} color="#38bdf8" /> Fundus Scope Interface
          </h4>
          <p style={{ margin: 0, fontSize: 12, color: '#91b4af', marginTop: 2 }}>
            Connect a mobile ophthalmic adapter, direct USB scope, or simulation scope
          </p>
        </div>

        {/* Source Selector */}
        <div style={{ display: 'flex', gap: 6, background: 'rgba(6, 20, 27, 0.8)', padding: 4, borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setMode(CameraMode.WEBCAM);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: 'none',
              background: mode === CameraMode.WEBCAM ? 'rgba(8, 145, 178, 0.4)' : 'transparent',
              color: mode === CameraMode.WEBCAM ? '#38bdf8' : '#91b4af',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Device Camera
          </button>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setMode(CameraMode.MOCK);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: 'none',
              background: mode === CameraMode.MOCK ? 'rgba(8, 145, 178, 0.4)' : 'transparent',
              color: mode === CameraMode.MOCK ? '#38bdf8' : '#91b4af',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Simulated Scope
          </button>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setMode(CameraMode.VENDOR);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: 'none',
              background: mode === CameraMode.VENDOR ? 'rgba(8, 145, 178, 0.4)' : 'transparent',
              color: mode === CameraMode.VENDOR ? '#38bdf8' : '#91b4af',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Vendor SDK
          </button>
        </div>
      </div>

      {/* Video Preview or Status View */}
      <div
        style={{
          width: '100%',
          minHeight: 240,
          background: '#041219',
          borderRadius: 12,
          border: '1px solid rgba(34, 211, 238, 0.15)',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {mode === CameraMode.WEBCAM && (
          <video
            ref={videoRef}
            playsInline
            muted
            style={{
              width: '100%',
              maxHeight: 340,
              objectFit: 'cover',
              display: connected ? 'block' : 'none',
            }}
          />
        )}

        {!connected && (
          <div style={{ textAlign: 'center', padding: 30, color: '#91b4af', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            {mode === CameraMode.VENDOR ? (
              <>
                <ShieldAlert size={36} color="#facc15" />
                <strong style={{ color: '#fde047', fontSize: 14 }}>Vendor Hardware SDK Not Installed</strong>
                <p style={{ margin: 0, fontSize: 12, maxWidth: 360, color: '#cbd5e1' }}>
                  Direct hardware integration is supported for Remidio, Forus 3nethra, and Volk devices. Install the device companion driver on this workstation to connect.
                </p>
              </>
            ) : (
              <>
                <Video size={36} color="#38bdf8" />
                <span style={{ fontSize: 13 }}>Camera stream not started</span>
                <Button variant="primary" size="sm" onClick={() => startCamera(mode)} disabled={connecting}>
                  {connecting ? 'Connecting...' : 'Start Camera'}
                </Button>
              </>
            )}
          </div>
        )}

        {connected && mode === CameraMode.MOCK && (
          <div style={{ textAlign: 'center', padding: 24, color: '#38bdf8' }}>
            <CheckCircle2 size={32} style={{ marginBottom: 8 }} />
            <div><strong>Simulated Fundus Scope Ready</strong></div>
            <small style={{ color: '#94a3b8' }}>Demo mode generates standardized diagnostic fundus sample</small>
          </div>
        )}
      </div>

      {error && (
        <div style={{ color: '#f87171', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{ background: 'transparent', border: 'none', color: '#91b4af', fontSize: 13, cursor: 'pointer' }}
        >
          Use File Upload Instead
        </button>

        {connected && (
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="outline" size="sm" onClick={stopCamera}>
              Stop Camera
            </Button>
            <Button variant="primary" size="sm" onClick={handleCapture}>
              <Camera size={15} /> Capture Retinal Image
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
