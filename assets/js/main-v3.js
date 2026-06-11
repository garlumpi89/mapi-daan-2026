const copy = {
  es: {
    floatingRsvp:'Confirmar asistencia', heroIntro:'Nos casamos', confirm:'Confirmar asistencia',
    welcomeText:'Nos encantaría compartir este día tan especial con vosotros. Aquí encontraréis toda la información necesaria para acompañarnos durante el fin de semana.',
    viewLocation:'Ver ubicación', weekend:'Fin de semana', programTitle:'Programa', friday:'Viernes', saturday:'Sábado', preboda:'Preboda', ceremony:'Ceremonia', busToVilla:'Autobuses a Hotel Luze El Villa', busDeparture:'Salida desde Villafranca', cocktail:'Cóctel', lunch:'Comida', dance:'Baile', busBack:'Autobuses a Villafranca', recena:'Recena', party:'Fiesta', forGuests:'Para invitados de fuera', hotelsTitle:'Alojamiento recomendado', hotelMartinez:'Ideal para quienes quieran alojarse en pleno centro de Villafranca.', hotelBardenas:'Perfectos para familias o grupos que prefieran disponer de más espacio.', hotelCamping:'Bungalows y otras opciones de alojamiento.', hotelLuze:'Lugar de celebración del cóctel, comida y baile.', discount:'Código descuento', visitWebsite:'Visitar web', joinUs:'¿Nos acompañáis?', deadline:'Confirma tu asistencia antes del 1 de septiembre.', sharePhotos:'Compartir fotos', madeWithLove:'Hecho con amor'
  },
  en: {
    floatingRsvp:'RSVP', heroIntro:'We are getting married', confirm:'RSVP',
    welcomeText:'We would love to share this very special day with you. Here you will find all the information you need to join us for the weekend.',
    viewLocation:'View location', weekend:'Wedding weekend', programTitle:'Programme', friday:'Friday', saturday:'Saturday', preboda:'Pre-wedding', ceremony:'Ceremony', busToVilla:'Buses to Hotel Luze El Villa', busDeparture:'Departure from Villafranca', cocktail:'Cocktail', lunch:'Lunch', dance:'Dance', busBack:'Buses to Villafranca', recena:'Late snack', party:'Party', forGuests:'For guests travelling', hotelsTitle:'Recommended accommodation', hotelMartinez:'Ideal for those who would like to stay in the centre of Villafranca.', hotelBardenas:'Perfect for families or groups who prefer more space.', hotelCamping:'Bungalows and other accommodation options.', hotelLuze:'Venue for the cocktail, lunch and dance.', discount:'Discount code', visitWebsite:'Visit website', joinUs:'Will you join us?', deadline:'Please RSVP before 1 September.', sharePhotos:'Share photos', madeWithLove:'Made with love'
  },
  nl: {
    floatingRsvp:'Bevestig aanwezigheid', heroIntro:'Wij gaan trouwen', confirm:'Bevestig aanwezigheid',
    welcomeText:'We zouden deze bijzondere dag heel graag met jullie delen. Hier vinden jullie alle informatie om het hele weekend met ons mee te vieren.',
    viewLocation:'Bekijk locatie', weekend:'Trouwweekend', programTitle:'Programma', friday:'Vrijdag', saturday:'Zaterdag', preboda:'Pre-bruiloft', ceremony:'Ceremonie', busToVilla:'Bussen naar Hotel Luze El Villa', busDeparture:'Vertrek vanuit Villafranca', cocktail:'Cocktail', lunch:'Lunch', dance:'Dansen', busBack:'Bussen naar Villafranca', recena:'Late snack', party:'Feest', forGuests:'Voor gasten van buiten', hotelsTitle:'Aanbevolen verblijf', hotelMartinez:'Ideaal voor wie in het centrum van Villafranca wil verblijven.', hotelBardenas:'Perfect voor families of groepen die graag wat meer ruimte hebben.', hotelCamping:'Bungalows en andere verblijfsmogelijkheden.', hotelLuze:'Locatie van de cocktail, lunch en dans.', discount:'Kortingscode', visitWebsite:'Website bekijken', joinUs:'Zijn jullie erbij?', deadline:'Bevestig je aanwezigheid voor 1 september.', sharePhotos:'Foto’s delen', madeWithLove:'Met liefde gemaakt'
  }
};

function setLanguage(lang){
  const data = copy[lang] || copy.es;
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if(data[key]) el.textContent = data[key];
  });
  document.querySelectorAll('.lang').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
  localStorage.setItem('wedding-lang', lang);
}

document.querySelectorAll('.lang').forEach(btn => btn.addEventListener('click', () => setLanguage(btn.dataset.lang)));
setLanguage(localStorage.getItem('wedding-lang') || (navigator.language||'es').slice(0,2).replace('nl','nl').replace('en','en') || 'es');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if(entry.isIntersecting) entry.target.classList.add('visible'); });
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
