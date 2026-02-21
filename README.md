# 🌸 Glow Cycle

**Tu compañera personalizada para rastrear tu ciclo, entender tu piel y conectar con el ritmo natural de tu cuerpo.**

---

## ¿Qué es Glow Cycle?

Una aplicación web que ayuda a las mujeres a:
- 📅 **Rastrear su ciclo menstrual** con predicciones inteligentes
- 💆‍♀️ **Monitorear su piel** y recibir recomendaciones personalizadas
- 📝 **Llevar un diario** de emociones y energía
- 🤖 **Obtener insights con IA** sobre cómo las hormonas afectan su cuerpo

---

## 🚀 Inicio Rápido

### 1. Clonar el proyecto
```bash
git clone https://github.com/puddl3duck/glowcycle.git
cd glowcycle
```

### 2. Abrir el frontend
```bash
cd frontend
# Abrir index.html en tu navegador
# O usar un servidor local:
python -m http.server 8000
# Visitar http://localhost:8000
```

### 3. Configurar backend (opcional)
```bash
cd infrastructure
npm install
npm run build
cdk deploy
```

---

## 🛠 Tecnologías

**Frontend:** HTML5, CSS3, JavaScript (Vanilla)  
**Backend:** Python, AWS Lambda, DynamoDB  
**IA:** AWS Bedrock (Claude Haiku)  
**Infraestructura:** AWS CDK, TypeScript

---

## 📁 Estructura del Proyecto

```
glowcycle/
├── frontend/          # Aplicación web (HTML/CSS/JS)
├── backend/           # Funciones Lambda (Python)
├── infrastructure/    # AWS CDK (TypeScript)
└── tests/            # Tests
```

---

## ✨ Características Principales

### 🌙 Rastreo de Ciclo
- Calendario visual con fases del ciclo
- Predicciones de próximo período y ovulación
- Tips personalizados por fase

### 💆‍♀️ Rastreo de Piel
- Registro manual de condición de piel
- Correlación con fases del ciclo
- Recomendaciones de skincare

### 📝 Diario & Estado de Ánimo
- Registro diario de emociones
- Monitoreo de niveles de energía
- Identificación de patrones

### 🤖 Asistente de Bienestar con IA
- Frases motivacionales personalizadas
- Análisis de patrones hormonales
- Consejos basados en tu ciclo actual

### 🌓 Modo Oscuro
- Cambio automático según hora del día
- Modo manual con persistencia
- Diseño accesible (WCAG AA/AAA)

---

## 🎯 Para Jurados

**Tiempo de evaluación: 60 segundos**

1. **Problema:** Las mujeres no entienden cómo su ciclo hormonal afecta su piel y emociones
2. **Solución:** App que conecta ciclo menstrual + piel + estado de ánimo con IA
3. **Innovación:** Primera app que usa IA para dar insights personalizados sobre hormonas y piel
4. **Impacto:** Ayuda a millones de mujeres a entender mejor su cuerpo

**Demo en vivo:** [glowcycle.app](https://glowcycle.app)

---

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE)

---

## 👥 Equipo

Proyecto desarrollado por el equipo Glow Cycle

---

**Hecho con 💜 para mujeres que quieren entender su cuerpo**
