// Entry point for all browser interactivity.
import { validateRegistration } from './validation.js';

// ЗАПОЛНИТЬ: вставить URL развёрнутого Google Apps Script Web App (см. README).
const REGISTRATION_ENDPOINT = 'PASTE_APPS_SCRIPT_WEB_APP_URL_HERE';

/* ---------- Gallery lightbox ---------- */
function initLightbox() {
  const box = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');
  if (!box) return;

  const open = (src, alt) => { img.src = src; img.alt = alt || ''; box.hidden = false;
    document.body.style.overflow = 'hidden'; };
  const close = () => { box.hidden = true; img.src = ''; document.body.style.overflow = ''; };

  document.querySelectorAll('.gallery__item').forEach((btn) => {
    btn.addEventListener('click', () => open(btn.dataset.full, btn.querySelector('img')?.alt));
  });
  closeBtn.addEventListener('click', close);
  box.addEventListener('click', (e) => { if (e.target === box) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !box.hidden) close(); });
}

/* ---------- FAQ: single-open accordion ---------- */
function initFaq() {
  const items = document.querySelectorAll('.faq__item');
  items.forEach((d) => {
    d.addEventListener('toggle', () => {
      if (d.open) items.forEach((o) => { if (o !== d) o.open = false; });
    });
  });
}

/* ---------- Registration form ---------- */
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(',') + 1)); // strip "data:...;base64,"
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function showErrors(form, errors) {
  form.querySelectorAll('.error').forEach((el) => { el.textContent = ''; });
  Object.entries(errors).forEach(([field, msg]) => {
    const el = form.querySelector(`[data-error-for="${field}"]`);
    if (el) el.textContent = msg;
  });
}

function initRegForm() {
  const form = document.getElementById('regForm');
  if (!form) return;
  const status = document.getElementById('regStatus');
  const submitBtn = form.querySelector('.reg-form__submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    status.className = 'reg-form__status';

    const data = {
      childName:   form.childName.value,
      age:         form.age.value,
      parentName:  form.parentName.value,
      parentPhone: form.parentPhone.value,
      location:    form.location.value,
      health:      form.health.value,
      comment:     form.comment.value,
      consent:     form.consent.checked,
    };

    const { valid, errors } = validateRegistration(data);
    showErrors(form, errors);
    if (!valid) {
      status.textContent = 'Խնդրում ենք լրացնել պարտադիր դաշտերը։';
      status.classList.add('is-error');
      return;
    }

    submitBtn.disabled = true;
    status.textContent = 'Ուղարկվում է…';

    try {
      const file = form.birthCert.files[0];
      const payload = { ...data };
      if (file) {
        payload.fileName = file.name;
        payload.fileMime = file.type;
        payload.fileData = await readFileAsBase64(file);
      }
      // Apps Script Web Apps reject custom JSON headers (CORS preflight);
      // send as text/plain to stay a "simple request".
      const resp = await fetch(REGISTRATION_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      });
      // fetch only rejects on network errors; a 4xx/5xx still resolves.
      // Treat a readable non-OK response as a failure (opaque responses have ok=false by design — allow those).
      if (!resp.ok && resp.type !== 'opaque') throw new Error('HTTP ' + resp.status);
      form.reset();
      status.textContent = 'Շնորհակալություն։ Ձեր հայտը ստացվեց — մենք կզանգահարենք։';
      status.classList.add('is-ok');
    } catch (err) {
      status.textContent = 'Սխալ. չհաջողվեց ուղարկել։ Փորձեք կրկին կամ զանգահարեք մեզ։';
      status.classList.add('is-error');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

/* ---------- Hide sticky CTA when the register section is visible ---------- */
function initStickyCta() {
  const cta = document.getElementById('ctaSticky');
  const target = document.getElementById('register');
  if (!cta || !target || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => cta.classList.toggle('is-hidden', entry.isIntersecting));
  }, { threshold: 0.15 });
  io.observe(target);
}

document.addEventListener('DOMContentLoaded', () => {
  initLightbox();
  initFaq();
  initRegForm();
  initStickyCta();
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
});
