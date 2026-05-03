/**
 * ADMIN.JS - Logic for the Admin Dashboard
 */

let currentTab = 'menus';

// State - Load from window globals (data.js)
let localMenus = [];
let localCatalog = [];
let localHotels = {};

const CATEGORIES_LIST = [
    'Entrante',
    'Primer Plato',
    'Segundo Plato',
    'Tercer Plato',
    'Postre'
];

const ALLERGENS_LIST = [
    { id: 1, name: 'Pescado' },
    { id: 2, name: 'Frutos Secos' },
    { id: 3, name: 'Lácteos' },
    { id: 4, name: 'Moluscos' },
    { id: 5, name: 'Cereales' },
    { id: 6, name: 'Crustáceos' },
    { id: 7, name: 'Huevos' },
    { id: 8, name: 'Cacahuetes' },
    { id: 9, name: 'Soja' },
    { id: 10, name: 'Apio' },
    { id: 11, name: 'Mostaza' },
    { id: 12, name: 'Sésamo' },
    { id: 13, name: 'Altramuz' },
    { id: 14, name: 'Sulfitos' }
];

document.addEventListener('DOMContentLoaded', async () => {
    // Ensure data is loaded
    if (typeof MENUS_DATA === 'undefined' || typeof CATALOG_ITEMS === 'undefined') {
        console.error("Data.js not loaded correctly");
        alert("Error: No se han podido cargar los datos base (data.js)");
        return;
    }

    // Try to load from Cloud first
    const cloudLoaded = await loadCloudData();
    
    localMenus = JSON.parse(JSON.stringify(MENUS_DATA));
    localCatalog = JSON.parse(JSON.stringify(CATALOG_ITEMS));
    localHotels = JSON.parse(JSON.stringify(HOTELS));

    renderCurrentTab();
    
    if (cloudLoaded) {
        console.log("Datos cargados desde la nube");
    }
});

function resetToDefaults() {
    if (confirm('¿Estás seguro de que deseas borrar todos los cambios y volver a los datos por defecto?')) {
        localStorage.removeItem('MENUS_DATA');
        localStorage.removeItem('CATALOG_ITEMS');
        localStorage.removeItem('HOTELS');
        location.reload();
    }
}

function switchTab(tab) {
    currentTab = tab;
    
    // Update Nav UI
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`nav-${tab}`).classList.add('active');
    
    // Update Content UI
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
    
    // Update Header
    const titles = {
        menus: 'Gestión de Menús',
        catalog: 'Catálogo de Platos',
        hotels: 'Hoteles',
        presentation: 'Generar Carta'
    };
    const descs = {
        menus: 'Crea y modifica la estructura de precios y platos para cada menú.',
        catalog: 'Gestiona la base de datos de platos, ingredientes y alérgenos.',
        hotels: 'Configura los datos de contacto y logos de tus establecimientos.',
        presentation: 'Prepara la carta de presentación lista para imprimir.'
    };
    document.getElementById('tabTitle').textContent = titles[tab];
    document.getElementById('tabDesc').textContent = descs[tab];
    
    // Init listeners for catalog filters
    document.getElementById('catalogSearch')?.addEventListener('input', renderCatalog);
    document.getElementById('catalogCategoryFilter')?.addEventListener('change', renderCatalog);

    renderCurrentTab();
}

function renderCurrentTab() {
    if (currentTab === 'menus') renderMenus();
    else if (currentTab === 'catalog') renderCatalog();
    else if (currentTab === 'hotels') renderHotels();
    else if (currentTab === 'presentation') renderPresentation();
}

// --- RENDERING ---

