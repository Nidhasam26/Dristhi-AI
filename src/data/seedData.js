/**
 * Seed Data — Demo accounts, patients, and scans for the DRISHTI AI hackathon demo.
 * All data is fictional and for demonstration purposes only.
 *
 * v3 additions: ownerUserId on scans & appointments, userId on patients,
 * fee + location on doctors.
 */

// ─── Default System Users ──────────────────────────────────────────────────────────
export const DEMO_USERS = [
  {
    id: 'usr_001',
    name: 'Ramesh Patil',
    username: 'patient',
    pin: '1234',
    role: 'patient',
    phone: '9876543210',
    village: 'Wardha',
    district: 'Yavatmal',
    state: 'Maharashtra',
  },
  {
    id: 'usr_002',
    name: 'Sunita Deshmukh',
    username: 'user',
    pin: '1234',
    role: 'user',
    phone: '9123456789',
    village: 'Pusad',
    district: 'Yavatmal',
    state: 'Maharashtra',
  },
  {
    id: 'usr_003',
    name: 'System Administrator',
    username: 'admin',
    pin: '0000',
    role: 'admin',
    phone: '9999900000',
    village: 'Civil Lines',
    district: 'Yavatmal',
    state: 'Maharashtra',
  },
];

// ─── Demo Patients ────────────────────────────────────────────────────────────
// userId links a patient record to an auth user account (1-to-1 for patient role users)
export const DEMO_PATIENTS = [
  {
    id: 'pat_001',
    userId: 'usr_001',  // Ramesh Patil's own patient record
    name: 'Ramesh Patil',
    age: 58,
    gender: 'M',
    phone: '9876543210',
    village: 'Wardha',
    district: 'Yavatmal',
    diabetes_since: '2014',
    hba1c: 8.2,
    created_by: 'usr_001',
    created_at: '2026-06-10',
  },
  {
    id: 'pat_002',
    userId: 'usr_002',  // Sunita Deshmukh's own patient record
    name: 'Sunita Deshmukh',
    age: 63,
    gender: 'F',
    phone: '9123456789',
    village: 'Pusad',
    district: 'Yavatmal',
    diabetes_since: '2010',
    hba1c: 9.7,
    created_by: 'usr_001',
    created_at: '2026-06-15',
  },
  {
    id: 'pat_003',
    name: 'Vitthal Kale',
    age: 71,
    gender: 'M',
    phone: '',
    village: 'Umarkhed',
    district: 'Yavatmal',
    diabetes_since: '2008',
    hba1c: 11.2,
    created_by: 'usr_001',
    created_at: '2026-07-01',
  },
  {
    id: 'pat_004',
    name: 'Lata Gaikwad',
    age: 50,
    gender: 'F',
    phone: '9988776655',
    village: 'Kalamb',
    district: 'Yavatmal',
    diabetes_since: '2020',
    hba1c: 6.9,
    created_by: 'usr_001',
    created_at: '2026-07-20',
  },
  {
    id: 'pat_005',
    name: 'Suresh Munde',
    age: 66,
    gender: 'M',
    phone: '',
    village: 'Digras',
    district: 'Yavatmal',
    diabetes_since: '2016',
    hba1c: 7.4,
    created_by: 'usr_001',
    created_at: '2026-08-01',
  },
];

// ─── Demo Scans ───────────────────────────────────────────────────────────────
// ai_result.gradcam_data contains a 14×14 activation matrix.
// ownerUserId: the auth user who owns/can see this scan result.
//   scn_001, scn_002 → Ramesh Patil (usr_001, 'patient' role)
//   scn_003          → Sunita Deshmukh (usr_002, 'user' role)
//   scn_004–006      → created by usr_001 health worker for other patients

