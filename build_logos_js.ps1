
$g = Get-Content "C:\Users\comun\Documents\GitHub\menus-eventos\img\guadiana.b64" -Raw
$c = Get-Content "C:\Users\comun\Documents\GitHub\menus-eventos\img\cumbria.b64" -Raw

$g = $g -replace "`r", "" -replace "`n", ""
$c = $c -replace "`r", "" -replace "`n", ""

$js = @"
const HOTELS = {
    'GUADIANA': {
        name: 'Sercotel Guadiana',
        logoPath: 'img/guadiana logo.jpg',
        logoBase64: 'data:image/jpeg;base64,$g',
        address: 'C/ Guadiana, 36 - 13002 Ciudad Real (España)',
        tel: '926 22 33 13',
        web: 'https://www.sercotelhoteles.com/es/hotel-guadiana'
    },
    'CUMBIA': {
        name: 'Cumbria Spa&Hotel',
        logoPath: 'img/cumbria logo.jpg',
        logoBase64: 'data:image/jpeg;base64,$c',
        address: 'Ctra. de Toledo, 26 - 13005 Ciudad Real (España)',
        tel: '926 25 04 04',
        web: 'https://www.cumbriahotel.es/'
    }
};
"@

$js | Out-File "C:\Users\comun\Documents\GitHub\menus-eventos\js\logos.js" -Encoding UTF8
Write-Host "Created js/logos.js"