function renderMenus() {
    const grid = document.getElementById('menusGrid');
    grid.innerHTML = '';
    
    localMenus.forEach((menu, idx) => {
        const card = document.createElement('div');
        card.className = 'admin-card';
        card.innerHTML = `
            <h3>
                ${menu.name}
                ${menu.hidden ? '<span style="background:#fee2e2; color:#ef4444; font-size:0.6rem; padding:2px 6px; border-radius:4px; font-weight:700; text-transform:uppercase; margin-left:8px;">Oculto</span>' : ''}
                <div class="actions">
                    <button class="btn-icon" onclick="editMenu(${idx})">✏️</button>
                    <button class="btn-icon btn-danger" onclick="deleteMenu(${idx})">🗑️</button>
                </div>
            </h3>
            <p style="font-weight:600; color:var(--accent);">${menu.price.toFixed(2)}€</p>
            <p style="font-size:0.9rem; color:#64748b; height:40px; overflow:hidden;">${menu.desc}</p>
            <div style="margin-top:1rem; font-size:0.8rem; color:#94a3b8;">
                ${menu.sections.length} secciones configuradas
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderCatalog() {
    const tbody = document.getElementById('catalogTableBody');
    tbody.innerHTML = '';
    
    const searchTerm = document.getElementById('catalogSearch')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('catalogCategoryFilter')?.value || 'all';

    // Group dishes by category
    const grouped = {};
    CATEGORIES_LIST.forEach(c => grouped[c] = []);
    grouped['Sin categoría'] = [];
    
    localCatalog.forEach((item, idx) => {
        const cat = item.category || 'Sin categoría';
        
        // Apply filters
        const matchesSearch = item.t.toLowerCase().includes(searchTerm) || (item.desc || "").toLowerCase().includes(searchTerm);
        const matchesCategory = (categoryFilter === 'all' || cat === categoryFilter);

        if (matchesSearch && matchesCategory) {
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push({ ...item, originalIdx: idx });
        }
    });
    
    [...CATEGORIES_LIST, 'Sin categoría'].forEach(cat => {
        if (grouped[cat] && grouped[cat].length > 0) {
            // Sort items alphabetically within category
            grouped[cat].sort((a, b) => a.t.localeCompare(b.t));

            // Add a header row for the category
            const headerRow = document.createElement('tr');
            headerRow.innerHTML = `<td colspan="4" style="background: #f8fafc; font-weight: bold; color: #475569; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; padding: 10px 15px;">${cat}</td>`;
            tbody.appendChild(headerRow);
            
            grouped[cat].forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <strong>${item.t}</strong><br>
                        <small style="color:#64748b">${item.desc || ''}</small>
                    </td>
                    <td>${item.sup ? `<span class="badge-sup">+${item.sup.toFixed(2)}€</span>` : '-'}</td>
                    <td><small>${item.al || '-'}</small></td>
                    <td>
                        <div class="actions">
                            <button class="btn-icon" onclick="editCatalogItem(${item.originalIdx})">✏️</button>
                            <button class="btn-icon btn-danger" onclick="deleteCatalogItem(${item.originalIdx})">🗑️</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    });
}

function renderHotels() {
    const grid = document.getElementById('hotelsGrid');
    grid.innerHTML = '';
    
    Object.keys(localHotels).forEach(key => {
        const hotel = localHotels[key];
        const card = document.createElement('div');
        card.className = 'admin-card';
        card.innerHTML = `
            <div style="display:flex; align-items:center; gap:20px;">
                <img src="${hotel.logoPath || 'img/placeholder-logo.png'}" style="width:80px; height:60px; object-fit:contain; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:4px;">
                <div style="flex:1">
                    <h3 style="margin:0 0 5px 0">${hotel.name}</h3>
                    <div style="font-size:0.85rem; color:#64748b; line-height:1.4">
                        ${hotel.address}<br>
                        ${hotel.tel}<br>
                        <a href="${hotel.web}" target="_blank" style="color:#f59e0b">${hotel.web}</a>
                    </div>
                </div>
                <div class="actions">
                    <button class="btn-icon" onclick="editHotel('${key}')">✏️</button>
                    <button class="btn-icon btn-danger" onclick="deleteHotel('${key}')">🗑️</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// --- MODALS & FORMS ---

function openModal(title) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('adminModal').classList.add('active');
}

function closeModal() {
    document.getElementById('adminModal').classList.remove('active');
    document.getElementById('adminForm').reset();
}

function editMenu(idx) {
    const menu = localMenus[idx];
    document.getElementById('editId').value = idx;
    
    let sectionsHtml = '<div class="admin-label">Estructura del Menú (Secciones y Platos)</div>';
    menu.sections.forEach((sec, sIdx) => {
        const useCatalog = (sec.items && sec.items.length > 20) || sec.useCatalog === true; 
        let dishesHtml = '';
        
        if (useCatalog) {
            dishesHtml = `
                <p style="font-size:0.8rem; color:#64748b; margin-top:5px; background:#f1f5f9; padding:10px; border-radius:6px; border:1px dashed #cbd5e1;">
                    <i>Esta sección está configurada para mostrar automáticamente <b>todo el Catálogo General de Platos</b>.</i>
                </p>
                <div style="margin-top:10px;">
                    <label style="font-size:0.75rem; color:#f59e0b; cursor:pointer; display:flex; align-items:center; gap:5px;">
                        <input type="checkbox" name="sec_toggle_catalog_${sIdx}" onchange="this.form.onsubmit(new Event('submit'))"> 
                        Cambiar a Selección Manual
                    </label>
                </div>
            `;
        } else {
            dishesHtml = `<div id="dishes_container_${sIdx}" style="margin-top:10px;">`;
            const currentDishes = Array.isArray(sec.items) ? sec.items : [];
            currentDishes.forEach((dish, dIdx) => {
                const dishTitle = typeof dish === 'object' ? dish.t : dish;
                dishesHtml += `
                    <div style="display:flex; gap:8px; margin-bottom:5px;">
                        <select class="admin-select" name="sec_${sIdx}_dish_${dIdx}" style="font-size:0.85rem">
                            ${getCatalogOptionsHtml(dishTitle, sec.title)}
                        </select>
                        <button type="button" class="btn-icon btn-danger" onclick="this.parentElement.remove()">🗑️</button>
                    </div>
                `;
            });
            dishesHtml += `
                <div style="margin-top:15px;">
                    <button type="button" class="btn-secondary" style="font-size:0.8rem; padding:6px 12px; border-color:#cbd5e1; display:flex; align-items:center; gap:5px;" onclick="addDishField(${sIdx}, '${sec.title.replace(/'/g, "\\'")}')">
                        <span style="font-size:1.2rem; font-weight:bold; color:#f59e0b;">+</span> Añadir otro plato a esta sección
                    </button>
                </div>
                <div style="margin-top:15px; padding-top:10px; border-top:1px dashed #e2e8f0;">
                    <label style="font-size:0.75rem; color:#64748b; cursor:pointer; display:flex; align-items:center; gap:5px;">
                        <input type="checkbox" name="sec_use_catalog_${sIdx}"> Usar todo el catálogo (Desactiva selección manual)
                    </label>
                </div>
            </div>`;
        }

        sectionsHtml += `
            <div class="section-item" style="border-left: 4px solid #f59e0b; background: #fff; padding: 1.5rem; margin-bottom: 1.5rem; border-radius:8px; border:1px solid #e2e8f0;">
                <div class="admin-form-group">
                    <label class="admin-label">Título de la Sección</label>
                    <input type="text" class="admin-input" name="sec_title_${sIdx}" value="${sec.title}" placeholder="Ej. Entrantes al centro">
                </div>
                <div style="display:flex; gap:10px; margin-bottom:15px;">
                    <div style="flex:1">
                        <label class="admin-label" style="font-size:0.7rem">Tipo de Sección</label>
                        <select class="admin-select" name="sec_type_${sIdx}" style="font-size:0.85rem">
                            <option value="fixed" ${sec.type === 'fixed' ? 'selected' : ''}>Fijos (Todos)</option>
                            <option value="choose_many" ${sec.type === 'choose_many' ? 'selected' : ''}>Elegir varios (Con límite)</option>
                            <option value="choose_split" ${sec.type === 'choose_split' ? 'selected' : ''}>Reparto (Pax)</option>
                        </select>
                    </div>
                    <div style="flex:1">
                        <label class="admin-label" style="font-size:0.7rem">Límite / Pax</label>
                        <input type="number" class="admin-input" name="sec_limit_${sIdx}" value="${sec.limit || ''}" style="font-size:0.85rem" placeholder="Ej. 1">
                    </div>
                    <div style="flex:1; display:flex; align-items:flex-end; padding-bottom:8px;">
                        <label style="font-size:0.75rem; color:#ef4444; cursor:pointer; display:flex; align-items:center; gap:5px; font-weight:600;">
                            <input type="checkbox" name="sec_hidden_${sIdx}" ${sec.hidden ? 'checked' : ''}> Ocultar
                        </label>
                    </div>
                </div>
                <div class="admin-label" style="font-size:0.8rem; margin-bottom:5px;">Platos de esta sección</div>
                ${dishesHtml}
            </div>
        `;
    });

    document.getElementById('formFields').innerHTML = `
        <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:15px;">
            <div class="admin-form-group">
                <label class="admin-label">Nombre del Menú</label>
                <input type="text" class="admin-input" name="name" value="${menu.name}" required>
            </div>
            <div class="admin-form-group">
                <label class="admin-label">Precio (€)</label>
                <input type="number" step="0.01" class="admin-input" name="price" value="${menu.price}" required>
            </div>
            <div class="admin-form-group" style="display:flex; align-items:flex-end; padding-bottom:10px;">
                <label style="display:flex; align-items:center; gap:8px; font-size:0.85rem; color:#ef4444; font-weight:600; cursor:pointer;">
                    <input type="checkbox" name="menu_hidden" ${menu.hidden ? 'checked' : ''}> OCULTAR MENÚ
                </label>
            </div>
            <div style="display:none;">
                <input type="number" class="admin-input" name="id" value="${menu.id || ''}">
            </div>
        </div>
        <div class="admin-form-group">
            <label class="admin-label">Descripción Publicitaria</label>
            <textarea class="admin-textarea" name="desc" rows="2">${menu.desc}</textarea>
        </div>
        ${sectionsHtml}
    `;
    openModal(`Editar ${menu.name}`);
}

function addDishField(sIdx, sectionTitle = '') {
    const container = document.getElementById(`dishes_container_${sIdx}`);
    const div = document.createElement('div');
    div.style.cssText = "display:flex; gap:8px; margin-bottom:5px;";
    div.innerHTML = `
        <select class="admin-select" name="sec_${sIdx}_newdish" style="font-size:0.85rem">
            ${getCatalogOptionsHtml('', sectionTitle)}
        </select>
        <button type="button" class="btn-icon btn-danger" onclick="this.parentElement.remove()">🗑️</button>
    `;
    container.insertBefore(div, container.lastElementChild);
}

function getCatalogOptionsHtml(selectedTitle, sectionTitle = '') {
    let options = '<option value="">-- Seleccionar Plato --</option>';
    
    // Determine preferred category based on section title
    let preferredCategory = '';
    const st = sectionTitle.toLowerCase();
    if (st.includes('postre')) preferredCategory = 'Postre';
    else if (st.includes('entrante') || st.includes('centro') || st.includes('cóctel')) preferredCategory = 'Entrante';
    else if (st.includes('primero') || st.includes('1º')) preferredCategory = 'Primer Plato';
    else if (st.includes('segundo') || st.includes('2º')) preferredCategory = 'Segundo Plato';
    else if (st.includes('tercero') || st.includes('3º')) preferredCategory = 'Tercer Plato';

    // Filter catalog
    let filteredCatalog = [...localCatalog]; // Copy to avoid mutation issues
    if (preferredCategory) {
        filteredCatalog = filteredCatalog.filter(item => item.category === preferredCategory);
    }
    
    // Sort filtered catalog alphabetically
    filteredCatalog.sort((a, b) => a.t.localeCompare(b.t));

    // Group filtered catalog by category
    const grouped = {};
    const catsToShow = preferredCategory ? [preferredCategory] : CATEGORIES_LIST;
    
    catsToShow.forEach(c => grouped[c] = []);
    if (!preferredCategory) grouped['Sin categoría'] = [];
    
    filteredCatalog.forEach(item => {
        const cat = item.category || 'Sin categoría';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
    });
    
    [...catsToShow, ...(preferredCategory ? [] : ['Sin categoría'])].forEach(cat => {
        if (grouped[cat] && grouped[cat].length > 0) {
            options += `<optgroup label="${cat.toUpperCase()}">`;
            grouped[cat].forEach(item => {
                const isSelected = (item.t === selectedTitle) ? 'selected' : '';
                options += `<option value="${item.t}" ${isSelected}>${item.t}</option>`;
            });
            options += `</optgroup>`;
        }
    });

    // If preferredCategory was used, add an "Others" section at the end just in case
    if (preferredCategory) {
        const others = localCatalog.filter(item => item.category !== preferredCategory);
        if (others.length > 0) {
            options += `<optgroup label="RESTO DEL CATÁLOGO (Otros)">`;
            others.forEach(item => {
                const isSelected = (item.t === selectedTitle) ? 'selected' : '';
                options += `<option value="${item.t}" ${isSelected}>${item.t}</option>`;
            });
            options += `</optgroup>`;
        }
    }
    
    // If the selectedTitle is not empty and not found in catalog, add it as custom
    if (selectedTitle && !localCatalog.find(i => i.t === selectedTitle)) {
        options += `<optgroup label="PERSONALIZADO"><option value="${selectedTitle}" selected>${selectedTitle}</option></optgroup>`;
    }
    
    return options;
}

function editCatalogItem(idx) {
    const item = localCatalog[idx];
    const currentAllergens = item.al || "";
    const allergensHtml = ALLERGENS_LIST.map(a => {
        const isChecked = currentAllergens.includes(a.id.toString()) ? 'checked' : '';
        return `
            <label style="display:flex; align-items:center; gap:8px; font-size:0.8rem; background:#f1f5f9; padding:5px 10px; border-radius:6px; cursor:pointer;">
                <input type="checkbox" name="allergens" value="${a.id}" ${isChecked}> ${a.id}. ${a.name}
            </label>
        `;
    }).join('');

    document.getElementById('editId').value = idx;
    document.getElementById('formFields').innerHTML = `
        <div class="admin-form-group">
            <label class="admin-label">Categoría del Plato</label>
            <select class="admin-select" name="category">
                <option value="">-- Seleccionar Categoría --</option>
                ${CATEGORIES_LIST.map(c => `<option value="${c}" ${item.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
        </div>
        <div class="admin-form-group">
            <label class="admin-label">Título del Plato</label>
            <input type="text" class="admin-input" name="t" value="${item.t}" required>
        </div>
        <div class="admin-form-group">
            <label class="admin-label">Suplemento (€)</label>
            <input type="number" step="0.01" class="admin-input" name="sup" value="${item.sup || 0}">
        </div>
        <div class="admin-form-group">
            <label class="admin-label">Descripción corta</label>
            <input type="text" class="admin-input" name="desc" value="${item.desc || ''}">
        </div>
        <div class="admin-form-group">
            <label class="admin-label">Alérgenos (Selecciona los que correspondan)</label>
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap:8px; background:#fff; border:1px solid #e2e8f0; padding:15px; border-radius:8px;">
                ${allergensHtml}
            </div>
        </div>
    `;
    openModal(`Editar Plato`);
}

function editHotel(key) {
    const hotel = localHotels[key];
    document.getElementById('editId').value = key;
    document.getElementById('formFields').innerHTML = `
        <div class="admin-form-group">
            <label class="admin-label">Nombre Comercial</label>
            <input type="text" class="admin-input" name="name" value="${hotel.name}" required>
        </div>
        <div class="admin-form-group">
            <label class="admin-label">Dirección</label>
            <input type="text" class="admin-input" name="address" value="${hotel.address}" required>
        </div>
        <div class="admin-form-group">
            <label class="admin-label">Teléfono</label>
            <input type="text" class="admin-input" name="tel" value="${hotel.tel}" required>
        </div>
        <div class="admin-form-group">
            <label class="admin-label">Web</label>
            <input type="text" class="admin-input" name="web" value="${hotel.web}" required>
        </div>
        <div class="admin-form-group">
            <label class="admin-label">Logo del Hotel</label>
            <div style="display:flex; align-items:center; gap:15px;">
                <img id="logoPreview" src="${hotel.logoPath || 'img/placeholder-logo.png'}" style="height:60px; width:auto; background:#f8fafc; border:1px solid #e2e8f0; border-radius:4px; padding:5px;">
                <input type="file" id="logoFile" accept="image/*" class="admin-input" style="font-size:0.8rem">
                <input type="hidden" name="logoPath" id="logoBase64" value="${hotel.logoPath || ''}">
            </div>
            <p style="font-size:0.7rem; color:#64748b; margin-top:5px;">Se recomienda formato PNG con fondo transparente.</p>
        </div>
    `;
    
    // Preview logic
    document.getElementById('logoFile').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(readerEvt) {
                const base64 = readerEvt.target.result;
                document.getElementById('logoPreview').src = base64;
                document.getElementById('logoBase64').value = base64;
            };
            reader.readAsDataURL(file);
        }
    });

    openModal(`Editar ${hotel.name}`);
}

function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = document.getElementById('editId').value;
    
    if (currentTab === 'menus') {
        if (id === "new") {
            const newMenu = {
                id: localMenus.length + 1,
                name: formData.get('name'),
                price: parseFloat(formData.get('price')),
                desc: formData.get('desc'),
                hidden: formData.get('menu_hidden') === 'on',
                sections: [
                    { title: "Entrantes al centro", type: "fixed", items: [] },
                    { title: "Primer Plato", type: "fixed", items: [] },
                    { title: "Segundo Plato", type: "fixed", items: [] },
                    { title: "Postre", type: "fixed", items: [] }
                ]
            };
            localMenus.push(newMenu);
        } else {
            const idx = parseInt(id);
            const menu = localMenus[idx];
            menu.name = formData.get('name');
            menu.price = parseFloat(formData.get('price'));
            menu.desc = formData.get('desc');
            menu.hidden = formData.get('menu_hidden') === 'on';
            menu.id = parseInt(formData.get('id'));
            
            // Update sections
            menu.sections.forEach((sec, sIdx) => {
                sec.title = formData.get(`sec_title_${sIdx}`);
                sec.type = formData.get(`sec_type_${sIdx}`);
                sec.hidden = formData.get(`sec_hidden_${sIdx}`) === 'on';
                const limit = formData.get(`sec_limit_${sIdx}`);
                if (limit !== "") sec.limit = parseInt(limit);
                else delete sec.limit;
                
                // Toggle catalog logic
                const wantsCatalog = formData.get(`sec_use_catalog_${sIdx}`) === 'on';
                const wantsManual = formData.get(`sec_toggle_catalog_${sIdx}`) === 'on';

                if (wantsCatalog) {
                    sec.useCatalog = true;
                    sec.items = []; // Will be handled by renderer
                } else if (wantsManual) {
                    sec.useCatalog = false;
                    sec.items = []; // Start fresh for manual
                } else {
                    // Update dishes (if not using global catalog)
                    if (sec.useCatalog !== true && (sec.items && sec.items.length <= 20)) {
                        const newDishes = [];
                        const inputs = e.target.querySelectorAll(`[name^="sec_${sIdx}_dish_"], [name^="sec_${sIdx}_newdish"]`);
                        inputs.forEach(input => {
                            if (input.value.trim() !== "") newDishes.push(input.value.trim());
                        });
                        sec.items = newDishes;
                    }
                }
            });
        }
    } else if (currentTab === 'catalog') {
        const selectedAllergens = Array.from(e.target.querySelectorAll('input[name="allergens"]:checked'))
            .map(cb => cb.value)
            .sort((a, b) => parseInt(a) - parseInt(b));
        
        const allergenNames = selectedAllergens.map(id => {
            const a = ALLERGENS_LIST.find(al => al.id == parseInt(id));
            return `${id} ${a.name}`;
        }).join('; ');

        const newItem = {
            t: formData.get('t'),
            category: formData.get('category'),
            sup: parseFloat(formData.get('sup')) || 0,
            desc: formData.get('desc'),
            al: allergenNames
        };
        
        if (id === "new") {
            localCatalog.push(newItem);
        } else {
            localCatalog[parseInt(id)] = newItem;
        }
    } else if (currentTab === 'hotels') {
        if (id === "new") {
            const hotelKey = formData.get('hotelKey');
            localHotels[hotelKey] = {
                name: formData.get('name'),
                address: formData.get('address'),
                tel: formData.get('tel'),
                web: formData.get('web'),
                logoPath: formData.get('logoPath')
            };
        } else {
            localHotels[id].name = formData.get('name');
            localHotels[id].address = formData.get('address');
            localHotels[id].tel = formData.get('tel');
            localHotels[id].web = formData.get('web');
            localHotels[id].logoPath = formData.get('logoPath');
        }
    }
    
    renderCurrentTab();
    closeModal();
    
    // Save to localStorage (Source of Truth for the browser session)
    localStorage.setItem('MENUS_DATA', JSON.stringify(localMenus));
    localStorage.setItem('CATALOG_ITEMS', JSON.stringify(localCatalog));
    localStorage.setItem('HOTELS', JSON.stringify(localHotels));
    
    showToast('Cambios guardados y vinculados');
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
        background: #10b981; color: white; padding: 0.75rem 1.5rem;
        border-radius: 99px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        z-index: 2000; font-weight: 500; animation: slideUp 0.3s ease-out;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function openCreateModal() {
    document.getElementById('editId').value = "new";
    
    if (currentTab === 'catalog') {
        const allergensHtml = ALLERGENS_LIST.map(a => `
            <label style="display:flex; align-items:center; gap:8px; font-size:0.8rem; background:#f1f5f9; padding:5px 10px; border-radius:6px; cursor:pointer;">
                <input type="checkbox" name="allergens" value="${a.id}"> ${a.id}. ${a.name}
            </label>
        `).join('');

        document.getElementById('formFields').innerHTML = `
            <div class="admin-form-group">
                <label class="admin-label">Categoría del Plato</label>
                <select class="admin-select" name="category">
                    <option value="">-- Seleccionar Categoría --</option>
                    ${CATEGORIES_LIST.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
            </div>
            <div class="admin-form-group">
                <label class="admin-label">Título del Plato</label>
                <input type="text" class="admin-input" name="t" placeholder="Ej. Croqueta de jamón" required>
            </div>
            <div class="admin-form-group">
                <label class="admin-label">Suplemento (€)</label>
                <input type="number" step="0.01" class="admin-input" name="sup" value="0">
            </div>
            <div class="admin-form-group">
                <label class="admin-label">Descripción corta</label>
                <input type="text" class="admin-input" name="desc" placeholder="Breve descripción para el cliente">
            </div>
            <div class="admin-form-group">
                <label class="admin-label">Alérgenos (Selecciona los que correspondan)</label>
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap:8px; background:#fff; border:1px solid #e2e8f0; padding:15px; border-radius:8px;">
                    ${allergensHtml}
                </div>
            </div>
        `;
        openModal('Añadir Nuevo Plato');
    } 
    else if (currentTab === 'menus') {
        document.getElementById('formFields').innerHTML = `
            <div class="admin-form-group">
                <label class="admin-label">Nombre del Menú</label>
                <input type="text" class="admin-input" name="name" placeholder="Ej. Menú Premium" required>
            </div>
            <div class="admin-form-group">
                <label class="admin-label">Precio (€)</label>
                <input type="number" step="0.01" class="admin-input" name="price" value="50" required>
            </div>
            <div class="admin-form-group">
                <label class="admin-label">Descripción</label>
                <textarea class="admin-textarea" name="desc" rows="2" placeholder="Breve descripción publicitaria"></textarea>
            </div>
            <p style="font-size:0.8rem; color:#64748b; margin-top:10px;"><i>* El nuevo menú se creará con una estructura base de 4 secciones (Entrantes, 1º, 2º, Postre) que podrás editar después.</i></p>
        `;
        openModal('Añadir Nuevo Menú');
    }
    else if (currentTab === 'hotels') {
        document.getElementById('formFields').innerHTML = `
            <div class="admin-form-group">
                <label class="admin-label">Identificador Único (ID)</label>
                <input type="text" class="admin-input" name="hotelKey" placeholder="Ej. hotel_central" required>
            </div>
            <div class="admin-form-group">
                <label class="admin-label">Nombre Comercial</label>
                <input type="text" class="admin-input" name="name" placeholder="Nombre del Hotel" required>
            </div>
            <div class="admin-form-group">
                <label class="admin-label">Dirección</label>
                <input type="text" class="admin-input" name="address" required>
            </div>
            <div class="admin-form-group">
                <label class="admin-label">Teléfono</label>
                <input type="text" class="admin-input" name="tel" required>
            </div>
            <div class="admin-form-group">
                <label class="admin-label">Web</label>
                <input type="text" class="admin-input" name="web" value="https://" required>
            </div>
            <div class="admin-form-group">
                <label class="admin-label">Logo del Hotel</label>
                <div style="display:flex; align-items:center; gap:15px;">
                    <img id="logoPreview" src="img/placeholder-logo.png" style="height:60px; width:auto; background:#f8fafc; border:1px solid #e2e8f0; border-radius:4px; padding:5px;">
                    <input type="file" id="logoFile" accept="image/*" class="admin-input" style="font-size:0.8rem">
                    <input type="hidden" name="logo" id="logoBase64" value="">
                </div>
            </div>
        `;
        
        // Preview logic for new hotel
        setTimeout(() => {
            document.getElementById('logoFile').addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(readerEvt) {
                        const base64 = readerEvt.target.result;
                        document.getElementById('logoPreview').src = base64;
                        document.getElementById('logoBase64').value = base64;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }, 100);

        openModal('Añadir Nuevo Hotel');
    }
}

function deleteCatalogItem(idx) {
    if (confirm('¿Estás seguro de eliminar este plato del catálogo?')) {
        localCatalog.splice(idx, 1);
        renderCatalog();
    }
}

function deleteMenu(idx) {
    if (confirm('¿Estás seguro de eliminar este menú completo?')) {
        localMenus.splice(idx, 1);
        renderMenus();
    }
}

function deleteHotel(key) {
    if (confirm(`¿Estás seguro de eliminar el hotel "${localHotels[key].name}"?`)) {
        delete localHotels[key];
        renderHotels();
    }
}

// --- EXPORT ---

async function exportConfig() {
    // Save to localStorage as backup
    localStorage.setItem('MENUS_DATA', JSON.stringify(localMenus));
    localStorage.setItem('CATALOG_ITEMS', JSON.stringify(localCatalog));
    localStorage.setItem('HOTELS', JSON.stringify(localHotels));

    // SAVE TO CLOUD (SUPABASE)
    const btn = document.querySelector('[onclick="exportConfig()"]');
    const originalText = btn ? btn.innerHTML : '';
    if (btn) btn.innerHTML = '⌛ Guardando...';

    const success = await saveCloudData(localMenus, localCatalog, localHotels);

    if (btn) btn.innerHTML = originalText;

    if (success) {
        alert("¡Éxito! Los cambios se han guardado en la NUBE y están activos para todo el mundo.");
    } else {
        alert("Los cambios se han guardado LOCALMENTE en este navegador, pero no se pudieron subir a la nube. Revisa tu conexión.");
        
        // Manual fallback logic
        const configText = `/** DATA.JS - Manual Export */\nconst MENUS_DATA_DEFAULT = ${JSON.stringify(localMenus)};\nconst CATALOG_ITEMS_DEFAULT = ${JSON.stringify(localCatalog)};\nconst HOTELS_DEFAULT = ${JSON.stringify(localHotels)};`;
        document.getElementById('exportDataJs').textContent = configText;
        document.getElementById('exportModal').classList.add('active');
    }
}

function closeExportModal() {
    document.getElementById('exportModal').classList.remove('active');
}

function copyToClipboard(id) {
    const text = document.getElementById(id).textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert('Copiado al portapapeles');
    });
}

function saveToLocal() {
    alert('Previsualización activada (Los cambios son temporales en esta sesión). Para cambios permanentes usa Exportar Código JS.');
    // We could inject into window for testing, but since it's a separate page, we'd need postMessage or similar.
    // For now, let's just use the export.
}

// --- PRESENTATION TAB LOGIC ---

function renderPresentation() {
    const hotelContainer = document.getElementById('presHotelSelector');
    const menuContainer = document.getElementById('presMenuSelector');
    if (!hotelContainer || !menuContainer) return;

    // Render Hotel Selector
    hotelContainer.innerHTML = '';
    Object.keys(localHotels).forEach((key, idx) => {
        const hotel = localHotels[key];
        const div = document.createElement('label');
        div.style.display = 'flex'; div.style.alignItems = 'center'; div.style.gap = '10px';
        div.style.padding = '12px'; div.style.background = '#f8fafc'; div.style.borderRadius = '8px';
        div.style.cursor = 'pointer'; div.style.border = '1px solid #e2e8f0';
        
        div.innerHTML = `
            <input type="radio" name="presHotel" value="${key}" ${idx === 0 ? 'checked' : ''} style="accent-color: #f59e0b;">
            <img src="${hotel.logoPath || 'img/placeholder-logo.png'}" style="height:30px; width:50px; object-fit:contain;">
            <span style="font-weight:600; color:#334155;">${hotel.name}</span>
        `;
        hotelContainer.appendChild(div);
    });

    // Render Menu Selector (Checkboxes)
    menuContainer.innerHTML = '';
    localMenus.forEach(menu => {
        if (menu.hidden) return;
        const div = document.createElement('label');
        div.style.display = 'flex'; div.style.alignItems = 'center'; div.style.gap = '10px';
        div.style.padding = '12px'; div.style.background = '#f8fafc'; div.style.borderRadius = '8px';
        div.style.cursor = 'pointer'; div.style.border = '1px solid #e2e8f0';

        div.innerHTML = `
            <input type="checkbox" class="pres-menu-cb" value="${menu.id}" checked style="accent-color: #f59e0b;">
            <div style="display:flex; flex-direction:column;">
                <span style="font-weight:600; color:#334155;">${menu.name}</span>
                <span style="font-size:0.75rem; color:#64748b;">${menu.price.toFixed(2)}€</span>
            </div>
        `;
        menuContainer.appendChild(div);
    });
}

function generateFromAdmin() {
    const hotelId = document.querySelector('input[name="presHotel"]:checked')?.value;
    const selectedCbs = document.querySelectorAll('.pres-menu-cb:checked');
    const menuIds = Array.from(selectedCbs).map(cb => cb.value);

    const titulo = (document.getElementById('presTitle')?.value || 'EVENTOS').trim().toUpperCase();
    const cliente = encodeURIComponent(document.getElementById('presClient')?.value || '');
    const fecha = document.getElementById('presDate')?.value || '';

    if (!hotelId) { alert("Por favor, selecciona un hotel."); return; }
    if (menuIds.length === 0) { alert("Selecciona al menos un menú."); return; }

    const url = `presentacion.html?hotel=${hotelId}&menus=${menuIds.join(',')}&titulo=${encodeURIComponent(titulo)}&cliente=${cliente}&fecha=${fecha}`;
    window.open(url, '_blank');
}

function createPremiumMenu() {
    // 1. Filter items with supplements
    const premiumItems = localCatalog.filter(item => item.sup > 0);
    
    if (premiumItems.length === 0) {
        alert("No se han encontrado platos con suplemento en el catálogo. Por favor, añade suplementos a algunos platos primero.");
        return;
    }

    // 2. Group by category
    const starters = premiumItems.filter(i => i.category === 'Entrante').map(i => i.t);
    const firsts = premiumItems.filter(i => i.category === 'Primer Plato').map(i => i.t);
    const seconds = premiumItems.filter(i => i.category === 'Segundo Plato').map(i => i.t);
    const desserts = premiumItems.filter(i => i.category === 'Postre').map(i => i.t);

    // 3. Create the menu object
    const newMenu = {
        id: Math.max(...localMenus.map(m => m.id), 0) + 1,
        name: "Selección Premium con Suplementos",
        price: 75.00, // Default price for premium
        desc: "Un menú exclusivo que incluye todas nuestras especialidades con suplemento para una experiencia gastronómica superior.",
        hidden: false,
        sections: [
            { title: "Entrantes Premium", type: "choose_many", limit: 4, items: starters },
            { title: "Primer Plato a Elegir", type: "choose_one", items: firsts },
            { title: "Segundo Plato a Elegir", type: "choose_one", items: seconds },
            { title: "Postre", type: "fixed", items: desserts.slice(0, 1) }
        ]
    };

    // 4. Add to local state and notify
    localMenus.push(newMenu);
    renderMenus();
    alert("¡Menú Premium Creado! Se ha generado un nuevo menú con todos los platos que tienen suplemento. Recuerda guardarlo permanentemente.");
    
    // Scroll to the new menu
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}
