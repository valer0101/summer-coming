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
    expect(r.errors.parentName).toBeTruthy();
  });

  it('requires age to be a number within 8–13', () => {
    expect(validateRegistration({ ...valid, age: '' }).errors.age).toBeTruthy();
    expect(validateRegistration({ ...valid, age: '7' }).errors.age).toBeTruthy();
    expect(validateRegistration({ ...valid, age: '14' }).errors.age).toBeTruthy();
    expect(validateRegistration({ ...valid, age: 'abc' }).errors.age).toBeTruthy();
    expect(validateRegistration({ ...valid, age: '8' }).errors.age).toBeUndefined();
    expect(validateRegistration({ ...valid, age: '13' }).errors.age).toBeUndefined();
  });

  it('requires a phone with at least 6 digits', () => {
    expect(validateRegistration({ ...valid, parentPhone: '123' }).errors.parentPhone).toBeTruthy();
    expect(validateRegistration({ ...valid, parentPhone: '' }).errors.parentPhone).toBeTruthy();
    expect(validateRegistration({ ...valid, parentPhone: '+374 91 12-34-56' }).errors.parentPhone).toBeUndefined();
  });

  it('requires location to be one of the three allowed places', () => {
    expect(ALLOWED_LOCATIONS).toEqual(['Աշտարակ', 'Կոշ', 'Օհանավան']);
    expect(validateRegistration({ ...valid, location: '' }).errors.location).toBeTruthy();
    expect(validateRegistration({ ...valid, location: 'Երևան' }).errors.location).toBeTruthy();
  });

  it('requires consent to be true', () => {
    expect(validateRegistration({ ...valid, consent: false }).errors.consent).toBeTruthy();
  });

  it('treats health and comment as optional', () => {
    const r = validateRegistration({ ...valid, health: '', comment: '' });
    expect(r.valid).toBe(true);
  });
});
