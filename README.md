# Mapi & Daan 2026 wedding website

Static website ready for GitHub Pages and custom domain `mapi-daan-2026.com`.

## Pages

- `/index.html` — main invitation page
- `/rsvp.html` — RSVP form
- `/fotos.html` — future Google Drive photo upload page

## Deploy on GitHub Pages

1. Upload all files to `https://github.com/garlumpi89/mapi-daan-2026`.
2. In GitHub, go to **Settings > Pages**.
3. Source: `Deploy from a branch`.
4. Branch: `main`, folder: `/root`.
5. The `CNAME` file is already set to `mapi-daan-2026.com`.
6. In your domain DNS, point the domain to GitHub Pages following GitHub's custom domain instructions.

## RSVP connection to Google Sheets

1. Create a Google Sheet, for example: `Mapi Daan RSVP`.
2. Open the Sheet and go to **Extensions > Apps Script**.
3. Paste the content of `apps-script/Code.gs`.
4. Save.
5. Click **Deploy > New deployment > Web app**.
6. Use:
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Copy the Web App URL.
8. Paste it in `config.js`:

```js
googleScriptUrl: "YOUR_WEB_APP_URL_HERE"
```

The form sends all languages to the same Google Sheet, using normalized internal values.

## Google Drive photos

When ready, create a Google Drive upload/folder link and paste it in `config.js`:

```js
googleDriveUrl: "YOUR_GOOGLE_DRIVE_LINK_HERE"
```

Until then, the `/fotos.html` page shows a pending message.

## Updating content

Most changeable links are in `config.js`. Text is in `assets/js/i18n.js`.
