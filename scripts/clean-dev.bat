@echo off
echo 🧹 Limpiando entorno de desarrollo de Terapli...

REM Verificar si estamos en el directorio correcto
if not exist nuxt.config.ts (
    echo ❌ Este script debe ejecutarse desde el directorio raíz del proyecto
    exit /b 1
)

REM Limpiar cache de Nuxt
echo ℹ️  Limpiando cache de Nuxt...
if exist .nuxt rmdir /s /q .nuxt
if exist .output rmdir /s /q .output
echo ✅ Cache de Nuxt limpiado

REM Limpiar cache de Node.js
echo ℹ️  Limpiando cache de Node.js...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo ✅ Cache de Node.js limpiado

REM Limpiar cache de Vite
echo ℹ️  Limpiando cache de Vite...
if exist node_modules\.vite rmdir /s /q node_modules\.vite
echo ✅ Cache de Vite limpiado

REM Limpiar archivos temporales
echo ℹ️  Limpiando archivos temporales...
for /r . %%i in (*.tsbuildinfo) do del "%%i" 2>nul
echo ✅ Archivos temporales limpiados

echo.
echo ✅ Entorno de desarrollo limpiado exitosamente!
echo ℹ️  Puedes ejecutar los siguientes comandos:
echo   • npm run dev:minimal    (sin PWA, Content, ni Analytics)
echo   • npm run dev:clean      (sin Content solamente)
echo   • npm run dev            (completo)
echo.
pause