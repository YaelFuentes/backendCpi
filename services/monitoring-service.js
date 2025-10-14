const puppeteer = require('puppeteer');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const cron = require('node-cron');
const logger = require('../utils/logger');

class MonitoringService {
    constructor() {
        this.config = {
            baseUrl: 'https://e0980-tmn.hci.us2.hana.ondemand.com/itspaces/shell/integration',
            credentials: {
                username: process.env.CPI_USERNAME || '',
                password: process.env.CPI_PASSWORD || ''
            },
            schedule: '0 9 * * 1,3,5', // Lunes, Miércoles, Viernes a las 9:00 AM
            timeout: 30000,
            screenshotOptions: {
                fullPage: true,
                type: 'png'
            },
            browser: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        };
        
        this.reportsDir = path.join(__dirname, '..', 'reports');
        this.screenshotsDir = path.join(this.reportsDir, 'screenshots');
        this.isRunning = false;
        this.lastRun = null;
        this.cronJob = null;
        
        this.initializeDirectories();
        this.setupSchedule();
    }

    async initializeDirectories() {
        try {
            await fs.mkdir(this.reportsDir, { recursive: true });
            await fs.mkdir(this.screenshotsDir, { recursive: true });
            logger.info('Directorios de reportes inicializados');
        } catch (error) {
            logger.error('Error inicializando directorios:', error);
        }
    }

    setupSchedule() {
        if (this.cronJob) {
            this.cronJob.destroy();
        }

        // Programar para lunes, miércoles y viernes a las 9:00 AM
        this.cronJob = cron.schedule(this.config.schedule, async () => {
            logger.info('Ejecutando monitoreo programado');
            try {
                await this.runMonitoring();
            } catch (error) {
                logger.error('Error en monitoreo programado:', error);
            }
        }, {
            scheduled: true,
            timezone: "America/Mexico_City"
        });

        logger.info('Monitoreo programado configurado para lunes, miércoles y viernes a las 9:00 AM');
    }

    async runMonitoring() {
        if (this.isRunning) {
            throw new Error('El monitoreo ya está en ejecución');
        }

        this.isRunning = true;
        const startTime = new Date();
        let browser = null;

        try {
            logger.info('Iniciando proceso de monitoreo CPI');

            // Verificar credenciales
            if (!this.config.credentials.username || !this.config.credentials.password) {
                throw new Error('Credenciales de CPI no configuradas');
            }

            // Inicializar navegador
            browser = await puppeteer.launch(this.config.browser);
            const page = await browser.newPage();

            // Configurar viewport y timeouts
            await page.setViewport({ width: 1920, height: 1080 });
            page.setDefaultTimeout(this.config.timeout);

            // Navegar a la página de login
            logger.info('Navegando a CPI...');
            await page.goto(this.config.baseUrl, { waitUntil: 'networkidle2' });

            // Realizar login
            await this.performLogin(page);

            // Esperar a que la página cargue completamente
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Capturar screenshot principal
            const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
            const screenshotPath = path.join(this.screenshotsDir, `cpi-monitoring-${timestamp}.png`);
            
            await page.screenshot({
                path: screenshotPath,
                ...this.config.screenshotOptions
            });

            logger.info(`Screenshot capturado: ${screenshotPath}`);

            // Analizar el estado de las integraciones
            const integrationStatus = await this.analyzeIntegrations(page);

            // Generar reporte
            const report = await this.generateReport({
                timestamp: startTime,
                screenshot: screenshotPath,
                integrationStatus,
                duration: Date.now() - startTime.getTime()
            });

            this.lastRun = {
                timestamp: startTime,
                success: true,
                report: report.id
            };

            logger.info('Monitoreo completado exitosamente');
            return report;

        } catch (error) {
            logger.error('Error durante el monitoreo:', error);
            
            this.lastRun = {
                timestamp: startTime,
                success: false,
                error: error.message
            };

            throw error;
        } finally {
            if (browser) {
                await browser.close();
            }
            this.isRunning = false;
        }
    }

    async performLogin(page) {
        try {
            logger.info('Intentando iniciar sesión en CPI (SAP Cloud Platform)...');

            // PASO 1: Ingresar usuario
            logger.info('PASO 1: Ingresando usuario...');
            
            // Buscar campo de usuario (sabemos que es j_username)
            const usernameSelector = '#j_username';
            
            try {
                await page.waitForSelector(usernameSelector, { timeout: 10000 });
                logger.info('Campo de usuario encontrado');
            } catch (error) {
                throw new Error('No se encontró el campo de usuario j_username');
            }

            // Limpiar y escribir usuario
            await page.click(usernameSelector);
            await page.keyboard.down('Control');
            await page.keyboard.press('KeyA');
            await page.keyboard.up('Control');
            await page.type(usernameSelector, this.config.credentials.username);

            // Hacer click en "Continuar"
            const continueButton = 'button[type="submit"]';
            await page.click(continueButton);

            // Esperar a que aparezca la página de contraseña
            logger.info('PASO 2: Esperando página de contraseña...');
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });

            // PASO 2: Ingresar contraseña
            logger.info('PASO 2: Ingresando contraseña...');
            
            // Buscar campo de contraseña (puede tener diferentes IDs)
            const passwordSelectors = [
                '#j_password',
                'input[type="password"]',
                '[name="j_password"]',
                '[name="password"]'
            ];

            let passwordField = null;
            for (const selector of passwordSelectors) {
                try {
                    await page.waitForSelector(selector, { timeout: 3000 });
                    passwordField = selector;
                    logger.info(`Campo de contraseña encontrado: ${selector}`);
                    break;
                } catch (e) {
                    continue;
                }
            }

            if (!passwordField) {
                throw new Error('No se encontró el campo de contraseña después del primer paso');
            }

            // Escribir contraseña
            await page.type(passwordField, this.config.credentials.password);

            // Buscar botón de submit para la contraseña
            const submitSelectors = [
                'button[type="submit"]',
                'input[type="submit"]',
                '#logOnFormSubmit',
                '.sapMBtnDefault'
            ];

            let submitted = false;
            for (const selector of submitSelectors) {
                try {
                    await page.click(selector);
                    submitted = true;
                    logger.info(`Botón de submit clickeado: ${selector}`);
                    break;
                } catch (e) {
                    continue;
                }
            }

            if (!submitted) {
                // Intentar enviar con Enter como último recurso
                await page.keyboard.press('Enter');
                logger.info('Enviado con Enter como último recurso');
            }

