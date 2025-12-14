
// Configuration & Data


// ... (CATALOG_ITEMS, MENUS_DATA, state, init, etc. remain unchanged) ...

function generatePDF() {
    if (!state.selectedMenu) { alert("Por favor, selecciona un menú primero."); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const hotel = HOTELS[state.selectedHotel];
    const data = getSelectedForPdf();

    // -- STYLING --
    const primaryColor = [15, 23, 42]; // Slate 900
    const accentColor = [245, 158, 11]; // Amber 500
    const dimColor = [100, 116, 139]; // Slate 500

    // -- HEADER --
    // Logo (Left)
    if (hotel.logoBase64) {
        try {
            // Larger logo, preserving aspect ratio roughly by fitting in a box
            doc.addImage(hotel.logoBase64, 'PNG', 15, 15, 50, 25, undefined, 'FAST');
        } catch (e) { console.warn("PDF Logo Error", e); }
    }

    // Hotel Info (Right)
    doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(...primaryColor);
    doc.text(hotel.name, 195, 20, null, null, "right");

    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...dimColor);
    doc.text(hotel.address, 195, 26, null, null, "right");
    doc.text(`Tel: ${hotel.tel}`, 195, 31, null, null, "right");
    doc.text(hotel.web, 195, 36, null, null, "right");

    // Divider
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.5);
    doc.line(15, 45, 195, 45);

    // -- DOCUMENT INFO --
    doc.setFont("helvetica", "bold"); doc.setFontSize(24); doc.setTextColor(...primaryColor);
    doc.text("PRESUPUESTO", 15, 60);

    doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(...dimColor);
    doc.text(`Ref: ${state.budgetRef}`, 15, 66);

    // Client & Event Data Box
    const clientName = document.getElementById('clientName')?.value || 'Cliente';
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.roundedRect(120, 50, 75, 28, 2, 2, 'F');

    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...primaryColor);
    doc.text("Detalles del Evento:", 125, 58);

    doc.setFont("helvetica", "normal"); doc.setTextColor(0, 0, 0);
    doc.text(`Cliente: ${clientName}`, 125, 64);
    doc.text(`Fecha: ${state.date}`, 125, 69);
    doc.text(`Comensales: ${state.guestCount} pax`, 125, 74);

    // -- MENU SELECTION --
    let y = 90;

    // Menu Title
    doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(...primaryColor);
    doc.text(`Menú Seleccionado: ${state.selectedMenu.name}`, 15, y);
    y += 10;

    // Menu Content
    doc.setFontSize(10); doc.setTextColor(50, 50, 50);

    const pageHeight = doc.internal.pageSize.height;

    Object.keys(data).forEach(title => {
        // Page break check
        if (y > pageHeight - 40) { doc.addPage(); y = 20; }

        const items = data[title];
        const cleanTitle = title.split('(')[0].trim();

        doc.setFont("helvetica", "bold"); doc.setTextColor(...primaryColor);
        doc.text(cleanTitle.toUpperCase(), 15, y);
        y += 6;

        doc.setFont("helvetica", "normal"); doc.setTextColor(50, 50, 50);
        items.forEach(item => {
            // Wrap text if too long
            const splitText = doc.splitTextToSize(`• ${item}`, 170);
            doc.text(splitText, 18, y);
            y += (5 * splitText.length); // Adjust for multiline
        });
        y += 6; // Spacing between sections
    });

    // -- TOTALS --
    if (y > pageHeight - 50) { doc.addPage(); y = 30; }

    y += 10;
    doc.setDrawColor(226, 232, 240);
    doc.line(15, y, 195, y);
    y += 10;

    const totalText = document.getElementById('totalPrice')?.textContent || '0.00€';

    // Total Box
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(...primaryColor);
    doc.text("Total Estimado:", 140, y + 5, null, null, "right");

    doc.setFontSize(18); doc.setTextColor(...accentColor);
    doc.text(totalText, 195, y + 6, null, null, "right");

    doc.setFontSize(8); doc.setFont("helvetica", "italic"); doc.setTextColor(...dimColor);
    doc.text("I.V.A. incluido - Presupuesto válido por 15 días.", 195, y + 14, null, null, "right");

    // -- FOOTER --
    doc.setFontSize(8); doc.setTextColor(150, 150, 150);
    doc.text("Documento generado automáticamente por Menús Eventos App", 105, pageHeight - 10, null, null, "center");

    doc.save(`Presupuesto_${state.budgetRef}.pdf`);
}


