#!/bin/bash
# Script para validar que todos los componentes Vue tienen HTML bien formado

echo "🔍 Validando componentes Vue..."
echo ""

ERRORS_FOUND=0

# Función para validar un archivo
validate_file() {
    local file=$1
    local open_divs=$(awk '/<template>/,/<\/template>/' "$file" | grep -c "<div" 2>/dev/null || echo 0)
    local close_divs=$(awk '/<template>/,/<\/template>/' "$file" | grep -c "</div>" 2>/dev/null || echo 0)
    
    if [ "$open_divs" -ne "$close_divs" ]; then
        echo "❌ ERROR en $file"
        echo "   Divs abiertos: $open_divs"
        echo "   Divs cerrados: $close_divs"
        echo "   Diferencia: $((open_divs - close_divs))"
        echo ""
        ERRORS_FOUND=$((ERRORS_FOUND + 1))
    else
        echo "✅ $file (${open_divs} divs balanceados)"
    fi
}

# Validar archivos específicos
echo "📄 Validando pages/coordinadora/**.vue"
for file in pages/coordinadora/*.vue; do
    if [ -f "$file" ]; then
        validate_file "$file"
    fi
done

echo ""
echo "📄 Validando components/coordinacion/**.vue"
for file in components/coordinacion/*.vue; do
    if [ -f "$file" ]; then
        validate_file "$file"
    fi
done

echo ""
echo "📄 Validando components/dashboard/**.vue"
for file in components/dashboard/*.vue; do
    if [ -f "$file" ]; then
        validate_file "$file"
    fi
done

echo ""
echo "=========================================="
if [ $ERRORS_FOUND -eq 0 ]; then
    echo "✅ ¡Todo bien! No se encontraron errores"
    exit 0
else
    echo "❌ Se encontraron $ERRORS_FOUND archivo(s) con errores"
    exit 1
fi
