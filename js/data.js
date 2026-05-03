/**
 * DATA.JS - Centralized storage for menus and items
 */

const CATALOG_ITEMS_DEFAULT = [
    { t: 'Croqueta de jamón con tomate cassé', category: 'Entrante', desc: 'Crujiente por fuera, cremosa por dentro.', ing: 'leche, jamón, harina, huevo', al: '3 Lácteos; 5 Cereales con gluten; 7 Huevo', sup: 0 },
    { t: 'Setas a la sartén con patatas y cremoso de yema', category: 'Entrante', desc: 'Salteado suave con toque de yema.', ing: 'setas, patatas, huevo', al: '7 Huevo', sup: 0 },
    { t: 'Huevo a 62º con parmentier y pulpitos fritos', category: 'Entrante', desc: 'Baja temperatura y contraste crujiente.', ing: 'huevo, leche, moluscos', al: '3 Lácteos; 4 Moluscos; 7 Huevo', sup: 0 },
    { t: 'Escalope de foie asado, cebolla caramelizada y pan de especias', category: 'Entrante', desc: 'Dulce‑salado con especias.', ing: 'foie, cebolla, azúcar, harina, mantequilla', al: '3 Lácteos; 5 Cereales con gluten', sup: 0 },
    { t: 'Ensalada de jamón de pato, dulce de higos y granada', category: 'Entrante', desc: 'Fresco y con contraste ácido.', ing: 'pato, higo, granada, lechugas, vinagre, aceite', al: '', sup: 0 },
    { t: 'Coca de verduras y pulpo frito', category: 'Entrante', desc: 'Base crujiente y mar.', ing: 'pan, harina, moluscos, verduras', al: '4 Moluscos; 5 Cereales con gluten', sup: 0 },
    { t: 'Verduras a la plancha con crema de queso', category: 'Entrante', desc: 'Verduras de temporada.', ing: 'verduras, queso, nata', al: '1 Pescado; 5 Cereales con gluten', sup: 0 },
    { t: 'Fritura de pescados', category: 'Entrante', desc: 'Selección de lonja.', ing: 'pescado, harina, aceite, sal', al: '1 Pescado; 5 Cereales con gluten', sup: 0 },
    { t: 'Salmorejo de mango, huevo y jamón', category: 'Entrante', desc: 'Versión tropical.', ing: 'tomate, mango, pan, ajo, aceite de oliva suave, vinagre, sal, queso, jamón serrano', al: '5 Cereales con gluten; 14 Sulfitos', sup: 0 },
    { t: 'Presa, boletus y vino tinto', category: 'Entrante', desc: 'Intenso y jugoso.', ing: 'presa, boletus, vino tinto, azúcar', al: '14 Sulfitos', sup: 0 },
    { t: 'Salmón ahumado con queso y salsa de cítricos', category: 'Entrante', desc: 'Ahumado suave con cítricos.', ing: 'salmón, queso, cítricos', al: '1 Pescado; 3 Lácteos', sup: 0 },
    { t: 'Pulpito frito con parmesano', category: 'Entrante', desc: 'Crujiente y sabroso.', ing: 'molusco, queso, harina, aceite de oliva', al: '3 Lácteos; 4 Moluscos; 5 Cereales con gluten', sup: 0 },
    { t: 'Brandada de bacalao crujiente', category: 'Entrante', desc: 'Clásico con textura.', ing: 'pasta filo, bacalao, leche, A.O.V.E., ajo, huevo', al: '1 Pescado; 3 Lácteos; 5 Cereales con gluten; 7 Huevo', sup: 0 },
    { t: 'Buñuelos de queso', category: 'Entrante', desc: 'Bocado ligero y lácteo.', ing: 'queso, huevo, harina, pan, aceite de oliva', al: '3 Lácteos; 5 Cereales con gluten; 7 Huevo', sup: 0 },
    { t: 'Ensalada de burrata, tomate, aguacate y aceitunas', category: 'Entrante', desc: 'Fresco y cremoso.', ing: 'burrata, tomate, aguacate, aceitunas, A.O.V.E., vinagre', al: '3 Lácteos; 14 Sulfitos', sup: 0 },
    { t: 'Ensalada de langostinos, mango y aguacate', category: 'Entrante', sup: 1.00, desc: 'Sustituye a estándar (+1.00€).', ing: 'lechugas, mango, aguacate, vinagre, A.O.V.E.', al: '14 Sulfitos' },
    { t: 'Almejas a la marinera', category: 'Entrante', sup: 1.75, desc: 'Sustituye a estándar (+1.75€).', ing: 'almejas, ajos, guindilla, vino, perejil', al: '4 Moluscos; 14 Sulfitos' },
    { t: 'Ensalada de perdiz en escabeche', category: 'Entrante', sup: 1.50, desc: 'Sustituye a estándar (+1.50€).', ing: 'perdiz, verduras, vinagre, A.O.V.E., lechugas, aceite, champiñón', al: '14 Sulfitos' },
    { t: 'Ibéricos con queso manchego', category: 'Entrante', sup: 1.75, desc: 'Sustituye a estándar (+1.75€).', ing: 'queso', al: '5 Cereales con gluten' },
    { t: 'Tataki de salmón y langostinos', category: 'Entrante', sup: 1.00, desc: 'Sustituye a estándar (+1.00€).', ing: 'salmón, langostino, vinagre, soja, sésamo, azúcar, cebolleta, huevas de trucha', al: '1 Pescado; 6 Crustáceos; 9 Soja; 12 Sésamo; 14 Sulfitos' },
    { t: 'Corte de foie con ensalada', category: 'Entrante', sup: 1.75, desc: 'Sustituye a estándar (+1.75€).', ing: 'lechugas, foie gras, aceite, vinagre, P.X.', al: '14 Sulfitos' },
    { t: 'Espárrago a la plancha, langostino, jamón y salsa trufada', category: 'Entrante', sup: 1.50, desc: 'Sustituye a estándar (+1.50€).', ing: 'espárragos, langostinos, jamón, trufa, apio', al: '6 Crustáceos; 10 Apio' },
    { t: 'Boletus con mollejitas de cordero', category: 'Entrante', sup: 1.50, desc: 'Sustituye a estándar (+1.50€).', ing: 'boletus, mollejas de cordero, aceite de oliva, sal', al: '' },
    { t: 'Salteado de chipirón o pulpo, setas, espárragos y patata cinta con huevo frito', category: 'Entrante', sup: 1.00, desc: 'Sustituye a estándar (+1.00€).', ing: 'chipirón, pulpo, setas, espárragos, patata, huevo, aceite de oliva', al: '4 Moluscos; 7 Huevo' },
    { t: 'Milhojas de foie con queso de cabra y compota de manzana', category: 'Entrante', sup: 1.50, desc: 'Sustituye a estándar (+1.50€).', ing: 'foie, queso, manzana, azúcar', al: '3 Lácteos' },
    { t: 'Gambón con verduras', category: 'Entrante', sup: 1.50, desc: 'Sustituye a estándar (+1.50€).', ing: 'gambón, verduras, aceite de oliva', al: '6 Crustáceos' },
    // NUEVOS PLATOS PDF 2026
    { t: 'Ensalada de aguacate, mango y gambón con vinagreta de granada', category: 'Entrante', al: '6, 9, 14', desc: 'Sugerencia PDF 2026' },
    { t: 'Mini coca crujiente de salmón, tomate seco, queso y piparra', category: 'Entrante', al: '1, 3, 5, 14', desc: 'Sugerencia PDF 2026' },
    { t: 'Boquerones crujientes con alioli de cítricos', category: 'Entrante', al: '1, 3, 5, 7', desc: 'Sugerencia PDF 2026' },
    { t: 'Zamburiñas gratinadas', category: 'Entrante', al: '3, 4, 5', desc: 'Sugerencia PDF 2026' },
    { t: 'Lomito de merluza con flan de gambas, su cristal y crema de sus cabezas', category: 'Primer Plato', al: '1, 3, 5, 7', desc: 'Sugerencia PDF 2026' },
    { t: 'Solomillo ibérico con salsa de avellanas y gratén de patatas', category: 'Segundo Plato', al: '2, 3, 5, 6, 7', desc: 'Sugerencia PDF 2026' },
    { t: 'Brownie de chocolate blanco y pistacho con sopa de chocolate helado de turrón', category: 'Postre', al: '2, 3, 5, 7, 14', desc: 'Sugerencia PDF 2026' },
    { t: 'Ensalada templada de perdiz escabechada con crujiente de jamón', category: 'Entrante', al: '14', desc: 'Sugerencia PDF 2026' },
    { t: 'Buñuelos de marisco y queso brie empanado, acompañados de alioli de almendras', category: 'Entrante', al: '2, 3, 5, 7', desc: 'Sugerencia PDF 2026' },
    { t: 'Mejillones a la francesa', category: 'Entrante', al: '3, 4, 14', desc: 'Sugerencia PDF 2026' },
    { t: 'Gambones a la sal y zamburiñas', category: 'Primer Plato', al: '3, 5, 6, 7', desc: 'Sugerencia PDF 2026' },
    { t: 'Bacalao gratinado con alioli de ajo negro, crema de pisto y torrezno crujiente', category: 'Primer Plato', al: '1, 3, 5, 14', desc: 'Sugerencia PDF 2026' },
    { t: 'Entrecot de añoja a la brasa con salsa mojo y patata chafada', category: 'Segundo Plato', al: '14', desc: 'Sugerencia PDF 2026' },
    { t: 'Mousse de mandarina y vodka con helado de chocolate blanco', category: 'Postre', al: '3, 7, 14', desc: 'Sugerencia PDF 2026' },
    { t: 'Ensalada de boletus con presa ibérica, parmesano y vinagreta de albahaca', category: 'Entrante', al: '3, 14', desc: 'Sugerencia PDF 2026' },
    { t: 'Alcachofas al azafrán con langostinos y zamburiña', category: 'Entrante', al: '4, 6', desc: 'Sugerencia PDF 2026' },
    { t: 'Creps de txangurro con crema mariscada', category: 'Entrante', al: '3, 4, 5, 6, 7', desc: 'Sugerencia PDF 2026' },
    { t: 'Lomo de lubina a la sal de limón', category: 'Primer Plato', al: '1, 3', desc: 'Sugerencia PDF 2026' },
    { t: 'Paletilla de lechal al horno con panaderas', category: 'Segundo Plato', al: '14', desc: 'Sugerencia PDF 2026' },
    { t: 'Tarta de turrón y chocolate blanco con helado de leche merengada', category: 'Postre', al: '3, 5, 7', desc: 'Sugerencia PDF 2026' },
    { t: 'Tosta crujiente de salmón, queso y mango', category: 'Entrante', al: '1, 3, 5', desc: 'Sugerencia PDF 2026' },
    { t: 'Ensalada de foie, frutos rojos y vinagreta de naranja', category: 'Entrante', al: '14', desc: 'Sugerencia PDF 2026' },
    { t: 'Croquetas surtidas de la casa', category: 'Entrante', al: '1, 3, 5, 7', desc: 'Sugerencia PDF 2026' },
    { t: 'Rape con salsa de piquillo y chips vegetales', category: 'Primer Plato', al: '1, 3, 14', desc: 'Sugerencia PDF 2026' },
    { t: 'Cochinillo asado con puré de manzana y patata', category: 'Segundo Plato', al: '14', desc: 'Sugerencia PDF 2026' },
    { t: 'Coulant de Lotus y Peta Zeta con helado de Oreo', category: 'Postre', al: '3, 5, 7', desc: 'Sugerencia PDF 2026' }
];