// Full Catalog Recovered
const CATALOG_ITEMS = [
    { t: 'Croqueta de jamón con tomate cassé', desc: 'Crujiente por fuera, cremosa por dentro.', ing: 'leche, jamón, harina, huevo', al: '3 Lácteos; 5 Cereales con gluten; 7 Huevo', sup: 0 },
    { t: 'Setas a la sartén con patatas y cremoso de yema', desc: 'Salteado suave con toque de yema.', ing: 'setas, patatas, huevo', al: '7 Huevo', sup: 0 },
    { t: 'Huevo a 62º con parmentier y pulpitos fritos', desc: 'Baja temperatura y contraste crujiente.', ing: 'huevo, leche, moluscos', al: '3 Lácteos; 4 Moluscos; 7 Huevo', sup: 0 },
    { t: 'Escalope de foie asado, cebolla caramelizada y pan de especias', desc: 'Dulce‑salado con especias.', ing: 'foie, cebolla, azúcar, harina, mantequilla', al: '3 Lácteos; 5 Cereales con gluten', sup: 0 },
    { t: 'Ensalada de jamón de pato, dulce de higos y granada', desc: 'Fresco y con contraste ácido.', ing: 'pato, higo, granada, lechugas, vinagre, aceite', al: '', sup: 0 },
    { t: 'Coca de verduras y pulpo frito', desc: 'Base crujiente y mar.', ing: 'pan, harina, moluscos, verduras', al: '4 Moluscos; 5 Cereales con gluten', sup: 0 },
    { t: 'Verduras a la plancha con crema de queso', desc: 'Verduras de temporada.', ing: 'verduras, queso, nata', al: '1 Pescado; 5 Cereales con gluten', sup: 0 },
    { t: 'Fritura de pescados', desc: 'Selección de lonja.', ing: 'pescado, harina, aceite, sal', al: '1 Pescado; 5 Cereales con gluten', sup: 0 },
    { t: 'Salmorejo de mango, huevo y jamón', desc: 'Versión tropical.', ing: 'tomate, mango, pan, ajo, aceite de oliva suave, vinagre, sal, queso, jamón serrano', al: '5 Cereales con gluten; 14 Sulfitos', sup: 0 },
    { t: 'Presa, boletus y vino tinto', desc: 'Intenso y jugoso.', ing: 'presa, boletus, vino tinto, azúcar', al: '14 Sulfitos', sup: 0 },
    { t: 'Salmón ahumado con queso y salsa de cítricos', desc: 'Ahumado suave con cítricos.', ing: 'salmón, queso, cítricos', al: '1 Pescado; 3 Lácteos', sup: 0 },
    { t: 'Pulpito frito con parmesano', desc: 'Crujiente y sabroso.', ing: 'molusco, queso, harina, aceite de oliva', al: '3 Lácteos; 4 Moluscos; 5 Cereales con gluten', sup: 0 },
    { t: 'Brandada de bacalao crujiente', desc: 'Clásico con textura.', ing: 'pasta filo, bacalao, leche, A.O.V.E., ajo, huevo', al: '1 Pescado; 3 Lácteos; 5 Cereales con gluten; 7 Huevo', sup: 0 },
    { t: 'Buñuelos de queso', desc: 'Bocado ligero y lácteo.', ing: 'queso, huevo, harina, pan, aceite de oliva', al: '3 Lácteos; 5 Cereales con gluten; 7 Huevo', sup: 0 },
    { t: 'Ensalada de burrata, tomate, aguacate y aceitunas', desc: 'Fresco y cremoso.', ing: 'burrata, tomate, aguacate, aceitunas, A.O.V.E., vinagre', al: '3 Lácteos; 14 Sulfitos', sup: 0 },
    // Specials
    { t: 'Ensalada de langostinos, mango y aguacate', sup: 1.00, desc: 'Sustituye a estándar (+1.00€).', ing: 'lechugas, mango, aguacate, vinagre, A.O.V.E.', al: '14 Sulfitos' },
    { t: 'Almejas a la marinera', sup: 1.75, desc: 'Sustituye a estándar (+1.75€).', ing: 'almejas, ajos, guindilla, vino, perejil', al: '4 Moluscos; 14 Sulfitos' },
    { t: 'Ensalada de perdiz en escabeche', sup: 1.50, desc: 'Sustituye a estándar (+1.50€).', ing: 'perdiz, verduras, vinagre, A.O.V.E., lechugas, aceite, champiñón', al: '14 Sulfitos' },
    { t: 'Ibéricos con queso manchego', sup: 1.75, desc: 'Sustituye a estándar (+1.75€).', ing: 'queso', al: '5 Cereales con gluten' },
    { t: 'Tataki de salmón y langostinos', sup: 1.00, desc: 'Sustituye a estándar (+1.00€).', ing: 'salmón, langostino, vinagre, soja, sésamo, azúcar, cebolleta, huevas de trucha', al: '1 Pescado; 6 Crustáceos; 9 Soja; 12 Sésamo; 14 Sulfitos' },
    { t: 'Corte de foie con ensalada', sup: 1.75, desc: 'Sustituye a estándar (+1.75€).', ing: 'lechugas, foie gras, aceite, vinagre, P.X.', al: '14 Sulfitos' },
    { t: 'Espárrago a la plancha, langostino, jamón y salsa trufada', sup: 1.50, desc: 'Sustituye a estándar (+1.50€).', ing: 'espárragos, langostinos, jamón, trufa, apio', al: '6 Crustáceos; 10 Apio' },
    { t: 'Boletus con mollejitas de cordero', sup: 1.50, desc: 'Sustituye a estándar (+1.50€).', ing: 'boletus, mollejas de cordero, aceite de oliva, sal', al: '' },
    { t: 'Salteado de chipirón o pulpo, setas, espárragos y patata cinta con huevo frito', sup: 1.00, desc: 'Sustituye a estándar (+1.00€).', ing: 'chipirón, pulpo, setas, espárragos, patata, huevo, aceite de oliva', al: '4 Moluscos; 7 Huevo' },
    { t: 'Milhojas de foie con queso de cabra y compota de manzana', sup: 1.50, desc: 'Sustituye a estándar (+1.50€).', ing: 'foie, queso, manzana, azúcar', al: '3 Lácteos' },
    { t: 'Gambón con verduras', sup: 1.50, desc: 'Sustituye a estándar (+1.50€).', ing: 'gambón, verduras, aceite de oliva', al: '6 Crustáceos' }
];

