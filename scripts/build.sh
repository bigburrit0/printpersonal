#!/bin/sh
# Arma _site/ con lo único que se publica: la página y lo que ella carga.
# docs/, tests/, CLAUDE.md y README.md quedan afuera a propósito (el repositorio es privado).
# Si la página empieza a cargar un archivo nuevo, agregalo a FILES.
set -eu
cd "$(dirname "$0")/.."

FILES="index.html styles.css app.js data"
OUT=_site

rm -rf "$OUT"
mkdir -p "$OUT"
for f in $FILES; do
  cp -R "$f" "$OUT/"
done
echo "Listo: $OUT/"
