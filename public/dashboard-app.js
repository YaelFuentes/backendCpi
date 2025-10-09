// dashboard-app.js - JavaScript externo para evitar CSP
console.log('🚀 Dashboard JavaScript cargado correctamente');

// Configuración global
let config = {
    baseUrl: '',
    username: '',
    password: ''
};

// Referencias a elementos DOM
let elements = {};

// Función de inicialización
function initDashboard() {
    console.log('Inicializando dashboard...');
    
    // Obtener referencias a elementos
    elements = {
        serverUrl: document.getElementById('server-url'),
        username: document.getElementById('username'),
        password: document.getElementById('password'),
        console: document.getElementById('console'),
        status: document.getElementById('status'),
        saveBtn: document.getElementById('save-btn'),
        testBtn: document.getElementById('test-btn'),
        healthBtn: document.getElementById('health-btn'),
        testOrden: document.getElementById('test-orden'),
        testPing: document.getElementById('test-ping'),
        browserTest: document.getElementById('browser-test'),
        clearBtn: document.getElementById('clear-btn')
    };

    // Verificar que todos los elementos existen
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`❌ Elemento no encontrado: ${key}`);
        }
    }

    // Asignar event listeners
    if (elements.saveBtn) {
        elements.saveBtn.addEventListener('click', saveConfig);
        console.log('✅ Event listener asignado a saveBtn');
    }
    
    if (elements.testBtn) {
        elements.testBtn.addEventListener('click', testConnection);
        console.log('✅ Event listener asignado a testBtn');
    }
    
    if (elements.healthBtn) {
        elements.healthBtn.addEventListener('click', testHealth);
        console.log('✅ Event listener asignado a healthBtn');
    }
    
    if (elements.testOrden) {
        elements.testOrden.addEventListener('click', () => testAPI('evaluar/orden'));
        console.log('✅ Event listener asignado a testOrden');
    }
    
    if (elements.testPing) {
        elements.testPing.addEventListener('click', () => testAPI('pruebas/ping'));
        console.log('✅ Event listener asignado a testPing');
    }
    
    if (elements.browserTest) {
        elements.browserTest.addEventListener('click', openInBrowser);
        console.log('✅ Event listener asignado a browserTest');
    }
    
    if (elements.clearBtn) {
        elements.clearBtn.addEventListener('click', clearConsole);
        console.log('✅ Event listener asignado a clearBtn');
    }

    // Cargar configuración guardada
    loadConfig();
    
    log('Dashboard inicializado correctamente', 'success');
    log('Configura URL y credenciales, luego click "Guardar Config"');
}

// Funciones de logging
function log(message, type = 'info') {
    if (!elements.console) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const colors = {
        info: '#00ff00',
        success: '#00ff00',
        error: '#ff6b6b',
        warn: '#ffeb3b'
    };
    
    const color = colors[type] || colors.info;
    const prefix = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
    
    elements.console.innerHTML += `[${timestamp}] ${prefix} ${message}\n`;
    elements.console.scrollTop = elements.console.scrollHeight;
}

function clearConsole() {
    if (elements.console) {
        elements.console.innerHTML = '';
        log('Console limpiada');
    }
}

// Funciones de configuración
function saveConfig() {
    console.log('saveConfig llamada');
    
    if (!elements.serverUrl || !elements.username || !elements.password) {
        log('Error: Elementos del formulario no encontrados', 'error');
        return;
    }

    config.baseUrl = elements.serverUrl.value.trim().replace(/\/$/, '');
    config.username = elements.username.value.trim();
    config.password = elements.password.value.trim();

    if (!config.baseUrl) {
        log('Error: URL del servidor requerida', 'error');
        return;
    }

    // Guardar en localStorage
    try {
        localStorage.setItem('external_config', JSON.stringify(config));
        log('Configuración guardada en localStorage', 'success');
    } catch (e) {
        log('Error guardando en localStorage: ' + e.message, 'error');
    }
    
    updateStatus('Configuración guardada', 'ok');
    log(`Configuración guardada - URL: ${config.baseUrl}, Usuario: ${config.username}`, 'success');
}

function loadConfig() {
    try {
        const saved = localStorage.getItem('external_config');
        if (saved) {
            config = JSON.parse(saved);
            
            if (elements.serverUrl) elements.serverUrl.value = config.baseUrl || '';
            if (elements.username) elements.username.value = config.username || '';
            if (elements.password) elements.password.value = config.password || '';
            
            log('Configuración cargada desde localStorage', 'success');
        }
    } catch (e) {
        log('Error cargando configuración: ' + e.message, 'error');
    }
}

