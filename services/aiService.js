require('dotenv').config();
const axios = require('axios');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'groq';
    this.model = process.env.AI_MODEL || 'llama3-8b-8192';
    this.maxTokens = parseInt(process.env.AI_MAX_TOKENS) || 500;
    this.temperature = parseFloat(process.env.AI_TEMPERATURE) || 0.3;
    
    this.groqApiKey = process.env.GROQ_API_KEY;
    this.huggingfaceToken = process.env.HUGGINGFACE_API_TOKEN;
    this.ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    
    logger.info(`🤖 Servicio de IA inicializado - Provider: ${this.provider}, Model: ${this.model}`);
  }

  /**
   * Traduce logs de CPI a mensajes legibles usando IA
   * @param {Object} logData - Datos del log de CPI
   * @param {string} logType - Tipo de log (error, warning, info, etc.)
   * @returns {Object} - Mensaje traducido y metadata
   */
  async translateCPILog(logData, logType = 'info') {
    try {
      const prompt = this.buildPrompt(logData, logType);
      
      let translation;
      switch (this.provider) {
        case 'groq':
          translation = await this.translateWithGroq(prompt);
          break;
        case 'ollama':
          translation = await this.translateWithOllama(prompt);
          break;
        case 'huggingface':
          translation = await this.translateWithHuggingFace(prompt);
          break;
        default:
          throw new Error(`Proveedor de IA no soportado: ${this.provider}`);
      }

      return {
        success: true,
        originalData: logData,
        translation: translation.message,
        metadata: {
          provider: this.provider,
          model: this.model,
          logType,
          tokensUsed: translation.tokensUsed || 0,
          processingTime: translation.processingTime,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      logger.error(`Error en traducción de IA: ${error.message}`);
      
      // Fallback: generar mensaje básico sin IA
      return {
        success: false,
        originalData: logData,
        translation: this.generateFallbackMessage(logData, logType),
        error: error.message,
        metadata: {
          provider: 'fallback',
          model: 'none',
          logType,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Construye el prompt para la IA basado en el tipo de log CPI
   */
  buildPrompt(logData, logType) {
    const systemPrompt = `Eres un experto en sistemas CPI (Customer Process Integration) y análisis de logs. 
Tu tarea es traducir logs técnicos de CPI a mensajes claros y comprensibles para usuarios de negocio.

Contexto de CPI:
- CPI es una plataforma de integración para procesos de negocio
- Maneja transacciones, transformaciones de datos, y comunicación entre sistemas
- Los logs pueden contener códigos de error, IDs de transacción, y datos de procesamiento

Instrucciones:
1. Analiza el log y extrae la información más importante
2. Traduce términos técnicos a lenguaje de negocio
3. Identifica el impacto en el proceso de negocio
4. Sugiere acciones si es necesario
5. Mantén un tono profesional pero accesible
6. Responde en español
7. Máximo 2-3 oraciones

Formato de respuesta:
- Mensaje principal (qué pasó)
- Impacto (cómo afecta al negocio)
- Acción sugerida (si aplica)`;

    const userPrompt = `Tipo de log: ${logType.toUpperCase()}

Datos del log CPI:
${JSON.stringify(logData, null, 2)}

Por favor, traduce este log técnico a un mensaje comprensible para usuarios de negocio.`;

    return { systemPrompt, userPrompt };
  }

  /**
   * Traducción usando Groq (API gratuita, muy rápida)
   */
  async translateWithGroq(prompt) {
    if (!this.groqApiKey || this.groqApiKey === 'your_groq_api_key_here') {
      throw new Error('API key de Groq no configurada. Obtén una gratis en https://console.groq.com/');
    }

    const startTime = Date.now();
    
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: this.model,
      messages: [
        { role: 'system', content: prompt.systemPrompt },
        { role: 'user', content: prompt.userPrompt }
      ],
      max_tokens: this.maxTokens,
      temperature: this.temperature
    }, {
      headers: {
        'Authorization': `Bearer ${this.groqApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const processingTime = Date.now() - startTime;
    
    return {
      message: response.data.choices[0].message.content.trim(),
      tokensUsed: response.data.usage?.total_tokens || 0,
      processingTime
    };
  }

  /**
   * Traducción usando Ollama (IA local, completamente gratuita)
   */
  async translateWithOllama(prompt) {
    const startTime = Date.now();
    
    try {
      const response = await axios.post(`${this.ollamaBaseUrl}/api/generate`, {
        model: this.model,
        prompt: `${prompt.systemPrompt}\n\n${prompt.userPrompt}`,
        stream: false,
        options: {
          temperature: this.temperature,
          num_predict: this.maxTokens
        }
      });

      const processingTime = Date.now() - startTime;
      
      return {
        message: response.data.response.trim(),
        tokensUsed: 0, // Ollama no reporta tokens
        processingTime
      };
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Ollama no está ejecutándose. Instala y ejecuta Ollama desde https://ollama.ai/');
      }
      throw error;
    }
  }

  /**
   * Traducción usando Hugging Face (API gratuita)
   */
  async translateWithHuggingFace(prompt) {
    if (!this.huggingfaceToken || this.huggingfaceToken === 'your_huggingface_token_here') {
      throw new Error('Token de Hugging Face no configurado. Obtén uno gratis en https://huggingface.co/settings/tokens');
    }

    const startTime = Date.now();
    
    // Usar modelo gratuito de Hugging Face
    const modelUrl = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';
    
    const response = await axios.post(modelUrl, {
      inputs: `${prompt.systemPrompt}\n\n${prompt.userPrompt}`,
      parameters: {
        max_new_tokens: this.maxTokens,
        temperature: this.temperature,
        return_full_text: false
      }
    }, {
      headers: {
        'Authorization': `Bearer ${this.huggingfaceToken}`,
        'Content-Type': 'application/json'
      }
    });

    const processingTime = Date.now() - startTime;
    
    return {
      message: response.data[0]?.generated_text?.trim() || 'No se pudo generar respuesta',
      tokensUsed: 0, // HF no reporta tokens en API gratuita
      processingTime
    };
  }

  /**
   * Genera mensaje de fallback cuando la IA no está disponible
   */
  generateFallbackMessage(logData, logType) {
    const typeMessages = {
      error: '❌ Se detectó un error en el procesamiento CPI',
      warning: '⚠️ Advertencia en el proceso CPI',
      info: 'ℹ️ Información de proceso CPI',
      success: '✅ Proceso CPI completado exitosamente'
    };

    const baseMessage = typeMessages[logType] || typeMessages.info;
    
    // Intentar extraer información básica
    let details = '';
    if (logData.transactionId) {
      details += ` (ID: ${logData.transactionId})`;
    }
    if (logData.customerInfo?.name) {
      details += ` para ${logData.customerInfo.name}`;
    }
    if (logData.orderId) {
      details += ` - Orden: ${logData.orderId}`;
    }

    return `${baseMessage}${details}. Consulte los logs técnicos para más detalles.`;
  }

  /**
   * Verifica la disponibilidad del proveedor de IA configurado
   */
  async checkAvailability() {
    try {
      const testData = { test: 'connection' };
      const result = await this.translateCPILog(testData, 'info');
      return {
        available: result.success,
        provider: this.provider,
        model: this.model,
        message: result.success ? 'IA disponible' : 'IA no disponible'
      };
    } catch (error) {
      return {
        available: false,
        provider: this.provider,
        model: this.model,
        message: error.message
      };
    }
  }
}

module.exports = new AIService();