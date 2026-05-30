import { describe, it, expect } from 'vitest';
import { validateRegistration, ALLOWED_LOCATIONS } from '../js/validation.js';

const valid = {
  childName: 'Աննա Պետրոսյան',
  age: '10',
  parentName: 'Մարիամ Պետրոսյան',
  parentPhone: '+37491123456',
  location: 'Աշտարակ',
  consent: true,
  health: '',
  comment: '',
};

describe('validateRegistration', () => {
  it('accepts a fully valid registration', () => {
    const r = validateRegistration(valid);
    expect(r.valid).toBe(true);
    expect(r.errors).toEqual({});
  });

  it('requires child name', () => {
    const r = validateRegistration({ ...valid, childName: '   ' });
    expect(r.valid).toBe(false);
    expect(r.errors.childName).toBeTruthy();
  });

  it('requires parent name', () => {
    const r = validateRegistration({ ...valid, parentName: '' });
    expect(r.valid).toBe(false);
    expect(r.errors.parentName).toBeTruthy();
  });

  it('requires age to be an integer within 8–13', () => {
    expect(validateRegistration({ ...valid, age: '' }).errors.age).toBeTruthy();
    expect(validateRegistration({ ...valid, age: '7' }).errors.age).toBeTruthy();
    expect(validateRegistration({ ...valid, age: '14' }).errors.age).toBeTruthy();
    expect(validateRegistration({ ...valid, age: 'abc' }).errors.age).toBeTruthy();
    expect(validateRegistration({ ...valid, age: '8.5' }).errors.age).toBeTruthy();
    expect(validateRegistration({ ...valid, age: '8.5' }).valid).toBe(false);
    expect(validateRegistration({ ...valid, age: '8' }).errors.age).toBeUndefined();
    expect(validateRegistration({ ...valid, age: '13' }).errors.age).toBeUndefined();
  });

  it('requires a phone with at least 6 digits', () => {
    expect(validateRegistration({ ...valid, parentPhone: '123' }).errors.parentPhone).toBeTruthy();
    expect(validateRegistration({ ...valid, parentPhone: '123' }).valid).toBe(false);
    expect(validateRegistration({ ...valid, parentPhone: '' }).errors.parentPhone).toBeTruthy();
    expect(validateRegistration({ ...valid, parentPhone: '+374 91 12-34-56' }).errors.parentPhone).toBeUndefined();
  });

  it('requires location to be one of the three allowed places', () => {
    expect(ALLOWED_LOCATIONS).toEqual(['Աշտարակ', 'Կոշ', 'Օհանավան']);
    expect(validateRegistration({ ...valid, location: '' }).errors.location).toBeTruthy();
    expect(validateRegistration({ ...valid, location: '' }).valid).toBe(false);
    expect(validateRegistration({ ...valid, location: 'Երևան' }).errors.location).toBeTruthy();
  });

  it('requires consent to be true', () => {
    expect(validateRegistration({ ...valid, consent: false }).errors.consent).toBeTruthy();
    expect(validateRegistration({ ...valid, consent: false }).valid).toBe(false);
  });

  it('rejects truthy-but-not-true consent values', () => {
    expect(validateRegistration({ ...valid, consent: 1 }).errors.consent).toBeTruthy();
    expect(validateRegistration({ ...valid, consent: 'true' }).errors.consent).toBeTruthy();
  });

  it('treats health and comment as optional (absent keys ok)', () => {
    const { health, comment, ...withoutOptional } = valid;
    const r = validateRegistration(withoutOptional);
    expect(r.valid).toBe(true);
  });
});
