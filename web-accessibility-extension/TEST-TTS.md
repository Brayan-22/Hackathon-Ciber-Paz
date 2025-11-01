# Pruebas de Text-to-Speech (TTS)

## 🎯 Objetivo
Verificar que la funcionalidad de lectura por voz funcione correctamente al navegar con Tab.

## ✅ Mejoras Implementadas

### 1. **Inicialización Automática**
- El TTS se inicializa automáticamente al cargar la página
- Verifica disponibilidad de `speechSynthesis` API
- Espera a que las voces estén cargadas

### 2. **Verificación de Permisos de Audio**
- Detecta si el contexto de audio está suspendido
- Muestra notificación visual cuando se requiere interacción del usuario
- Solicita activación con un solo clic en la página

### 3. **Extracción Inteligente de Texto**
El sistema ahora lee:
- **Inputs**: Labels, placeholders, aria-labels
- **Botones**: Texto interno o aria-label
- **Enlaces**: Texto del enlace + indica "enlace"
- **Imágenes**: Alt text o título
- **Elementos ARIA**: Roles y labels
- **Campos de formulario**: Incluye el tipo de campo

### 4. **Mejoras de UX**
- **Debounce**: Evita repetir el mismo texto rápidamente
- **Límite de longitud**: Textos largos se truncan a 200 caracteres
- **Logs de consola**: Para debugging
- **Fallback automático**: Si speechSynthesis falla, intenta chrome.tts

### 5. **Feedback Visual**
- Al presionar `Alt+T` se muestra notificación de estado (Activado/Desactivado)
- Notificación de permisos de audio con botón de confirmación
- Auto-desaparece después de 2-5 segundos

## 🧪 Pasos para Probar

### Prueba 1: Activación Inicial
1. Instala/recarga la extensión
2. Navega a cualquier sitio web
3. Abre la consola del navegador (F12)
4. Busca el mensaje: `[WAU] Inicializando Text-to-Speech...`
5. Debe seguir: `[WAU] TTS inicializado correctamente`

### Prueba 2: Permisos de Audio
1. En una página nueva (sin interacción previa)
2. Presiona `Tab` para navegar
3. Si aparece notificación: "Haz clic para activar lectura por voz"
4. Haz clic en cualquier parte de la página
5. Vuelve a presionar `Tab`
6. Debe escucharse la lectura del elemento enfocado

### Prueba 3: Navegación con Tab
1. Asegúrate de que TTS esté activado (Alt+T)
2. Presiona `Tab` repetidamente
3. Debe leer:
   - Botones: "Nombre del botón"
   - Enlaces: "Texto del enlace, enlace"
   - Inputs: "Label del campo, campo de text"
   - Imágenes: "Alt text de la imagen"

### Prueba 4: Toggle TTS
1. Presiona `Alt+T`
2. Debe aparecer notificación: "🔊 TTS Activado" o "🔇 TTS Desactivado"
3. Verifica que el color sea verde (activado) o rojo (desactivado)
4. Presiona `Tab` y verifica que solo lee cuando está activado

### Prueba 5: Widget Flotante
1. Haz clic en el botón morado en la esquina inferior derecha
2. Activa/desactiva "Lectura por voz (TTS)"
3. Navega con `Tab` y verifica que respete la configuración

### Prueba 6: Diferentes Tipos de Elementos
Prueba en una página con:
- [ ] Campos de texto (input type="text")
- [ ] Campos de email (input type="email")
- [ ] Áreas de texto (textarea)
- [ ] Botones (button)
- [ ] Enlaces (a href)
- [ ] Imágenes (img)
- [ ] Elementos con aria-label
- [ ] Elementos con role

## 🐛 Solución de Problemas

### Problema: No se escucha nada
**Soluciones:**
1. Verifica que TTS esté activado (Alt+T)
2. Revisa la consola por errores
3. Asegúrate de haber interactuado con la página (clic)
4. Verifica el volumen del sistema
5. Prueba en modo incógnito (sin otras extensiones)

### Problema: Notificación de permisos aparece siempre
**Soluciones:**
1. Haz clic en la página para activar el contexto de audio
2. Verifica que no haya bloqueadores de audio en el navegador
3. Revisa configuración de Chrome: `chrome://settings/content/sound`

### Problema: Solo funciona en algunas páginas
**Soluciones:**
1. Algunas páginas tienen Content Security Policy (CSP) restrictivas
2. Verifica la consola por errores de seguridad
3. El fallback chrome.tts debería funcionar como alternativa

## 📊 Logs de Consola

Mensajes normales:
```
[WAU] Inicializando Text-to-Speech...
[WAU] TTS inicializado correctamente
[WAU] Leyendo elemento enfocado: Texto del elemento...
[WAU TTS] Iniciando lectura: Texto...
[WAU] TTS activado
```

Mensajes de advertencia:
```
[WAU TTS] No se pudo verificar permisos de audio
[WAU TTS] Error en síntesis de voz
```

Mensajes de error:
```
[WAU TTS] SpeechSynthesis API no disponible
[WAU TTS] Error enviando mensaje a background
```

## 📝 Notas Técnicas

### Compatibilidad de Navegadores
- ✅ Chrome/Edge: Soporte completo
- ✅ Firefox: Funciona con speechSynthesis
- ⚠️ Safari: Requiere interacción del usuario siempre
- ✅ Brave: Funciona con permisos de audio

### Políticas de Autoplay
Los navegadores modernos requieren interacción del usuario antes de permitir audio:
- Primera reproducción requiere clic/touch/keypress
- Las subsecuentes funcionan automáticamente
- La notificación guía al usuario en este proceso

### Voces del Sistema
- El navegador usa las voces instaladas en el sistema operativo
- Windows: Microsoft voices
- macOS: Sistema de voces de Apple
- Linux: eSpeak u otras instaladas

## ✨ Características Adicionales

### Limitación de Texto
- Textos mayores a 200 caracteres se truncan
- Evita lecturas excesivamente largas
- Mejora la experiencia de usuario

### Anti-repetición
- No repite el mismo texto en menos de 1 segundo
- Evita spam de audio al re-enfocar elementos
- Mejora la navegación rápida

### Cancelación Inteligente
- Cancela la lectura anterior antes de iniciar una nueva
- Pequeño delay (50ms) para evitar problemas de sincronización
- Smooth transition entre elementos