// Función para actualizar status
function updateStatus(message, type) {
    if (!elements.status) return;
    
    elements.status.textContent = 'Estado: ' + message;
    elements.status.className = 'status status-' + type;
}

// Función para generar headers de auth
function getAuthHeaders() {
    if (!config.username || !config.password) {
        return { 'Content-Type': 'application/json' };
    }
    
    const credentials = btoa(config.username + ':' + config.password);
    return {
        'Authorization': 'Basic ' + credentials,
        'Content-Type': 'application/json'
    };
}

// Función principal de test
async function testConnection() {
    console.log('testConnection llamada');
    
    if (!config.baseUrl) {
        log('Error: Guarda primero la configuración', 'error');
        return;
    }

    log(`Probando conexión a: ${config.baseUrl}/api/health`);
    updateStatus('Probando conexión...', 'error');

    try {
        const response = await fetch(config.baseUrl + '/api/health', {
            method: 'GET',
            headers: getAuthHeaders(),
            mode: 'cors'
        });

        log(`Respuesta recibida: ${response.status} ${response.statusText}`);

        if (response.ok) {
            const data = await response.json();
            log(`Conexión exitosa - Status: ${data.status}, Uptime: ${Math.floor(data.uptime)}s`, 'success');
            updateStatus('Conectado correctamente', 'ok');
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        log(`Error de conexión: ${error.message}`, 'error');
        updateStatus('Error de conexión', 'error');
        
        // Diagnóstico adicional
        if (error.message.includes('CORS')) {
            log('Posible problema de CORS', 'warn');
        } else if (error.message.includes('Failed to fetch')) {
            log('El servidor puede estar inactivo o hay problemas de red', 'warn');
        }
    }
}

// Test específico de health
async function testHealth() {
    console.log('testHealth llamada');
    
    if (!config.baseUrl) {
        log('Error: Guarda primero la configuración', 'error');
        return;
    }

    log('Testing health endpoint...');

    try {
        const response = await fetch(config.baseUrl + '/api/health', {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const text = await response.text();
        log(`Respuesta raw: ${text.substring(0, 100)}...`);

        if (response.ok) {
            const data = JSON.parse(text);
            log(`Health OK: ${JSON.stringify(data)}`, 'success');
        } else {
            log(`Health Error: ${response.status}`, 'error');
        }
    } catch (error) {
        log(`Error en health test: ${error.message}`, 'error');
    }
}

// Test de API específica
async function testAPI(endpoint, data = null) {
    console.log(`testAPI llamada: ${endpoint}`);
    
    if (!config.baseUrl) {
        log('Error: Guarda primero la configuración', 'error');
        return;
    }

    const testData = data || {
        test: true,
        timestamp: new Date().toISOString(),
        source: 'external-dashboard'
    };

    log(`Testing API: /api/${endpoint}`);

    try {
        const response = await fetch(config.baseUrl + '/api/' + endpoint, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(testData)
        });

        if (response.ok) {
            const responseData = await response.json();
            log(`API ${endpoint} OK - RequestID: ${responseData.requestId}`, 'success');
        } else {
            log(`API ${endpoint} Error: ${response.status}`, 'error');
        }
    } catch (error) {
        log(`Error en API ${endpoint}: ${error.message}`, 'error');
    }
}

// Abrir en browser
function openInBrowser() {
    console.log('openInBrowser llamada');
    
    if (!config.baseUrl) {
        log('Error: Guarda primero la configuración', 'error');
        return;
    }

    const url = config.baseUrl + '/api/health';
    log(`Abriendo en nueva pestaña: ${url}`);
    log(`Usar credenciales: ${config.username} / ${config.password}`);
    window.open(url, '_blank');
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, iniciando dashboard...');
    initDashboard();
});

// También intentar inicializar cuando la página esté completamente cargada
window.addEventListener('load', function() {
    console.log('Página completamente cargada');
    if (config.baseUrl) {
        log('Configuración detectada, ejecutando test automático en 2 segundos...');
        setTimeout(() => {
            console.log('Ejecutando test automático...');
            testConnection();
        }, 2000);
    }
});

// Exponer funciones globalmente para debugging
window.dashboardApp = {
    config,
    elements,
    saveConfig,
    testConnection,
    testHealth,
    testAPI,
    openInBrowser,
    clearConsole,
    log
};