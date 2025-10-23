#!/usr/bin/env node

/**
 * Script de verificación de PWA
 * Verifica que todos los componentes necesarios estén configurados
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración PWA...\n');

const checks = [];
let hasErrors = false;

// 1. Verificar nuxt.config.ts
console.log('📋 Verificando nuxt.config.ts...');
const nuxtConfigPath = path.join(__dirname, '../nuxt.config.ts');
if (fs.existsSync(nuxtConfigPath)) {
  const content = fs.readFileSync(nuxtConfigPath, 'utf8');
  
  if (content.includes('@vite-pwa/nuxt')) {
    console.log('  ✅ Módulo @vite-pwa/nuxt encontrado');
    checks.push({ name: 'Módulo PWA', status: 'ok' });
  } else {
    console.log('  ❌ Módulo @vite-pwa/nuxt NO encontrado');
    hasErrors = true;
    checks.push({ name: 'Módulo PWA', status: 'error' });
  }
  
  if (content.includes('pwa:')) {
    console.log('  ✅ Configuración PWA encontrada');
    checks.push({ name: 'Config PWA', status: 'ok' });
  } else {
    console.log('  ❌ Configuración PWA NO encontrada');
    hasErrors = true;
    checks.push({ name: 'Config PWA', status: 'error' });
  }
} else {
  console.log('  ❌ nuxt.config.ts no encontrado');
  hasErrors = true;
}

console.log('');

// 2. Verificar íconos
console.log('🎨 Verificando íconos...');
const iconsPath = path.join(__dirname, '../public/icons');
const requiredIcons = [
  'icon-192x192.png',
  'icon-512x512.png',
  'maskable_icon.png'
];

const svgIcons = [
  'icon-192x192.svg',
  'icon-512x512.svg',
  'maskable_icon.svg'
];

let pngCount = 0;
let svgCount = 0;

requiredIcons.forEach(icon => {
  const iconPath = path.join(iconsPath, icon);
  if (fs.existsSync(iconPath)) {
    console.log(`  ✅ ${icon} encontrado`);
    pngCount++;
  } else {
    console.log(`  ⚠️  ${icon} NO encontrado (usando placeholder SVG)`);
  }
});

svgIcons.forEach(icon => {
  const iconPath = path.join(iconsPath, icon);
  if (fs.existsSync(iconPath)) {
    svgCount++;
  }
});

if (pngCount === 3) {
  console.log('  ✅ Todos los íconos PNG listos');
  checks.push({ name: 'Íconos PNG', status: 'ok' });
} else if (svgCount === 3) {
  console.log('  ⚠️  Usando íconos SVG placeholder - reemplaza con PNG para producción');
  checks.push({ name: 'Íconos', status: 'warning' });
} else {
  console.log('  ❌ Faltan íconos');
  hasErrors = true;
  checks.push({ name: 'Íconos', status: 'error' });
}

console.log('');

// 3. Verificar composables
console.log('🧩 Verificando composables...');
const composablePath = path.join(__dirname, '../composables/usePWAInstallPrompt.ts');
if (fs.existsSync(composablePath)) {
  console.log('  ✅ usePWAInstallPrompt.ts encontrado');
  checks.push({ name: 'Composable PWA', status: 'ok' });
} else {
  console.log('  ❌ usePWAInstallPrompt.ts NO encontrado');
  hasErrors = true;
  checks.push({ name: 'Composable PWA', status: 'error' });
}

console.log('');

// 4. Verificar componentes
console.log('🧱 Verificando componentes...');
const components = [
  'InstallPWAModal.vue',
  'PWAInstallWrapper.vue',
  'InstallPWAButton.vue'
];

components.forEach(comp => {
  const compPath = path.join(__dirname, '../components', comp);
  if (fs.existsSync(compPath)) {
    console.log(`  ✅ ${comp} encontrado`);
  } else {
    console.log(`  ❌ ${comp} NO encontrado`);
    hasErrors = true;
  }
});

console.log('');

// 5. Verificar app.vue
console.log('📱 Verificando app.vue...');
const appVuePath = path.join(__dirname, '../app.vue');
if (fs.existsSync(appVuePath)) {
  const content = fs.readFileSync(appVuePath, 'utf8');
  
  if (content.includes('apple-mobile-web-app-capable')) {
    console.log('  ✅ Meta tags iOS encontrados');
    checks.push({ name: 'Meta tags iOS', status: 'ok' });
  } else {
    console.log('  ⚠️  Meta tags iOS no encontrados');
    checks.push({ name: 'Meta tags iOS', status: 'warning' });
  }
} else {
  console.log('  ❌ app.vue no encontrado');
  hasErrors = true;
}

console.log('');

// Resumen
console.log('═══════════════════════════════════════════════════');
console.log('📊 RESUMEN DE VERIFICACIÓN');
console.log('═══════════════════════════════════════════════════');

const okCount = checks.filter(c => c.status === 'ok').length;
const warningCount = checks.filter(c => c.status === 'warning').length;
const errorCount = checks.filter(c => c.status === 'error').length;

console.log(`✅ Correcto: ${okCount}`);
console.log(`⚠️  Advertencias: ${warningCount}`);
console.log(`❌ Errores: ${errorCount}`);
console.log('');

if (hasErrors || errorCount > 0) {
  console.log('❌ HAY ERRORES - Revisa la configuración');
  console.log('');
  console.log('💡 Pasos sugeridos:');
  console.log('1. Ejecuta: npm install @vite-pwa/nuxt');
  console.log('2. Verifica que todos los archivos estén creados');
  console.log('3. Lee PWA_IMPLEMENTATION.md para más detalles');
  process.exit(1);
} else if (warningCount > 0) {
  console.log('⚠️  CONFIGURACIÓN FUNCIONAL CON ADVERTENCIAS');
  console.log('');
  console.log('💡 Para producción:');
  console.log('1. Reemplaza los íconos SVG con PNG reales');
  console.log('2. Abre: http://localhost:3000/icons/generate-icons.html');
  console.log('3. O usa: https://realfavicongenerator.net/');
  console.log('');
  console.log('✨ Puedes iniciar el servidor de desarrollo');
  process.exit(0);
} else {
  console.log('✅ TODO CORRECTO - PWA lista para usar');
  console.log('');
  console.log('🚀 Próximos pasos:');
  console.log('1. npm run dev');
  console.log('2. Abre DevTools → Application → Manifest');
  console.log('3. Verifica los íconos y configuración');
  console.log('4. Prueba en un dispositivo móvil');
  console.log('');
  console.log('📚 Lee PWA_IMPLEMENTATION.md para más detalles');
  process.exit(0);
}
