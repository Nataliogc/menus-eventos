@echo off
REM === Configuración (cambia esta URL por la de tu repositorio) ===
set REPO_URL=https://github.com/Nataliogc/menus-eventos.git

REM === Comprobaciones ===
where git >nul 2>nul
if errorlevel 1 (
  echo [ERROR] No se encuentra 'git' en el PATH. Instala Git y vuelve a ejecutar.
  pause
  exit /b 1
)

if not exist ".git" (
  echo Inicializando repositorio Git...
  git init
  git branch -M main
)

REM Config global basica (solo si no existe)
for /f "delims=" %%a in ('git config user.name') do set GIT_USERNAME=%%a
if "%GIT_USERNAME%"=="" (
  echo Configurando nombre y email de Git (solo primera vez)...
  git config user.name "Tu Nombre"
  git config user.email "tu_email@ejemplo.com"
)

REM === Remoto origin ===
git remote get-url origin >nul 2>nul
if errorlevel 1 (
  echo Estableciendo remoto origin a %REPO_URL%
  git remote add origin %REPO_URL%
)

REM === Commit con fecha y hora ===
set NOW=%date% %time%
git add .
git commit -m "Actualizacion: %NOW%"

REM === Empujar a main ===
git push -u origin main

echo.
echo ✅ Cambios subidos. Revisa GitHub Pages en Settings > Pages del repo.
pause