const MENUS_DATA_DEFAULT = [
    {
        id: 1,
        name: "Menú 1",
        price: 65.00,
        desc: "Indicado para bodas y celebraciones formales con equilibrio mar por tierra.",
        sections: [
            { title: "Entrantes (Elige 4)", type: "choose_many", limit: 4, items: CATALOG_ITEMS_DEFAULT },
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
            { title: "Entrantes (Elige 4)", type: "choose_many", limit: 4, items: CATALOG_ITEMS_DEFAULT },
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
            { title: "Entrantes (Elige 4)", type: "choose_many", limit: 4, items: CATALOG_ITEMS_DEFAULT },
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
            { title: "Entrantes (Elige 4)", type: "choose_many", limit: 4, items: CATALOG_ITEMS_DEFAULT },
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
            { title: "Entrantes (Elige 4)", type: "choose_many", limit: 4, items: CATALOG_ITEMS_DEFAULT },
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
            { title: "Entrantes (Elige 4)", type: "choose_many", limit: 4, items: CATALOG_ITEMS_DEFAULT },
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
    },
    // NUEVOS MENÚS PDF 2026
    {
        id: 9,
        name: "Sugerencia A (PDF)",
        price: 40.00,
        desc: "Basado en la propuesta 1 del PDF de eventos.",
        sections: [
            { title: "Entrantes al centro", type: "fixed", items: ["Ensalada de aguacate, mango y gambón con vinagreta de granada", "Mini coca crujiente de salmón, tomate seco, queso y piparra", "Boquerones crujientes con alioli de cítricos", "Zamburiñas gratinadas"] },
            { title: "Plato único a elegir", type: "choose_split", items: ["Lomito de merluza con flan de gambas, su cristal y crema de sus cabezas", "Solomillo ibérico con salsa de avellanas y gratén de patatas"] },
            { title: "Postre", type: "fixed", items: ["Brownie de chocolate blanco y pistacho con sopa de chocolate helado de turrón"] }
        ]
    },
    {
        id: 10,
        name: "Sugerencia B (PDF)",
        price: 45.00,
        desc: "Basado en la propuesta 2 del PDF de eventos.",
        sections: [
            { title: "Entrantes al centro", type: "fixed", items: ["Ensalada templada de perdiz escabechada con crujiente de jamón", "Buñuelos de marisco y queso brie empanado, acompañados de alioli de almendras", "Mejillones a la francesa", "Gambones a la sal y zamburiñas"] },
            { title: "Plato único a elegir", type: "choose_split", items: ["Bacalao gratinado con alioli de ajo negro, crema de pisto y torrezno crujiente", "Entrecot de añoja a la brasa con salsa mojo y patata chafada"] },
            { title: "Postre", type: "fixed", items: ["Mousse de mandarina y vodka con helado de chocolate blanco"] }
        ]
    },
    {
        id: 11,
        name: "Sugerencia C (PDF)",
        price: 50.00,
        desc: "Basado en la propuesta 3 del PDF de eventos.",
        sections: [
            { title: "Entrantes al centro", type: "fixed", items: ["Ensalada de boletus con presa ibérica, parmesano y vinagreta de albahaca", "Alcachofas al azafrán con langostinos y zamburiña", "Creps de txangurro con crema mariscada", "Gambones a la sal y zamburiñas"] },
            { title: "Plato único a elegir", type: "choose_split", items: ["Lomo de lubina a la sal de limón", "Paletilla de lechal al horno con panaderas"] },
            { title: "Postre", type: "fixed", items: ["Tarta de turrón y chocolate blanco con helado de leche merengada"] }
        ]
    },
    {
        id: 12,
        name: "Sugerencia D (PDF)",
        price: 60.00,
        desc: "Basado en la propuesta 4 del PDF de eventos.",
        sections: [
            { title: "Entrantes al centro", type: "fixed", items: ["Tosta crujiente de salmón, queso y mango", "Ensalada de foie, frutos rojos y vinagreta de naranja", "Croquetas surtidas de la casa"] },
            { title: "Primer plato", type: "fixed", items: ["Gambones a la sal y zamburiñas"] },
            { title: "Segundo plato a elegir", type: "choose_split", items: ["Rape con salsa de piquillo y chips vegetales", "Cochinillo asado con puré de manzana y patata"] },
            { title: "Postre", type: "fixed", items: ["Coulant de Lotus y Peta Zeta con helado de Oreo"] }
        ]
    }
];

const HOTELS_DEFAULT = {
    'GUADIANA': {
        name: 'Sercotel Guadiana',
        logoPath: 'img/guadiana logo.jpg',
        address: 'C/ Guadiana, 36 - 13002 Ciudad Real',
        tel: '926 22 33 13',
        web: 'www.hotelguadiana.es'
    },
    'CUMBRIA': {
        name: 'Cumbria Spa&Hotel',
        logoPath: 'img/cumbria logo.jpg',
        address: 'Ctra. de Toledo, 26 - 13005 Ciudad Real',
        tel: '926 25 04 04',
        web: 'www.cumbriahotel.es'
    }
};

// SYNC LOGIC: Load from localStorage if available (Source of Truth)
if (localStorage.getItem('MENUS_DATA')) {
    window.MENUS_DATA = JSON.parse(localStorage.getItem('MENUS_DATA'));
} else {
    window.MENUS_DATA = MENUS_DATA_DEFAULT;
}

if (localStorage.getItem('CATALOG_ITEMS')) {
    window.CATALOG_ITEMS = JSON.parse(localStorage.getItem('CATALOG_ITEMS'));
} else {
    window.CATALOG_ITEMS = CATALOG_ITEMS_DEFAULT;
}

if (localStorage.getItem('HOTELS')) {
    window.HOTELS = JSON.parse(localStorage.getItem('HOTELS'));
} else {
    window.HOTELS = HOTELS_DEFAULT;
}

// Map to global for easy access by other scripts
const MENUS_DATA = window.MENUS_DATA;
const CATALOG_ITEMS = window.CATALOG_ITEMS;
const HOTELS = window.HOTELS;
