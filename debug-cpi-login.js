// Script independiente para debuggear la página de login CPI
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function debugCPILogin() {
    const baseUrl = 'https://e0980-tmn.hci.us2.hana.ondemand.com/itspaces/shell/integration';
    let browser = null;

    try {
        console.log('🔍 Iniciando debug de página CPI...');
        console.log('📍 URL:', baseUrl);

        // Configuración del navegador
        browser = await puppeteer.launch({
            headless: false, // Para poder ver qué pasa
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            slowMo: 100 // Ralentizar para debug
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        console.log('📍 Navegando a CPI...');
        await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });

        console.log('⏳ Esperando 5 segundos para que la página cargue completamente...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Capturar información básica
        const pageInfo = await page.evaluate(() => {
            return {
                title: document.title,
                url: window.location.href,
                bodyText: document.body.innerText.substring(0, 300)
            };
        });

        console.log('📊 Información de la página:');
        console.log('   Título:', pageInfo.title);
        console.log('   URL:', pageInfo.url);
        console.log('   Texto inicial:', pageInfo.bodyText);

        // Buscar todos los inputs
        const inputs = await page.evaluate(() => {
            const allInputs = document.querySelectorAll('input');
            const inputInfo = [];

            allInputs.forEach((input, index) => {
                const isVisible = input.offsetHeight > 0 && input.offsetWidth > 0;
                inputInfo.push({
                    index,
                    type: input.type,
                    name: input.name || '',
                    id: input.id || '',
                    placeholder: input.placeholder || '',
                    className: input.className || '',
                    visible: isVisible,
                    value: input.value || ''
                });
            });

            return inputInfo;
        });

        console.log('🔍 Inputs encontrados:');
        inputs.forEach(input => {
            console.log(`   [${input.index}] Tipo: ${input.type}, ID: "${input.id}", Name: "${input.name}", Placeholder: "${input.placeholder}", Visible: ${input.visible}`);
        });

        // Buscar botones
        const buttons = await page.evaluate(() => {
            const allButtons = document.querySelectorAll('button, input[type="submit"], input[type="button"]');
            const buttonInfo = [];

            allButtons.forEach((button, index) => {
                const isVisible = button.offsetHeight > 0 && button.offsetWidth > 0;
                buttonInfo.push({
                    index,
                    type: button.type || 'button',
                    text: button.textContent || button.value || '',
                    className: button.className || '',
                    visible: isVisible
                });
            });

            return buttonInfo;
        });

        console.log('🔘 Botones encontrados:');
        buttons.forEach(button => {
            console.log(`   [${button.index}] Tipo: ${button.type}, Texto: "${button.text}", Visible: ${button.visible}`);
        });

        // Capturar screenshot
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const screenshotPath = path.join(__dirname, 'debug', `cpi-debug-${timestamp}.png`);
        
        await page.screenshot({
            path: screenshotPath,
            fullPage: true
        });

        console.log('📸 Screenshot guardado en:', screenshotPath);

        // Buscar elementos SAP específicos
        const sapElements = await page.evaluate(() => {
            const sapSelectors = [
                '[id*="username"]',
                '[id*="user"]',
                '[id*="login"]',
                '[id*="password"]',
                '[name*="username"]',
                '[name*="user"]',
                '[name*="login"]',
                '[name*="password"]',
                '.sapMInputBase',
                '.sap-m-Input',
                '.sapMInput'
            ];

            const found = [];
            sapSelectors.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => {
                        found.push({
                            selector,
                            tag: el.tagName,
                            type: el.type || '',
                            id: el.id || '',
                            name: el.name || '',
                            visible: el.offsetHeight > 0 && el.offsetWidth > 0
                        });
                    });
                } catch (e) {
                    // Ignorar errores de selector
                }
            });

            return found;
        });

        console.log('🏢 Elementos SAP encontrados:');
        sapElements.forEach(el => {
            console.log(`   Selector: ${el.selector}, Tag: ${el.tag}, ID: "${el.id}", Name: "${el.name}", Visible: ${el.visible}`);
        });

        // Analizar si hay frames o iframes
        const frames = await page.evaluate(() => {
            const iframes = document.querySelectorAll('iframe, frame');
            return Array.from(iframes).map((frame, index) => ({
                index,
                src: frame.src || '',
                id: frame.id || '',
                name: frame.name || ''
            }));
        });

        if (frames.length > 0) {
            console.log('🖼️  Frames encontrados:');
            frames.forEach(frame => {
                console.log(`   [${frame.index}] ID: "${frame.id}", Name: "${frame.name}", Src: "${frame.src}"`);
            });
        }

        console.log('✅ Debug completado exitosamente');
        console.log('💡 Revisa el screenshot generado para más detalles visuales');

        return {
            success: true,
            inputs,
            buttons,
            sapElements,
            frames,
            screenshotPath
        };

    } catch (error) {
        console.error('❌ Error durante debug:', error.message);
        return {
            success: false,
            error: error.message
        };
    } finally {
        if (browser) {
            console.log('🔒 Cerrando navegador...');
            await browser.close();
        }
    }
}

// Ejecutar debug
debugCPILogin().then(result => {
    if (result.success) {
        console.log('\n🎉 Debug completado con éxito');
    } else {
        console.log('\n❌ Debug falló:', result.error);
    }
    process.exit(0);
}).catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
});