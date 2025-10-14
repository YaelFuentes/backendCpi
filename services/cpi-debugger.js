const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class CPIDebugger {
    constructor() {
        this.config = {
            baseUrl: 'https://e0980-tmn.hci.us2.hana.ondemand.com/itspaces/shell/integration',
            browser: {
                headless: false, // Cambio a false para debug
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            },
            timeout: 30000
        };
        
        this.debugDir = path.join(__dirname, '..', 'debug');
        this.initializeDirectories();
    }

    async initializeDirectories() {
        try {
            await fs.mkdir(this.debugDir, { recursive: true });
            logger.info('Directorio de debug inicializado');
        } catch (error) {
            logger.error('Error inicializando directorio debug:', error);
        }
    }

    async debugLoginPage() {
        let browser = null;
        try {
            logger.info('🔍 Iniciando debug de la página de login CPI...');

            browser = await puppeteer.launch(this.config.browser);
            const page = await browser.newPage();

            // Configurar viewport
            await page.setViewport({ width: 1920, height: 1080 });
            page.setDefaultTimeout(this.config.timeout);

            // Navegar a la página
            logger.info('📍 Navegando a CPI...');
            await page.goto(this.config.baseUrl, { waitUntil: 'networkidle2' });

            // Capturar screenshot inicial
            const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
            const screenshotPath = path.join(this.debugDir, `cpi-login-debug-${timestamp}.png`);
            
            await page.screenshot({
                path: screenshotPath,
                fullPage: true
            });

            logger.info(`📸 Screenshot capturado: ${screenshotPath}`);

            // Analizar elementos de la página
            const pageAnalysis = await page.evaluate(() => {
                const analysis = {
                    title: document.title,
                    url: window.location.href,
                    forms: [],
                    inputs: [],
                    buttons: [],
                    bodyText: document.body.innerText.substring(0, 500)
                };

                // Buscar formularios
                const forms = document.querySelectorAll('form');
                forms.forEach((form, index) => {
                    analysis.forms.push({
                        index,
                        action: form.action,
                        method: form.method,
                        inputs: form.querySelectorAll('input').length
                    });
                });

                // Buscar todos los inputs
                const inputs = document.querySelectorAll('input');
                inputs.forEach((input, index) => {
                    analysis.inputs.push({
                        index,
                        type: input.type,
                        name: input.name,
                        id: input.id,
                        placeholder: input.placeholder,
                        className: input.className,
                        visible: input.offsetHeight > 0 && input.offsetWidth > 0
                    });
                });

                // Buscar botones
                const buttons = document.querySelectorAll('button, input[type="submit"], input[type="button"]');
                buttons.forEach((button, index) => {
                    analysis.buttons.push({
                        index,
                        type: button.type,
                        text: button.textContent || button.value,
                        className: button.className,
                        visible: button.offsetHeight > 0 && button.offsetWidth > 0
                    });
                });

                return analysis;
            });

            // Guardar análisis en archivo JSON
            const analysisPath = path.join(this.debugDir, `cpi-analysis-${timestamp}.json`);
            await fs.writeFile(analysisPath, JSON.stringify(pageAnalysis, null, 2));

            logger.info(`📊 Análisis guardado: ${analysisPath}`);

            // Buscar elementos específicos de SAP/CPI
            const sapElements = await page.evaluate(() => {
                const sapSelectors = [
                    '[id*="sap"]',
                    '[class*="sap"]',
                    '[id*="login"]',
                    '[class*="login"]',
                    '[id*="user"]',
                    '[class*="user"]',
                    '[id*="password"]',
                    '[class*="password"]',
                    '[type="text"]',
                    '[type="password"]',
                    '[type="email"]'
                ];

                const foundElements = [];
                sapSelectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => {
                        foundElements.push({
                            selector,
                            tagName: el.tagName,
                            type: el.type,
                            id: el.id,
                            className: el.className,
                            name: el.name,
                            placeholder: el.placeholder,
                            text: el.textContent?.substring(0, 100)
                        });
                    });
                });

                return foundElements;
            });

            return {
                success: true,
                screenshotPath,
                analysisPath,
                pageAnalysis,
                sapElements,
                message: 'Debug completado exitosamente'
            };

        } catch (error) {
            logger.error('Error durante debug:', error);
            return {
                success: false,
                error: error.message,
                message: 'Error durante el debug'
            };
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }

    async testSpecificSelectors(selectors) {
        let browser = null;
        try {
            browser = await puppeteer.launch(this.config.browser);
            const page = await browser.newPage();
            await page.goto(this.config.baseUrl, { waitUntil: 'networkidle2' });

            const results = {};
            for (const selector of selectors) {
                try {
                    const element = await page.$(selector);
                    results[selector] = element !== null;
                } catch (error) {
                    results[selector] = false;
                }
            }

            return { success: true, results };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}

module.exports = CPIDebugger;