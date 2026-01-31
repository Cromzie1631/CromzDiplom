#!/bin/bash
# Копирует примеры .pa9 из cromzie в workspace
# Использование: ./scripts/copy-examples.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKSPACE="$PROJECT_DIR/workspace"
EXAMPLES="$PROJECT_DIR/cromzie/Examples"

mkdir -p "$WORKSPACE"

if [ ! -d "$EXAMPLES" ]; then
  echo "Папка cromzie/Examples не найдена."
  exit 1
fi

cp "$EXAMPLES"/Demo1.pa9 "$EXAMPLES"/Motor.pa9 "$EXAMPLES"/sin.pa9 \
   "$EXAMPLES"/ImpSt.pa9 "$EXAMPLES"/LabTermo.pa9 "$EXAMPLES"/Van_der_Pol.pa9 \
   "$EXAMPLES"/TTL.PA9 "$WORKSPACE/" 2>/dev/null || true

echo "Примеры скопированы в workspace/"
