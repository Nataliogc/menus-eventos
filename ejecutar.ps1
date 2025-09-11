# Requires: Git installed
param(
  [string]$RepoUrl = "https://github.com/Nataliogc/menus-eventos.git"
)

function Ensure-Git {
  try { git --version | Out-Null } catch {
    Write-Error "[ERROR] Git no está instalado o no está en el PATH."
    exit 1
  }
}

Ensure-Git

if (-not (Test-Path ".git")) {
  Write-Host "Inicializando repositorio Git..."
  git init | Out-Null
  git branch -M main | Out-Null
}

$gitUser = (git config user.name) 2>$null
if (-not $gitUser) {
  Write-Host "Configurando nombre y email de Git (solo primera vez)..."
  git config user.name "Tu Nombre"
  git config user.email "tu_email@ejemplo.com"
}

$origin = (git remote get-url origin) 2>$null
if (-not $origin) {
  Write-Host "Estableciendo remoto origin a $RepoUrl"
  git remote add origin $RepoUrl | Out-Null
}

$now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git add .
git commit -m "Actualizacion: $now"
git push -u origin main

Write-Host "`n✅ Cambios subidos. Revisa GitHub Pages en Settings > Pages del repo."
