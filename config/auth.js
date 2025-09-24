// Configuración de autenticación básica usando variables de entorno
require('dotenv').config();

// Función para validar que las variables de entorno estén configuradas
function validateAuthEnvVars() {
  const requiredVars = [
    'AUTH_ADMIN_USER', 'AUTH_ADMIN_PASS',
    'AUTH_USER_USER', 'AUTH_USER_PASS',
    'AUTH_CLIENT_USER', 'AUTH_CLIENT_PASS'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Error: Faltan las siguientes variables de entorno de autenticación:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('📝 Copia el archivo .env.example a .env y configura las credenciales.');
    process.exit(1);
  }
}

// Validar variables de entorno al cargar el módulo
validateAuthEnvVars();

const AUTH_CONFIG = {
  users: {
    [process.env.AUTH_ADMIN_USER]: process.env.AUTH_ADMIN_PASS,
    [process.env.AUTH_USER_USER]: process.env.AUTH_USER_PASS,
    [process.env.AUTH_CLIENT_USER]: process.env.AUTH_CLIENT_PASS
  },
  challenge: process.env.AUTH_CHALLENGE === 'true' || true,
  realm: process.env.AUTH_REALM || 'Backend CPI API'
};

// Log de configuración (sin mostrar contraseñas)
console.log('🔐 Configuración de autenticación cargada:');
console.log(`   - Usuarios configurados: ${Object.keys(AUTH_CONFIG.users).join(', ')}`);
console.log(`   - Realm: ${AUTH_CONFIG.realm}`);
console.log(`   - Challenge: ${AUTH_CONFIG.challenge}`);

module.exports = AUTH_CONFIG;