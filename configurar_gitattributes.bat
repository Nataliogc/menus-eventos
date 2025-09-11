@echo off
setlocal
pushd "%~dp0"

REM --- Crea/actualiza .gitattributes con reglas por tipo de archivo ---
(
  echo * text=auto eol=lf
  echo *.html text eol=lf
  echo *.css  text eol=lf
  echo *.js   text eol=lf
  echo *.json text eol=lf
  echo *.yml  text eol=lf
  echo *.md   text eol=lf
  echo *.svg  text eol=lf

  echo *.bat  text eol=crlf
  echo *.cmd  text eol=crlf
  echo *.ps1  text eol=crlf

  echo *.sh   text eol=lf

  echo *.ico  -text
  echo *.png  -text
  echo *.jpg  -text
  echo *.jpeg -text
  echo *.gif  -text
  echo *.pdf  -text
) > ".gitattributes"

REM (Opcional) Evita que Git haga conversiones automáticas globales
git config core.autocrlf false >nul 2>nul

REM Sube el archivo al repo
git add .gitattributes
git commit -m "Añade .gitattributes con reglas de fin de línea" || echo No hay cambios que commitear.
git push

echo.
echo ✅ .gitattributes configurado y subido.
popd
