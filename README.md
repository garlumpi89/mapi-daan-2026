Web v1.40 Mapi & Daan

Cambios:
- En RSVP, la pregunta de canción ya no incluye “(opcional)” en el título; ahora aparece en el placeholder.
- Reducción del espacio vacío al final del RSVP bajo el botón de envío.

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


## v1.38
- Canción marcada como opcional.
- Menos hueco inferior en RSVP.
- Código descuento Hotel Luze ajustado en desktop/móvil con icono compacto.
- Más aire debajo del botón final del main.


## v1.38
- Restaurada la validación manual del RSVP antes de enviar.
- Reducido el espacio vacío bajo el botón de envío en RSVP.
