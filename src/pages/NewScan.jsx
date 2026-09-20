import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { usePatients } from '../context/PatientContext.jsx';
import { useMockAI } from '../hooks/useMockAI.js';
import { useVoice } from '../hooks/useVoice.js';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import ImageUploader from '../components/scan/ImageUploader.jsx';
import FundusCameraControls from '../components/scan/FundusCameraControls.jsx';
import PatientForm from '../components/patient/PatientForm.jsx';
import AnimatedRetinaEye from '../components/ui/AnimatedRetinaEye.jsx';
import {
  Search,
  UserPlus,
  CheckCircle2,
  UploadCloud,
  ScanLine,
  BrainCircuit,
  ShieldCheck,
  ArrowRight,
  Eye,
  RotateCcw,
  Camera,
  Volume2,
} from 'lucide-react';

const stages = ['Patient', 'Retinal image', 'AI analysis'];
const checkpoints = [
  'Image received & normalized',
  'Quality gate verified',
  'Retina structure detected',
  'Vascular pattern mapping',
  'AI classification',
  'Risk calibration',
  'Explainability map',
];

export default function NewScan() {
  const { user } = useAuth();
  const { patients, addPatient, addScan, getPatientById } = usePatients();
  const { analyze, isAnalyzing, error } = useMockAI();
  const { speak } = useVoice();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [newPatient, setNewPatient] = useState(false);
  const [image, setImage] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [eye, setEye] = useState('right');
  const [phase, setPhase] = useState(0);
  const [saving, setSaving] = useState(false);
  const [quality, setQuality] = useState(true);
  const [showCameraModal, setShowCameraModal] = useState(false);

  useEffect(() => {
    if (location.state?.patientId) {
      const p = getPatientById(location.state.patientId);
      if (p) {
        setSelected(p);
        setStep(1);
      }
    }
  }, [location.state, getPatientById]);

  // Voice guidance trigger on step change
  useEffect(() => {
    if (step === 0) {
      speak('patient_select');
    } else if (step === 1) {
      speak(eye === 'right' ? 'eye_right' : 'eye_left');
    } else if (step === 2) {
      speak('analyzing');
    }
  }, [step, eye, speak]);

  const filtered = patients.filter((p) =>
    `${p.name} ${p.village} ${p.id}`.toLowerCase().includes(search.toLowerCase())
  );

  async function createPatient(data) {
    setSaving(true);
    const p = {
      ...data,
      created_by: user.id,
      created_at: new Date().toISOString().slice(0, 10),
    };
    const saved = await addPatient(p);
    setSaving(false);
    setSelected(saved);
    setNewPatient(false);
    setStep(1);
    speak('saved_offline');
  }

  async function runScan() {
    if (!selected || !image || !quality) return;
    setStep(2);
    setPhase(1);

    for (let i = 2; i <= checkpoints.length; i++) {
      await new Promise((r) => setTimeout(r, 450));
      setPhase(i);
    }

    const { success, result } = await analyze(image);
    if (!success) {
      setStep(1);
      return;
    }

    const scan = {
      patient_id: selected.id,
      scan_date: new Date().toISOString().slice(0, 10),
      eye,
      image_dataurl: image,
      thumbnail_url: thumbnail,
      ai_result: result,
      reviewed_by: null,
      doctor_notes: '',
      scanned_by: user.id,
    };

    const savedScan = await addScan(scan);
    if (result.grade >= 2) {
      speak('referral_required');
    } else {
      speak('saved_offline');
    }

    navigate(`/scan/${savedScan.id}`);
  }

  return (
    <PageWrapper>
      <div className="dr-scan-page cinematic-scan">
        <div className="dr-page-head">
          <div>
            <div className="dr-eyebrow">
              <span className="dr-live-dot" /> RETINAL SCREENING WORKSPACE
            </div>
            <h1>
              New <span>Retinal Scan</span>
            </h1>
            <p>Capture a fundus image and run the explainable screening pipeline.</p>
          </div>
          <div className="dr-scan-id">
            SESSION · {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div className="dr-stepper">
          {stages.map((s, i) => (
            <div key={s} className={`dr-step ${step === i ? 'active' : ''} ${step > i ? 'done' : ''}`}>
              <span>{step > i ? <CheckCircle2 size={17} /> : `0${i + 1}`}</span>
              <b>{s}</b>
              {i < 2 && <i />}
            </div>
          ))}
        </div>

        {/* STEP 0: Select / Register Patient */}
        {step === 0 && (
          <section className="dr-workspace-grid">
            <div className="dr-panel">
              <div className="dr-panel-head">
                <div>
                  <span className="dr-eyebrow">STEP 01</span>
                  <h3>Select patient</h3>
                </div>
                <UserPlus size={20} />
              </div>

              {!newPatient ? (
                <>
                  <div className="dr-search">
                    <Search size={17} />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search name, ID or village..."
                    />
                  </div>

                  <div className="dr-patient-list">
                    {filtered.map((p) => (
                      <button
                        className={`dr-patient ${selected?.id === p.id ? 'selected' : ''}`}
                        key={p.id}
                        onClick={() => {
                          setSelected(p);
                          setStep(1);
                          speak('patient_selected');
                        }}
                      >
                        <span className="dr-avatar">
                          <UserPlus size={15} />
                        </span>
                        <span>
                          <b>{p.name}</b>
                          <small>
                            {p.id} · {p.village || 'Location not set'}
                          </small>
                        </span>
                        <ArrowRight size={16} />
                      </button>
                    ))}
                  </div>

                  <button className="dr-secondary-btn" onClick={() => { setNewPatient(true); speak('register_patient'); }}>
                    <UserPlus size={16} /> Register new patient
                  </button>
                </>
              ) : (
                <PatientForm onSubmit={createPatient} onCancel={() => setNewPatient(false)} loading={saving} />
              )}
            </div>

            <div className="dr-panel dr-dark-panel">
              <div className="dr-panel-head">
                <div>
                  <span className="dr-eyebrow">SCREENING PREVIEW</span>
                  <h3>Retinal AI</h3>
                </div>
              </div>
              <AnimatedRetinaEye mode="ready" size={330} />
              <div className="dr-preview-note">
                <ShieldCheck size={16} /> Quality gate + explainability enabled
              </div>
            </div>
          </section>
        )}

        {/* STEP 1: Capture Retina */}
        {step === 1 && (
          <section className="dr-workspace-grid">
            <div className="dr-panel">
              <div className="dr-panel-head">
                <div>
                  <span className="dr-eyebrow">STEP 02</span>
                  <h3>Capture the retina</h3>
                </div>
                <UploadCloud size={20} />
              </div>

              <div className="dr-selected-patient">
                <div className="dr-avatar">
                  <Eye size={16} />
                </div>
                <div>
                  <b>{selected?.name}</b>
                  <small>
                    {selected?.id} · {selected?.village || 'Location not set'}
                  </small>
                </div>
                <button onClick={() => setStep(0)}>
                  <RotateCcw size={14} /> Change
                </button>
              </div>

              {showCameraModal ? (
                <FundusCameraControls
                  onCapture={(url) => {
                    setImage(url);
                    setShowCameraModal(false);
                    speak('image_captured');
                  }}
                  onCancel={() => setShowCameraModal(false)}
                />
              ) : (
                <>
                  <ImageUploader
                    onImageSelected={(url, name, thumb) => {
                      setImage(url);
                      setThumbnail(thumb);
                      speak('image_captured');
                    }}
                    onClear={() => {
                      setImage(null);
                      setThumbnail(null);
                    }}
                  />

                  {!image && <button type="button" className="dr-secondary-btn" onClick={() => speak('capture_image')}>
                    <Volume2 size={15} /> Hear capture instructions
                  </button>}

                  <div style={{ marginTop: 12, textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setShowCameraModal(true)}
                      className="dr-secondary-btn"
                      style={{ padding: '8px 14px', fontSize: 13 }}
                    >
                      <Camera size={15} /> Switch to Camera / Scope Capture
                    </button>
                  </div>
                </>
              )}

              {image && (
                <div className="dr-quality">
                  <span>
                    <CheckCircle2 size={16} /> Image loaded
                  </span>
                  <button
                    className={quality ? 'ok' : ''}
                    onClick={() => {
                      setQuality((q) => {
                        const nxt = !q;
                        speak(nxt ? 'quality_accepted' : 'quality_low');
                        return nxt;
                      });
                    }}
                  >
                    {quality ? 'Quality gate passed' : 'Quality gate paused'}
                  </button>
                </div>
              )}
            </div>

            <div className="dr-panel">
              <span className="dr-eyebrow">EYE SELECTION</span>
              <h3>Which eye?</h3>
              <div className="dr-eye-buttons">
                <button
                  className={eye === 'right' ? 'active' : ''}
                  onClick={() => {
                    setEye('right');
                    speak('eye_right');
                  }}
                >
                  <Eye size={20} /> Right eye<span>OD</span>
                </button>
                <button
                  className={eye === 'left' ? 'active' : ''}
                  onClick={() => {
                    setEye('left');
                    speak('eye_left');
                  }}
                >
                  <Eye size={20} /> Left eye<span>OS</span>
                </button>
              </div>

              <div className="dr-check-list">
                <div>
                  <CheckCircle2 size={15} /> JPEG / PNG / WebP supported
                </div>
                <div>
                  <CheckCircle2 size={15} /> Optimized for rural 2G/3G transmission
                </div>
                <div>
                  <CheckCircle2 size={15} /> AI output requires clinical review
                </div>
              </div>

              <button
                className="dr-primary-btn full"
                disabled={!image || !quality}
                onClick={() => {
                  speak('start_analysis');
                  runScan();
                }}
              >
                <ScanLine size={18} /> Start AI analysis <ArrowRight size={16} />
              </button>
            </div>
          </section>
        )}

        {/* STEP 2: Running AI Analysis */}
        {step === 2 && (
          <section className="dr-analysis">
            <div className="dr-analysis-visual">
              <div className="dr-analysis-frame">
                {image && <img src={image} alt="Retinal scan under analysis" />}
                <div className="dr-scan-line" />
                <div className="dr-corner c1" />
                <div className="dr-corner c2" />
                <div className="dr-corner c3" />
                <div className="dr-corner c4" />
                <div className="dr-analysis-tag">
                  <span className="dr-live-dot" /> LIVE AI ANALYSIS
                </div>
              </div>
              <h2>Analyzing retinal features</h2>
              <div className="dr-progress">
                <i style={{ width: `${Math.round((phase / checkpoints.length) * 100)}%` }} />
              </div>
              <b>{Math.round((phase / checkpoints.length) * 100)}%</b>
            </div>

            <div className="dr-panel dr-analysis-panel">
              <div className="dr-panel-head">
                <div>
                  <span className="dr-eyebrow">AI PIPELINE</span>
                  <h3>Explainable screening</h3>
                </div>
                <BrainCircuit size={22} />
              </div>

              {checkpoints.map((c, i) => (
                <div
                  className={`dr-checkpoint ${phase > i ? 'done' : ''} ${phase === i + 1 ? 'current' : ''}`}
                  key={c}
                >
                  {phase > i ? (
                    <CheckCircle2 size={17} />
                  ) : phase === i + 1 ? (
                    <span className="dr-spinner" />
                  ) : (
                    <span className="dr-empty-dot" />
                  )}
                  <span>{c}</span>
                  {phase > i && <small>COMPLETE</small>}
                </div>
              ))}

              <div className="dr-analysis-message">
                {error || 'DRISHTI AI is processing the image locally. Do not close this page.'}
              </div>
            </div>
          </section>
        )}

        <p className="dr-disclaimer">
          Screening decision support only. A qualified ophthalmologist must confirm findings before diagnosis or surgical treatment.
        </p>
      </div>
    </PageWrapper>
  );
}
