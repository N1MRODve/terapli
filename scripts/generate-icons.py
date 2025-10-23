#!/usr/bin/env python3
"""
Generador simple de íconos PNG placeholder para PWA
Requiere: pip install pillow
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
    
    # Directorio de salida
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'icons')
    os.makedirs(output_dir, exist_ok=True)
    
    # Colores de la marca
    BG_COLOR = (249, 247, 243)  # #F9F7F3
    PRIMARY_COLOR = (216, 175, 160)  # #D8AFA0
    TEXT_COLOR = (90, 74, 66)  # #5A4A42
    
    def create_icon(size, filename):
        """Crea un ícono simple con la letra K"""
        # Crear imagen con fondo
        img = Image.new('RGB', (size, size), BG_COLOR)
        draw = ImageDraw.Draw(img)
        
        # Dibujar un corazón/forma orgánica simplificada
        # (círculo superior)
        center = size // 2
        heart_size = size // 3
        
        # Círculo del corazón
        draw.ellipse(
            [center - heart_size//2, center - heart_size, 
             center + heart_size//2, center],
            fill=PRIMARY_COLOR
        )
        
        # Punto decorativo
        dot_size = size // 20
        draw.ellipse(
            [center - dot_size, center + heart_size//2 - dot_size,
             center + dot_size, center + heart_size//2 + dot_size],
            fill=PRIMARY_COLOR
        )
        
        # Texto K
        try:
            # Intentar usar una fuente del sistema
            font_size = size // 4
            font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia.ttf", font_size)
        except:
            # Si falla, usar fuente por defecto
            font = ImageFont.load_default()
        
        # Dibujar K centrada
        text = "K"
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        text_x = (size - text_width) // 2
        text_y = center + heart_size//2 + size // 10
        
        draw.text((text_x, text_y), text, fill=TEXT_COLOR, font=font)
        
        # Guardar
        filepath = os.path.join(output_dir, filename)
        img.save(filepath, 'PNG')
        print(f"✅ Creado: {filename}")
    
    def create_maskable_icon():
        """Crea el ícono maskable con safe zone"""
        size = 512
        img = Image.new('RGB', (size, size), PRIMARY_COLOR)
        draw = ImageDraw.Draw(img)
        
        # Círculo central con safe zone (10%)
        margin = size * 0.1
        safe_size = size - (margin * 2)
        
        # Fondo del círculo
        draw.ellipse(
            [margin, margin, size - margin, size - margin],
            fill=BG_COLOR
        )
        
        # Corazón centrado
        center = size // 2
        heart_size = int(safe_size * 0.3)
        
        draw.ellipse(
            [center - heart_size//2, center - heart_size//2,
             center + heart_size//2, center + heart_size//2],
            fill=PRIMARY_COLOR
        )
        
        # Texto K
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia.ttf", size // 5)
        except:
            font = ImageFont.load_default()
        
        text = "K"
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_x = (size - text_width) // 2
        text_y = center + heart_size
        
        draw.text((text_x, text_y), text, fill=TEXT_COLOR, font=font)
        
        # Guardar
        filepath = os.path.join(output_dir, 'maskable_icon.png')
        img.save(filepath, 'PNG')
        print(f"✅ Creado: maskable_icon.png")
    
    # Generar los íconos
    print("🎨 Generando íconos PNG...\n")
    create_icon(192, 'icon-192x192.png')
    create_icon(512, 'icon-512x512.png')
    create_maskable_icon()
    
    print("\n✨ Íconos generados exitosamente!")
    print("\n💡 Estos son placeholders simples.")
    print("Para producción, reemplázalos con tu logo profesional.")
    
except ImportError:
    print("❌ Error: Pillow no está instalado")
    print("\nInstala con:")
    print("  pip install pillow")
    print("\nO usa el generador HTML:")
    print("  Abre http://localhost:3000/icons/generate-icons.html")
except Exception as e:
    print(f"❌ Error: {e}")
