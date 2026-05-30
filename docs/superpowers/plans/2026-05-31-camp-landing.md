# Church Camp Landing Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page, mobile-first Armenian-language landing page for an annual church summer camp that *shows* the camp through photos/video and collects pre-registrations into a Google Sheet.

**Architecture:** A static site (one `index.html` + `css/styles.css` + small ES-module JS). No build step for the deployed site — it is plain files served by a free static host (Netlify or GitHub Pages). The registration form `POST`s (via `fetch`) to a Google Apps Script Web App that saves an optional birth-certificate file to a private Google Drive folder and appends a row to a Google Sheet. The only genuinely testable logic — form validation — is isolated in a pure ES module and covered by Vitest (dev-only; not deployed).

**Tech Stack:** HTML5, CSS3 (custom properties, fl/grid, `@media`), vanilla JS (ES modules), Vitest (dev tests only), Google Apps Script (backend), Netlify/GitHub Pages (hosting).

**Spec:** `docs/superpowers/specs/2026-05-30-camp-landing-design.md`

**Conventions used in this plan:**
- The site language is **Armenian (`hy`)**. Default Armenian copy is provided. Spots the owner must fill in later are marked with an HTML comment `<!-- ЗАПОЛНИТЬ: ... -->` and a visible placeholder.
- Vitest tests are dev-only and never shipped to the host (host serves only `index.html`, `css/`, `js/`, `assets/`).
- Commit after every task.

---

## File Structure

```
landing-caming-page/
├── index.html                 # the single page; all 14 sections
├── css/
│   └── styles.css             # design tokens (:root) + base + components + responsive
├── js/
│   ├── validation.js          # PURE form-validation functions (tested)
│   └── main.js                # DOM wiring: gallery lightbox, FAQ accordion, sticky CTA,
│                              #   smooth scroll, form submit + file upload
├── assets/
│   ├── images/                # photos (placeholders committed; owner replaces)
│   │   └── placeholder.svg
│   └── README.md              # how to drop in real photos/video
├── apps-script/
│   └── Code.gs                # Google Apps Script Web App (form -> Drive + Sheet)
├── tests/
│   └── validation.test.js     # Vitest unit tests for js/validation.js
├── package.json               # dev-only: vitest
├── README.md                  # deploy + yearly-content-update + Apps Script setup guide
└── docs/superpowers/...       # spec + this plan (already present)
```

**Responsibility per file:**
- `index.html` — semantic structure and all Armenian content. Sections are `<section id="...">` landmarks.
- `css/styles.css` — all styling. Top `:root` block holds the palette/spacing tokens so the look can be retuned in one place.
- `js/validation.js` — pure, side-effect-free validation (no DOM). Importable by both the browser and Vitest.
- `js/main.js` — all browser interactivity. Imports `validation.js`.
- `apps-script/Code.gs` — server side; deployed separately in Google's console (instructions in README).

---

## Task 1: Project scaffolding, dev test runner, design tokens

**Files:**
- Create: `package.json`
- Create: `css/styles.css`
- Create: `index.html`
- Create: `assets/images/placeholder.svg`
- Create: `assets/README.md`
- Modify: `.gitignore` (already has `node_modules/`, `.superpowers/`, `.DS_Store` — verify only)

- [ ] **Step 1: Create `package.json` with Vitest (dev-only)**

```json
{
  "name": "camp-landing",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "serve": "python3 -m http.server 8000"
  },
  "devDependencies": {
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Install dev deps**

Run: `npm install`
Expected: `node_modules/` created, `vitest` available. (`node_modules/` is already gitignored.)

- [ ] **Step 3: Create `index.html` boilerplate**

```html
<!DOCTYPE html>
<html lang="hy">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ամառային քրիստոնեական ճամբար</title>
  <meta name="description" content="Ամառային քրիստոնեական ճամբար 8–13 տարեկան երեխաների համար Հրազդանում։ Անվճար, վճարվում է միայն ճանապարհը։">
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <!-- Sections added in later tasks -->
  <main id="top"></main>
  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 4: Create `css/styles.css` with design tokens, reset, base typography**

```css
/* ============ DESIGN TOKENS (retune the whole look here) ============ */
:root {
  --bg:           #fdf8f0;   /* warm light background */
  --surface:      #ffffff;   /* cards */
  --text:         #2b2419;   /* body text (near-black warm) */
  --text-soft:    #6b4a2e;   /* warm brown headings/labels */
  --muted:        #8a7256;   /* secondary text */
  --border:       #efe2cf;   /* hairlines */
  --accent:       #e9742f;   /* sunset orange */
  --accent-dark:  #c2541b;   /* hover / on-light text */
  --accent-2:     #f0a35a;   /* gradient end */

  --radius:       16px;
  --radius-lg:    22px;
  --shadow:       0 10px 30px rgba(180,110,40,0.14);
  --shadow-soft:  0 4px 14px rgba(120,80,30,0.10);

  --container:    1080px;
  --gap:          clamp(16px, 4vw, 28px);
  --section-y:    clamp(48px, 9vw, 96px);

  --font: -apple-system, "Segoe UI", "Noto Sans Armenian", "Helvetica Neue", Arial, sans-serif;
}

/* ============ RESET ============ */
*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; }
html { scroll-behavior: smooth; }
img, svg, video { display: block; max-width: 100%; height: auto; }

/* ============ BASE ============ */
body {
  font-family: var(--font);
  color: var(--text);
  background: var(--bg);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3 { color: var(--text-soft); line-height: 1.15; letter-spacing: -0.4px; }
h2 { font-size: clamp(26px, 5vw, 38px); }
h3 { font-size: clamp(18px, 3vw, 22px); }
p  { color: var(--text); }
a  { color: var(--accent-dark); }

/* ============ LAYOUT HELPERS ============ */
.container { width: 100%; max-width: var(--container); margin-inline: auto; padding-inline: clamp(16px, 5vw, 32px); }
.section { padding-block: var(--section-y); }
.section--tint { background: #fbf2e4; }
.section__lead { color: var(--muted); max-width: 60ch; margin-top: 10px; }
.label { text-transform: uppercase; letter-spacing: 1.5px; font-size: 12px; font-weight: 700; color: var(--accent-dark); }

/* ============ BUTTONS ============ */
.btn {
  display: inline-block; font-weight: 800; font-size: 16px;
  padding: 14px 28px; border-radius: 999px; border: 0; cursor: pointer;
  text-decoration: none; transition: transform .08s ease, background .2s ease;
}
.btn--primary { background: var(--accent); color: #fff; box-shadow: var(--shadow-soft); }
.btn--primary:hover { background: var(--accent-dark); }
.btn--on-accent { background: #fff; color: var(--accent-dark); }
.btn:active { transform: translateY(1px); }
```

- [ ] **Step 5: Create placeholder image and assets README**