const MENUS_DATA = [
    {
        id: 1,
        name: "Menú 1",
        price: 65.00,
        desc: "Indicado para bodas y celebraciones formales con equilibrio mar por tierra.",
        sections: [
            { title: "Entrantes (Elige 4)", type: "choose_many", limit: 4, items: CATALOG_ITEMS },
            { title: "Primer Plato", type: "fixed", items: ["Ensalada con ½ langosta, frutas tropicales y vinagre de Fórum Chardonnay"] },
            {
                title: "Segundo Plato (Reparto)",
                type: "choose_split",
                items: ["½ Rape negro, gamba roja, jugo de crustáceos y crujiente de tinta", "½ Cochinillo asado, puré de membrillo y patata trufada"]
            },
            { title: "Postre", type: "fixed", items: ["Bomba de chocolate"] }
        ]
    },
    {
        id: 2,
        name: "Menú 2",
        price: 60.00,
        desc: "Recomendado para grupos que valoran el arroz y el producto de mar.",
        sections: [
            { title: "Entrantes (Elige 4)", type: "choose_many", limit: 4, items: CATALOG_ITEMS },
            { title: "Primer Plato", type: "fixed", items: ["Arroz caldoso con bogavante"] },
            {
                title: "Segundo Plato (Reparto)",
                type: "choose_split",
                items: ["Merluza a la gallega", "Entrecot de ternera a la brasa"]
            },
            { title: "Postre", type: "fixed", items: ["Tarta de queso con frutos rojos"] }
        ]
    },
    {
        id: 3,
        name: "Menú 3 (Personalizable)",
        price: 58.00,
        desc: "Ideal para celebraciones informales. 100% Configurable.",
        sections: [
            { title: "Entrantes (Elige 4)", type: "choose_many", limit: 4, items: CATALOG_ITEMS },
            { title: "Primer Plato", type: "fixed", items: ["Crema de calabaza con virutas de ibérico"] },
            {
                title: "Segundo Plato (Reparto)",
                type: "choose_split",
                items: ["Bacalao al pil-pil", "Magret de pato con salsa de frutos rojos"]
            },
            { title: "Postre", type: "fixed", items: ["Helado artesano de turrón"] }
        ]
    },
    {
        id: 4,
        name: "Menú 4",
        price: 62.00,
        desc: "Pensado para eventos de empresa o reuniones formales.",
        sections: [
            { title: "Entrantes (Elige 4)", type: "choose_many", limit: 4, items: CATALOG_ITEMS },
            { title: "Primer Plato", type: "fixed", items: ["Sopa castellana con huevo poché"] },
            {
                title: "Segundo Plato (Reparto)",
                type: "choose_split",
                items: ["Merluza en salsa verde", "Cochinillo al horno"]
            },
            { title: "Postre", type: "fixed", items: ["Flan de queso manchego"] }
        ]
    },
    {
        id: 5,
        name: "Menú 5",
        price: 55.00,
        desc: "Buen ajuste para grupos amplios con presupuesto contenido.",
        sections: [
            { title: "Entrantes (Elige 4)", type: "choose_many", limit: 4, items: CATALOG_ITEMS },
            { title: "Primer Plato", type: "fixed", items: ["Ensalada templada de setas"] },
            {
                title: "Segundo Plato (Reparto)",
                type: "choose_split",
                items: ["Lenguado a la meniere", "Carrillada de ibérico al vino tinto"]
            },
            { title: "Postre", type: "fixed", items: ["Coulant de chocolate"] }
        ]
    },
    {
        id: 6,
        name: "Menú 6 (Premium)",
        price: 70.00,
        desc: "Para eventos premium: producto top y doble elección.",
        sections: [
            { title: "Entrantes (Elige 4)", type: "choose_many", limit: 4, items: CATALOG_ITEMS },
            { title: "Primer Plato", type: "fixed", items: ["Lasaña de bogavante y setas"] },
            { title: "Segundo Plato", type: "fixed", items: ["Rodaballo salvaje al horno"] },
            {
                title: "Tercer Plato (Reparto)",
                type: "choose_split",
                items: ["Solomillo de buey con foie", "Pichón estofado al oporto"]
            },
            { title: "Postre", type: "fixed", items: ["Tarta de tres chocolates"] }
        ]
    },
    {
        id: 7,
        name: "Menú 7",
        price: 52.00,
        desc: "Encaja con celebraciones familiares con entrantes clásicos.",
        sections: [
            { title: "Entrantes (Fijos)", type: "fixed", items: ["Ensaladilla rusa de bogavante", "Croquetas de jamón ibérico", "Tartar de atún rojo"] },
            { title: "Primer Plato", type: "fixed", items: ["Crema de marisco"] },
            { title: "Segundo Plato", type: "fixed", items: ["Entrecot de ternera gallega"] },
            { title: "Postre", type: "fixed", items: ["Tarta de zanahoria"] }
        ]
    },
    {
        id: 8,
        name: "Menú 8",
        price: 50.00,
        desc: "Práctico para comidas de empresa o grupos.",
        sections: [
            { title: "Entrantes (Fijos)", type: "fixed", items: ["Jamón y queso manchego", "Timbal de verduras", "Ensalada césar"] },
            { title: "Primer Plato", type: "fixed", items: ["Sopa de pescado"] },
            { title: "Segundo Plato", type: "fixed", items: ["Pollo de corral a la brasa"] },
            { title: "Postre", type: "fixed", items: ["Natillas caseras"] }
        ]
    }
];

