# 📚 Comandos de Git - Guía Rápida

## 🔄 Flujo Normal de Trabajo

### 1. Ver qué archivos cambiaron
```bash
git status
```
o más corto:
```bash
git status --short
```

### 2. Agregar archivos al staging
```bash
# Agregar todos los archivos modificados
git add .

# O agregar archivos específicos
git add frontend/js/journal-mood.js
git add backend/journal/handler.py
```

### 3. Hacer commit (guardar cambios localmente)
```bash
git commit -m "descripción de los cambios"
```

Ejemplos de mensajes:
```bash
git commit -m "feat: add multiple journal entries per day"
git commit -m "fix: restore production API URL"
git commit -m "docs: update README"
```

### 4. Subir cambios a GitHub (push)
```bash
git push origin main
```

---

## 📥 Traer cambios de GitHub (pull)

### Cuando tu equipo sube cambios y tú quieres descargarlos:
```bash
git pull origin main
```

---

## 🎯 Orden Correcto Completo

```bash
# 1. Ver qué cambió
git status

# 2. Agregar cambios
git add .

# 3. Hacer commit
git commit -m "feat: descripción del cambio"

# 4. Subir a GitHub
git push origin main
```

---

## ⚠️ IMPORTANTE: Orden de Actualización

### ❌ INCORRECTO (causa problemas):
```bash
git push origin main          # Primero push
git commit -m "mensaje"       # Luego commit - ¡MAL!
```

### ✅ CORRECTO:
```bash
git add .                     # 1. Agregar
git commit -m "mensaje"       # 2. Commit
git push origin main          # 3. Push
```

---

## 🔍 Comandos Útiles

### Ver historial de commits
```bash
git log --oneline -10
```

### Ver diferencias antes de commit
```bash
git diff
```

### Ver diferencias de un archivo específico
```bash
git diff frontend/js/journal-mood.js
```

### Deshacer cambios en un archivo (antes de commit)
```bash
git checkout -- archivo.js
```

### Ver archivos ignorados por .gitignore
```bash
git status --ignored
```

---

## 🚀 Comandos para Deploy del Lambda

### Después de cambiar código del backend:
```bash
# 1. Ir a la carpeta
cd backend/journal

# 2. Ejecutar deploy
.\deploy-now.local.bat

# 3. Esperar 10 segundos

# 4. Probar en el navegador
```

---

## 📝 Convenciones de Mensajes de Commit

```bash
feat:     # Nueva funcionalidad
fix:      # Corrección de bug
docs:     # Cambios en documentación
style:    # Formato, espacios (no afecta código)
refactor: # Refactorización de código
test:     # Agregar tests
chore:    # Tareas de mantenimiento
```

### Ejemplos:
```bash
git commit -m "feat: add timestamp to journal entries"
git commit -m "fix: resolve CORS error in API Gateway"
git commit -m "docs: update setup instructions"
git commit -m "style: format code with prettier"
git commit -m "refactor: simplify journal save logic"
```

---

## 🆘 Solución de Problemas

### Si olvidaste hacer pull antes de push:
```bash
git pull origin main
# Resolver conflictos si hay
git push origin main
```

### Si hiciste commit pero quieres cambiar el mensaje:
```bash
git commit --amend -m "nuevo mensaje"
git push origin main --force  # ⚠️ Usar con cuidado
```

### Si quieres deshacer el último commit (pero mantener cambios):
```bash
git reset --soft HEAD~1
```

### Si quieres deshacer TODO (⚠️ PELIGROSO):
```bash
git reset --hard HEAD~1
```

---

## 📋 Checklist Antes de Push

- [ ] `git status` - Ver qué cambió
- [ ] `git add .` - Agregar cambios
- [ ] `git commit -m "mensaje"` - Hacer commit
- [ ] `git push origin main` - Subir a GitHub
- [ ] Si es backend: Deploy del Lambda
- [ ] Probar en el navegador
- [ ] Avisar al equipo que hagan `git pull`

---

## 🎓 Resumen Ultra Rápido

```bash
# Subir cambios
git add . && git commit -m "mensaje" && git push origin main

# Bajar cambios
git pull origin main

# Ver estado
git status
```

---

**💡 Tip:** Guarda este archivo en tus notas para consultarlo siempre que lo necesites.
