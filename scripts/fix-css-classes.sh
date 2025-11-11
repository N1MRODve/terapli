#!/bin/bash

echo "🔧 Corrigiendo clases CSS inválidas en components.css..."

# Archivo a corregir
FILE="/Users/dieterlorenzo/terapli/assets/css/components.css"

# Crear backup
cp "$FILE" "$FILE.backup"

# Reemplazos de clases inválidas
sed -i '' 's/border-neutral\/5/border-gray-100/g' "$FILE"
sed -i '' 's/border-neutral\/8/border-gray-200/g' "$FILE"
sed -i '' 's/border-neutral\/10/border-gray-200/g' "$FILE"
sed -i '' 's/border-neutral\/20/border-gray-300/g' "$FILE"
sed -i '' 's/border-neutral\/30/border-gray-400/g' "$FILE"

sed -i '' 's/text-neutral/text-gray-700/g' "$FILE"
sed -i '' 's/placeholder:text-neutral\/40/placeholder:text-gray-400/g' "$FILE"

sed -i '' 's/bg-neutral\/5/bg-gray-50/g' "$FILE"
sed -i '' 's/hover:bg-neutral\/5/hover:bg-gray-50/g' "$FILE"
sed -i '' 's/disabled:bg-neutral\/5/disabled:bg-gray-50/g' "$FILE"

sed -i '' 's/hover:border-neutral\/30/hover:border-gray-400/g' "$FILE"
sed -i '' 's/focus:ring-neutral\/20/focus:ring-gray-200/g' "$FILE"
sed -i '' 's/focus:ring-neutral\/30/focus:ring-gray-300/g' "$FILE"

# Reemplazos de violeta (usar purple en su lugar)
sed -i '' 's/text-violeta/text-purple-600/g' "$FILE"
sed -i '' 's/bg-violeta\/10/bg-purple-50/g' "$FILE"
sed -i '' 's/bg-violeta\/20/bg-purple-100/g' "$FILE"
sed -i '' 's/hover:bg-violeta\/20/hover:bg-purple-100/g' "$FILE"
sed -i '' 's/focus:ring-violeta\/30/focus:ring-purple-200/g' "$FILE"
sed -i '' 's/focus:ring-violeta\/50/focus:ring-purple-300/g' "$FILE"
sed -i '' 's/focus:border-violeta\/50/focus:border-purple-300/g' "$FILE"
sed -i '' 's/hover:border-violeta\/30/hover:border-purple-200/g' "$FILE"

echo "✅ Clases CSS corregidas en components.css"
echo "📁 Backup guardado en components.css.backup"