function makeActivationMatrix(grade) {
  const size = 14;
  const center = Math.floor(size / 2);
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));

  const patterns = {
    0: [],
    1: [{ x: center - 2, y: center + 1, intensity: 0.7, radius: 1.5 }],
    2: [
      { x: center - 2, y: center + 1, intensity: 0.85, radius: 2.0 },
      { x: center + 3, y: center - 2, intensity: 0.70, radius: 1.5 },
    ],
    3: [
      { x: center - 2, y: center + 1, intensity: 0.95, radius: 2.5 },
      { x: center + 3, y: center - 2, intensity: 0.85, radius: 2.0 },
      { x: center - 1, y: center - 3, intensity: 0.75, radius: 1.5 },
      { x: center + 1, y: center + 3, intensity: 0.80, radius: 1.5 },
    ],
    4: [
      { x: center,     y: center,     intensity: 1.00, radius: 3.5 },
      { x: center - 3, y: center + 2, intensity: 0.90, radius: 2.5 },
      { x: center + 3, y: center - 3, intensity: 0.85, radius: 2.0 },
      { x: center - 1, y: center - 4, intensity: 0.80, radius: 2.0 },
      { x: center + 2, y: center + 4, intensity: 0.75, radius: 1.5 },
    ],
  };

  for (const spot of (patterns[grade] ?? [])) {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const dist = Math.sqrt((c - spot.x) ** 2 + (r - spot.y) ** 2);
        matrix[r][c] = Math.min(1, matrix[r][c] + spot.intensity * Math.exp(-(dist ** 2) / (2 * spot.radius ** 2)));
      }
    }
  }

  return matrix;
}

export const DEMO_SCANS = [
  // Ramesh Patil — progression from Mild → Moderate (owned by usr_001)
  {
    id: 'scn_001',
    patient_id: 'pat_001',
    ownerUserId: 'usr_001',
    scan_date: '2026-06-10',
    eye: 'right',
    image_dataurl: null,
    ai_result: {
      grade: 1,
      grade_label: 'Mild NPDR',
      confidence: 0.82,
      gradcam_data: makeActivationMatrix(1),
    },
    reviewed_by: 'usr_002',
    doctor_notes: 'Mild changes consistent with early NPDR. Advised patient to strictly control HbA1c. Review in 6 months.',
    scanned_by: 'usr_001',
  },
  {
    id: 'scn_002',
    patient_id: 'pat_001',
    ownerUserId: 'usr_001',
    scan_date: '2026-08-20',
    eye: 'right',
    image_dataurl: null,
    ai_result: {
      grade: 2,
      grade_label: 'Moderate NPDR',
      confidence: 0.88,
      gradcam_data: makeActivationMatrix(2),
    },
    reviewed_by: null,
    doctor_notes: '',
    scanned_by: 'usr_001',
  },
  // Sunita Deshmukh — Severe NPDR (owned by usr_002)
  {
    id: 'scn_003',
    patient_id: 'pat_002',
    ownerUserId: 'usr_002',
    scan_date: '2026-07-05',
    eye: 'left',
    image_dataurl: null,
    ai_result: {
      grade: 3,
      grade_label: 'Severe NPDR',
      confidence: 0.91,
      gradcam_data: makeActivationMatrix(3),
    },
    reviewed_by: 'usr_002',
    doctor_notes: 'High-risk patient. Urgent referral to Nagpur Eye Institute arranged. Patient counselled.',
    scanned_by: 'usr_001',
  },
  // Vitthal Kale — PDR (scanned by usr_001 health worker, owned by usr_001)
  {
    id: 'scn_004',
    patient_id: 'pat_003',
    ownerUserId: 'usr_001',
    scan_date: '2026-07-10',
    eye: 'right',
    image_dataurl: null,
    ai_result: {
      grade: 4,
      grade_label: 'Proliferative DR',
      confidence: 0.94,
      gradcam_data: makeActivationMatrix(4),
    },
    reviewed_by: 'usr_002',
    doctor_notes: 'Emergency referral completed. Patient transferred to tertiary centre.',
    scanned_by: 'usr_001',
  },
  // Lata Gaikwad — No DR (scanned by usr_001 health worker)
  {
    id: 'scn_005',
    patient_id: 'pat_004',
    ownerUserId: 'usr_001',
    scan_date: '2026-07-25',
    eye: 'right',
    image_dataurl: null,
    ai_result: {
      grade: 0,
      grade_label: 'No DR',
      confidence: 0.96,
      gradcam_data: makeActivationMatrix(0),
    },
    reviewed_by: null,
    doctor_notes: '',
    scanned_by: 'usr_001',
  },
  // Suresh Munde — Mild NPDR (scanned by usr_001 health worker)
  {
    id: 'scn_006',
    patient_id: 'pat_005',
    ownerUserId: 'usr_001',
    scan_date: '2026-08-05',
    eye: 'right',
    image_dataurl: null,
    ai_result: {
      grade: 1,
      grade_label: 'Mild NPDR',
      confidence: 0.79,
      gradcam_data: makeActivationMatrix(1),
    },
    reviewed_by: null,
    doctor_notes: '',
    scanned_by: 'usr_001',
  },
];

