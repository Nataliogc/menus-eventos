
// Configuration & Data is now loaded from js/data.js

/**
 * Utility to find allergen numbers for a dish and format as superscript (1/2/3)
 */
function getAllergensSup(dishName) {
    if (!dishName) return '';
    const catalogItem = CATALOG_ITEMS.find(i => i.t === dishName);
    if (!catalogItem || !catalogItem.al) return '';
    
    const matches = catalogItem.al.match(/\d+/g);
    if (!matches) return '';
    
    return `<sup>(${matches.join('/')})</sup>`;
}

// State
let state = {
    selectedHotel: Object.keys(HOTELS)[0] || 'GUADIANA',
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

function generatePresentation() {
    const selectedCheckboxes = document.querySelectorAll('.menu-print-checkbox:checked');
    const ids = Array.from(selectedCheckboxes).map(cb => cb.dataset.id);
    
    if (ids.length === 0) {
        alert("Por favor, selecciona al menos un menú marcando su casilla en la esquina superior.");
        return;
    }
    
    const titulo = (document.getElementById('eventTitle')?.value || 'EVENTOS').trim().toUpperCase() || 'EVENTOS';
    window.location.href = `presentacion.html?hotel=${state.selectedHotel}&menus=${ids.join(',')}&titulo=${encodeURIComponent(titulo)}`;
}

function generatePDF() {
    // This is for the Budget PDF
    if (!state.selectedMenu) {
        alert("Selecciona un menú y personalízalo antes de generar el presupuesto.");
        return;
    }
    window.print();
}

function renderMenus() {
    const gallery = document.getElementById('menuGrid');
    gallery.innerHTML = '';

    MENUS_DATA.forEach((menu, idx) => {
        if (menu.hidden) return; // Skip hidden menus
        
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
            <div class="menu-selection-badge" onclick="event.stopPropagation()">
                <input type="checkbox" class="menu-print-checkbox" checked data-id="${menu.id}" style="width:20px; height:20px; cursor:pointer; accent-color:var(--accent);">
            </div>
            <div class="menu-header">
                <span class="menu-name">${menu.name}</span>
                <span class="menu-price">${menu.price.toFixed(2)}€</span>
            </div>
            <div style="margin-bottom:12px; font-size:0.9rem; color:var(--text-dim); height:40px; overflow:hidden;">
                ${menu.desc}
            </div>
            <ul class="menu-items">
                ${previewItems.map(item => `<li>${item}${getAllergensSup(item)}</li>`).join('')}
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
        if (section.hidden) return; // Skip hidden sections
        
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

        // Determine which items to render
        let itemsToRender = section.items;
        if (section.useCatalog) {
            itemsToRender = CATALOG_ITEMS;
        }

        // Render Items
        if (section.type === 'choose_many' && itemsToRender.length > 0 && typeof itemsToRender[0] === 'object') {
            groupEl.classList.add('grid-options');
        }

        itemsToRender.forEach(item => {
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
    // No-op: base64 conversion removed (fails on file:// due to CORS).
    // Logos are served directly by path.
}
function initHotels() {
    const selectors = [
        document.getElementById('hotelSelector'),
        document.getElementById('hotelSelectorSidebar')
    ];
    
    selectors.forEach(selector => {
        if (!selector) return;
        selector.innerHTML = '';
        Object.keys(HOTELS).forEach(key => {
            const hotel = HOTELS[key];
            const option = document.createElement('div');
            option.className = `hotel-option ${state.selectedHotel === key ? 'selected' : ''}`;
            option.onclick = () => { 
                state.selectedHotel = key; 
                initHotels(); 
                if (typeof updateSummary === 'function') updateSummary(); 
            };
            option.innerHTML = `
                <img src="${hotel.logo || hotel.logoPath || 'img/placeholder-logo.png'}" class="hotel-logo" alt="${hotel.name}">
                <div style="font-size:0.75rem; font-weight:bold; line-height:1.2; margin-top:5px;">${hotel.name}</div>
            `;
            selector.appendChild(option);
        });
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
            <img src="${hotel.logoPath || hotel.logo || 'img/placeholder-logo.png'}" style="height:60px; object-fit:contain;" alt="Logo" onerror="this.style.display='none'">
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
        if (sec.hidden) return; // Skip hidden sections
        
        const selData = selections[idx];

        if (sec.type === 'fixed') {
            const itemsWithAl = sec.items.map(item => `${item}${getAllergensSup(item)}`);
            html += `<li><strong>${sec.title}:</strong> ${itemsWithAl.join(', ')}</li>`;
        } else if (sec.type === 'choose_one') {
            const val = (selData && selData[0]) || 'Pendiente de elección';
            html += `<li><strong>${sec.title}:</strong> ${val}${getAllergensSup(val)}</li>`;
        } else if (sec.type === 'choose_many') {
            const items = selData || [];
            if (items.length > 0) {
                html += `<li><strong>${sec.title}:</strong><br>`;
                items.forEach(i => html += `&nbsp;&nbsp;• ${i}${getAllergensSup(i)}<br>`);
                html += `</li>`;
            }
        } else if (sec.type === 'choose_split') {
            const quantities = selData || {};
            const parts = [];
            Object.entries(quantities).forEach(([item, qty]) => {
                if (qty > 0) parts.push(`${item}${getAllergensSup(item)} (${qty})`);
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