// State
let state = {
    selectedHotel: 'GUADIANA',
    selectedMenu: null,
    selectedOptions: {}, // { menuId: { sectionIdx: [item IDs] or { itemId: qty } } }
    guestCount: 100,
    date: new Date().toISOString().split('T')[0],
    budgetRef: '', // Unique Reference
    currentView: 'gallery'
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initHotels();
    preloadImages();
    renderMenus();
    setupEventListeners();
    updateSummary();
    showGallery();
});

function showGallery() {
    state.currentView = 'gallery';
    document.getElementById('view-gallery').classList.add('active');
    document.getElementById('view-config').classList.remove('active');
    state.selectedMenu = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function configureMenu(menuId) {
    const menu = MENUS_DATA.find(m => m.id === menuId);
    if (!menu) return;

    state.currentView = 'config';
    state.budgetRef = generateBudgetRef(); // Generate new Ref for this session
    document.getElementById('view-gallery').classList.remove('active');
    document.getElementById('view-config').classList.add('active');

    selectMenu(menu);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function generateBudgetRef() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `REF-${dateStr}-${random}`;
}

function selectMenu(menu) {
    state.selectedMenu = menu;

    // Auto-select fixed items + Init others
    if (!state.selectedOptions[menu.id]) {
        state.selectedOptions[menu.id] = {};
        menu.sections.forEach((sec, idx) => {
            if (sec.type === 'fixed') {
                state.selectedOptions[menu.id][idx] = [...sec.items];
            } else if (sec.type === 'choose_split') {
                // Init split items with 0
                state.selectedOptions[menu.id][idx] = {};
                sec.items.forEach(item => {
                    const id = typeof item === 'object' ? item.t : item;
                    state.selectedOptions[menu.id][idx][id] = 0;
                });
            } else {
                state.selectedOptions[menu.id][idx] = [];
            }
        });
    }

    renderSelectedMenuDetails(menu);
    renderMenuOptions();
    updateSummary();
}

function renderMenus() {
    const gallery = document.getElementById('menuGrid');
    gallery.innerHTML = '';

    MENUS_DATA.forEach(menu => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.onclick = () => configureMenu(menu.id);

        let previewItems = [];
        menu.sections.forEach(s => {
            if (s.items && s.items.length > 0 && previewItems.length < 3) {
                const item = s.items[0];
                previewItems.push(typeof item === 'object' ? item.t : item);
            }
        });

        card.innerHTML = `
            <div class="menu-header">
                <span class="menu-name">${menu.name}</span>
                <span class="menu-price">${menu.price.toFixed(2)}€</span>
            </div>
            <div style="margin-bottom:12px; font-size:0.9rem; color:var(--text-dim); height:40px; overflow:hidden;">
                ${menu.desc}
            </div>
            <ul class="menu-items">
                ${previewItems.map(item => `<li>${item}</li>`).join('')}
            </ul>
             <button class="btn-select">Personalizar</button>
        `;
        gallery.appendChild(card);
    });
}

