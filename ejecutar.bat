@echo off
setlocal enabledelayedexpansion

REM === CONFIGURA TU REPO (ya puesto al tuyo) ============================
set "REPO_URL=https://github.com/Nataliogc/menus-eventos.git"
REM ======================================================================

REM Trabajar en la carpeta donde está el .bat
pushd "%~dp0"

REM Comprobación de Git
where git >nul 2>nul
if errorlevel 1 (
  echo [ERROR] No se encuentra 'git' en el PATH. Instala Git: https://git-scm.com/download/win
  pause
  exit /b 1
)

REM Normaliza fin de linea para Windows/Web (solo repo actual)
git config core.autocrlf true >nul 2>nul

REM Inicializa repo si no existe
git rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
  echo Inicializando repositorio Git...
  git init || goto :error
  git branch -M main
)

REM Asegura remoto origin
git remote get-url origin >nul 2>nul
if errorlevel 1 (
  echo Estableciendo remoto origin: %REPO_URL%
  git remote add origin "%REPO_URL%" || goto :error
)

REM Archivos mínimos
if not exist "index.html" (
  echo [AVISO] No existe index.html. Crea o renombra tu pagina a index.html
  pause
  exit /b 1
)

if not exist "README.md" (
  echo Pagina de menus para eventos.> "README.md"
)

REM Evita procesado Jekyll (por si usas carpetas con _ )
if not exist ".nojekyll" type nul > ".nojekyll"

REM Commit con fecha/hora
set "NOW=%date% %time%"
git add -A
git diff --cached --quiet >nul 2>nul
if errorlevel 1 (
  git commit -m "Auto: %NOW%" || goto :commit_check
) else (
  echo No hay cambios que commitear.
)

REM Empujar a main
git push -u origin main || goto :error

echo.
echo ✅ Cambios subidos correctamente a: %REPO_URL%
echo ℹ️  Activa GitHub Pages: Settings > Pages > Branch: main (/root) > Save
echo    Abriendo pagina de configuracion...
start "" "%REPO_URL:git=/settings/pages%"

goto :end

:commit_check
REM Si falla porque no hay nada que commitear
for /f "tokens=2 delims=: " %%i in ('git status -s ^| findstr /r "."') do set _dummy=%%i
if not defined _dummy (
  echo No se detectaron cambios nuevos.
  goto :push_anyway
) else (
  goto :error
)

:push_anyway
git push -u origin main || goto :error
goto :end

:error
echo.
echo ❌ Se produjo un error. Revisa los mensajes de Git de arriba.
pause
:end
popd
