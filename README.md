# Mapi & Daan Wedding Website — v1.20

Static GitHub Pages website for `mapi-daan-2026.com`.

## v1.20 changes

- RSVP payload values are now normalized to Spanish for easier management in Google Sheets.
- Apps Script updated with Spanish tab names, Spanish headers and Spanish dashboard formulas.
- Menu values sent from the RSVP are now: `Ninguno`, `Vegetariano`, `Vegano`, `Sin gluten`, `Otro`.
- Guest menu/allergy fields keep a consistent size, including the last guest.
- Hotel Luze El Villa discount code can be copied directly.
- Discount code wraps safely on narrow screens.
- Added a little more space below the main page RSVP button.

## Deploy

Upload all files to the GitHub Pages branch/root.

## Apps Script

Use `apps-script/Code.gs` in your Google Sheet Apps Script project and deploy it as a Web App.

The website currently posts to the configured Apps Script endpoint in `index.html`.


## v1.32
- Adds visible photos page title in all three languages.
- Uses transparent camera artwork to avoid beige/white background mismatch.