function renderSelectedMenuDetails(menu) {
    const container = document.getElementById('selectedMenuCard');
    container.innerHTML = `
        <div class="menu-card active" style="margin:0;">
             <div class="menu-header">
                <span class="menu-name">${menu.name}</span>
                <span class="menu-price">${menu.price.toFixed(2)}€</span>
            </div>
            <p>${menu.desc}</p>
        </div>
    `;
}

function renderMenuOptions() {
    const container = document.getElementById('menuOptionsContainer');
    if (!container) return;

    container.innerHTML = '';
    const menu = state.selectedMenu;
    if (!menu) return;

    const selections = state.selectedOptions[menu.id] || {};

    menu.sections.forEach((section, idx) => {
        const groupEl = document.createElement('div');
        groupEl.className = 'pick-group';
        groupEl.dataset.group = idx;
        groupEl.dataset.limit = section.limit || 99;

        // Header
        let headerHtml = `<div class="pick-title">${section.title}`;
        if (section.type === 'choose_many') {
            const currentCount = (selections[idx] || []).length;
            headerHtml += ` <small>(${currentCount}/${section.limit || 1})</small>`;
        } else if (section.type === 'choose_split') {
            const currentTotal = Object.values(selections[idx] || {}).reduce((a, b) => a + b, 0);
            const remaining = state.guestCount - currentTotal;
            headerHtml += ` <small>Restantes: ${remaining}</small>`;
        }
        headerHtml += `</div>`;
        groupEl.innerHTML = headerHtml;

        // Render Items
        if (section.type === 'choose_many' && section.items.length > 0 && typeof section.items[0] === 'object') {
            groupEl.classList.add('grid-options');
        }

        section.items.forEach(item => {
            const itemId = typeof item === 'object' ? item.t : item;

            // --- SPLIT Logic Rendering ---
            if (section.type === 'choose_split') {
                const row = document.createElement('div');
                row.className = 'pick-item split-row';
                // row.style.display = 'flex'; row.style.justifyContent = 'space-between'; // handled by css

                const qty = (selections[idx] && selections[idx][itemId]) || 0;

                row.innerHTML = `
                    <div style="flex-grow:1; font-weight:500;">${itemId}</div>
                    <div class="split-controls" style="display:flex; align-items:center; gap:10px;">
                        <button class="btn-qty minus" data-action="minus" data-group="${idx}" data-item="${itemId}">-</button>
                        <input type="number" class="input-qty" value="${qty}" min="0" readonly style="width:50px; text-align:center; background:rgba(0,0,0,0.3); border:1px solid #444; color:white; border-radius:4px;">
                        <button class="btn-qty plus" data-action="plus" data-group="${idx}" data-item="${itemId}">+</button>
                    </div>
                `;
                groupEl.appendChild(row);
                return;
            }

            // --- Standard Logic Rendering ---
            const isSelected = Array.isArray(selections[idx]) && selections[idx].includes(itemId);
            const btn = document.createElement('div');
            btn.className = `pick-item ${isSelected ? 'is-selected' : ''}`;

            const currentCount = (selections[idx] || []).length;
            const limitReached = currentCount >= (section.limit || 1);

            if (section.type === 'choose_many' && limitReached && !isSelected) {
                btn.classList.add('disabled');
            }

            btn.dataset.group = idx;
            btn.dataset.itemId = itemId;

            if (section.type === 'fixed') {
                btn.classList.add('is-selected', 'fixed');
            }

            // Simple vs Rich Content
            if (typeof item === 'object') {
                btn.classList.add('rich-item');
                let html = `<div class="rich-header"><b>${item.t}</b>`;
                if (item.sup) html += ` <span class="supplement">+${item.sup.toFixed(2)}€</span>`;
                html += `</div>`;
                if (item.desc) html += `<div class="rich-desc">${item.desc}</div>`;

                html += `<div class="rich-meta">`;
                if (item.ing) html += `<span class="pill ing">Ing: ${item.ing}</span>`;
                if (item.al) html += `<span class="pill al">Al: ${item.al}</span>`;
                html += `</div>`;
                btn.innerHTML = html;
            } else {
                btn.textContent = item;
            }

            groupEl.appendChild(btn);
        });

        container.appendChild(groupEl);
    });
}

