import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { usePatients } from '../context/PatientContext.jsx';
import { useAppointments } from '../context/AppointmentContext.jsx';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import AnimatedRetinaEye from '../components/ui/AnimatedRetinaEye.jsx';
import { ScanLine, Users, AlertTriangle, CheckCircle2, ArrowRight, Activity, ShieldCheck, Clock3, Eye, Calendar } from 'lucide-react';
import { getDRInfo } from '../utils/drClassification.js';

const ROLE_LABELS = { patient: 'Health Worker', user: 'Field Screener', admin: 'Ophthalmologist / Admin' };

function Stat({ icon: Icon, value, label, tone = 'teal', to }) {
  const content = (
    <div className={`dr-stat dr-stat-${tone}`}>
      <div className="dr-stat-icon"><Icon size={19}/></div>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} style={{ textDecoration: 'none', color: 'inherit' }}>{content}</Link>;
  }

  return content;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { patients, scans } = usePatients();
  const { appointments } = useAppointments();
  const total = scans.length;
  const normal = scans.filter(s => s.ai_result?.grade === 0).length;
  const review = scans.filter(s => (s.ai_result?.grade ?? 0) >= 2).length;
  const pending = scans.filter(s => !s.reviewed_by && (s.ai_result?.grade ?? 0) >= 1).length;
  const upcomingAppointments = appointments.filter(a => a.status === 'confirmed' || a.status === 'scheduled').length;
  const avgConfidence = total ? Math.round(scans.reduce((sum, s) => sum + (s.ai_result?.confidence || 0), 0) / total * 100) : 0;
  const recent = [...scans].sort((a,b) => new Date(b.scan_date) - new Date(a.scan_date)).slice(0,5);
  const gradeCount = [0,1,2,3,4].map(g => scans.filter(s => s.ai_result?.grade === g).length);

  return <PageWrapper>
    <div className="dr-dashboard-screen">
    <div className="dr-page-head">
      <div><div className="dr-eyebrow"><span className="dr-live-dot"/> AI VISION ONLINE · {user?.district || 'Rural Screening Unit'}</div>
      <h1>Retinal Intelligence <span>Command Center</span></h1>
      <p>Explainable AI-assisted retinal screening for faster, safer clinical triage.</p></div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Link className="dr-primary-btn" to="/scan/new"><ScanLine size={18}/> Start Retinal Scan <ArrowRight size={16}/></Link>
      </div>
    </div>

    <section className="dr-hero">
      <div className="dr-hero-copy"><div className="dr-kicker"><ShieldCheck size={14}/> SCREENING WORKFLOW READY</div>
        <h2>See deeper.<br/><span>Screen smarter.</span></h2>
        <p>Upload a fundus image, run the quality gate, analyze retinal features, and review an explainable AI result.</p>
        <div className="dr-hero-actions">
          <Link className="dr-primary-btn" to="/scan/new"><ScanLine size={17}/> Start New Screening</Link>
          <Link className="dr-secondary-btn" to="/appointments/book" style={{ background: 'rgba(6, 24, 33, 0.8)', color: '#22d3ee', borderColor: 'rgba(34, 211, 238, 0.3)' }}>
            <Calendar size={17}/> Book Doctor Appointment
          </Link>
        </div>
      </div>
      <div className="dr-eye-panel"><div className="dr-orbit-label top">RETINAL MAP · LIVE</div><AnimatedRetinaEye mode="ambient" size={300}/><div className="dr-orbit-label bottom"><span className="dr-live-dot"/> SYSTEM NOMINAL</div></div>
    </section>

    <div className="dr-stats-grid">
      <Stat icon={Users} value={patients.length} label="Registered patients" to="/patients" />
      <Stat icon={Eye} value={total} label="Retinal scans" />
      <Stat icon={Calendar} value={upcomingAppointments} label="Active appointments" tone="teal" to="/appointments" />
      <Stat icon={AlertTriangle} value={review} label="High-priority review" tone="amber" />
      <Stat icon={CheckCircle2} value={`${avgConfidence}%`} label="Average AI confidence" tone="green" />
      <Stat icon={Clock3} value={pending} label="Pending physician review" tone="purple" />
    </div>

    <section className="dr-section-grid">
      <div className="dr-panel"><div className="dr-panel-head"><div><span className="dr-eyebrow">AI PIPELINE</span><h3>From image to explainable result</h3></div><Activity size={20}/></div>
        <div className="dr-pipeline">{['Retinal image','Quality gate','Retina detection','Vessel mapping','AI classification','Risk assessment','Doctor review'].map((s,i)=><div className="dr-pipeline-step" key={s}><span>{String(i+1).padStart(2,'0')}</span><b>{s}</b>{i<6&&<i/>}</div>)}</div>
      </div>
      <div className="dr-panel"><div className="dr-panel-head"><div><span className="dr-eyebrow">GRADE DISTRIBUTION</span><h3>Screening overview</h3></div></div>
        <div className="dr-bars">{gradeCount.map((count,g)=>{const info=getDRInfo(g); const pct=total?Math.max(4,count/total*100):4; return <div className="dr-bar-row" key={g}><span>G{g} · {info.label}</span><div><i style={{width:`${pct}%`,background:info.color}}/></div><b>{count}</b></div>})}</div>
      </div>
    </section>

    <section className="dr-panel"><div className="dr-panel-head"><div><span className="dr-eyebrow">RECENT SCREENINGS</span><h3>Latest retinal analyses</h3></div><Link className="dr-text-btn" to="/patients">View patients <ArrowRight size={14}/></Link></div>
      {recent.length ? <div className="dr-table-wrap"><table className="dr-table"><thead><tr><th>Patient</th><th>Eye</th><th>Date</th><th>AI finding</th><th>Confidence</th><th/></tr></thead><tbody>{recent.map(s=>{const p=patients.find(x=>x.id===s.patient_id);const info=getDRInfo(s.ai_result?.grade ?? 0);return <tr key={s.id}><td><strong>{p?.name || 'Patient'}</strong><small>{s.id}</small></td><td><span className="dr-eye-badge"><Eye size={12}/>{s.eye==='left'?'LEFT':'RIGHT'}</span></td><td><span className="dr-date">{new Date(s.scan_date).toLocaleDateString('en-IN')}</span></td><td><span className="dr-result"><span className="dr-result-dot" style={{background:info.color}}/>{info.label}</span></td><td><div className="dr-confidence"><span>{Math.round((s.ai_result?.confidence||0)*100)}%</span><i><b style={{width:`${Math.round((s.ai_result?.confidence||0)*100)}%`}}/></i></div></td><td><Link to={`/scan/${s.id}`} className="dr-icon-link" aria-label={`Open scan ${s.id}`}><ArrowRight size={16}/></Link></td></tr>})}</tbody></table></div> : <div className="dr-empty"><Eye size={30}/><p>No scans yet. Start your first retinal screening.</p><Link className="dr-primary-btn" to="/scan/new">Start scan</Link></div>}
    </section>
    <p className="dr-disclaimer">DRISHTI AI is a screening and decision-support prototype. AI output does not replace a qualified clinical diagnosis.</p>
    </div>
  </PageWrapper>;
}

