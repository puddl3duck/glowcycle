# 🧪 Dark Mode - Guía de Pruebas

## Cómo Probar el Modo Oscuro

---

## 🎯 PRUEBAS BÁSICAS

### 1. Activar Modo Oscuro

#### Método 1: Botón Toggle
1. Abre cualquier página del proyecto
2. Busca el botón flotante 🌓 en la esquina inferior derecha
3. Haz clic para cambiar entre modo claro y oscuro
4. El tema debe cambiar inmediatamente

#### Método 2: Automático por Hora
1. El modo oscuro se activa automáticamente de 18:00 a 04:59
2. El modo claro se activa automáticamente de 05:00 a 17:59
3. Puedes simular cambiando la hora del sistema

#### Método 3: Manual en DevTools
1. Abre DevTools (F12)
2. En la consola, escribe: `document.body.classList.add('dark-theme')`
3. Para quitar: `document.body.classList.remove('dark-theme')`

---

## 📋 CHECKLIST DE PRUEBAS

### Landing Page (index.html)
- [ ] Hero title es blanco y legible
- [ ] Hero description es blanca y legible
- [ ] Logo es rosa (#FFB6D9)
- [ ] Estadísticas tienen números en gradiente rosa
- [ ] Botón "Start Your Journey" tiene gradiente rosa con texto oscuro
- [ ] Imagen hero tiene filtro brightness(0.95)
- [ ] Decoraciones flotantes tienen filtro brightness(0.95)

### Questionnaire
- [ ] Question title es blanco con sombra
- [ ] Question subtitle es blanco
- [ ] Input fields tienen fondo oscuro y texto blanco
- [ ] Placeholders son visibles en lavanda claro
- [ ] Cycle selector tiene botones con borde rosa
- [ ] Número de días es rosa (#FFB6D9)
- [ ] Label "days" es blanco
- [ ] Progress bar tiene gradiente rosa
- [ ] Botón "Continue" tiene gradiente rosa

### Dashboard
- [ ] Navbar tiene fondo oscuro
- [ ] Logo es blanco
- [ ] Nav links son lavanda claro, rosa al hover
- [ ] Profile name es blanco
- [ ] Motivational quote es blanco con sombra
- [ ] Motivational subtext es blanco
- [ ] Dashboard title es blanco
- [ ] Feature cards tienen fondo oscuro con borde rosa
- [ ] Feature titles son blancos
- [ ] Feature descriptions son blancas
- [ ] Step cards tienen fondo oscuro
- [ ] Step numbers tienen gradiente rosa con texto oscuro
- [ ] Comparison cards tienen fondo oscuro
- [ ] Testimonial cards tienen fondo oscuro
- [ ] Footer tiene fondo oscuro con logo rosa

### Cycle Tracking
- [ ] Back button tiene fondo gradiente lavanda
- [ ] Back button text es blanco
- [ ] Flecha es BLANCA (no rosa) ⬅️
- [ ] Page title es blanco
- [ ] Page subtitle es blanco
- [ ] Cycle wheel labels externos son BLANCOS (Menstrual, Follicular, Ovulation, Luteal)
- [ ] Cycle wheel centro es OSCURO (14, Day)
- [ ] Phase info card tiene fondo oscuro
- [ ] Phase title es blanco
- [ ] Phase description es blanca
- [ ] Phase days badge tiene gradiente rosa
- [ ] Tip items tienen gradiente rosa con borde
- [ ] Date input tiene fondo oscuro y texto blanco
- [ ] Save button tiene gradiente rosa
- [ ] Prediction items tienen gradiente rosa

### Journal & Mood
- [ ] Back button tiene fondo gradiente lavanda
- [ ] Flecha es BLANCA ⬅️
- [ ] Page title es blanco
- [ ] Current date es blanco
- [ ] Journal prompt es blanco
- [ ] Mood options tienen labels blancos
- [ ] Mood emojis tienen brightness(0.95)
- [ ] Energy slider labels son blancos
- [ ] Energy value es blanco
- [ ] Textarea tiene fondo oscuro y texto blanco
- [ ] Placeholder es visible en lavanda
- [ ] Word count es visible
- [ ] Tag buttons tienen fondo oscuro con texto blanco
- [ ] Save button tiene gradiente rosa
- [ ] Entry previews tienen todo el texto blanco

### Skin Tracking
- [ ] Back button tiene fondo gradiente lavanda
- [ ] Flecha es BLANCA ⬅️
- [ ] Page title es blanco
- [ ] Page description es blanca
- [ ] Method card tiene fondo oscuro
- [ ] Method title es blanco
- [ ] Method description es blanca
- [ ] Method button tiene gradiente rosa
- [ ] Icon tiene brightness(0.95)
- [ ] **Consent Popup**:
  - [ ] Fondo es oscuro sólido (#25253A)
  - [ ] Borde es rosa grueso (3px)
  - [ ] Title es blanco
  - [ ] Content text es blanco
  - [ ] Checkbox container tiene fondo y borde
  - [ ] Label es blanco
  - [ ] "See more" link es rosa
  - [ ] Cancel button tiene fondo oscuro con borde
  - [ ] Accept button tiene gradiente rosa
- [ ] **Scanner Instructions**:
  - [ ] Container tiene fondo oscuro sólido
  - [ ] Borde es rosa visible
  - [ ] Text "Position your face..." es blanco y bold
  - [ ] Instruction items tienen fondo y borde
- [ ] **Skin Metrics**:
  - [ ] Valores son rosa SÓLIDO (#FFB6D9)
  - [ ] Labels son blancos
  - [ ] No hay gradientes transparentes
  - [ ] Text-shadow es visible
- [ ] Recommendation cards tienen gradiente rosa
- [ ] Recommendation titles son blancos
- [ ] Recommendation descriptions son blancas

---

## 🔍 PRUEBAS DETALLADAS

### Prueba de Contraste
1. Abre cada página en modo oscuro
2. Toma una captura de pantalla
3. Usa una herramienta de contraste (ej: WebAIM Contrast Checker)
4. Verifica que el contraste sea al menos 4.5:1 (WCAG AA)

### Prueba de Legibilidad
1. Abre cada página en modo oscuro
2. Lee todo el texto sin esfuerzo
3. Verifica que no haya texto gris claro difícil de leer
4. Verifica que todos los placeholders sean visibles

### Prueba de Interactividad
1. Haz hover sobre todos los botones
2. Verifica que el hover state sea visible
3. Haz focus en todos los inputs (Tab)
4. Verifica que el focus state sea visible (outline rosa)
5. Haz clic en todos los botones
6. Verifica que funcionen correctamente

### Prueba de Iconos
1. Verifica que todos los iconos sean visibles
2. Verifica que no estén demasiado brillantes
3. Verifica que tengan colores naturales
4. Verifica que los emojis sean visibles

### Prueba de Persistencia
1. Activa modo oscuro
2. Navega a otra página
3. Verifica que el modo oscuro persista
4. Recarga la página
5. Verifica que el modo oscuro persista
6. Cierra y abre el navegador
7. Verifica que el modo oscuro persista

### Prueba de Auto-Switch
1. Cambia la hora del sistema a 19:00 (noche)
2. Recarga la página
3. Verifica que el modo oscuro se active automáticamente
4. Cambia la hora del sistema a 10:00 (día)
5. Recarga la página
6. Verifica que el modo claro se active automáticamente

---

## 🌐 PRUEBAS EN NAVEGADORES

### Chrome/Edge
- [ ] Modo oscuro funciona correctamente
- [ ] Transiciones son suaves
- [ ] Scrollbar personalizado es visible
- [ ] Selection highlight es visible

### Firefox
- [ ] Modo oscuro funciona correctamente
- [ ] Transiciones son suaves
- [ ] Scrollbar personalizado es visible
- [ ] Selection highlight es visible

### Safari
- [ ] Modo oscuro funciona correctamente
- [ ] Transiciones son suaves
- [ ] Scrollbar personalizado es visible
- [ ] Selection highlight es visible

---

## 📱 PRUEBAS EN DISPOSITIVOS

### Desktop (1920x1080)
- [ ] Todos los elementos son visibles
- [ ] Layout es correcto
- [ ] Texto es legible

### Tablet (768x1024)
- [ ] Todos los elementos son visibles
- [ ] Layout es responsive
- [ ] Texto es legible

### Mobile (375x667)
- [ ] Todos los elementos son visibles
- [ ] Layout es responsive
- [ ] Texto es legible
- [ ] Botones son fáciles de tocar

---

## ♿ PRUEBAS DE ACCESIBILIDAD

### Keyboard Navigation
1. Usa solo el teclado (Tab, Enter, Escape)
2. Verifica que puedas navegar por toda la página
3. Verifica que el focus sea visible
4. Verifica que puedas activar todos los botones

### Screen Reader
1. Activa un lector de pantalla (NVDA, JAWS, VoiceOver)
2. Navega por la página
3. Verifica que todo el contenido sea leído
4. Verifica que los labels sean descriptivos

### High Contrast Mode
1. Activa el modo de alto contraste del sistema
2. Verifica que el contenido sea visible
3. Verifica que los bordes sean más gruesos

### Reduced Motion
1. Activa "Reduce motion" en el sistema
2. Verifica que las animaciones sean mínimas
3. Verifica que las transiciones sean instantáneas

---

## 🐛 PROBLEMAS COMUNES

### Problema: Texto no es blanco
**Solución**: Verifica que `dark-mode-complete.css` esté cargado después de los otros CSS

### Problema: Flecha del back button es rosa
**Solución**: Verifica que el CSS tenga `.back-arrow { color: #FFFFFF !important; }`

### Problema: Skin metrics no son visibles
**Solución**: Verifica que tengan `color: #FFB6D9` sin gradientes transparentes

### Problema: Consent popup no es visible
**Solución**: Verifica que tenga `background: #25253A` y `border: 3px solid rgba(255, 182, 217, 0.5)`

### Problema: Modo oscuro no persiste
**Solución**: Verifica que localStorage esté habilitado en el navegador

### Problema: Auto-switch no funciona
**Solución**: Verifica que la función `applyTheme()` se llame en `DOMContentLoaded`

---

## ✅ CRITERIOS DE ACEPTACIÓN

El modo oscuro está completo cuando:
- [ ] Todos los textos son blancos y legibles
- [ ] Todos los botones tienen contraste adecuado
- [ ] Todos los inputs son visibles
- [ ] Todos los iconos tienen brightness(0.95)
- [ ] Todas las flechas de back son blancas
- [ ] Todos los labels del cycle wheel son blancos
- [ ] Todos los skin metrics son rosa sólido
- [ ] Consent popup es completamente visible
- [ ] Scanner instructions son completamente visibles
- [ ] Tema persiste en localStorage
- [ ] Auto-switch funciona correctamente
- [ ] No hay elementos invisibles o difíciles de ver

---

## 📊 REPORTE DE PRUEBAS

### Template:
```
Fecha: [fecha]
Navegador: [Chrome/Firefox/Safari/Edge]
Dispositivo: [Desktop/Tablet/Mobile]
Resolución: [1920x1080/etc]

Landing Page: ✅/❌
Questionnaire: ✅/❌
Dashboard: ✅/❌
Cycle Tracking: ✅/❌
Journal & Mood: ✅/❌
Skin Tracking: ✅/❌

Problemas encontrados:
1. [descripción]
2. [descripción]

Notas adicionales:
[notas]
```

---

**Última actualización**: 2026-02-14  
**Versión**: 2.0
