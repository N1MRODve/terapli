#!/bin/bash

echo "🧹 Limpiando entorno de desarrollo de Terapli..."

# Función para imprimir con colores
print_success() {
    echo -e "\033[32m✅ $1\033[0m"
}

print_info() {
    echo -e "\033[34mℹ️  $1\033[0m"
}

print_warning() {
    echo -e "\033[33m⚠️  $1\033[0m"
}

# Verificar si estamos en el directorio correcto
if [ ! -f "nuxt.config.ts" ]; then
    echo "❌ Este script debe ejecutarse desde el directorio raíz del proyecto"
    exit 1
fi

# Limpiar cache de Nuxt
print_info "Limpiando cache de Nuxt..."
rm -rf .nuxt
rm -rf .output
print_success "Cache de Nuxt limpiado"

# Limpiar cache de Node.js
print_info "Limpiando cache de Node.js..."
rm -rf node_modules/.cache
print_success "Cache de Node.js limpiado"

# Limpiar cache de Vite (si existe)
if [ -d "node_modules/.vite" ]; then
    print_info "Limpiando cache de Vite..."
    rm -rf node_modules/.vite
    print_success "Cache de Vite limpiado"
fi

# Limpiar archivos temporales de TypeScript
print_info "Limpiando archivos temporales..."
find . -name "*.tsbuildinfo" -delete 2>/dev/null || true
print_success "Archivos temporales limpiados"

# Reinstalar dependencias (opcional)
read -p "¿Deseas reinstalar las dependencias? (y/N): " reinstall
if [[ $reinstall =~ ^[Yy]$ ]]; then
    print_info "Reinstalando dependencias..."
    npm install
    print_success "Dependencias reinstaladas"
fi

echo ""
print_success "Entorno de desarrollo limpiado exitosamente!"
print_info "Puedes ejecutar los siguientes comandos:"
echo "  • npm run dev:minimal    (sin PWA, Content, ni Analytics)"
echo "  • npm run dev:clean      (sin Content solamente)" 
echo "  • npm run dev            (completo)"