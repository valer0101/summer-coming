// Pure, DOM-free validation for the registration form.
// Imported by both the browser (js/main.js) and Vitest.

export const ALLOWED_LOCATIONS = ['Աշտարակ', 'Կոշ', 'Օհանավան'];

const MSG = {
  required: 'Պարտադիր դաշտ է',
  age:      'Տարիքը պետք է լինի 8–13',
  phone:    'Մուտքագրեք վավեր հեռախոսահամար',
  location: 'Ընտրեք՝ Աշտարակ, Կոշ կամ Օհանավան',
  consent:  'Անհրաժեշտ է ծնողի համաձայնությունը',
};

const isBlank = (v) => v == null || String(v).trim() === '';

export function validateRegistration(data = {}) {
  const errors = {};

  if (isBlank(data.childName))  errors.childName  = MSG.required;
  if (isBlank(data.parentName)) errors.parentName = MSG.required;

  const age = Number(String(data.age ?? '').trim());
  if (!Number.isInteger(age) || age < 8 || age > 13) {
    errors.age = MSG.age;
  }

  const digits = String(data.parentPhone || '').replace(/\D/g, '');
  if (digits.length < 6) errors.parentPhone = MSG.phone;

  if (!ALLOWED_LOCATIONS.includes(data.location)) errors.location = MSG.location;

  if (data.consent !== true) errors.consent = MSG.consent;

  return { valid: Object.keys(errors).length === 0, errors };
}
