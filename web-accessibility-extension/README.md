# 🧩 Extensión de Navegador: Accesibilidad Web Universal

**Objetivo:** Proveer una herramienta accesible, confiable y extensible que mejore la accesibilidad en cualquier sitio web, cumpliendo con **WCAG 2.2 AA**, y soportando **Chrome (MV3)** y **Firefox (MV2 quirks)**.

## ✨ Características Principales

### 🎯 Widget Flotante de Acceso Rápido
- **Botón flotante** en la esquina inferior derecha de cada página
- Acceso directo a todas las funcionalidades sin necesidad de abrir el popup de la extensión
- Panel deslizante con controles intuitivos y accesibles
- Diseño responsive y compatible con modo oscuro

### 🔤 Ajustes de Tipografía
- Escalado tipográfico por `rem` (0.8x - 2.0x)
- Controles de incremento/decremento rápido (A-, A+)
- Slider para ajuste fino
- Visualización en tiempo real del porcentaje

### 🎨 Temas de Accesibilidad
- **Predeterminado**: Sin modificaciones
- **Alto contraste**: Fondo negro, texto blanco
- **Protanopia**: Filtros para deficiencia rojo-verde
- **Deuteranopia**: Filtros para deficiencia verde-rojo
- **Tritanopia**: Filtros para deficiencia azul-amarillo

### 🔗 Mejoras Visuales
- Resaltado automático de enlaces con bordes y subrayado
- Foco visible en amarillo para mejor navegación
- Skip to content automático

### 🔊 Lectura por Voz (TTS)
- Lectura automática al enfocar elementos
- Soporte para múltiples idiomas
- Fallback usando `chrome.tts` API

### ⌨️ Navegación por Teclado
- **Alt+T**: Alternar TTS on/off
- **Alt+Plus**: Aumentar tamaño de fuente
- **Alt+Minus**: Disminuir tamaño de fuente
- **Tab**: Desplazamiento suave al elemento enfocado
- **Escape**: Cerrar panel flotante
- Atajos personalizables desde opciones

### � Persistencia y Sincronización
- Configuración guardada en `chrome.storage.sync`
- Sincronización entre dispositivos
- Aplicación instantánea en todas las pestañas

## �📁 Estructura del Proyecto
```
web-accessibility-extension/
├── manifest.json (Chrome MV3)
├── manifest-firefox.json (Firefox MV2)
├── README.md
├── background/
│   └── service-worker.js
├── content/
│   ├── content-script.js (Script principal)
│   ├── dom-injector.js (Inyector de CSS y elementos)
│   ├── floating-widget.js (Widget flotante ⭐ NUEVO)
│   └── styles/
│       ├── themes.css
│       ├── links-highlight.css
│       └── floating-widget.css (⭐ NUEVO)
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── options/
│   ├── options.html
│   ├── options.js
│   └── options.css
├── utils/
│   ├── storage.js (Gestión de configuración)
│   ├── tts.js (Text-to-Speech)
│   └── keyboard-nav.js (Navegación por teclado)
├── icons/
└── _locales/es/messages.json
```

## 🚀 Instalación (modo desarrollador)

### Chrome / Edge / Brave
1. Abre `chrome://extensions` (o `edge://extensions`, `brave://extensions`)
2. Activa el **Modo de desarrollador** (esquina superior derecha)
3. Click en **Cargar extensión sin empaquetar**
4. Selecciona la carpeta `web-accessibility-extension/`
5. ¡Listo! Verás el ícono de la extensión en la barra de herramientas

### Firefox
1. Abre `about:debugging`
2. Click en **Este Firefox** (en la barra lateral)
3. Click en **Cargar complemento temporal**
4. Navega a la carpeta y selecciona `manifest-firefox.json`
5. La extensión se cargará temporalmente

> **Nota Firefox**: Para hacer la extensión permanente en Firefox, debes firmarla a través de AMO (addons.mozilla.org)

## 🎮 Uso

### Método 1: Widget Flotante (⭐ Recomendado)
1. Navega a cualquier sitio web
2. Busca el **botón flotante morado** en la esquina inferior derecha
3. Haz click para abrir el panel de accesibilidad
4. Ajusta las opciones según tus necesidades
5. Los cambios se aplican inmediatamente

