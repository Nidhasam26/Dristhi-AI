/**
 * DR Classification Utility
 * Maps DR grades (0–4) to labels, colors, referral recommendations, and urgency.
 *
 * SCOPE NOTE: This utility describes overall DR severity grade only.
 * Grad-CAM highlights image regions that influenced the AI prediction —
 * it does NOT identify or locate individual lesions. Lesion-level detection
 * is explicitly out of scope for this MVP.
 */

export const DR_GRADES = {
  0: {
    grade: 0,
    label: 'No DR',
    fullLabel: 'No Diabetic Retinopathy',
    color: '#22C55E',
    badgeClass: 'badge-dr-0',
    dotClass: 'dr-0',
    urgency: 'routine',
    urgencyLabel: 'Routine Follow-up',
    recommendation: 'The AI found no signs of diabetic retinopathy in this image. Encourage the patient to continue regular blood sugar monitoring and schedule the next screening in 12 months.',
    referral: 'No referral required. Schedule next screening in 12 months.',
    icon: 'check-circle',
    progressPosition: 0,
  },
  1: {
    grade: 1,
    label: 'Mild NPDR',
    fullLabel: 'Mild Non-Proliferative DR',
    color: '#84CC16',
    badgeClass: 'badge-dr-1',
    dotClass: 'dr-1',
    urgency: 'monitor',
    urgencyLabel: 'Monitor — 6 months',
    recommendation: 'The AI has classified this image as Mild NPDR. Early retinal changes are present. Advise the patient to improve blood sugar control. Schedule a follow-up screening in 6 months.',
    referral: 'Refer to district eye clinic within 3 months for a baseline clinical assessment by a doctor.',
    icon: 'alert-circle',
    progressPosition: 25,
  },
  2: {
    grade: 2,
    label: 'Moderate NPDR',
    fullLabel: 'Moderate Non-Proliferative DR',
    color: '#F59E0B',
    badgeClass: 'badge-dr-2',
    dotClass: 'dr-2',
    urgency: 'refer',
    urgencyLabel: 'Refer — 1 month',
    recommendation: 'The AI has classified this image as Moderate NPDR. More significant retinal changes are present. Medical review by an ophthalmologist is needed to confirm the finding and plan management.',
    referral: 'Refer to district ophthalmologist within 1 month. Advise patient to optimise blood sugar and blood pressure.',
    icon: 'alert-triangle',
    progressPosition: 50,
  },
  3: {
    grade: 3,
    label: 'Severe NPDR',
    fullLabel: 'Severe Non-Proliferative DR',
    color: '#EF4444',
    badgeClass: 'badge-dr-3',
    dotClass: 'dr-3',
    urgency: 'urgent',
    urgencyLabel: 'Urgent — 1 week',
    recommendation: 'The AI has classified this image as Severe NPDR. There is a high risk of vision-threatening progression. Urgent clinical evaluation is required. Do not delay referral.',
    referral: 'Refer urgently to a tertiary eye care centre within 1 week.',
    icon: 'alert-octagon',
    progressPosition: 75,
  },
  4: {
    grade: 4,
    label: 'PDR',
    fullLabel: 'Proliferative Diabetic Retinopathy',
    color: '#7C3AED',
    badgeClass: 'badge-dr-4',
    dotClass: 'dr-4',
    urgency: 'emergency',
    urgencyLabel: 'Emergency — Immediate',
    recommendation: 'The AI has classified this image as Proliferative DR. This is a sight-threatening condition requiring immediate specialist intervention. Arrange emergency transport to a vitreoretinal centre.',
    referral: 'Emergency referral to a vitreoretinal surgeon immediately. Inform the patient that treatment may be required urgently.',
    icon: 'x-octagon',
    progressPosition: 100,
  },
};

export function getDRInfo(grade) {
  return DR_GRADES[grade] ?? DR_GRADES[0];
}

export function getGradeColor(grade) {
  return DR_GRADES[grade]?.color ?? '#22C55E';
}

export function getUrgencyColor(urgency) {
  const colors = {
    routine: '#22C55E',
    monitor: '#84CC16',
    refer: '#F59E0B',
    urgent: '#EF4444',
    emergency: '#7C3AED',
  };
  return colors[urgency] ?? '#64748B';
}
