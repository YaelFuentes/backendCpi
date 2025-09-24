// Configuración de autenticación básica
// En un entorno de producción, estas credenciales deberían estar en variables de entorno

const AUTH_CONFIG = {
  users: {
    'admin': 'Cpilogger',
    'user': 'Yael156503383',
    'api-client': 'client456'
  },
  challenge: true, // Muestra el diálogo de autenticación en el navegador
  realm: 'Backend CPI API' // Nombre que aparece en el diálogo de autenticación
};

module.exports = AUTH_CONFIG;