// --- Logic ---
function handleSelectionClick(e) {
    // 1. Handle Split Controls (+/-)
    if (e.target.classList.contains('btn-qty')) {
        handleSplitChange(e);
        return;
    }

    // 2. Handle Standard Selection
    const itemEl = e.target.closest('.pick-item');
    if (!itemEl || itemEl.classList.contains('fixed') || itemEl.classList.contains('split-row')) return;
    if (itemEl.classList.contains('disabled')) return;

    const menuId = state.selectedMenu?.id;
    if (!menuId) return;

    const groupIdx = itemEl.dataset.group;
    const itemId = itemEl.dataset.itemId;
    const section = state.selectedMenu.sections[groupIdx];

    if (!section || section.type === 'choose_split') return;

    const currentSelections = state.selectedOptions[menuId][groupIdx] || [];
    const isSelected = currentSelections.includes(itemId);
    const limit = section.limit || 1;

    if (section.type === 'choose_one') {
        state.selectedOptions[menuId][groupIdx] = [itemId];
    } else {
        if (isSelected) {
            state.selectedOptions[menuId][groupIdx] = currentSelections.filter(id => id !== itemId);
        } else {
            if (currentSelections.length < limit) {
                state.selectedOptions[menuId][groupIdx].push(itemId);
            }
        }
    }

    renderMenuOptions();
    updateSummary();
}

