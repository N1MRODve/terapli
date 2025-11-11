#!/bin/bash

echo "🔧 Corrección masiva de clases terracota → violeta..."

# Función para buscar y reemplazar en archivos
fix_terracota() {
    local pattern="$1"
    local replacement="$2"
    
    echo "   🔄 $pattern → $replacement"
    
    # Buscar archivos que contengan el patrón
    files=$(grep -r -l "$pattern" \
        --include="*.vue" \
        --include="*.ts" \
        --include="*.js" \
        --include="*.css" \
        --exclude-dir=node_modules \
        --exclude-dir=.nuxt \
        --exclude-dir=.output \
        . 2>/dev/null || true)
    
    if [ -n "$files" ]; then
        echo "$files" | while read -r file; do
            if [ -f "$file" ]; then
                sed -i '' "s/$pattern/$replacement/g" "$file"
                echo "     ✅ Corregido: $file"
            fi
        done
    fi
}

echo "📁 Corrigiendo clases CSS básicas..."

# Clases básicas
fix_terracota "bg-terracota" "bg-purple-600"
fix_terracota "text-terracota" "text-purple-600"
fix_terracota "border-terracota" "border-purple-600"

echo "📁 Corrigiendo clases con opacidad..."

# Clases con opacidad
fix_terracota "bg-terracota/90" "bg-purple-700"
fix_terracota "bg-terracota/80" "bg-purple-200"
fix_terracota "bg-terracota/20" "bg-purple-100"
fix_terracota "bg-terracota/10" "bg-purple-50"
fix_terracota "bg-terracota/5" "bg-purple-25"

fix_terracota "text-terracota/90" "text-purple-700"
fix_terracota "text-terracota/80" "text-purple-600"
fix_terracota "text-terracota/70" "text-purple-500"

fix_terracota "border-terracota/30" "border-purple-300"
fix_terracota "border-terracota/20" "border-purple-200"

echo "📁 Corrigiendo hovers y focus..."

# Estados hover
fix_terracota "hover:bg-terracota/90" "hover:bg-purple-700"
fix_terracota "hover:bg-terracota/80" "hover:bg-purple-600"
fix_terracota "hover:bg-terracota" "hover:bg-purple-700"
fix_terracota "hover:text-terracota" "hover:text-purple-600"
fix_terracota "hover:border-terracota" "hover:border-purple-600"

# Estados focus
fix_terracota "focus:ring-terracota/50" "focus:ring-purple-300"
fix_terracota "focus:ring-terracota/30" "focus:ring-purple-200"
fix_terracota "focus:ring-terracota" "focus:ring-purple-300"
fix_terracota "focus:border-terracota" "focus:border-purple-600"

echo "📁 Corrigiendo clases de ring..."

# Ring classes
fix_terracota "ring-terracota/50" "ring-purple-300"
fix_terracota "ring-terracota/30" "ring-purple-200"
fix_terracota "ring-terracota" "ring-purple-300"
fix_terracota "ring-2 ring-terracota" "ring-2 ring-purple-300"

echo "📁 Corrigiendo gradientes y utilidades..."

# Gradientes
fix_terracota "from-terracota" "from-purple-600"
fix_terracota "to-terracota" "to-purple-600"
fix_terracota "via-terracota" "via-purple-600"

# Otras utilidades
fix_terracota "shadow-terracota" "shadow-purple-500"
fix_terracota "decoration-terracota" "decoration-purple-600"

echo "📁 Corrigiendo nombres de clases personalizadas..."

# CSS classes personalizadas
fix_terracota "gradient-terracota" "gradient-violeta"
fix_terracota "text-gradient-terracota" "text-gradient-violeta"
fix_terracota "btn-terracota" "btn-primary"
fix_terracota "btn-terracota-light" "btn-secondary"

echo "✅ Corrección masiva completada!"
echo "📊 Archivos procesados:"

# Mostrar resumen
grep -r -l "purple-\|violeta" \
    --include="*.vue" \
    --include="*.ts" \
    --include="*.js" \
    --include="*.css" \
    --exclude-dir=node_modules \
    --exclude-dir=.nuxt \
    --exclude-dir=.output \
    . 2>/dev/null | wc -l | awk '{print "   🎨 " $1 " archivos con nuevos colores"}'

echo ""
echo "🔍 Verificando si quedan referencias a terracota..."
remaining=$(grep -r -l "terracota" \
    --include="*.vue" \
    --include="*.ts" \
    --include="*.js" \
    --include="*.css" \
    --exclude-dir=node_modules \
    --exclude-dir=.nuxt \
    --exclude-dir=.output \
    . 2>/dev/null || true)

if [ -n "$remaining" ]; then
    echo "⚠️  Archivos que aún contienen 'terracota':"
    echo "$remaining"
else
    echo "✅ ¡No quedan referencias a 'terracota'!"
fi