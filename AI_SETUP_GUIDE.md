# 🤖 Guía de Configuración de IA para Backend CPI

Este archivo te ayuda a configurar rápidamente la integración con IA para traducir logs de CPI.

## 🚀 Configuración Rápida (5 minutos)

### Opción 1: Groq (Recomendado - Gratis y Rápido)

1. **Obtener API Key gratuita:**
   - Ve a: https://console.groq.com/
   - Regístrate con tu email
   - Ve a "API Keys" y crea una nueva key
   - Copia la key

2. **Configurar en .env:**
   ```bash
   AI_PROVIDER=groq
   GROQ_API_KEY=tu_api_key_aqui
   AI_MODEL=llama3-8b-8192
   ```

3. **¡Listo!** La IA funcionará inmediatamente.

### Opción 2: Ollama (Local - 100% Gratis)

1. **Instalar Ollama:**
   - Descarga: https://ollama.ai/
   - Instala en Windows
   - Abre terminal y ejecuta: `ollama pull llama3`

2. **Configurar en .env:**
   ```bash
   AI_PROVIDER=ollama
   OLLAMA_BASE_URL=http://localhost:11434
   AI_MODEL=llama3
   ```

3. **Asegúrate que Ollama esté ejecutándose:**
   ```bash
   ollama serve
   ```

### Opción 3: Hugging Face (Alternativa)

1. **Obtener token:**
   - Ve a: https://huggingface.co/settings/tokens
   - Crea un token de lectura
   - Copia el token

2. **Configurar en .env:**
   ```bash
   AI_PROVIDER=huggingface
   HUGGINGFACE_API_TOKEN=tu_token_aqui
   ```

## 🧪 Probar la Configuración

```bash
# Verificar estado de IA
npm run test:ai

# O verificar manualmente
curl -u admin:Cpilogger http://localhost:3000/api/ai/status
```

## 📊 Tipos de Logs que Traduce

### Ejemplo de Log de Error CPI:
```json
{
  "errorCode": "CPI_ERR_001",
  "message": "Connection timeout to SAP system",
  "transactionId": "TXN_12345",
  "customerInfo": { "name": "Empresa ABC" }
}
```

### Traducción IA:
> "❌ Error en conexión con SAP durante procesamiento de Empresa ABC (TXN_12345). 
> Impacto: Transacción no completada. Acción: Sistema reintentará automáticamente."

## ⚙️ Configuración Avanzada

### Variables de Entorno Disponibles:
```bash
# Proveedor de IA
AI_PROVIDER=groq                    # groq | ollama | huggingface

# Configuración de modelo
AI_MODEL=llama3-8b-8192            # Modelo específico
AI_MAX_TOKENS=500                  # Máximo tokens por respuesta
AI_TEMPERATURE=0.3                 # Creatividad (0.0 = preciso, 1.0 = creativo)

# URLs específicas
OLLAMA_BASE_URL=http://localhost:11434
GROQ_API_KEY=gsk_...
HUGGINGFACE_API_TOKEN=hf_...
```

### Modelos Recomendados:

**Groq:**
- `llama3-8b-8192` (Rápido, buena calidad)
- `llama3-70b-8192` (Más lento, mejor calidad)
- `mixtral-8x7b-32768` (Bueno para textos largos)

**Ollama:**
- `llama3` (8B - Rápido)
- `llama3:70b` (70B - Mejor calidad, más lento)
- `codellama` (Especializado en código)

## 🔧 Solución de Problemas

### Error: "API key no configurada"
```bash
# Verifica que tu .env tenga:
GROQ_API_KEY=tu_api_key_real_aqui
```

### Error: "Ollama no está ejecutándose"
```bash
# En terminal separada:
ollama serve

# Luego prueba:
ollama run llama3
```

### Error: "Proveedor no soportado"
```bash
# Verifica que AI_PROVIDER sea uno de:
AI_PROVIDER=groq      # o ollama o huggingface
```

## 📈 Monitoreo y Logs

### Ver estado de IA:
```bash
GET /api/ai/status
```

### Ver traducciones recientes:
```bash
GET /api/ai/translations
```

### Logs del servidor:
- Cada traducción se registra en los logs
- Incluye tiempo de procesamiento y tokens usados
- Fallback automático si IA no está disponible

## 🎯 Casos de Uso

1. **Monitoreo de CPI**: Logs traducidos para equipos de negocio
2. **Alertas comprensibles**: Errores explicados en lenguaje simple
3. **Reportes automáticos**: Resúmenes de procesos CPI
4. **Dashboards ejecutivos**: Métricas de negocio desde logs técnicos

## 🔄 Flujo de Procesamiento

```
Log CPI → Backend → Detección Automática del Tipo → IA → Traducción → Respuesta
     ↓
Almacenamiento + Logging + Historial de Traducciones
```

## 💡 Tips de Optimización

1. **Groq** es el más rápido para uso en tiempo real
2. **Ollama** es mejor para alta privacidad/datos sensibles
3. **Temperature baja (0.1-0.3)** para traducciones más precisas
4. **Tokens moderados (300-500)** para respuestas concisas
5. **Fallback siempre habilitado** para garantizar respuesta

¡Ya tienes todo configurado para traducir logs CPI con IA! 🎉