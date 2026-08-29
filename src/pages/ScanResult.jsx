import { useCallback, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { usePatients } from '../context/PatientContext.jsx';
import { useAppointments } from '../context/AppointmentContext.jsx';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import HeatmapOverlay from '../components/scan/HeatmapOverlay.jsx';
import SeverityGauge from '../components/scan/SeverityGauge.jsx';
import RecommendationCard from '../components/scan/RecommendationCard.jsx';
import ProgressionLens from '../components/scan/ProgressionLens.jsx';
import Button from '../components/ui/Button.jsx';
import SyncStatusBadge from '../components/ui/SyncStatusBadge.jsx';
import { DRBadge } from '../components/ui/Badge.jsx';
import {
  ArrowLeft, User, CheckCircle2, Clock, Save, Edit3,
  ShieldCheck, Activity, ScanLine, BrainCircuit, Eye, FileText,
  RotateCcw, AlertTriangle, ChevronRight, Sparkles, Info, Download, X,
  Stethoscope, Calendar, Radio
} from 'lucide-react';
import { getDRInfo } from '../utils/drClassification.js';
import './ScanResult.css';

const PIPELINE_STEPS = [
  { title: 'Image quality', description: 'Image received and quality-gated' },
  { title: 'Retina detection', description: 'Fundus region identified' },
  { title: 'Vessel mapping', description: 'Retinal structure mapped' },
  { title: 'AI classification', description: 'DR grade estimated' },
  { title: 'Risk calibration', description: 'Confidence and severity reviewed' },
];

const EXPLANATION_TABS = [
  { id: 'pipeline', label: 'Analysis pipeline', icon: Activity },
  { id: 'meaning', label: 'What this means', icon: Info },
];

function riskToneForGrade(grade) {
  if (grade >= 3) return 'danger';
  if (grade === 2) return 'warning';
  return 'safe';
}

function Stat({ icon: Icon, label, value, tone = 'teal' }) {
  return (
    <div className={`result-stat result-stat-${tone}`}>
      <div className="result-stat-icon" aria-hidden="true"><Icon size={17} /></div>
      <div>
        <div className="result-stat-label">{label}</div>
        <div className="result-stat-value">{value}</div>
      </div>
    </div>
  );
}

function Pipeline() {
  return (
    <div className="result-pipeline">
      {PIPELINE_STEPS.map(({ title, description }, index) => (
        <div className="pipeline-row" key={title}>
          <div className="pipeline-dot" aria-hidden="true"><CheckCircle2 size={15} /></div>
          <div className="pipeline-copy">
            <strong>{title}</strong>
            <span>{description}</span>
          </div>
          {index < PIPELINE_STEPS.length - 1 && <div className="pipeline-line" aria-hidden="true" />}
        </div>
      ))}
    </div>
  );
}

function ScanNotFound() {
  return (
    <PageWrapper>
      <div className="result-empty card">
        <div className="result-empty-icon" aria-hidden="true"><ScanLine size={28} /></div>
        <h2>Scan not found</h2>
        <p>
          This screening record does not exist, has been deleted, or you are not authorized to view it.
          Each retinal scan is private to the account it belongs to.
        </p>
        <Link to="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
      </div>
    </PageWrapper>
  );
}

export default function ScanResult() {
  const { id } = useParams();
  const { user } = useAuth();
  const { getScanById, getPatientById, updateScan, getPatientScans } = usePatients();
  const { getAppointmentForScan } = useAppointments();
  const navigate = useNavigate();

  const scan = getScanById(id);
  const patient = scan ? getPatientById(scan.patient_id) : null;
  const patientScans = patient ? getPatientScans(patient.id) : [];
  const linkedAppointment = scan ? getAppointmentForScan(scan.id) : null;

  const [notes, setNotes] = useState(scan?.doctor_notes ?? '');
  const [decision, setDecision] = useState(scan?.doctor_decision || (scan?.reviewed_by ? 'approved' : null));
  const [overriddenGrade, setOverriddenGrade] = useState(scan?.overridden_grade ?? scan?.ai_result?.grade ?? 0);
  const [showOverride, setShowOverride] = useState(false);
  const [showProgression, setShowProgression] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeExplanation, setActiveExplanation] = useState('pipeline');

  const effectiveGrade = showOverride ? overriddenGrade : scan?.ai_result?.grade ?? 0;
  const riskTone = useMemo(() => riskToneForGrade(effectiveGrade), [effectiveGrade]);

  // Single save path shared by both "approve/modify" and "save notes" actions,
  // so the update payload can't drift between the two call sites.
  const persistScan = useCallback(async (nextDecision) => {
    if (!scan) return;
    setSaving(true);
    await updateScan(scan.id, {
      doctor_notes: notes,
      reviewed_by: user.id,
      doctor_decision: nextDecision,
      overridden_grade: showOverride ? overriddenGrade : null,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, [scan, notes, user, showOverride, overriddenGrade, updateScan]);

  const handleDecision = useCallback((nextDecision) => {
    setDecision(nextDecision);
    persistScan(nextDecision);
  }, [persistScan]);

  const handleModify = useCallback(() => {
    setShowOverride(true);
    handleDecision('modified');
  }, [handleDecision]);

  const handleSaveNotes = useCallback(() => {
    persistScan(decision || 'reviewed');
  }, [persistScan, decision]);

  if (!scan) return <ScanNotFound />;

  const info = getDRInfo(effectiveGrade);
  const confidence = Math.round((scan.ai_result.confidence || 0) * 100);
  const date = new Date(scan.scan_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const fullDate = new Date(scan.scan_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <PageWrapper>
      <div className="result-page cinematic-result">
        {/* HEADER */}
        <header className="result-header">
          <div className="result-header-left">
            <button className="result-back" onClick={() => navigate(-1)} aria-label="Go back">
              <ArrowLeft size={19} />
            </button>
            <div>
              <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span className="live-dot" aria-hidden="true" /> Analysis complete
                <SyncStatusBadge status={scan.sync_status} />
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(14, 116, 144, 0.25)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  Inference Mode: {scan.ai_result?.inference_mode || 'MOCK (Baseline Simulation)'}
                </span>
              </div>
              <h1>Retinal Risk Assessment</h1>
              <p>{patient?.name || 'Anonymous patient'} · {scan.eye === 'right' ? 'Right eye (OD)' : 'Left eye (OS)'} · {fullDate}</p>
            </div>
          </div>
          <div className="result-header-actions">
            {patientScans.length > 1 && (
              <Button
                variant={showProgression ? 'primary' : 'outline'}
                size="sm"
                icon={Activity}
                onClick={() => setShowProgression((v) => !v)}
                aria-pressed={showProgression}
              >
                {showProgression ? 'Hide Progression' : 'Progression Lens'}
              </Button>
            )}
            {patient && (
              <Link to={`/patients/${patient.id}`} className="no-decoration">
                <Button variant="outline" icon={User} size="sm">Patient Dossier</Button>
              </Link>
            )}
          </div>
        </header>

        {/* TOP STATUS STRIP */}
        <section className="result-status-strip" aria-label="Screening status summary">
          <Stat icon={ShieldCheck} label="Image quality" value="Passed" tone="safe" />
          <Stat icon={Eye} label="Eye screened" value={scan.eye === 'right' ? 'Right / OD' : 'Left / OS'} />
          <Stat icon={BrainCircuit} label="AI confidence" value={`${confidence}%`} tone={confidence >= 85 ? 'safe' : 'warning'} />
          <Stat icon={FileText} label="Clinical status" value={scan.reviewed_by ? 'Reviewed' : 'Awaiting review'} tone={scan.reviewed_by ? 'safe' : 'warning'} />
        </section>

        {/* ── CINEMATIC PROMINENT DOCTOR APPOINTMENT CTA ── */}
        <section
          className="animate-slide-up"
          style={{
            marginBottom: 'var(--space-6)',
            padding: '24px 28px',
            borderRadius: 20,
            background: linkedAppointment
              ? 'linear-gradient(135deg, rgba(8, 145, 178, 0.25) 0%, rgba(6, 24, 33, 0.95) 100%)'
              : effectiveGrade >= 2
              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(6, 36, 42, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(7, 31, 44, 0.95) 100%)',
            border: linkedAppointment
              ? '1.5px solid rgba(34, 197, 94, 0.45)'
              : '1.5px solid rgba(34, 211, 238, 0.45)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4), 0 0 25px rgba(34, 211, 238, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: 640 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: linkedAppointment
                  ? 'rgba(34, 197, 94, 0.2)'
                  : 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
                border: linkedAppointment
                  ? '1.5px solid rgba(34, 197, 94, 0.4)'
                  : '1.5px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: linkedAppointment ? '#4ade80' : '#ffffff',
                flexShrink: 0,
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              }}
            >
              <Stethoscope size={26} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: linkedAppointment ? '#4ade80' : '#22d3ee',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  {linkedAppointment ? 'APPOINTMENT SCHEDULED' : 'CLINICAL REVIEW RECOMMENDED'}
                </span>
                {effectiveGrade >= 2 && !linkedAppointment && (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: 'rgba(245, 158, 11, 0.25)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      color: '#fbbf24',
                      fontSize: 10.5,
                      fontWeight: 800,
                    }}
                  >
                    PRIORITY FOLLOW-UP
                  </span>
                )}
              </div>

              <h2
                style={{
                  fontSize: 'clamp(17px, 2.2vw, 21px)',
                  fontWeight: 800,
                  color: '#f0fdfa',
                  margin: '4px 0 2px',
                  letterSpacing: '-0.01em',
                }}
              >
                {linkedAppointment
                  ? `Consultation Booked with ${linkedAppointment.doctorName}`
                  : 'Connect with a Retinal Specialist for Clinical Evaluation'}
              </h2>

              <p style={{ fontSize: 13, color: '#91b4af', margin: 0, lineHeight: 1.4 }}>
                {linkedAppointment
                  ? `Scheduled on ${new Date(linkedAppointment.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at ${linkedAppointment.time} · Status: ${linkedAppointment.status.toUpperCase()}`
                  : `AI findings indicate ${info.fullLabel}. Timely clinical assessment by an ophthalmologist is recommended.`}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {linkedAppointment ? (
              <Link to={`/appointments/${linkedAppointment.id}`} style={{ textDecoration: 'none' }}>
                <Button variant="primary" icon={ArrowRight}>
                  View Appointment Details
                </Button>
              </Link>
            ) : (
              <Link
                to={`/appointments/book?scanId=${scan.id}&patientId=${scan.patient_id}`}
                style={{ textDecoration: 'none' }}
              >
                <button
                  type="button"
                  className="dr-primary-btn"
                  style={{
                    padding: '14px 24px',
                    fontSize: 14,
                    fontWeight: 800,
                    boxShadow: '0 8px 24px rgba(8, 145, 178, 0.5), 0 0 20px rgba(34, 211, 238, 0.25)',
                  }}
                >
                  <Calendar size={18} /> BOOK DOCTOR APPOINTMENT
                </button>
              </Link>
            )}
          </div>
        </section>

        {showProgression && (
          <section className="result-progress card animate-slide-up">
            <div className="result-section-heading">
              <div>
                <div className="eyebrow">Longitudinal view</div>
                <h2>Retinopathy Progression Lens</h2>
              </div>
              <button className="icon-close" onClick={() => setShowProgression(false)} aria-label="Close progression view">
                <X size={16} />
              </button>
            </div>
            <ProgressionLens scans={patientScans} />
          </section>
        )}

        {/* HERO GRID */}
        <section className="result-hero-grid">
          {/* LEFT: EXPLAINABILITY */}
          <div className="result-main-card result-visual-card">
            <div className="result-card-heading">
              <div>
                <div className="eyebrow">Explainable AI</div>
                <h2>What the model is seeing</h2>
              </div>
              <span className="ai-chip"><Sparkles size={13} aria-hidden="true" /> AI assist</span>
            </div>

            <HeatmapOverlay imageDataUrl={scan.image_dataurl} gradcamData={scan.ai_result.gradcam_data} />

            <div className="explain-tabs" role="tablist" aria-label="Explanation view">
              {EXPLANATION_TABS.map(({ id: tabId, label, icon: Icon }) => (
                <button
                  key={tabId}
                  role="tab"
                  id={`tab-${tabId}`}
                  aria-selected={activeExplanation === tabId}
                  aria-controls={`panel-${tabId}`}
                  className={activeExplanation === tabId ? 'active' : ''}
                  onClick={() => setActiveExplanation(tabId)}
                >
                  <Icon size={14} aria-hidden="true" /> {label}
                </button>
              ))}
            </div>

            <div role="tabpanel" id={`panel-${activeExplanation}`} aria-labelledby={`tab-${activeExplanation}`}>
              {activeExplanation === 'pipeline' ? (
                <Pipeline />
              ) : (
                <div className="meaning-panel">
                  <Info size={18} aria-hidden="true" />
                  <div>
                    <strong>Decision-support visualization</strong>
                    <p>The heatmap shows model attention/attribution regions. It is not a lesion map and does not replace clinical examination.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: RESULT */}
          <div className="result-side-column">
            <div className={`result-verdict-card ${riskTone}`}>
              <div className="verdict-topline">
                <span><span className="pulse-ring" aria-hidden="true" /> AI risk assessment</span>
                <span className="verdict-id">#{scan.id}</span>
              </div>
              <div className="verdict-grade-row">
                <div>
                  <div className="verdict-kicker">Current finding</div>
                  <div className="verdict-label">{info.fullLabel}</div>
                  <p>{info.shortLabel || info.description || 'AI-assisted retinal classification.'}</p>
                </div>
                <div className="confidence-orb">
                  <span>{confidence}%</span>
                  <small>confidence</small>
                </div>
              </div>
              <div className="verdict-progress">
                <span style={{ width: `${Math.min(confidence, 100)}%` }} />
              </div>
              <div className="verdict-foot">
                <DRBadge grade={effectiveGrade} size="lg" />
                <span>Grade {effectiveGrade} · {date}</span>
              </div>
            </div>

            <div className="card result-grade-card">
              <div className="result-section-heading compact">
                <div><div className="eyebrow">Severity</div><h2>DR Grade</h2></div>
                {user?.role === 'admin' && (
                  <button className="text-button" onClick={() => setShowOverride((v) => !v)}>
                    <Edit3 size={13} aria-hidden="true" /> {showOverride ? 'Reset AI' : 'Override'}
                  </button>
                )}
              </div>
              {showOverride && (
                <div className="override-box">
                  <label htmlFor="override-grade">Physician diagnostic override</label>
                  <select
                    id="override-grade"
                    className="form-input"
                    value={overriddenGrade}
                    onChange={(e) => setOverriddenGrade(Number(e.target.value))}
                  >
                    {[0, 1, 2, 3, 4].map((g) => (
                      <option key={g} value={g}>Grade {g}: {getDRInfo(g).fullLabel}</option>
                    ))}
                  </select>
                </div>
              )}
              <SeverityGauge grade={effectiveGrade} />
            </div>

            <RecommendationCard
              grade={effectiveGrade}
              confidence={scan.ai_result.confidence}
              scanId={scan.id}
              patientId={scan.patient_id}
              onRetake={() => navigate('/scan/new', { state: { patientId: scan.patient_id } })}
            />
          </div>
        </section>

        {/* LOWER GRID */}
        <section className="result-lower-grid">
          <div className="card patient-summary-card">
            <div className="result-section-heading compact">
              <div><div className="eyebrow">Patient context</div><h2>Screening dossier</h2></div>
              {patient && (
                <Link to={`/patients/${patient.id}`} className="text-button no-decoration">
                  Open dossier <ChevronRight size={14} aria-hidden="true" />
                </Link>
              )}
            </div>
            {patient ? (
              <div className="patient-summary-grid">
                <div><span>Name</span><strong>{patient.name}</strong></div>
                <div><span>Age / Gender</span><strong>{patient.age}y / {patient.gender}</strong></div>
                <div><span>Location</span><strong>{patient.village}</strong></div>
                <div><span>Diabetes since</span><strong>{patient.diabetes_since || '—'}</strong></div>
                <div><span>Last HbA1c</span><strong className={patient.hba1c >= 8 ? 'metric-danger' : 'metric-safe'}>{patient.hba1c ? `${patient.hba1c}%` : '—'}</strong></div>
                <div><span>Prior screenings</span><strong>{patientScans.length}</strong></div>
              </div>
            ) : <p>No linked patient record.</p>}
          </div>

          <div className="card review-card">
            <div className="result-section-heading compact">
              <div><div className="eyebrow">Clinical gate</div><h2>Physician review</h2></div>
              <span className={`review-pill ${decision ? 'reviewed' : 'pending'}`}>
                {decision ? <CheckCircle2 size={13} aria-hidden="true" /> : <Clock size={13} aria-hidden="true" />}
                {decision ? 'Reviewed' : 'Pending'}
              </span>
            </div>

            <label htmlFor="doctor-notes" className="sr-only">Clinical notes</label>
            <textarea
              id="doctor-notes"
              className="form-input result-notes"
              value={notes}
              onChange={(e) => { setNotes(e.target.value); setSaved(false); }}
              rows={4}
              placeholder="Add clinical assessment, findings, referral notes, or follow-up instructions..."
            />

            <div className="review-actions">
              <button
                className={`review-action ${decision === 'approved' ? 'selected approve' : ''}`}
                onClick={() => handleDecision('approved')}
                disabled={saving}
              >
                <CheckCircle2 size={17} aria-hidden="true" /> Approve AI triage
              </button>
              <button
                className={`review-action ${decision === 'modified' ? 'selected modify' : ''}`}
                onClick={handleModify}
                disabled={saving}
              >
                <Edit3 size={17} aria-hidden="true" /> Modify finding
              </button>
            </div>

            <div className="review-footer">
              <span className={saved ? 'save-success' : ''}>
                {saved ? <><CheckCircle2 size={14} aria-hidden="true" /> Assessment saved & logged</> : 'AI assists · clinician decides'}
              </span>
              <Button variant="primary" size="sm" icon={Save} onClick={handleSaveNotes} loading={saving}>Save Assessment</Button>
            </div>
          </div>
        </section>

        {/* ACTION BAR */}
        <section className="result-action-bar">
          <div>
            <div className="eyebrow">Next step</div>
            <strong>Need another image or a fresh screening?</strong>
            <span>Retake the scan without losing this clinical record.</span>
          </div>
          <div className="result-action-buttons">
            <Button variant="outline" size="sm" icon={RotateCcw} onClick={() => navigate('/scan/new', { state: { patientId: scan.patient_id } })}>
              Retake Screening
            </Button>
            <Button variant="primary" size="sm" icon={Download} onClick={() => window.print()}>
              Print / Save Report
            </Button>
          </div>
        </section>

        <div className="result-disclaimer">
          <AlertTriangle size={14} aria-hidden="true" />
          DRISHTI AI is a screening and decision-support prototype. AI output, confidence and heatmap visualizations must be interpreted by a qualified clinician and do not constitute a diagnosis.
        </div>
      </div>
    </PageWrapper>
  );
}

