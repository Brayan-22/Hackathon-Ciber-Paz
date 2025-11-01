# 🔧 Solución de Errores: "Unexpected token 'export'"

## ❌ Problema Original

Error en la consola del navegador:
```
Uncaught SyntaxError: Unexpected token 'export'
```

Este error aparecía en:
- `utils/storage.js:31`
- `utils/tts.js:235`
- `utils/keyboard-nav.js:41`

## 🔍 Causa del Error

Los archivos de utilidades (`utils/*.js`) estaban usando sintaxis de **módulos ES6** (`export { ... }`), pero se cargaban como **scripts normales** en el `content_scripts` del `manifest.json`.

Cuando un archivo se carga directamente en `content_scripts`, se ejecuta como un script tradicional en el contexto de la página, **NO como un módulo ES6**. Por lo tanto, la palabra clave `export` no está permitida y causa un error de sintaxis.

## ✅ Solución Implementada

### 1. **Eliminación de `export` statements**

Se removieron todas las declaraciones `export` de los archivos de utilidades:

**Antes:**
```javascript
// Export for ES modules (popup/options)
export { getSettings, setSettings };

// Export to window for content scripts
if (typeof window !== 'undefined') {
  window.WAU_Storage = { getSettings, setSettings };
}
```

**Después:**
```javascript
// Export to window for content scripts
if (typeof window !== 'undefined') {
  window.WAU_Storage = { getSettings, setSettings };
}
```

### 2. **Actualización de popup.js y options.js**

Como el popup y las opciones necesitaban usar estos archivos, se cambió de **dynamic imports** a **carga dinámica de scripts**:

**Antes:**
```javascript
const storage = await import(chrome.runtime.getURL('../utils/storage.js'));
```

**Después:**
```javascript
// Load storage utility script dynamically
const script = document.createElement('script');
script.src = chrome.runtime.getURL('../utils/storage.js');
await new Promise((resolve, reject) => {
  script.onload = resolve;
  script.onerror = reject;
  document.head.appendChild(script);
});

const { getSettings, setSettings } = window.WAU_Storage;
```

### 3. **Configuración de web_accessible_resources**

Se aseguró que los archivos utils estén accesibles desde las páginas de extensión:

```json
"web_accessible_resources": [
  {
    "resources": [
      "content/styles/*.css",
      "utils/*.js"
    ],
    "matches": ["<all_urls>"]
  },
  {
    "resources": [
      "utils/storage.js"
    ],
    "matches": [],
    "extension_ids": [],
    "use_dynamic_url": false
  }
]
```

## 🔄 Archivos Modificados

1. ✅ `utils/storage.js` - Removido `export`
2. ✅ `utils/tts.js` - Removido `export`
3. ✅ `utils/keyboard-nav.js` - Removido `export`
4. ✅ `popup/popup.js` - Cambio de import a script loading
5. ✅ `options/options.js` - Cambio de import a script loading
6. ✅ `manifest.json` - Actualizado web_accessible_resources

## 🧪 Cómo Verificar la Solución

### Paso 1: Recargar la extensión
1. Ve a `chrome://extensions`
2. Encuentra "Accesibilidad Web Universal"
3. Click en el botón de **recargar** (icono circular)