function handleSplitChange(e) {
    const btn = e.target;
    const groupIdx = btn.dataset.group;
    const itemId = btn.dataset.item;
    const action = btn.dataset.action;
    const menuId = state.selectedMenu.id;

    const currentQty = state.selectedOptions[menuId][groupIdx][itemId] || 0;
    const allQtys = state.selectedOptions[menuId][groupIdx];
    const totalSelected = Object.values(allQtys).reduce((a, b) => a + b, 0);

    if (action === 'plus') {
        if (totalSelected < state.guestCount) {
            state.selectedOptions[menuId][groupIdx][itemId] = currentQty + 1;
        }
    } else {
        if (currentQty > 0) {
            state.selectedOptions[menuId][groupIdx][itemId] = currentQty - 1;
        }
    }
    renderMenuOptions();
    // No need to update summary for split unless they have price implications (assumed included)
}

function updateSummary() {
    const totalPriceEl = document.getElementById('totalPrice');
    if (!state.selectedMenu) {
        if (totalPriceEl) totalPriceEl.textContent = "0.00€";
        return;
    }

    let pricePerPerson = state.selectedMenu.price;
    const menuId = state.selectedMenu.id;
    const selections = state.selectedOptions[menuId] || {};

    // Supplements (Only from 'choose_many' arrays, not splits for now)
    state.selectedMenu.sections.forEach((sec, idx) => {
        if (sec.type === 'choose_many') {
            const selectedIds = selections[idx] || [];
            selectedIds.forEach(selId => {
                const itemObj = sec.items.find(i => (typeof i === 'object' ? i.t : i) === selId);
                if (itemObj && itemObj.sup) {
                    pricePerPerson += itemObj.sup;
                }
            });
        }
    });

    let total = pricePerPerson * state.guestCount;
    // Fix NaN: Format safely
    if (isNaN(total)) total = 0;

    if (totalPriceEl) {
        totalPriceEl.textContent = total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
    }
}

function getSelectedForPdf() {
    if (!state.selectedMenu) return {};
    const result = {};
    const selections = state.selectedOptions[state.selectedMenu.id] || {};

    state.selectedMenu.sections.forEach((sec, idx) => {
        if (sec.type === 'choose_split') {
            // For split, we need quantities
            const quantities = selections[idx] || {};
            const lines = [];
            Object.entries(quantities).forEach(([item, qty]) => {
                if (qty > 0) lines.push(`${item} (${qty} pax)`);
            });
            if (lines.length > 0) result[sec.title] = lines;
        } else {
            // Standard array
            const itemIds = selections[idx] || [];
            if (itemIds.length > 0) result[sec.title] = itemIds;
        }
    });
    return result;
}

// --- Images & PDF ---
function preloadImages() {
    Object.keys(HOTELS).forEach(async key => {
        try {
            const hotel = HOTELS[key];
            hotel.logoBase64 = await getBase64FromUrl(hotel.logoPath);
        } catch (e) {
            console.warn(`Could not load logo for ${key}`, e);
        }
    });
}
function getBase64FromUrl(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL("image/png");
            resolve(dataURL);
        };
        img.onerror = () => resolve(null);
    });
}
function initHotels() {
    const selector = document.getElementById('hotelSelector');
    selector.innerHTML = '';
    Object.keys(HOTELS).forEach(key => {
        const hotel = HOTELS[key];
        const option = document.createElement('div');
        option.className = `hotel-option ${state.selectedHotel === key ? 'selected' : ''}`;
        option.onclick = () => { state.selectedHotel = key; initHotels(); };
        option.innerHTML = `
            <img src="${hotel.logoPath}" class="hotel-logo" alt="${hotel.name}">
            <div style="font-size:0.8rem; font-weight:bold;">${hotel.name}</div>
        `;
        selector.appendChild(option);
    });
}
function setupEventListeners() {
    const guestInput = document.getElementById('guestInput');
    if (guestInput) {
        guestInput.addEventListener('input', (e) => {
            state.guestCount = parseInt(e.target.value) || 0;
            // When guest count changes, we might need to clamp splits? 
            // For now, let's just update summary. Validation happens on click.
            updateSummary();
            renderMenuOptions(); // Update "Restantes" text
        });
    }
    const optionsContainer = document.getElementById('menuOptionsContainer');
    if (optionsContainer) {
        optionsContainer.addEventListener('click', handleSelectionClick);
    }
}