`assets/images/placeholder.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#efe2cf"/>
  <text x="400" y="300" font-family="sans-serif" font-size="28" fill="#8a7256"
        text-anchor="middle" dominant-baseline="middle">Լուսանկար / Photo</text>
</svg>
```

`assets/README.md`:

```markdown
# Photos & video

Replace `images/placeholder.svg` references in `index.html` with real files.

- Put photos here as `images/camp-01.jpg`, `images/camp-02.jpg`, ...
- Recommended: JPG, max width ~1600px, compressed (<300 KB each) so the page stays fast.
- For the hero video, either drop `video/intro.mp4` here or use a YouTube embed
  (see the VIDEO section comment in index.html).
```

- [ ] **Step 6: Verify the page loads styled**

Run: `npm run serve` then open `http://localhost:8000`
Expected: blank warm-cream page, no console errors (Network tab shows `styles.css` and `main.js` 200 — `main.js` 404 is fine until Task 2 creates it; if so, create an empty `js/main.js` now).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json index.html css/ assets/
git commit -m "chore: scaffold static site, design tokens, dev test runner"
```

---

## Task 2: Form validation module (TDD)

This is the one piece of real logic. Build it test-first as a pure module.

**Files:**
- Test: `tests/validation.test.js`
- Create: `js/validation.js`

**Contract:** `validateRegistration(data)` takes a plain object and returns
`{ valid: boolean, errors: { [field]: string } }`. Error messages are in Armenian.
Allowed locations are exactly `["Աշտարակ", "Կոշ", "Օհանավան"]`.

- [ ] **Step 1: Write the failing tests**

`tests/validation.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { validateRegistration, ALLOWED_LOCATIONS } from '../js/validation.js';

