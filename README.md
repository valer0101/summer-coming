# Ամառային ճամբար — Landing page

Single static page (Armenian) for the annual church kids' camp, with a registration form that writes into a Google Sheet.

## Local preview

    npm install        # one time (dev test runner only)
    npm run serve      # http://localhost:8000
    npm test           # run validation unit tests

## Deploy (free)

- **Option A — Netlify (drag & drop):** go to app.netlify.com, drag the project folder onto the deploy area. You get a free `your-name.netlify.app` URL. Re-drag to update.
- **Option B — GitHub Pages:** push the repo to GitHub, then Settings ▸ Pages ▸ Deploy from branch ▸ main / root.
- **Note:** Only `index.html`, `css/`, `js/`, and `assets/` are needed live. `tests/`, `package.json`, `node_modules/`, `docs/`, `apps-script/`, `.claude/` are not served.

## Registration backend (Google Sheet)

See the comment header in `apps-script/Code.gs`. Steps:

1. Create a Google Sheet.
2. Create a private Drive folder for birth-certificate copies; copy its ID.
3. Sheet ▸ Extensions ▸ Apps Script ▸ paste `Code.gs` ▸ set `DRIVE_FOLDER_ID`.
4. Deploy ▸ New deployment ▸ Web app (Execute as Me, Access Anyone) ▸ copy URL.
5. Paste that URL into `js/main.js` → `REGISTRATION_ENDPOINT`.

Keep the Sheet and folder private — they hold personal data.

## Updating content each year

Search `index.html` for `ЗАПОЛНИТЬ` — every spot you may need to change is marked:

- **Photos:** drop files in `assets/images/`, update `src` in the GALLERY and HERO sections.
- **Video:** set the YouTube `VIDEO_ID`, or swap the iframe for a local `<video src="assets/video/intro.mp4" controls>`.
- **Dates / program / what-to-bring / FAQ:** edit the text directly.
- **Contacts / map / socials:** edit the footer.
- **Reviews:** remove `hidden` from `<section id="reviews">` and fill the `.review` cards.

Also: the whole colour scheme lives in the `:root` block at the top of `css/styles.css`.