// --- Budget Preview Modal (Visualizar) ---
function showBudgetPreview() {
    if (!state.selectedMenu) { alert("Por favor, selecciona un menú primero."); return; }

    const modal = document.getElementById('budgetModal');
    const content = document.getElementById('previewContent');
    const hotel = HOTELS[state.selectedHotel];

    // Calculate values
    let basePrice = state.selectedMenu.price;
    let supplementTotal = 0;
    const selections = state.selectedOptions[state.selectedMenu.id] || {};

    state.selectedMenu.sections.forEach((sec, idx) => {
        if (sec.type === 'choose_many') {
            const selectedIds = selections[idx] || [];
            selectedIds.forEach(selId => {
                const itemObj = sec.items.find(i => (typeof i === 'object' ? i.t : i) === selId);
                if (itemObj && itemObj.sup) {
                    supplementTotal += itemObj.sup;
                }
            });
        }
    });

    // Build HTML
    let html = `
        <div class="preview-header">
            <div class="prev-hotel-info">
                <strong>${hotel.name}</strong><br>
                ${hotel.address}<br>
                Tel: ${hotel.tel} · <a href="${hotel.web}" target="_blank" style="color:inherit;">${hotel.web}</a>
            </div>
            <img src="${hotel.logoPath}" style="height:60px; object-fit:contain;" alt="Logo" onerror="this.style.display='none'">
        </div>

        <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid #e2e8f0; padding-bottom:10px; margin-bottom:20px;">
            <div class="prev-title" style="margin:0;">Presupuesto</div>
            <div style="font-size:1.2rem; font-weight:bold; color:#64748b;">${state.budgetRef}</div>
        </div>

        <div style="margin-bottom:30px; color:#64748b; font-size:0.95rem;">
            <strong>Fecha:</strong> ${state.date} &nbsp;&nbsp;|&nbsp;&nbsp; 
            <strong>Comensales:</strong> ${state.guestCount}
        </div>

        <div class="prev-section">
            <div class="prev-sec-title">Menú Seleccionado: ${state.selectedMenu.name}</div>
            <ul class="prev-list">
    `;

    // Menu Breakdown
    state.selectedMenu.sections.forEach((sec, idx) => {
        const selData = selections[idx];

        if (sec.type === 'fixed') {
            html += `<li><strong>${sec.title}:</strong> ${sec.items.join(', ')}</li>`;
        } else if (sec.type === 'choose_one') {
            const val = (selData && selData[0]) || 'Pendiente de elección';
            html += `<li><strong>${sec.title}:</strong> ${val}</li>`;
        } else if (sec.type === 'choose_many') {
            const items = selData || [];
            if (items.length > 0) {
                html += `<li><strong>${sec.title}:</strong><br>`;
                items.forEach(i => html += `&nbsp;&nbsp;• ${i}<br>`);
                html += `</li>`;
            }
        } else if (sec.type === 'choose_split') {
            const quantities = selData || {};
            const parts = [];
            Object.entries(quantities).forEach(([item, qty]) => {
                if (qty > 0) parts.push(`${item} (${qty})`);
            });
            if (parts.length > 0) {
                html += `<li><strong>${sec.title} (Reparto):</strong><br>&nbsp;&nbsp;${parts.join('<br>&nbsp;&nbsp;')}</li>`;
            }
        }
    });

    html += `</ul></div>`;

    // Math Block
    const totalBase = basePrice * state.guestCount;
    const totalSupp = supplementTotal * state.guestCount;
    const grandTotal = totalBase + totalSupp;

    html += `
        <div class="prev-total-box">
             <div class="prev-total-line">
                Base Menú: ${basePrice.toFixed(2)}€ x ${state.guestCount} pax = ${totalBase.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
            </div>
            ${supplementTotal > 0 ? `
            <div class="prev-total-line" style="color:#f59e0b;">
                Suplementos: ${supplementTotal.toFixed(2)}€ x ${state.guestCount} pax = ${totalSupp.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
            </div>` : ''}
            
            <div class="prev-final-price" style="margin-top:15px;">
                TOTAL PROVISIONAL: ${grandTotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </div>
            <div style="font-size:0.8rem; color:#94a3b8; margin-top:10px;">
                I.V.A. incluido. Precios válidos salvo error tipográfico.
            </div>
        </div>
    `;

    content.innerHTML = html;
    modal.classList.add('active');
}

function closeBudgetPreview() {
    document.getElementById('budgetModal').classList.remove('active');
}