            // Esperar navegación final
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });
            
            // Verificar que llegamos a CPI (no a una página de error)
            const currentUrl = page.url();
            logger.info(`URL después del login: ${currentUrl}`);
            
            if (currentUrl.includes('error') || currentUrl.includes('login') || currentUrl.includes('saml')) {
                throw new Error('El login no fue exitoso - aún en página de autenticación');
            }
            
            logger.info('Login de 2 pasos completado exitosamente');

        } catch (error) {
            logger.error('Error durante el login de 2 pasos:', error);
            throw new Error(`Fallo en el login de 2 pasos: ${error.message}`);
        }
    }

    async analyzeIntegrations(page) {
        try {
            logger.info('Analizando estado de integraciones...');

            // Esperar a que el contenido cargue
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Buscar indicadores de estado (esto puede necesitar ajustes según la UI real)
            const integrations = await page.evaluate(() => {
                const results = [];
                
                // Buscar elementos que podrían indicar integraciones
                const integrationElements = document.querySelectorAll([
                    '.integration-item',
                    '.flow-item',
                    '.integration-flow',
                    '[data-testid*="integration"]',
                    '.sap-m-List .sap-m-ListItem',
                    '.sapMListItems .sapMSLI'
                ].join(', '));

                integrationElements.forEach((element, index) => {
                    const name = element.textContent?.trim() || `Integration ${index + 1}`;
                    
                    // Buscar indicadores de estado
                    const hasError = element.querySelector('.error, .failed, .red, [style*="red"]');
                    const hasWarning = element.querySelector('.warning, .yellow, [style*="yellow"]');
                    const hasSuccess = element.querySelector('.success, .green, [style*="green"]');
                    
                    let status = 'unknown';
                    if (hasError) status = 'error';
                    else if (hasWarning) status = 'warning';
                    else if (hasSuccess) status = 'success';

                    results.push({
                        name: name.substring(0, 100), // Limitar longitud
                        status,
                        element: element.tagName
                    });
                });

                return results;
            });

            // Contar estados
            const statusCounts = integrations.reduce((acc, integration) => {
                acc[integration.status] = (acc[integration.status] || 0) + 1;
                return acc;
            }, {});

            const analysis = {
                total: integrations.length,
                statusCounts,
                integrations: integrations.slice(0, 20), // Limitar a primeras 20
                hasErrors: statusCounts.error > 0,
                hasWarnings: statusCounts.warning > 0,
                overallStatus: statusCounts.error > 0 ? 'error' : 
                              statusCounts.warning > 0 ? 'warning' : 'success'
            };

            logger.info(`Análisis completado: ${analysis.total} integraciones encontradas`);
            return analysis;

        } catch (error) {
            logger.error('Error analizando integraciones:', error);
            return {
                total: 0,
                statusCounts: {},
                integrations: [],
                hasErrors: false,
                hasWarnings: false,
                overallStatus: 'unknown',
                error: error.message
            };
        }
    }

    async generateReport(data) {
        const reportId = `report-${Date.now()}`;
        const reportPath = path.join(this.reportsDir, `${reportId}.json`);

        const report = {
            id: reportId,
            timestamp: data.timestamp,
            duration: data.duration,
            screenshot: data.screenshot,
            integrationStatus: data.integrationStatus,
            summary: {
                totalIntegrations: data.integrationStatus.total,
                errors: data.integrationStatus.statusCounts.error || 0,
                warnings: data.integrationStatus.statusCounts.warning || 0,
                success: data.integrationStatus.statusCounts.success || 0,
                overallStatus: data.integrationStatus.overallStatus
            },
            metadata: {
                cpiUrl: this.config.baseUrl,
                monitoringVersion: '1.0.0',
                environment: process.env.NODE_ENV || 'production'
            }
        };

        try {
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            logger.info(`Reporte generado: ${reportPath}`);
        } catch (error) {
            logger.error('Error guardando reporte:', error);
        }

        return report;
    }

    async getStatus() {
        return {
            isRunning: this.isRunning,
            lastRun: this.lastRun,
            nextRun: this.cronJob ? "Lunes, Miércoles, Viernes a las 9:00 AM" : null,
            isScheduled: this.cronJob ? true : false,
            config: {
                schedule: this.config.schedule,
                hasCredentials: !!(this.config.credentials.username && this.config.credentials.password),
                baseUrl: this.config.baseUrl
            }
        };
    }

    async getReports() {
        try {
            const files = await fs.readdir(this.reportsDir);
            const reportFiles = files.filter(file => file.endsWith('.json') && file.startsWith('report-'));
            
            const reports = [];
            for (const file of reportFiles) {
                try {
                    const content = await fs.readFile(path.join(this.reportsDir, file), 'utf8');
                    const report = JSON.parse(content);
                    reports.push({
                        id: report.id,
                        timestamp: report.timestamp,
                        summary: report.summary,
                        duration: report.duration
                    });
                } catch (error) {
                    logger.error(`Error leyendo reporte ${file}:`, error);
                }
            }

            return reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } catch (error) {
            logger.error('Error obteniendo reportes:', error);
            return [];
        }
    }

    async getReport(reportId) {
        try {
            const reportPath = path.join(this.reportsDir, `${reportId}.json`);
            const content = await fs.readFile(reportPath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            logger.error(`Error obteniendo reporte ${reportId}:`, error);
            return null;
        }
    }

    async deleteReport(reportId) {
        try {
            const reportPath = path.join(this.reportsDir, `${reportId}.json`);
            await fs.unlink(reportPath);
            logger.info(`Reporte eliminado: ${reportId}`);
        } catch (error) {
            logger.error(`Error eliminando reporte ${reportId}:`, error);
            throw error;
        }
    }

    async updateConfig(newConfig) {
        if (newConfig.credentials) {
            this.config.credentials = { ...this.config.credentials, ...newConfig.credentials };
        }
        
        if (newConfig.schedule && newConfig.schedule !== this.config.schedule) {
            this.config.schedule = newConfig.schedule;
            this.setupSchedule();
        }

        if (newConfig.baseUrl) {
            this.config.baseUrl = newConfig.baseUrl;
        }

        logger.info('Configuración de monitoreo actualizada');
    }

    getConfig() {
        return { ...this.config };
    }

    async testConnection() {
        let browser = null;
        try {
            logger.info('Probando conexión a CPI...');
            
            browser = await puppeteer.launch(this.config.browser);
            const page = await browser.newPage();
            
            await page.goto(this.config.baseUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
            
            const title = await page.title();
            
            return {
                success: true,
                message: 'Conexión exitosa',
                pageTitle: title,
                url: this.config.baseUrl
            };
        } catch (error) {
            return {
                success: false,
                message: 'Error de conexión',
                error: error.message,
                url: this.config.baseUrl
            };
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }

    stop() {
        if (this.cronJob) {
            this.cronJob.destroy();
            this.cronJob = null;
            logger.info('Monitoreo programado detenido');
        }
    }

    start() {
        if (!this.cronJob) {
            this.setupSchedule();
            logger.info('Monitoreo programado iniciado');
        }
    }
}

module.exports = MonitoringService;