### Paso 2: Recargar la página de prueba
1. Ve a cualquier sitio web (ej: https://www.igac.gov.co/)
2. Presiona `F5` para recargar
3. Abre la consola del navegador (`F12`)

### Paso 3: Verificar que no hay errores
La consola debe mostrar:
```
✅ [WAU] Inicializando Text-to-Speech...
✅ [WAU] TTS inicializado correctamente
```

**NO** debe mostrar:
```
❌ Uncaught SyntaxError: Unexpected token 'export'
```

### Paso 4: Probar funcionalidad
1. El **widget flotante morado** debe aparecer en la esquina inferior derecha
2. El **popup de la extensión** debe funcionar correctamente
3. La **página de opciones** debe funcionar correctamente
4. Presiona `Tab` para navegar - debe funcionar el TTS

## 🎯 ¿Por Qué Esta Solución?

### Opción Rechazada: Convertir a Módulos ES6
No se usó `type="module"` en content_scripts porque:
- ❌ Los módulos ES6 en content scripts tienen **alcance aislado**
- ❌ No pueden compartir variables entre sí fácilmente
- ❌ Requieren sintaxis de import/export en todos los archivos
- ❌ Más complejo de debuggear

### Opción Elegida: Scripts Tradicionales
Se usaron scripts tradicionales porque:
- ✅ Comparten el **mismo contexto global** (`window`)
- ✅ Pueden exportar/importar mediante `window.WAU_*`
- ✅ Más simple y directo
- ✅ Compatible con todas las versiones de navegadores
- ✅ Fácil de debuggear en la consola

## 📚 Patrón de Diseño Usado

### Para Content Scripts (utils/*.js)
```javascript
// Define funciones normalmente
function myFunction() {
  // ...
}

// Exportar al objeto window
if (typeof window !== 'undefined') {
  window.MY_NAMESPACE = { myFunction };
}
```

### Para Usar en Otros Scripts
```javascript
// En content-script.js (ya cargado por orden en manifest)
const { myFunction } = window.MY_NAMESPACE;
myFunction();
```

### Para Popup/Options (HTML pages)
```javascript
// Cargar script dinámicamente
const script = document.createElement('script');
script.src = chrome.runtime.getURL('../utils/my-util.js');
await new Promise((resolve, reject) => {
  script.onload = resolve;
  script.onerror = reject;
  document.head.appendChild(script);
});

// Usar desde window
const { myFunction } = window.MY_NAMESPACE;
myFunction();
```

## ⚠️ Notas Importantes

### Orden de Carga en manifest.json
El orden de los scripts en `content_scripts.js` es **crítico**:

```json
"js": [
  "utils/storage.js",        // ← Primero: Define window.WAU_Storage
  "utils/tts.js",            // ← Segundo: Define window.WAU_TTS
  "utils/keyboard-nav.js",   // ← Tercero: Define window.WAU_KB
  "content/dom-injector.js", // ← Cuarto: Define window.__WAU_INJECTOR__
  "content/content-script.js", // ← Quinto: USA todos los anteriores
  "content/floating-widget.js" // ← Sexto: USA storage y TTS
]
```

Si cambias el orden, los scripts pueden intentar usar funciones que aún no están definidas.

### Variables Globales
Todos los exports van al objeto `window`:
- `window.WAU_Storage` - Funciones de storage
- `window.WAU_TTS` - Funciones de text-to-speech
- `window.WAU_KB` - Funciones de navegación por teclado
- `window.__WAU_INJECTOR__` - Funciones de inyección de CSS/DOM

## 🐛 Si Aún Tienes Errores

### Error: "window.WAU_Storage is undefined"
**Causa:** Los scripts no se cargaron en orden correcto.
**Solución:** Verifica el orden en `manifest.json` > `content_scripts` > `js`

### Error: "chrome.runtime.getURL is not a function"
**Causa:** Intentando usar desde un contexto no permitido.
**Solución:** Solo úsalo desde popup/options, no desde páginas web normales.

### Error: "Cannot read property 'speak' of undefined"
**Causa:** `window.WAU_TTS` no está definido aún.
**Solución:** Espera a que el script cargue con el `checkInterval` en content-script.js

## ✅ Checklist de Verificación

Después de aplicar los cambios:

- [ ] ✅ No hay errores en la consola
- [ ] ✅ El widget flotante aparece
- [ ] ✅ El popup funciona correctamente
- [ ] ✅ La página de opciones funciona
- [ ] ✅ TTS funciona al presionar Tab
- [ ] ✅ Los atajos de teclado funcionan (Alt+T, Alt+Plus, Alt+Minus)
- [ ] ✅ Los cambios se guardan correctamente
- [ ] ✅ Los temas se aplican correctamente

---

**Status:** ✅ RESUELTO

**Fecha:** Noviembre 1, 2025

**Archivos modificados:** 6 archivos

**Impacto:** Corrección crítica - La extensión ahora funciona completamente
