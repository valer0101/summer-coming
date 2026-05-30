// Entry point for all browser interactivity.
import { validateRegistration } from './validation.js';

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

document.addEventListener('DOMContentLoaded', () => {
  initLightbox();
});
