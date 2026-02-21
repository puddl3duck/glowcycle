# 🎯 Plan de Acción Completo - Glow Cycle

## Estado Actual
- ✅ Código local correcto (DecimalEncoder implementado)
- ✅ README simplificado
- ✅ Documentación limpiada
- ❌ AWS Lambda desactualizado (causa error 500)

---

## 📋 PASO 1: Preparar el Merge del Equipo

### 1.1 Verificar estado actual
```bash
# Ver en qué branch estás
git branch

# Ver cambios pendientes
git status
```

### 1.2 Hacer commit de cambios actuales
```bash
# Agregar todos los cambios
git add .

# Hacer commit
git commit -m "fix: add DecimalEncoder to fix JSON serialization + simplify README"
```

### 1.3 Actualizar tu branch con main
```bash
# Cambiar a main
git checkout main

# Actualizar main
git pull origin main

# Volver a tu branch
git checkout tu-branch-actual
```

### 1.4 Merge de branches del equipo
```bash
# Opción A: Merge directo (si eres la líder)
git checkout main
git merge branch-compañera-1
git merge branch-compañera-2
git merge branch-compañera-3

# Opción B: Pull Requests (recomendado)
# 1. Ir a GitHub
# 2. Crear Pull Request de cada branch
# 3. Revisar cambios
# 4. Hacer merge desde GitHub
```

### 1.5 Resolver conflictos (si hay)
```bash
# Si hay conflictos, Git te lo dirá
# Abrir archivos con conflictos
# Buscar marcadores: <<<<<<< HEAD
# Resolver manualmente
# Después:
git add .
git commit -m "merge: resolve conflicts"
```

---

## 📋 PASO 2: Redeploy del Backend (3 Opciones)

### OPCIÓN A: AWS CDK (Recomendado si ya está configurado)

```bash
# 1. Ir a carpeta infrastructure
cd infrastructure

# 2. Instalar dependencias (si no lo has hecho)
npm install

# 3. Build TypeScript
npm run build

# 4. Verificar que todo esté bien
cdk synth

# 5. Deploy a AWS
cdk deploy

# 6. Copiar la URL del API Gateway que aparece
# Ejemplo: https://abc123.execute-api.us-east-1.amazonaws.com/prod
```

**Si CDK falla con error de credenciales:**
```bash
# Configurar AWS CLI
aws configure
# Ingresar:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Region (ej: us-east-1)
# - Output format: json
```

---

### OPCIÓN B: AWS Console (Más fácil, manual)

**Paso 1: Actualizar Lambda de Period**
1. Ir a: https://console.aws.amazon.com/lambda
2. Buscar función: `GlowCycle-PeriodHandler` o similar
3. Click en la función
4. Pestaña "Code"
5. Abrir archivo `handler.py`
6. Copiar TODO el contenido de `backend/period/handler.py` local
7. Pegar en el editor de AWS
8. Click "Deploy"
9. Esperar mensaje "Successfully deployed"

**Paso 2: Actualizar Lambda Utils**
1. En la misma función Lambda
2. Buscar carpeta `utils`
3. Abrir `lambda_utils.py`
4. Copiar TODO el contenido de `backend/utils/lambda_utils.py` local
5. Pegar en el editor
6. Click "Deploy"

**Paso 3: Actualizar Lambda de Journal**
1. Buscar función: `GlowCycle-JournalHandler` o similar
2. Repetir proceso con `backend/journal/handler.py`
3. Click "Deploy"

**Paso 4: Verificar**
1. Ir a pestaña "Test"
2. Crear evento de prueba:
```json
{
  "httpMethod": "GET",
  "queryStringParameters": {
    "user": "testuser"
  }
}
```
3. Click "Test"
4. Verificar que NO haya error "Decimal is not JSON serializable"

---

### OPCIÓN C: AWS CLI (Rápido, desde terminal)

```bash
# 1. Crear carpeta temporal
mkdir lambda-deploy
cd lambda-deploy

# 2. Copiar archivos del backend
cp -r ../backend/* .

# 3. Instalar dependencias
pip install -r requirements.txt -t .

# 4. Crear ZIP
# Windows PowerShell:
Compress-Archive -Path * -DestinationPath function.zip -Force

# Mac/Linux:
zip -r function.zip .

# 5. Actualizar Lambda de Period
aws lambda update-function-code \
  --function-name GlowCycle-PeriodHandler \
  --zip-file fileb://function.zip

# 6. Actualizar Lambda de Journal
aws lambda update-function-code \
  --function-name GlowCycle-JournalHandler \
  --zip-file fileb://function.zip

# 7. Limpiar
cd ..
rm -rf lambda-deploy
```