### Método 2: Popup de la Extensión
1. Click en el ícono de la extensión en la barra de herramientas
2. Usa los controles del popup para ajustar configuración
3. Click en **Opciones…** para personalizar atajos de teclado

### Método 3: Atajos de Teclado
- `Alt+T`: Activar/desactivar lectura por voz
- `Alt+Plus`: Aumentar tamaño de texto
- `Alt+Minus`: Disminuir tamaño de texto

## ⚙️ Opciones Avanzadas

Accede a la página de opciones desde:
- Click en **Opciones…** en el popup
- Click derecho en el ícono → **Opciones**
- `chrome://extensions` → Detalles → Opciones de extensión

### Configuración disponible:
- **Atajos de teclado personalizados**
- **Preferencias avanzadas**
- **Restablecer configuración**

## 🔧 Permisos
- `storage`, `activeTab`, `scripting`
- `tts` (necesario para *fallback* de lectura en background)

## 🧠 Arquitectura Técnica

### Content Scripts
- **dom-injector.js**: Inyecta CSS y elementos DOM (skip to content)
- **content-script.js**: Script principal que coordina todas las funcionalidades
- **floating-widget.js**: Widget flotante independiente con panel de control

### Background Service Worker
- Gestión de configuración por defecto
- Fallback para TTS cuando `speechSynthesis` no está disponible
- Mensajería entre componentes

### Utilities
- **storage.js**: Abstracción para `chrome.storage.sync` con valores por defecto
- **tts.js**: Manejo de Text-to-Speech con fallbacks
- **keyboard-nav.js**: Sistema de atajos de teclado personalizable

### Estilos
- **themes.css**: Temas de color y filtros para daltonismo
- **links-highlight.css**: Resaltado de enlaces
- **floating-widget.css**: Estilos del widget flotante (responsive, dark mode, a11y)

## 🎨 Diseño Accesible

El widget flotante está diseñado siguiendo las mejores prácticas:
- ✅ Contraste AAA (WCAG 2.2)
- ✅ Navegable por teclado completo
- ✅ ARIA labels y roles apropiados
- ✅ Soporte para `prefers-reduced-motion`
- ✅ Soporte para `prefers-contrast: high`
- ✅ Soporte para modo oscuro (`prefers-color-scheme: dark`)
- ✅ Responsive (adaptable a pantallas pequeñas)
- ✅ Focus visible en todos los elementos interactivos

## 🔄 Flujo de Funcionamiento

1. **Carga inicial**: Content scripts se inyectan en todas las páginas
2. **Inicialización**: Se carga la configuración guardada
3. **Aplicación**: Se aplican estilos y configuraciones al DOM
4. **Widget**: Se crea el botón flotante en la esquina inferior derecha
5. **Interacción**: Usuario puede modificar configuración desde:
   - Widget flotante (recomendado)
   - Popup de la extensión
   - Atajos de teclado
6. **Persistencia**: Cambios se guardan automáticamente en `chrome.storage.sync`
7. **Sincronización**: Configuración se sincroniza entre pestañas y dispositivos

## 🧪 Pruebas y Validación

### Herramientas Recomendadas
- **Lighthouse** (Accessibility audit integrado en Chrome DevTools)
- **axe DevTools** (Extensión para análisis de accesibilidad)
- **WAVE** (Web Accessibility Evaluation Tool)
- **Lectores de pantalla**: NVDA (Windows), VoiceOver (macOS), JAWS

### Checklist WCAG 2.2 AA
- ✅ 1.4.3 Contraste (Mínimo)
- ✅ 1.4.4 Redimensionamiento de texto
- ✅ 1.4.10 Reflow
- ✅ 2.1.1 Teclado
- ✅ 2.4.7 Foco visible
- ✅ 3.1.1 Idioma de la página
- ✅ 4.1.2 Nombre, función, valor

Documentación completa: https://www.w3.org/WAI/WCAG22/quickref/

## 🛠 Empaquetado para Producción