// ─── Demo Specialists (Ophthalmologists / Retinal Specialists) ───────────────
// fee: INR consultation fee  |  location: clinic city
export const DEMO_DOCTORS = [
  {
    id: 'doc_001',
    name: 'Dr. Ananya Sharma',
    title: 'MD, DNB (Ophthalmology), FVRS',
    role: 'Chief Vitreoretinal Surgeon',
    specialty: 'Medical & Surgical Retina',
    hospital: 'Nagpur Eye Institute & Research Centre',
    location: 'Nagpur, Maharashtra',
    fee: 1500,
    experience: '14+ years',
    rating: 4.9,
    reviewsCount: 128,
    avatarColor: '#0891b2',
    availableDays: ['Mon', 'Wed', 'Thu', 'Fri', 'Sat'],
    availableSlots: ['09:30 AM', '11:00 AM', '02:00 PM', '04:30 PM'],
    modes: ['in-person', 'tele-consultation'],
    languages: ['Hindi', 'Marathi', 'English'],
    about: 'Specializes in high-risk diabetic retinopathy management, macular edema, and micro-incision vitrectomy surgery.',
  },
  {
    id: 'doc_002',
    name: 'Dr. Rajesh Kulkarni',
    title: 'MS (Ophthalmology), Fellowship Retina',
    role: 'Senior Retina Consultant',
    specialty: 'Diabetic Retinopathy Specialist',
    hospital: 'Yavatmal District Super Speciality Eye Clinic',
    location: 'Yavatmal, Maharashtra',
    fee: 800,
    experience: '11+ years',
    rating: 4.8,
    reviewsCount: 94,
    avatarColor: '#059669',
    availableDays: ['Mon', 'Tue', 'Thu', 'Fri'],
    availableSlots: ['10:00 AM', '11:30 AM', '03:00 PM', '05:00 PM'],
    modes: ['in-person', 'tele-consultation'],
    languages: ['Marathi', 'Hindi', 'English'],
    about: 'Dedicated to community ophthalmology and rural diabetic eye disease screening, anti-VEGF therapy, and laser photocoagulation.',
  },
  {
    id: 'doc_003',
    name: 'Dr. Priya Deshpande',
    title: 'MBBS, DO, FICO (UK)',
    role: 'Consultant Tele-Ophthalmologist',
    specialty: 'Retinal Screening & Tele-Triage',
    hospital: 'Maharashtra Tele-Ophthalmology Network',
    location: 'Online / Tele-Medicine',
    fee: 600,
    experience: '8+ years',
    rating: 4.9,
    reviewsCount: 112,
    avatarColor: '#7c3aed',
    availableDays: ['Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    availableSlots: ['09:00 AM', '10:30 AM', '01:30 PM', '03:30 PM', '06:00 PM'],
    modes: ['tele-consultation'],
    languages: ['Marathi', 'Hindi', 'English'],
    about: 'Expert in fast remote fundus evaluation, AI decision validation, and longitudinal retinopathy monitoring for rural clinics.',
  },
  {
    id: 'doc_004',
    name: 'Dr. Vikram Rao',
    title: 'MD (AIIMS), FMRF (Sankara Nethralaya)',
    role: 'Vitreoretinal Specialist & Surgeon',
    specialty: 'Proliferative DR & Complex Retinal Disease',
    hospital: 'Vidarbha Retinal Foundation',
    location: 'Nagpur, Maharashtra',
    fee: 2500,
    experience: '16+ years',
    rating: 5.0,
    reviewsCount: 164,
    avatarColor: '#dc2626',
    availableDays: ['Mon', 'Wed', 'Fri'],
    availableSlots: ['10:30 AM', '02:30 PM', '04:00 PM'],
    modes: ['in-person'],
    languages: ['English', 'Hindi', 'Marathi'],
    about: 'Leading tertiary referral specialist for proliferative diabetic retinopathy, vitreous hemorrhage, and retinal detachment.',
  },
];

// ─── Demo Appointments ────────────────────────────────────────────────────────
// ownerUserId: the authenticated user who booked / owns this appointment.
//   apt_001 → owned by usr_001 (Ramesh Patil)
//   apt_002 → owned by usr_002 (Sunita Deshmukh)
//   apt_003 → owned by usr_001 (health worker booked for their patient Vitthal Kale)
export const DEMO_APPOINTMENTS = [
  {
    id: 'apt_001',
    ownerUserId: 'usr_001',
    patientId: 'pat_001',
    patientName: 'Ramesh Patil',
    patientPhone: '9876543210',
    patientVillage: 'Wardha',
    patientDistrict: 'Yavatmal',
    doctorId: 'doc_001',
    doctorName: 'Dr. Ananya Sharma',
    doctorRole: 'Chief Vitreoretinal Surgeon',
    doctorHospital: 'Nagpur Eye Institute & Research Centre',
    doctorFee: 1500,
    scanId: 'scn_002',
    scanGrade: 2,
    scanGradeLabel: 'Moderate NPDR',
    date: '2026-08-29',
    time: '02:00 PM',
    type: 'in-person',
    reason: 'Clinical follow-up review for Moderate NPDR screening finding',
    status: 'confirmed',
    notes: 'Patient counselled regarding strict HbA1c control; detailed dilated fundus examination scheduled.',
    createdAt: '2026-08-20T10:30:00.000Z',
  },
  {
    id: 'apt_002',
    ownerUserId: 'usr_002',
    patientId: 'pat_002',
    patientName: 'Sunita Deshmukh',
    patientPhone: '9123456789',
    patientVillage: 'Pusad',
    patientDistrict: 'Yavatmal',
    doctorId: 'doc_004',
    doctorName: 'Dr. Vikram Rao',
    doctorRole: 'Vitreoretinal Specialist & Surgeon',
    doctorHospital: 'Vidarbha Retinal Foundation',
    doctorFee: 2500,
    scanId: 'scn_003',
    scanGrade: 3,
    scanGradeLabel: 'Severe NPDR',
    date: '2026-08-27',
    time: '10:30 AM',
    type: 'in-person',
    reason: 'Priority specialist consultation for Severe NPDR triage',
    status: 'scheduled',
    notes: 'High-risk patient referral. AI screening indicates extensive microvascular changes.',
    createdAt: '2026-08-22T08:15:00.000Z',
  },
  {
    id: 'apt_003',
    ownerUserId: 'usr_001',
    patientId: 'pat_003',
    patientName: 'Vitthal Kale',
    patientPhone: '',
    patientVillage: 'Umarkhed',
    patientDistrict: 'Yavatmal',
    doctorId: 'doc_001',
    doctorName: 'Dr. Ananya Sharma',
    doctorRole: 'Chief Vitreoretinal Surgeon',
    doctorHospital: 'Nagpur Eye Institute & Research Centre',
    doctorFee: 1500,
    scanId: 'scn_004',
    scanGrade: 4,
    scanGradeLabel: 'Proliferative DR',
    date: '2026-07-15',
    time: '11:00 AM',
    type: 'in-person',
    reason: 'Emergency tertiary retinal assessment for PDR',
    status: 'completed',
    notes: 'Emergency clinical review completed. Panretinal photocoagulation (PRP) treatment plan initiated.',
    createdAt: '2026-07-11T09:00:00.000Z',
  },
];
