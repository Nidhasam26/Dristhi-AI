/** Form validation helpers */

export function validateRequired(value, fieldName = 'Field') {
  if (!value || String(value).trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateAge(value) {
  const num = Number(value);
  if (!value) return 'Age is required';
  if (isNaN(num) || num < 1 || num > 120) return 'Enter a valid age (1–120)';
  return null;
}

export function validatePhone(value) {
  if (!value) return null; // optional
  const cleaned = String(value).replace(/\D/g, '');
  if (cleaned.length !== 10) return 'Enter a valid 10-digit phone number';
  return null;
}

export function validateHbA1c(value) {
  if (!value) return null; // optional
  const num = Number(value);
  if (isNaN(num) || num < 3 || num > 20) return 'Enter a valid HbA1c (3–20%)';
  return null;
}

export function validatePatientForm(data) {
  const errors = {};
  const nameErr = validateRequired(data.name, 'Patient name');
  if (nameErr) errors.name = nameErr;
  const ageErr = validateAge(data.age);
  if (ageErr) errors.age = ageErr;
  const genderErr = validateRequired(data.gender, 'Gender');
  if (genderErr) errors.gender = genderErr;
  const villageErr = validateRequired(data.village, 'Village');
  if (villageErr) errors.village = villageErr;
  const phoneErr = validatePhone(data.phone);
  if (phoneErr) errors.phone = phoneErr;
  const hba1cErr = validateHbA1c(data.hba1c);
  if (hba1cErr) errors.hba1c = hba1cErr;
  return errors;
}