### Chrome Web Store
```bash
# Crear ZIP para subir a Chrome Web Store
cd web-accessibility-extension
# En Windows PowerShell:
Compress-Archive -Path * -DestinationPath ..\extension-chrome.zip
```

### Firefox AMO
```bash
# Usar manifest-firefox.json
cd web-accessibility-extension
# Renombrar temporalmente
Rename-Item manifest.json manifest-chrome.json
Rename-Item manifest-firefox.json manifest.json
# Crear ZIP
Compress-Archive -Path * -DestinationPath ..\extension-firefox.zip
# Restaurar nombres
Rename-Item manifest.json manifest-firefox.json
Rename-Item manifest-chrome.json manifest.json
```

## 🐛 Solución de Problemas

### El widget flotante no aparece
- Verifica que la extensión esté habilitada
- Recarga la página (F5)
- Revisa la consola para errores (F12)

### TTS no funciona o no se escucha al presionar Tab

#### Causa 1: Permisos de Audio
Los navegadores modernos requieren interacción del usuario antes de permitir audio automático.

**Solución:**
1. Si aparece la notificación "Haz clic para activar lectura por voz", haz clic en cualquier parte de la página
2. La notificación desaparecerá y el TTS funcionará correctamente
3. Solo necesitas hacer esto una vez por página

#### Causa 2: TTS Desactivado
Verifica que la lectura por voz esté activada.

**Solución:**
1. Presiona `Alt+T` para alternar TTS
2. Debe aparecer "🔊 TTS Activado" (fondo verde)
3. También puedes activarlo desde el widget flotante

#### Causa 3: No hay Voces Disponibles
El navegador puede no tener voces cargadas.

**Solución:**
1. Abre la consola (F12) y busca: `[WAU] TTS inicializado correctamente`
2. Si dice "TTS no disponible", verifica:
   - `chrome://settings/languages` (Chrome)
   - Configuración de voz del sistema operativo
3. Instala voces adicionales en tu sistema operativo

#### Causa 4: Navegador sin Soporte
Safari o navegadores antiguos pueden tener soporte limitado.

**Solución:**
1. Usa Chrome, Edge, Firefox o Brave (versiones recientes)
2. La extensión intentará usar `chrome.tts` como fallback

#### Debugging
Abre la consola del navegador (F12) y busca:
- ✅ `[WAU] Inicializando Text-to-Speech...`
- ✅ `[WAU] TTS inicializado correctamente`
- ✅ `[WAU] Leyendo elemento enfocado: ...`
- ❌ Si ves errores, reporta el problema

Para pruebas detalladas, consulta: `TEST-TTS.md`

### Los estilos no se aplican
- Limpia la caché del navegador
- Recarga la extensión en `chrome://extensions`
- Verifica que no haya conflictos con otras extensiones

### Los atajos de teclado no funcionan
- Verifica la configuración en Opciones
- Comprueba que no haya conflictos con atajos del sistema
- Algunos sitios pueden bloquear eventos de teclado

## � Privacidad y Seguridad

- ✅ **Sin rastreo personal**: No recopilamos datos de usuario
- ✅ **Datos locales**: Configuración guardada solo en `chrome.storage.sync`
- ✅ **Sin servidores externos**: Todo funciona localmente
- ✅ **Código abierto**: Auditable y transparente
- ✅ **Permisos mínimos**: Solo los necesarios para funcionar

## 📝 Licencia y Contribuciones

Este proyecto está diseñado para hackathons y fines educativos. 

### Para contribuir:
1. Fork del repositorio
2. Crea una rama para tu feature
3. Implementa mejoras
4. Envía un Pull Request

### Ideas para mejoras futuras:
- [ ] Modo lector (simplificar diseño de páginas)
- [ ] Diccionario de términos con definiciones
- [ ] Traducción automática
- [ ] Más temas de color
- [ ] Exportar/importar configuración
- [ ] Estadísticas de uso
- [ ] Integración con screen readers nativos

## 📞 Soporte

Para reportar problemas o sugerir mejoras:
- Abre un issue en el repositorio
- Contacta al equipo de desarrollo

---

Hecho con ❤️ para mejorar la accesibilidad web y cumplir con WCAG 2.2 AA.
**¡La web debe ser accesible para todos! 🌐♿**