---

## 📋 PASO 3: Actualizar Frontend con nueva API URL

### 3.1 Obtener URL del API Gateway
Después del deploy, copiar la URL que aparece. Ejemplo:
```
https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
```

### 3.2 Actualizar config.js
Abrir `frontend/js/config.js` y actualizar:
```javascript
const API_CONFIG = {
    BASE_URL: 'https://TU-URL-AQUI.execute-api.us-east-1.amazonaws.com/prod',
    ENDPOINTS: {
        JOURNAL: '/journal',
        PERIOD: '/period',
        SKIN: '/skin',
        WELLNESS: '/wellness'
    }
};
```

### 3.3 Commit y push
```bash
git add frontend/js/config.js
git commit -m "chore: update API Gateway URL"
git push origin main
```

---

## 📋 PASO 4: Verificar que Todo Funcione

### 4.1 Abrir la aplicación
```bash
cd frontend
python -m http.server 8000
# Abrir: http://localhost:8000
```

### 4.2 Probar Cycle Tracking
1. Ir a Cycle Tracking
2. Abrir DevTools (F12)
3. Ver Console
4. Buscar:
   - ✅ "Loading user data: {userName: 'sophia', ...}"
   - ✅ "Periods loaded from backend: {periods: [...], count: X}"
   - ❌ NO debe aparecer "Decimal is not JSON serializable"

### 4.3 Probar Journal
1. Ir a Journal & Mood
2. Crear una entrada
3. Verificar que se guarde sin errores

### 4.4 Probar Wellness
1. Ir al Dashboard
2. Verificar que aparezca la frase motivacional
3. No debe haber errores en consola

---

## 📋 PASO 5: Deploy del Frontend (Opcional)

### Si quieres publicar en internet:

**Opción A: GitHub Pages**
```bash
# 1. Crear branch gh-pages
git checkout -b gh-pages

# 2. Copiar frontend a raíz
cp -r frontend/* .

# 3. Commit y push
git add .
git commit -m "deploy: GitHub Pages"
git push origin gh-pages

# 4. Ir a GitHub > Settings > Pages
# 5. Seleccionar branch: gh-pages
# 6. Tu app estará en: https://tu-usuario.github.io/glowcycle
```

**Opción B: Netlify (Más fácil)**
1. Ir a: https://app.netlify.com
2. Drag & drop la carpeta `frontend`
3. Listo! Te da una URL automáticamente

---

## 🎯 Checklist Final

Antes de la presentación, verificar:

- [ ] Merge de todas las branches completado
- [ ] Backend desplegado (sin error 500)
- [ ] Frontend actualizado con API URL correcta
- [ ] Cycle tracking funciona (carga períodos)
- [ ] Journal funciona (guarda entradas)
- [ ] Wellness funciona (muestra frases IA)
- [ ] README simplificado (60 segundos)
- [ ] Demo funcional para jurados

---

## 🆘 Troubleshooting

### Error: "AWS credentials not found"
```bash
aws configure
# Ingresar credenciales de AWS
```

### Error: "CDK not found"
```bash
npm install -g aws-cdk
```

### Error: "Permission denied"
```bash
# Verificar IAM roles en AWS Console
# Tu usuario necesita permisos de Lambda y API Gateway
```

### Error persiste después de deploy
```bash
# Limpiar caché del navegador
# Ctrl + Shift + R (Windows)
# Cmd + Shift + R (Mac)

# O abrir en ventana incógnita
```

---

## 📞 Ayuda Rápida

Si algo falla, estos comandos te ayudan a diagnosticar:

```bash
# Ver logs de Lambda
aws logs tail /aws/lambda/GlowCycle-PeriodHandler --follow

# Ver estado de CDK
cdk diff

# Verificar que Lambda se actualizó
aws lambda get-function --function-name GlowCycle-PeriodHandler

# Test rápido del endpoint
curl "https://TU-API-URL/prod/period?user=testuser"
```

---

## ✅ Resultado Esperado

Después de seguir este plan:
1. ✅ Código del equipo integrado
2. ✅ Backend funcionando sin errores
3. ✅ Frontend conectado correctamente
4. ✅ App lista para demo
5. ✅ README claro para jurados

**Tiempo estimado:** 30-60 minutos

---

**¡Éxito con tu presentación! 💜**
