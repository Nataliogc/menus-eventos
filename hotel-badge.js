<script>
/* ===== Logo de hotel dentro del menú seleccionado ===== */

(function(){
  // Configura aquí los logos y colores por hotel
  const HOTEL_CFG = {
    'Cumbria':  {
      logo: 'https://nataliogc.github.io/menus-eventos/img/cumbria-logo.jpg', // o 'img/cumbria-logo.jpg'
      alt:  'Hotel Cumbria',
      highlight: '#0a6aa1' // azul
    },
    'Guadiana': {
      logo: 'https://nataliogc.github.io/menus-eventos/img/guadiana-logo.jpg', // o 'img/guadiana-logo.jpg'
      alt:  'Hotel Guadiana',
      highlight: '#2f7f47' // verde
    }
  };

  function putHotelLogoInSelectedMenu(){
    const hotelSel = document.getElementById('hotel')?.value || '';
    const menuSel  = document.getElementById('menu')?.value  || '';

    // Limpia logos y realces previos
    document.querySelectorAll('.hotel-badge').forEach(n => n.remove());
    document.querySelectorAll('details.highlight').forEach(d => d.classList.remove('highlight'));

    if(!hotelSel || !menuSel) return;

    const cfg = HOTEL_CFG[hotelSel] || HOTEL_CFG['Cumbria'];
    // color de borde dinámico
    document.documentElement.style.setProperty('--menu-highlight', cfg.highlight || '#cfe5fb');

    // Localiza el <summary> cuyo .title contenga "Menú NºX"
    const sum = Array.from(document.querySelectorAll('details > summary'))
      .find(s => s.querySelector('.title')?.textContent.trim().includes(`Menú Nº${menuSel}`));
    if(!sum) return;

    // Crea la chapa con el logo
    const badge = document.createElement('span');
    badge.className = 'hotel-badge';
    badge.innerHTML = `<img src="${cfg.logo}" alt="${cfg.alt}"><b>${hotelSel}</b>`;

    // Inserta junto a la etiqueta de precio, si existe
    const price = sum.querySelector('.price-badge');
    if(price) price.insertAdjacentElement('afterend', badge);
    else sum.appendChild(badge);

    // Abre y resalta ese menú
    const details = sum.parentElement;
    if(details && details.tagName.toLowerCase()==='details'){
      details.open = true;
      details.classList.add('highlight');
      // Mejor UX: desplaza al bloque
      try { details.scrollIntoView({behavior:'smooth', block:'center'}); } catch(_){}
    }
  }

  // Conecta eventos de los selectores existentes
  window.addEventListener('DOMContentLoaded', function(){
    document.getElementById('hotel')?.addEventListener('change', putHotelLogoInSelectedMenu);
    document.getElementById('menu')?.addEventListener('change', putHotelLogoInSelectedMenu);
    // primera pasada
    putHotelLogoInSelectedMenu();
  });
})();
</script>
