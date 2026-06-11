# Mapi & Daan — Wedding Website 💍

Sitio web de la boda · 03 · 10 · 2026 · Villafranca, Navarra

## Pages

| File | Purpose |
|---|---|
| `index.html` | Landing page: hero, weekend program, accommodation, RSVP/photos CTAs |
| `rsvp.html` | RSVP form (sends responses to a Google Sheet) |
| `fotos.html` | Photo-sharing page (links to a shared Google Photos album) |

Three languages built in (ES / EN / NL) — switcher in the top-right corner. Spanish is the default; the visitor's choice is remembered.

## ✅ Things you need to plug in

### 1. RSVP → Google Sheet

1. Create a Google Sheet. In row 1 add headers:
   `Fecha | Asistencia | Personas | Nombres | Autobus | Preboda | Alergias | Cancion | Mensaje`
2. In the Sheet: **Extensions → Apps Script**. Delete everything and paste:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var d = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(), d.asistencia, d.personas, d.nombres,
    d.autobus, d.preboda, d.alergias, d.cancion, d.mensaje
  ]);
  return ContentService.createTextOutput("OK");
}
```

3. Click **Deploy → New deployment → Web app**.
   - *Execute as:* **Me**
   - *Who has access:* **Anyone**
4. Copy the Web App URL and paste it in `rsvp.html`, replacing:

```javascript
const SHEET_ENDPOINT = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";
```

Until you do this, the form still works visually (shows the success screen and logs the answer in the browser console) but nothing is stored.

### 2. Google Photos album

1. Create an album in Google Photos → enable link sharing (allow collaborators to add photos).
2. Copy the share link and replace it in `fotos.html`:

```html
<a class="btn" id="album-link" href="https://photos.app.goo.gl/REPLACE_WITH_ALBUM_LINK" ...>
```

### 3. Map / hotel links

The "Ver ubicación" and "Ver más" links point to Google Maps searches and `hotelluzeelvilla.com` as best guesses — double-check each one and replace with exact links if needed (search for `maps.google.com` and `hotelluzeelvilla` in the HTML files).

## Images & artwork

The watercolor artwork (church, florals, hotel photos, camera) is hot-linked from the Stitch design exports (`lh3.googleusercontent.com`). Every image has an automatic fallback to the local SVG illustrations in `assets/` if a URL ever stops working. For long-term safety, consider downloading the images (open each URL in your browser, save into `assets/img/`, and update the `src` attributes).

## Brand

Palette and typography follow the brand spec: warm off-white `#f5f0e8`, ink `#3d3529`, taupe `#a89a7d`, gold accent `#c9a84c`; Cormorant Garamond (display), system sans (labels), Great Vibes (names). Tokens live at the top of `css/style.css`.

## Publishing

The site is plain HTML/CSS/JS — host it anywhere:

- **GitHub Pages** (free): create a repo, upload these files, enable Pages.
- **Netlify / Vercel** (free): drag-and-drop the folder.

No build step required.