const valid = {
  childName: 'Աննա Պետրոսյան',
  age: '10',
  parentName: 'Մարիամ Պետրոսյան',
  parentPhone: '+37491123456',
  location: 'Աշտարակ',
  consent: true,
  // optional:
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../js/validation.js'` (or export errors).

- [ ] **Step 3: Implement `js/validation.js`**

```js
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

  const age = Number(String(data.age).trim());
  if (isBlank(data.age) || !Number.isFinite(age) || age < 8 || age > 13) {
    errors.age = MSG.age;
  }

  const digits = String(data.parentPhone || '').replace(/\D/g, '');
  if (digits.length < 6) errors.parentPhone = MSG.phone;

  if (!ALLOWED_LOCATIONS.includes(data.location)) errors.location = MSG.location;

  if (data.consent !== true) errors.consent = MSG.consent;

  return { valid: Object.keys(errors).length === 0, errors };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — all assertions green.

- [ ] **Step 5: Commit**

```bash
git add js/validation.js tests/validation.test.js
git commit -m "feat: add tested pure form-validation module"
```

---

## Task 3: Page skeleton — semantic sections + sticky header nav

Lay down every section landmark so later tasks fill them in. Add a minimal top nav.

**Files:**
- Modify: `index.html` (replace `<main id="top">` block)
- Modify: `css/styles.css` (append header/nav styles)

- [ ] **Step 1: Replace the `<body>` inner structure in `index.html`**

```html
<body>
  <header class="site-header">
    <div class="container site-header__inner">
      <span class="site-header__logo">⛺ Ճամբար</span>
      <nav class="site-nav">
        <a href="#about">Ճամբարի մասին</a>
        <a href="#gallery">Լուսանկարներ</a>
        <a href="#program">Ծրագիր</a>
        <a href="#faq">Հարցեր</a>
      </nav>
      <a href="#register" class="btn btn--primary btn--sm">Գրանցվել</a>
    </div>
  </header>

  <main id="top">
    <section id="hero"          class="hero"></section>
    <section id="about"         class="section"></section>
    <section id="eligibility"   class="section section--tint"></section>
    <section id="gallery"       class="section"></section>
    <section id="video"         class="section section--tint"></section>
    <section id="program"       class="section"></section>
    <section id="accommodation" class="section section--tint"></section>
    <section id="leaders"       class="section"></section>
    <section id="bring"         class="section section--tint"></section>
    <section id="price"         class="section"></section>
    <section id="reviews"       class="section section--tint" hidden></section>
    <section id="faq"           class="section"></section>
    <section id="register"      class="section section--tint"></section>
  </main>

  <footer id="contacts" class="site-footer"></footer>

  <!-- Sticky mobile CTA (Task 12) -->
  <a href="#register" class="cta-sticky btn btn--primary" id="ctaSticky">Գրանցվել</a>

  <script type="module" src="js/main.js"></script>
</body>
```

- [ ] **Step 2: Append header/nav CSS to `css/styles.css`**

```css
/* ============ HEADER / NAV ============ */
.site-header { position: sticky; top: 0; z-index: 40; background: rgba(253,248,240,0.92);
  backdrop-filter: blur(8px); border-bottom: 1px solid var(--border); }
.site-header__inner { display: flex; align-items: center; gap: 16px; min-height: 60px; }
.site-header__logo { font-weight: 800; color: var(--text-soft); }
.site-nav { display: none; gap: 22px; margin-left: auto; }
.site-nav a { color: var(--text); text-decoration: none; font-weight: 600; font-size: 15px; }
.site-nav a:hover { color: var(--accent-dark); }
.btn--sm { padding: 9px 18px; font-size: 14px; margin-left: auto; }
@media (min-width: 760px) {
  .site-nav { display: flex; }
  .btn--sm { margin-left: 0; }
}
.cta-sticky { display: none; }  /* shown on mobile in Task 12 */
```

- [ ] **Step 3: Verify**

Run: `npm run serve`, open `http://localhost:8000`.
Expected: sticky header with logo, nav links (visible ≥760px wide, hidden on narrow), and a "Գրանցվել" button. Empty sections below. No console errors.

- [ ] **Step 4: Commit**

```bash
git add index.html css/styles.css
git commit -m "feat: page skeleton with semantic sections and sticky nav"
```

---

## Task 4: Hero section

**Files:**
- Modify: `index.html` (`#hero`)
- Modify: `css/styles.css` (append hero styles)

- [ ] **Step 1: Fill `#hero` in `index.html`**

```html
<section id="hero" class="hero">
  <div class="hero__bg">
    <!-- ЗАПОЛНИТЬ: заменить на реальное фото детей -->
    <img src="assets/images/placeholder.svg" alt="Երեխաները ճամբարում">
  </div>
  <div class="container hero__inner">
    <span class="hero__badge">Անվճար · վճարվում է միայն ճանապարհը</span>
    <h1 class="hero__title">Ամառային<br>քրիստոնեական ճամբար</h1>
    <p class="hero__sub">Հինգ օր բնության գրկում՝ խաղ, ընկերներ և հավատ՝
      8–13 տարեկան երեխաների համար։</p>
    <div class="hero__facts">
      <span>👧 8–13 տարեկան</span>
      <span>🛏 գիշերակացով</span>
      <span>📅 5 օր</span>
      <span>📍 Հրազդան</span>
    </div>
    <a href="#register" class="btn btn--on-accent hero__cta">Գրանցվել →</a>
  </div>
</section>
```

- [ ] **Step 2: Append hero CSS**

```css
/* ============ HERO ============ */
.hero { position: relative; color: #fff; overflow: hidden; isolation: isolate;
  background: linear-gradient(160deg, #e9742f 0%, #f0a35a 100%); }
.hero__bg { position: absolute; inset: 0; z-index: -2; }
.hero__bg img { width: 100%; height: 100%; object-fit: cover; }
.hero::after { content: ""; position: absolute; inset: 0; z-index: -1;
  background: linear-gradient(165deg, rgba(194,84,27,0.86), rgba(233,116,47,0.66)); }
.hero__inner { padding-block: clamp(56px, 14vw, 130px); max-width: 720px; }
.hero__badge { display: inline-block; background: rgba(255,255,255,0.18);
  border: 1px solid rgba(255,255,255,0.55); padding: 6px 14px; border-radius: 999px;
  font-size: 13px; font-weight: 600; margin-bottom: 18px; }
.hero__title { color: #fff; font-size: clamp(32px, 8vw, 60px); }
.hero__sub { margin-top: 14px; font-size: clamp(15px, 2.4vw, 19px); max-width: 40ch; opacity: .97; }
.hero__facts { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 22px; }
.hero__facts span { background: rgba(255,255,255,0.92); color: var(--text-soft);
  font-size: 13px; font-weight: 600; padding: 7px 13px; border-radius: 999px; }
.hero__cta { margin-top: 26px; }
```

- [ ] **Step 3: Verify** — reload; full-bleed warm hero, readable white text over the (placeholder) image, facts as chips, CTA scrolls to `#register`. Check on a narrow (≈375px) window: title wraps cleanly, no horizontal scroll.

- [ ] **Step 4: Commit**

```bash
git add index.html css/styles.css
git commit -m "feat: hero section"
```

---

## Task 5: "About / values" and "Eligibility" sections

**Files:**
- Modify: `index.html` (`#about`, `#eligibility`)
- Modify: `css/styles.css` (append)

- [ ] **Step 1: Fill `#about`**

```html
<section id="about" class="section">
  <div class="container">
    <span class="label">Ճամբարի մասին</span>
    <h2>Մեկ շաբաթ, որ երեխան երբեք չի մոռանա</h2>
    <p class="section__lead">Ամեն ամառ մենք երեխաների համար ստեղծում ենք ապահով ու
      ուրախ միջավայր՝ ուր նրանք խաղում են, նոր ընկերներ ձեռք բերում և սովորում
      հավատի մասին։</p>
    <div class="cards-grid">
      <article class="vcard"><div class="vcard__ico">✝️</div><h3>Հոգևոր պարապմունք</h3>
        <p>Պարզ ու հետաքրքիր դասեր երեխաների լեզվով։</p></article>
      <article class="vcard"><div class="vcard__ico">🌳</div><h3>Խաղեր և բնություն</h3>
        <p>Շարժ, մաքուր օդ և ակտիվ խաղեր ամբողջ օրը։</p></article>
      <article class="vcard"><div class="vcard__ico">🤝</div><h3>Նոր ընկերներ</h3>
        <p>Երեխաները կապեր են ստեղծում, որ մնում են տարիներ։</p></article>
      <article class="vcard"><div class="vcard__ico">🛡️</div><h3>Ապահովություն</h3>
        <p>Փորձառու ղեկավարներ՝ շուրջօրյա հսկողությամբ։</p></article>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Fill `#eligibility`**

```html
<section id="eligibility" class="section section--tint">
  <div class="container eligibility">
    <span class="label">Ո՞ւմ համար է</span>
    <h2>Ճամբարը՝ Աշտարակի, Կոշի և Օհանավանի երեխաների համար</h2>
    <p class="section__lead">Ընդունվում են 8–13 տարեկան երեխաներ այս բնակավայրերից։
      Գրանցումը նախնական է. ձեր հայտը հաստատելու համար մենք կզանգահարենք։</p>
    <div class="eligibility__places">
      <span>Աշտարակ</span><span>Կոշ</span><span>Օհանավան</span>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Append CSS**

```css
/* ============ CARDS GRID (values) ============ */
.cards-grid { display: grid; grid-template-columns: 1fr; gap: var(--gap); margin-top: 28px; }
@media (min-width: 560px){ .cards-grid { grid-template-columns: 1fr 1fr; } }
@media (min-width: 900px){ .cards-grid { grid-template-columns: repeat(4,1fr); } }
.vcard { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 22px; box-shadow: var(--shadow-soft); }
.vcard__ico { font-size: 30px; }
.vcard h3 { margin-top: 10px; }
.vcard p { margin-top: 6px; color: var(--muted); font-size: 15px; }

/* ============ ELIGIBILITY ============ */
.eligibility__places { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 22px; }
.eligibility__places span { background: var(--accent); color: #fff; font-weight: 800;
  font-size: clamp(16px,3vw,20px); padding: 12px 26px; border-radius: 999px; }
```

- [ ] **Step 4: Verify** — reload; four value cards reflow 1→2→4 columns as the window widens; eligibility section shows the three place pills prominently.

- [ ] **Step 5: Commit**

```bash
git add index.html css/styles.css
git commit -m "feat: about/values and eligibility sections"
```

---

## Task 6: Photo gallery + lightbox

**Files:**
- Modify: `index.html` (`#gallery`)
- Create: `js/main.js` (start it here; later tasks append)
- Modify: `css/styles.css` (append)

- [ ] **Step 1: Fill `#gallery`** (6 placeholders; owner swaps for real photos)

```html
<section id="gallery" class="section">
  <div class="container">
    <span class="label">Լուսանկարներ</span>
    <h2>Տեսեք, ինչպիսին է ճամբարը</h2>
    <p class="section__lead">Անցած տարիների կադրեր։</p>
    <div class="gallery">
      <!-- ЗАПОЛНИТЬ: заменить src на реальные фото assets/images/camp-XX.jpg -->
      <button class="gallery__item" data-full="assets/images/placeholder.svg"><img src="assets/images/placeholder.svg" alt="Ճամբարի կադր 1" loading="lazy"></button>
      <button class="gallery__item" data-full="assets/images/placeholder.svg"><img src="assets/images/placeholder.svg" alt="Ճամբարի կադր 2" loading="lazy"></button>
      <button class="gallery__item" data-full="assets/images/placeholder.svg"><img src="assets/images/placeholder.svg" alt="Ճամբարի կադր 3" loading="lazy"></button>
      <button class="gallery__item" data-full="assets/images/placeholder.svg"><img src="assets/images/placeholder.svg" alt="Ճամբարի կադր 4" loading="lazy"></button>
      <button class="gallery__item" data-full="assets/images/placeholder.svg"><img src="assets/images/placeholder.svg" alt="Ճամբարի կադր 5" loading="lazy"></button>
      <button class="gallery__item" data-full="assets/images/placeholder.svg"><img src="assets/images/placeholder.svg" alt="Ճամբարի կադр 6" loading="lazy"></button>
    </div>
  </div>
  <div class="lightbox" id="lightbox" hidden>
    <button class="lightbox__close" id="lightboxClose" aria-label="Փակել">✕</button>
    <img class="lightbox__img" id="lightboxImg" src="" alt="">
  </div>
</section>
```

- [ ] **Step 2: Create `js/main.js` with the lightbox wiring**

```js
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
```

- [ ] **Step 3: Append gallery + lightbox CSS**

```css
/* ============ GALLERY ============ */
.gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 24px; }
@media (min-width: 700px){ .gallery { grid-template-columns: repeat(3,1fr); gap: 14px; } }
.gallery__item { padding: 0; border: 0; cursor: pointer; border-radius: var(--radius);
  overflow: hidden; background: var(--border); aspect-ratio: 4/3; }
.gallery__item img { width: 100%; height: 100%; object-fit: cover; transition: transform .25s ease; }
.gallery__item:hover img { transform: scale(1.05); }

/* ============ LIGHTBOX ============ */
.lightbox { position: fixed; inset: 0; z-index: 60; display: flex; align-items: center;
  justify-content: center; background: rgba(20,12,4,0.86); padding: 20px; }
.lightbox[hidden] { display: none; }
.lightbox__img { max-width: 92vw; max-height: 86vh; border-radius: 12px; }
.lightbox__close { position: absolute; top: 16px; right: 18px; font-size: 26px; color: #fff;
  background: none; border: 0; cursor: pointer; }
```

- [ ] **Step 4: Verify** — reload; gallery grid (2 cols mobile, 3 desktop). Click a tile → dark overlay opens with the image; clicking ✕, the backdrop, or pressing Esc closes it; body scroll is locked while open.

- [ ] **Step 5: Commit**

```bash
git add index.html js/main.js css/styles.css
git commit -m "feat: photo gallery with lightbox"
```

---

## Task 7: Video and "Program (5 days)" sections

**Files:**
- Modify: `index.html` (`#video`, `#program`)
- Modify: `css/styles.css` (append)

- [ ] **Step 1: Fill `#video`** (YouTube embed by default; swap for self-hosted if preferred)

```html
<section id="video" class="section section--tint">
  <div class="container">
    <span class="label">Տեսանյութ</span>
    <h2>Ճամբարը՝ մեկ րոպեում</h2>
    <div class="video__frame">
      <!-- ЗАПОЛНИТЬ: вставить ID ролика вместо VIDEO_ID, или заменить на <video src="assets/video/intro.mp4" controls> -->
      <iframe src="https://www.youtube-nocookie.com/embed/VIDEO_ID"
        title="Ճամբարի տեսանյութ" loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Fill `#program`** (5 day cards)

```html
<section id="program" class="section">
  <div class="container">
    <span class="label">Ծրագիր</span>
    <h2>5 օր ճամբարում</h2>
    <p class="section__lead">Ամեն օր՝ առավոտյան պարապմունք, ակտիվ խաղեր, ստեղծագործ
      զբաղմունք և երեկոյան հանդիպումներ։ <!-- ЗАПОЛНИТЬ: уточнить программу при желании --></p>
    <ol class="days">
      <li class="day"><span class="day__n">Օր 1</span><h3>Ծանոթություն</h3><p>Տեղավորում, ծանոթացման խաղեր, բացման երեկո։</p></li>
      <li class="day"><span class="day__n">Օր 2</span><h3>Արկածներ բնության մեջ</h3><p>Արշավ, թիմային խաղեր, պարապմունք։</p></li>
      <li class="day"><span class="day__n">Օр 3</span><h3>Ստեղծագործություն</h3><p>Արհեստ, երաժշտություն, մրցույթներ։</p></li>
      <li class="day"><span class="day__n">Օր 4</span><h3>Թիմ և հավատ</h3><p>Համատեղ նախագծեր, զրույցներ, խարույկ։</p></li>
      <li class="day"><span class="day__n">Օр 5</span><h3>Տոն և հրաժեշտ</h3><p>Եզրափակիչ տոն, պարգևներ, ընտանիքների հանդիպում։</p></li>
    </ol>
  </div>
</section>
```

- [ ] **Step 3: Append CSS**

```css
/* ============ VIDEO ============ */
.video__frame { position: relative; margin-top: 22px; aspect-ratio: 16/9;
  border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow); background:#000; }
.video__frame iframe, .video__frame video { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }

/* ============ PROGRAM (days) ============ */
.days { list-style: none; padding: 0; margin-top: 26px; display: grid; gap: 14px;
  grid-template-columns: 1fr; }
@media (min-width: 640px){ .days { grid-template-columns: 1fr 1fr; } }
@media (min-width: 980px){ .days { grid-template-columns: repeat(5,1fr); } }
.day { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 18px; box-shadow: var(--shadow-soft); }
.day__n { display: inline-block; font-weight: 800; color: var(--accent-dark);
  background: #fbe7d6; padding: 3px 10px; border-radius: 999px; font-size: 13px; }
.day h3 { margin-top: 10px; font-size: 17px; }
.day p { margin-top: 6px; color: var(--muted); font-size: 14px; }
```

- [ ] **Step 4: Verify** — reload; video keeps 16:9 at all widths (placeholder iframe may show a YouTube error until a real ID is set — that's expected). Program shows 5 day-cards reflowing 1→2→5 columns.

- [ ] **Step 5: Commit**

```bash
git add index.html css/styles.css
git commit -m "feat: video and 5-day program sections"
```

---

## Task 8: "Accommodation & safety", "Leaders", "What to bring" sections

**Files:**
- Modify: `index.html` (`#accommodation`, `#leaders`, `#bring`)
- Modify: `css/styles.css` (append)

- [ ] **Step 1: Fill `#accommodation`**

```html
<section id="accommodation" class="section section--tint">
  <div class="container">
    <span class="label">Կեցություն և անվտանգություն</span>
    <h2>Ապահով պայմաններ ձեր երեխայի համար</h2>
    <div class="feature-list">
      <div class="feature"><span class="feature__ico">🛏</span><div><h3>Հարմարավետ ննջասենյակներ</h3><p>Մաքուր, ջեռուցվող սենյակներ՝ առանձին տղաների և աղջիկների համար։</p></div></div>
      <div class="feature"><span class="feature__ico">🍲</span><div><h3>Օրը 3 անգամ սնունդ</h3><p>Տաք, համեղ և առողջարար կերակուր։</p></div></div>
      <div class="feature"><span class="feature__ico">👀</span><div><h3>Շուրջօրյա հսկողություն</h3><p>Ղեկավարները միշտ երեխաների կողքին են։</p></div></div>
      <div class="feature"><span class="feature__ico">⛑️</span><div><h3>Բժշկական աջակցություն</h3><p>Առաջին օգնության միջոցներ տեղում։</p></div></div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Fill `#leaders`** (NO photos, NO names — experience-focused, per spec)

```html
<section id="leaders" class="section">
  <div class="container leaders">
    <span class="label">Մեր ղեկավարները</span>
    <h2>Փորձառու և վստահելի թիմ</h2>
    <p class="leaders__text">Ճամբարը վարում են ղեկավարներ, ովքեր երկար տարիներ
      աշխատում են երեխաների հետ։ Նրանք պատասխանատու են, պատրաստված և ուշադիր՝
      ապահովելու համար, որ ձեր երեխան լինի ապահով և երջանիկ ձեռքերում։</p>
    <div class="leaders__stats">
      <div><strong>10+</strong><span>տարվա փորձ</span></div>
      <div><strong>24/7</strong><span>հսկողություն</span></div>
      <div><strong>100%</strong><span>նվիրվածություն</span></div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Fill `#bring`**

```html
<section id="bring" class="section section--tint">
  <div class="container">
    <span class="label">Ի՞նչ վերցնել հետը</span>
    <h2>Երեխայի պայուսակը</h2>
    <ul class="bring-list">
      <li>Հագուստ՝ 5 օրվա համար</li>
      <li>Տաք բաճկոն երեկոների համար</li>
      <li>Հարմարավետ կոշիկներ</li>
      <li>Անձնական հիգիենայի պարագաներ</li>
      <li>Սրբիչ</li>
      <li>Ջրաման</li>
      <li>Անհրաժեշտ դեղորայք (եթե կա)</li>
      <!-- ЗАПОЛНИТЬ: добавить/убрать пункты при необходимости -->
    </ul>
  </div>
</section>
```

- [ ] **Step 4: Append CSS**

```css
/* ============ FEATURE LIST (accommodation) ============ */
.feature-list { display: grid; gap: 16px; margin-top: 24px; grid-template-columns: 1fr; }
@media (min-width: 720px){ .feature-list { grid-template-columns: 1fr 1fr; } }
.feature { display: flex; gap: 14px; background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 18px; box-shadow: var(--shadow-soft); }
.feature__ico { font-size: 26px; }
.feature h3 { font-size: 17px; }
.feature p { margin-top: 4px; color: var(--muted); font-size: 14px; }

/* ============ LEADERS ============ */
.leaders__text { max-width: 60ch; margin-top: 12px; font-size: 17px; }
.leaders__stats { display: flex; flex-wrap: wrap; gap: 28px; margin-top: 26px; }
.leaders__stats div { display: flex; flex-direction: column; }
.leaders__stats strong { font-size: clamp(28px,5vw,40px); color: var(--accent-dark); }
.leaders__stats span { color: var(--muted); font-size: 14px; }

/* ============ BRING LIST ============ */
.bring-list { columns: 2; column-gap: 28px; margin-top: 22px; padding-left: 18px; }
@media (max-width: 480px){ .bring-list { columns: 1; } }
.bring-list li { margin-bottom: 8px; }
```

- [ ] **Step 5: Verify** — reload; accommodation features in a 1/2-col grid; leaders block is text + 3 stats and contains **no images and no personal names**; bring-list shows as two columns (one on narrow screens).

- [ ] **Step 6: Commit**

```bash
git add index.html css/styles.css
git commit -m "feat: accommodation, leaders, and what-to-bring sections"
```

---

## Task 9: "Price", hidden "Reviews", and "FAQ" (accordion) sections

**Files:**
- Modify: `index.html` (`#price`, `#reviews`, `#faq`)
- Modify: `js/main.js` (append FAQ accordion)
- Modify: `css/styles.css` (append)

- [ ] **Step 1: Fill `#price`**

```html
<section id="price" class="section">
  <div class="container price">
    <span class="label">Արժեքը</span>
    <div class="price__card">
      <p class="price__big">Ճամբարը <strong>անվճար է</strong></p>
      <p class="price__note">Վճարվում է միայն ճանապարհածախսը՝ <strong>3000–4000 ֏</strong></p>
      <a href="#register" class="btn btn--primary">Գրանցվել</a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Fill `#reviews`** (kept `hidden` on the `<section>` from Task 3; structure ready for the owner)

```html
<section id="reviews" class="section section--tint" hidden>
  <!-- Чтобы показать отзывы: удалить атрибут hidden у этой <section> и заполнить карточки. -->
  <div class="container">
    <span class="label">Կարծիքներ</span>
    <h2>Ծնողների կարծիքները</h2>
    <div class="reviews">
      <blockquote class="review">
        <p>«ЗАПОЛНИТЬ: текст отзыва»</p>
        <cite>— ЗАПОЛНИТЬ: имя</cite>
      </blockquote>
      <!-- копировать .review для каждого отзыва -->
    </div>
  </div>
</section>
```

- [ ] **Step 3: Fill `#faq`**

```html
<section id="faq" class="section">
  <div class="container">
    <span class="label">Հաճախ տրվող հարցեր</span>
    <h2>Հարցեր ծնողներից</h2>
    <div class="faq">
      <details class="faq__item"><summary>Կարո՞ղ եմ կապ պահել երեխայիս հետ։</summary>
        <p>Այո։ Ղեկավարների հետ կապի համարը կտրամադրվի գրանցումից հետո։</p></details>
      <details class="faq__item"><summary>Որքա՞ն է տևում ճամբարը։</summary>
        <p>5 օր՝ գիշերակացով, Հրազդանում։</p></details>
      <details class="faq__item"><summary>Ի՞նչ արժե մասնակցությունը։</summary>
        <p>Ճամբարը անվճար է. վճարվում է միայն ճանապարհը՝ 3000–4000 ֏։</p></details>
      <details class="faq__item"><summary>Ո՞վ է վարում ճամբարը։</summary>
        <p>Փորձառու, պատասխանատու ղեկավարների թիմ՝ երկար տարիների փորձով։</p></details>
      <!-- ЗАПОЛНИТЬ: добавить вопросы при необходимости -->
    </div>
  </div>
</section>
```

- [ ] **Step 4: Append FAQ accordion JS to `js/main.js`** — add an `initFaq` that keeps only one `<details>` open at a time, and call it from the `DOMContentLoaded` handler.

Add this function:

```js
/* ---------- FAQ: single-open accordion ---------- */
function initFaq() {
  const items = document.querySelectorAll('.faq__item');
  items.forEach((d) => {
    d.addEventListener('toggle', () => {
      if (d.open) items.forEach((o) => { if (o !== d) o.open = false; });
    });
  });
}
```

And update the existing init block to:

```js
document.addEventListener('DOMContentLoaded', () => {
  initLightbox();
  initFaq();
});
```

- [ ] **Step 5: Append CSS**

```css
/* ============ PRICE ============ */
.price__card { background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-lg); box-shadow: var(--shadow); padding: clamp(24px,5vw,44px);
  text-align: center; max-width: 560px; margin-inline: auto; }
.price__big { font-size: clamp(22px,4vw,30px); color: var(--text-soft); }
.price__big strong { color: var(--accent-dark); }
.price__note { margin-top: 10px; color: var(--muted); font-size: 17px; }
.price__card .btn { margin-top: 22px; }

/* ============ REVIEWS ============ */
.reviews { display: grid; gap: 16px; margin-top: 24px; grid-template-columns: 1fr; }
@media (min-width: 720px){ .reviews { grid-template-columns: 1fr 1fr; } }
.review { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 20px; box-shadow: var(--shadow-soft); }
.review cite { display: block; margin-top: 10px; color: var(--accent-dark); font-weight: 700; font-style: normal; }

/* ============ FAQ ============ */
.faq { margin-top: 22px; max-width: 760px; }
.faq__item { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 4px 18px; margin-bottom: 10px; }
.faq__item summary { cursor: pointer; font-weight: 700; color: var(--text-soft);
  padding: 14px 0; list-style: none; }
.faq__item summary::-webkit-details-marker { display: none; }
.faq__item summary::after { content: "+"; float: right; color: var(--accent); font-size: 22px; line-height: 1; }
.faq__item[open] summary::after { content: "–"; }
.faq__item p { padding-bottom: 14px; color: var(--muted); }
```

- [ ] **Step 6: Verify** — reload; price card centered with free + transport note; the reviews `<section>` is not visible (still `hidden`); FAQ items expand/collapse and opening one closes the others.

- [ ] **Step 7: Commit**

```bash
git add index.html js/main.js css/styles.css
git commit -m "feat: price, hidden reviews scaffold, and FAQ accordion"
```

---

## Task 10: Registration form (markup + validation wiring + submit + file upload)

This uses the tested `validateRegistration` from Task 2 and posts to the Apps Script endpoint built in Task 14. The endpoint URL is a single constant the owner pastes in after deploying the script.

**Files:**
- Modify: `index.html` (`#register`)
- Modify: `js/main.js` (append form wiring)
- Modify: `css/styles.css` (append)

- [ ] **Step 1: Fill `#register`**

```html
<section id="register" class="section section--tint">
  <div class="container register">
    <span class="label">Գրանցում</span>
    <h2>Գրանցեք ձեր երեխային</h2>
    <p class="section__lead">Սա նախնական հայտ է։ Մենք կզանգահարենք՝ հաստատելու համար։</p>

    <form id="regForm" class="reg-form" novalidate>
      <div class="field">
        <label for="childName">Երեխայի անուն, ազգանուն *</label>
        <input id="childName" name="childName" type="text" autocomplete="name">
        <small class="error" data-error-for="childName"></small>
      </div>
      <div class="field">
        <label for="age">Տարիք (8–13) *</label>
        <input id="age" name="age" type="number" min="8" max="13" inputmode="numeric">
        <small class="error" data-error-for="age"></small>
      </div>
      <div class="field">
        <label for="parentName">Ծնողի անուն *</label>
        <input id="parentName" name="parentName" type="text">
        <small class="error" data-error-for="parentName"></small>
      </div>
      <div class="field">
        <label for="parentPhone">Ծնողի հեռախոս *</label>
        <input id="parentPhone" name="parentPhone" type="tel" inputmode="tel" autocomplete="tel">
        <small class="error" data-error-for="parentPhone"></small>
      </div>
      <div class="field">
        <label for="location">Որտեղի՞ց եք *</label>
        <select id="location" name="location">
          <option value="">— Ընտրեք —</option>
          <option value="Աշտարակ">Աշտարակ</option>
          <option value="Կոշ">Կոշ</option>
          <option value="Օհանավան">Օհանավան</option>
        </select>
        <small class="error" data-error-for="location"></small>
      </div>
      <div class="field">
        <label for="health">Առողջություն / ալերգիա</label>
        <textarea id="health" name="health" rows="2"></textarea>
      </div>
      <div class="field">
        <label for="birthCert">Ծննդյան վկայականի պատճեն (ըստ ցանկության)</label>
        <input id="birthCert" name="birthCert" type="file" accept="image/*,application/pdf">
        <small class="hint">Կարող եք կցել հիմա կամ բերել պատճենը ճամբար գալիս։</small>
      </div>
      <div class="field">
        <label for="comment">Մեկնաբանություն</label>
        <textarea id="comment" name="comment" rows="2"></textarea>
      </div>
      <div class="field field--check">
        <label><input id="consent" name="consent" type="checkbox"> Ես՝ որպես ծնող, համաձայն եմ երեխայի մասնակցությանը *</label>
        <small class="error" data-error-for="consent"></small>
      </div>

      <button type="submit" class="btn btn--primary reg-form__submit">Ուղարկել հայտը</button>
      <p class="reg-form__status" id="regStatus" role="status" aria-live="polite"></p>
    </form>
  </div>
</section>
```

- [ ] **Step 2: Append form wiring to `js/main.js`**

Add the endpoint constant near the top of the file (just after the import):

```js
// ЗАПОЛНИТЬ: вставить URL развёрнутого Google Apps Script Web App (см. README, Task 14).
const REGISTRATION_ENDPOINT = 'PASTE_APPS_SCRIPT_WEB_APP_URL_HERE';
```

Add these functions:

```js
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
      await fetch(REGISTRATION_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      });
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
```

Update the init block to:

```js
document.addEventListener('DOMContentLoaded', () => {
  initLightbox();
  initFaq();
  initRegForm();
});
```

- [ ] **Step 3: Append form CSS**

```css
/* ============ REGISTRATION FORM ============ */
.reg-form { margin-top: 24px; max-width: 560px; display: grid; gap: 16px; }
.field { display: grid; gap: 6px; }
.field label { font-weight: 700; color: var(--text-soft); font-size: 15px; }
.field input, .field select, .field textarea {
  font: inherit; padding: 12px 14px; border: 1px solid var(--border); border-radius: 12px;
  background: #fff; color: var(--text); width: 100%; }
.field input:focus, .field select:focus, .field textarea:focus {
  outline: 2px solid var(--accent); outline-offset: 1px; border-color: var(--accent); }
.field--check label { display: flex; align-items: flex-start; gap: 10px; font-weight: 600; }
.field--check input { width: auto; margin-top: 3px; }
.hint { color: var(--muted); font-size: 13px; }
.error { color: #c0392b; font-size: 13px; min-height: 1em; }
.reg-form__submit { justify-self: start; margin-top: 6px; }
.reg-form__status { font-weight: 700; min-height: 1.2em; }
.reg-form__status.is-ok { color: #2f7a4d; }
.reg-form__status.is-error { color: #c0392b; }
```

- [ ] **Step 4: Verify validation UX (no backend needed yet)** — reload; submit the empty form → inline Armenian errors appear under required fields and the status line prompts to fill them; the location `<select>` only offers the three places; choosing a valid set clears errors. (Actual network submit is verified in Task 14 after the endpoint exists; until then a submit attempt will show the error status, which is fine.)

- [ ] **Step 5: Commit**

```bash
git add index.html js/main.js css/styles.css
git commit -m "feat: registration form with validation, file upload, and submit"
```

---

## Task 11: Contacts / footer

**Files:**
- Modify: `index.html` (`#contacts` footer)
- Modify: `css/styles.css` (append)

- [ ] **Step 1: Fill the `<footer id="contacts">`**

```html
<footer id="contacts" class="site-footer">
  <div class="container site-footer__grid">
    <div>
      <h3>Կապ մեզ հետ</h3>
      <p>📞 <a href="tel:+374XXXXXXXX">+374 XX XXX XXX</a> <!-- ЗАПОЛНИТЬ: телефон --></p>
      <p>✉️ <a href="mailto:EMAIL">EMAIL</a> <!-- ЗАПОЛНИТЬ: email --></p>
      <p class="site-footer__social">
        <a href="#"><!-- ЗАПОЛНИТЬ: Facebook -->Facebook</a> ·
        <a href="#"><!-- ЗАПОЛНИТЬ: Instagram -->Instagram</a>
      </p>
    </div>
    <div>
      <h3>Որտեղ ենք</h3>
      <p>Հրազդան <!-- ЗАПОЛНИТЬ: точный адрес --></p>
      <!-- ЗАПОЛНИТЬ: вставить embed карты Google Maps (Share → Embed a map) -->
      <iframe class="site-footer__map" src="" title="Քարտեզ" loading="lazy"></iframe>
    </div>
  </div>
  <div class="container site-footer__copy">© <span id="year"></span> Ամառային ճամբар</div>
</footer>
```

- [ ] **Step 2: Append a small JS line to fill the year** — add to the `DOMContentLoaded` handler in `js/main.js`:

```js
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
```

- [ ] **Step 3: Append footer CSS**

```css
/* ============ FOOTER ============ */
.site-footer { background: #2b2419; color: #f4ece0; padding-block: 48px 28px; margin-top: 20px; }
.site-footer h3 { color: #fff; }
.site-footer a { color: #f0a35a; }
.site-footer__grid { display: grid; gap: 28px; grid-template-columns: 1fr; }
@media (min-width: 720px){ .site-footer__grid { grid-template-columns: 1fr 1fr; } }
.site-footer__social { margin-top: 8px; }
.site-footer__map { width: 100%; height: 220px; border: 0; border-radius: var(--radius); margin-top: 10px; }
.site-footer__copy { margin-top: 28px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.15);
  font-size: 13px; color: #cdbfa f; }
```

> Note: fix the typo if pasted — the last color must be `#cdbfaf`.

- [ ] **Step 4: Verify** — reload; dark footer with contact column + location/map column (map empty until owner pastes an embed URL), and the year auto-fills.

- [ ] **Step 5: Commit**

```bash
git add index.html js/main.js css/styles.css
git commit -m "feat: contacts/footer with map slot and auto year"
```

---

## Task 12: Sticky mobile CTA + active-link polish

**Files:**
- Modify: `css/styles.css` (show `.cta-sticky` on mobile)
- Modify: `js/main.js` (hide sticky CTA when the register form is on screen)

- [ ] **Step 1: Append CSS to reveal the sticky CTA on small screens**

```css
/* ============ STICKY MOBILE CTA ============ */
@media (max-width: 759px) {
  .cta-sticky { display: block; position: fixed; left: 16px; right: 16px; bottom: 16px;
    z-index: 50; text-align: center; box-shadow: 0 8px 22px rgba(194,84,27,0.45);
    transition: opacity .25s ease, transform .25s ease; }
  .cta-sticky.is-hidden { opacity: 0; transform: translateY(120%); pointer-events: none; }
  body { padding-bottom: 72px; } /* room so footer isn't covered */
}
```

- [ ] **Step 2: Append JS to hide the sticky CTA once the form is visible** — add `initStickyCta` and call it:

```js
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
```

Update the init block to also call `initStickyCta();`.

- [ ] **Step 3: Verify** — narrow the window to <760px: a full-width "Գրանցվել" button sticks to the bottom; scroll down to the registration form and the sticky button slides away; scroll back up and it returns. On desktop (≥760px) the sticky button is not shown.

- [ ] **Step 4: Commit**

```bash
git add css/styles.css js/main.js
git commit -m "feat: sticky mobile CTA that hides over the form"
```

---

## Task 13: Responsive & cross-section QA pass

No new features — verify the whole page holds together. Fix any issues found, committing fixes individually.

**Files:** any of `index.html`, `css/styles.css`, `js/main.js` as needed.

- [ ] **Step 1: Mobile (≈375px) walkthrough**

Run: `npm run serve`; open `http://localhost:8000`; in browser devtools set width 375px.
Check, top to bottom: no horizontal scrollbar anywhere; hero text readable; nav collapsed; all section paddings consistent; gallery 2-col; program/days stack; form inputs full-width and tappable; sticky CTA visible then hides over form.
Expected: all true. Fix + commit any problem.

- [ ] **Step 2: Tablet (≈768px) and desktop (≈1200px) walkthrough**

Check: nav links appear ≥760px; grids expand (values→4, days→5, gallery→3); container max-width caps content at 1080px and centers it; sticky mobile CTA hidden.
Expected: all true.

- [ ] **Step 3: Run the unit tests once more**

Run: `npm test`
Expected: PASS (validation suite still green).

- [ ] **Step 4: Console check** — reload with devtools console open; no JS errors. (A YouTube embed warning from the placeholder `VIDEO_ID` is acceptable.)

- [ ] **Step 5: Commit** (only if fixes were made)

```bash
git add -A
git commit -m "fix: responsive QA adjustments"
```

---

## Task 14: Google Apps Script backend (form → Drive + Sheet)

The site is static, so the form needs a tiny server. Google Apps Script is free and writes straight into a Google Sheet + Drive folder owned by the camp.

**Files:**
- Create: `apps-script/Code.gs`

- [ ] **Step 1: Create `apps-script/Code.gs`**

```javascript
/**
 * Camp registration endpoint.
 * Receives a JSON body (sent as text/plain) from the landing page form,
 * optionally saves an uploaded birth-certificate file to a private Drive
 * folder, and appends a row to the bound Google Sheet.
 *
 * Deploy: Extensions ▸ Apps Script from a Google Sheet, paste this, then
 * Deploy ▸ New deployment ▸ Web app ▸ Execute as: Me ▸ Who has access: Anyone.
 * Copy the Web App URL into js/main.js (REGISTRATION_ENDPOINT).
 */

// ЗАПОЛНИТЬ: ID приватной папки Google Drive для загруженных свидетельств.
// (Создайте папку, откройте её, скопируйте ID из URL после /folders/.)
var DRIVE_FOLDER_ID = 'PASTE_PRIVATE_DRIVE_FOLDER_ID';

var HEADERS = ['Ամսաթիվ', 'Երեխա', 'Տարիք', 'Ծնող', 'Հեռախոս',
               'Բնակավայր', 'Առողջություն', 'Մեկնաբանություն', 'Վկայական', 'Համաձայնություն'];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);

    var fileLink = '';
    if (data.fileData && data.fileName) {
      var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
      var blob = Utilities.newBlob(
        Utilities.base64Decode(data.fileData),
        data.fileMime || 'application/octet-stream',
        data.fileName
      );
      var file = folder.createFile(blob);
      fileLink = file.getUrl();
    }

    sheet.appendRow([
      new Date(),
      data.childName || '',
      data.age || '',
      data.parentName || '',
      data.parentPhone || '',
      data.location || '',
      data.health || '',
      data.comment || '',
      fileLink,
      data.consent ? 'Այո' : 'Ոչ'
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

- [ ] **Step 2: Deploy and capture the URL (manual, in Google)**

Follow the header comment: create a Google Sheet → Extensions ▸ Apps Script → paste `Code.gs` → set `DRIVE_FOLDER_ID` → Deploy ▸ New deployment ▸ Web app (Execute as **Me**, access **Anyone**) → authorize → copy the Web App URL.

- [ ] **Step 3: Wire the URL into the site**

Edit `js/main.js`: set `REGISTRATION_ENDPOINT` to the copied Web App URL.

- [ ] **Step 4: End-to-end test the real submission**

Run: `npm run serve`; open the page; fill the form with valid data, attach a small test image; submit.
Expected: success message in Armenian appears; a new row shows up in the Google Sheet with the data and a Drive link; the file exists in the private folder.

- [ ] **Step 5: Commit**

```bash
git add apps-script/Code.gs js/main.js
git commit -m "feat: Google Apps Script backend for registrations + file upload"
```

> Security note (from spec §7): the Sheet and Drive folder hold personal data and a sensitive document. Keep both private (shared only with the camp's organizers). Do not commit the real Web App URL or folder ID to a public repo if the repo is public — if needed, the owner keeps them only in their deployed copy.

---

## Task 15: README — deploy + yearly update + setup guide

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md`**

```markdown
# Ամառային ճամբար — Landing page

Single static page (Armenian) for the annual church kids' camp, with a
registration form that writes into a Google Sheet.

## Local preview
```bash
npm install        # one time (dev test runner only)
npm run serve      # http://localhost:8000
npm test           # run validation unit tests
```

## Deploy (free)

**Option A — Netlify (drag & drop):** go to app.netlify.com, drag the project
folder onto the deploy area. You get a free `your-name.netlify.app` URL.
Re-drag to update.

**Option B — GitHub Pages:** push the repo to GitHub → Settings ▸ Pages ▸
Deploy from branch ▸ `main` / root.

> Only `index.html`, `css/`, `js/`, and `assets/` are needed live.
> `tests/`, `package.json`, `node_modules/`, `docs/`, `apps-script/` are not served.

## Registration backend (Google Sheet)

See the comment header in `apps-script/Code.gs`. Summary:
1. Create a Google Sheet.
2. Create a **private** Drive folder for birth-certificate copies; copy its ID.
3. Sheet ▸ Extensions ▸ Apps Script ▸ paste `Code.gs` ▸ set `DRIVE_FOLDER_ID`.
4. Deploy ▸ New deployment ▸ Web app (Execute as Me, Access Anyone) ▸ copy URL.
5. Paste that URL into `js/main.js` → `REGISTRATION_ENDPOINT`.

Keep the Sheet and folder private — they hold personal data.

## Updating content each year

Search `index.html` for `ЗАПОЛНИТЬ` — every spot you may need to change is marked:
- **Photos:** drop files in `assets/images/`, update `src` in the GALLERY and HERO sections.
- **Video:** set the YouTube `VIDEO_ID`, or swap the iframe for `<video src="assets/video/intro.mp4" controls>`.
- **Dates / program / what-to-bring / FAQ:** edit the text directly.
- **Contacts / map / socials:** edit the footer.
- **Reviews:** remove `hidden` from `<section id="reviews">` and fill the `.review` cards.

The whole colour scheme lives in the `:root` block at the top of `css/styles.css`.
```

> If pasting the fenced code blocks inside the README causes nested-fence issues, indent the inner command blocks instead of fencing them.

- [ ] **Step 2: Verify** — open `README.md`; confirm every spec deliverable has a clear instruction (deploy, backend setup, yearly content edits).

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: deployment, backend setup, and yearly-update guide"
```

---

## Self-Review (completed by plan author)

**Spec coverage:**
- §1 goal / Armenian / ages / Hrazdan / 5 days → Tasks 3,4,7 (hero facts, program) ✔
- §2 static, mobile-first, free host, reusable → Tasks 1,13,15 ✔
- §3 visual style B (tokens, sunset, calm, photo-forward) → Tasks 1,4 ✔
- §4 all 14 blocks → hero(4), about+eligibility(5), gallery(6), video+program(7), accommodation+leaders+bring(8), price+reviews+faq(9), register(10), contacts(11); sticky CTA(12) ✔
- §5 form fields incl. location dropdown, optional health/file/comment, consent, no church field, → Google Sheet via Apps Script with Drive upload → Tasks 10,14 ✔
- §6 eligibility (clear statement + 3-item dropdown + human follow-up copy) → Tasks 5,10 ✔
- §7 privacy → notes in Tasks 14,15 ✔
- §8 owner content placeholders → `ЗАПОЛНИТЬ` markers throughout + README ✔
- §9 YAGNI (no auth/CMS/payments/i18n) → respected ✔

**Placeholder scan:** Owner-content `ЗАПОЛНИТЬ` markers are intentional (real text the owner supplies), not implementation gaps. All code steps contain complete code. No "TBD/implement later" in implementation logic.

**Type/name consistency:** `validateRegistration` / `ALLOWED_LOCATIONS` exports match their imports and the field names used in the form payload (`childName, age, parentName, parentPhone, location, health, comment, consent`). `REGISTRATION_ENDPOINT`, `initLightbox/initFaq/initRegForm/initStickyCta`, and element ids (`regForm, regStatus, lightbox, lightboxImg, lightboxClose, ctaSticky, register, year`) are consistent across tasks. Apps Script reads the same payload keys the form sends (incl. `fileData/fileName/fileMime`).
