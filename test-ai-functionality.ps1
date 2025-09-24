# Script de pruebas para funcionalidades de IA
# Este script demuestra cómo usar las nuevas funcionalidades de traducción de logs CPI con IA

# Configurar credenciales
$username = "admin"
$password = "Cpilogger"
$base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(("{0}:{1}" -f $username, $password)))
$headers = @{
    Authorization = "Basic $base64AuthInfo"
}

Write-Host "=== PRUEBAS DE FUNCIONALIDAD IA PARA LOGS CPI ===" -ForegroundColor Cyan
Write-Host "URL Base: http://localhost:3000/api/" -ForegroundColor Gray

# 1. Verificar estado del servicio de IA
Write-Host "`n1. Verificando estado del servicio de IA:" -ForegroundColor Yellow
try {
    $aiStatus = Invoke-RestMethod -Uri "http://localhost:3000/api/ai/status" -Method Get -Headers $headers
    Write-Host "✓ Estado de IA:" -ForegroundColor Green
    Write-Host "  - Disponible: $($aiStatus.ai.available)" -ForegroundColor Gray
    Write-Host "  - Proveedor: $($aiStatus.ai.provider)" -ForegroundColor Gray
    Write-Host "  - Modelo: $($aiStatus.ai.model)" -ForegroundColor Gray
    Write-Host "  - Status: $($aiStatus.ai.status)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Error consultando estado de IA: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Enviar log de error CPI para traducción
Write-Host "`n2. Enviando log de ERROR CPI con traducción IA:" -ForegroundColor Yellow
$errorLog = @{
    errorCode = "CPI_ERR_001"
    message = "Connection timeout to SAP system during invoice processing"
    transactionId = "TXN_ERROR_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    customerInfo = @{
        customerId = "CUST_ERROR_001" 
        name = "Empresa ABC S.L."
        orderId = "ORD_999_ERROR"
    }
    systemInfo = @{
        source = "CPI_ADAPTER_SAP"
        component = "InvoiceProcessor"
        environment = "PROD"
    }
    status = "error"
    retryAttempts = 3
    lastRetryTime = (Get-Date).AddMinutes(-5).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
} | ConvertTo-Json -Depth 10

try {
    $errorResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/gma/ssffev/PI4/" -Method Post -Body $errorLog -ContentType "application/json" -Headers $headers
    Write-Host "✓ Log de error procesado:" -ForegroundColor Green
    Write-Host "  - Request ID: $($errorResponse.requestId)" -ForegroundColor Gray
    Write-Host "  - Tipo detectado: $($errorResponse.logType)" -ForegroundColor Gray
    Write-Host "  - IA disponible: $($errorResponse.aiTranslation.available)" -ForegroundColor Gray
    Write-Host "  - Proveedor: $($errorResponse.aiTranslation.provider)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📝 TRADUCCIÓN IA:" -ForegroundColor Cyan
    Write-Host "$($errorResponse.humanReadable)" -ForegroundColor White
} catch {
    Write-Host "✗ Error procesando log de error: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Enviar log de éxito CPI para traducción
Write-Host "`n3. Enviando log de ÉXITO CPI con traducción IA:" -ForegroundColor Yellow
$successLog = @{
    transactionId = "TXN_SUCCESS_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    status = "success"
    message = "Invoice successfully processed and sent to SAP"
    customerInfo = @{
        customerId = "CUST_SUCCESS_001"
        name = "Distribuidora XYZ"
        email = "contabilidad@xyz.com"
    }
    orderDetails = @{
        orderId = "ORD_SUCCESS_12345"
        totalAmount = 2845.67
        currency = "EUR"
        items = @(
            @{ productId = "PROD_001"; quantity = 10; unitPrice = 125.50 },
            @{ productId = "PROD_002"; quantity = 5; unitPrice = 340.75 }
        )
    }
    processingInfo = @{
        startTime = (Get-Date).AddMinutes(-2).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        endTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        processingDuration = "00:02:15"
        systemsInvolved = @("CPI", "SAP_ERP", "Payment_Gateway", "Email_Service")
    }
    success = $true
} | ConvertTo-Json -Depth 10

try {
    $successResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/gma/ssffev/PI4/" -Method Post -Body $successLog -ContentType "application/json" -Headers $headers
    Write-Host "✓ Log de éxito procesado:" -ForegroundColor Green
    Write-Host "  - Request ID: $($successResponse.requestId)" -ForegroundColor Gray
    Write-Host "  - Tipo detectado: $($successResponse.logType)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📝 TRADUCCIÓN IA:" -ForegroundColor Cyan
    Write-Host "$($successResponse.humanReadable)" -ForegroundColor White
} catch {
    Write-Host "✗ Error procesando log de éxito: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Enviar log de warning CPI para traducción
Write-Host "`n4. Enviando log de WARNING CPI con traducción IA:" -ForegroundColor Yellow
$warningLog = @{
    warning = "High memory usage detected in CPI runtime"
    level = "warn"
    transactionId = "TXN_WARNING_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    systemMetrics = @{
        memoryUsage = "85%"
        cpuUsage = "67%"
        activeConnections = 245
        pendingMessages = 12
    }
    thresholds = @{
        memoryWarning = "80%"
        memoryCritical = "90%"
        maxConnections = 300
    }
    affectedComponents = @("MessageProcessor", "DataTransformer", "ConnectorPool")
    recommendedActions = @(
        "Monitor memory usage closely",
        "Consider scaling up if usage persists",
        "Review message processing queue"
    )
    timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
} | ConvertTo-Json -Depth 10

try {
    $warningResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/gma/ssffev/PI4/" -Method Post -Body $warningLog -ContentType "application/json" -Headers $headers
    Write-Host "✓ Log de warning procesado:" -ForegroundColor Green
    Write-Host "  - Request ID: $($warningResponse.requestId)" -ForegroundColor Gray
    Write-Host "  - Tipo detectado: $($warningResponse.logType)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📝 TRADUCCIÓN IA:" -ForegroundColor Cyan
    Write-Host "$($warningResponse.humanReadable)" -ForegroundColor White
} catch {
    Write-Host "✗ Error procesando log de warning: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Probar traducción manual de IA
Write-Host "`n5. Probando traducción manual de IA:" -ForegroundColor Yellow
$manualTranslation = @{
    logData = @{
        customLog = "CPI integration flow 'Customer_Master_Sync' execution failed"
        errorDetails = "HTTP 500 error when calling external API endpoint /customers/sync"
        affectedRecords = 150
        businessImpact = "Customer data synchronization halted"
        systemComponent = "DataSyncService"
    }
    logType = "error"
} | ConvertTo-Json -Depth 10

try {
    $manualResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/ai/translate" -Method Post -Body $manualTranslation -ContentType "application/json" -Headers $headers
    Write-Host "✓ Traducción manual completada:" -ForegroundColor Green
    Write-Host "  - Éxito: $($manualResponse.translation.success)" -ForegroundColor Gray
    Write-Host "  - Proveedor: $($manualResponse.translation.provider)" -ForegroundColor Gray
    Write-Host "  - Tiempo de procesamiento: $($manualResponse.translation.processingTime)ms" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📝 TRADUCCIÓN IA:" -ForegroundColor Cyan
    Write-Host "$($manualResponse.translation.humanReadable)" -ForegroundColor White
} catch {
    Write-Host "✗ Error en traducción manual: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Consultar todas las traducciones recientes
Write-Host "`n6. Consultando traducciones recientes:" -ForegroundColor Yellow
try {
    $recentTranslations = Invoke-RestMethod -Uri "http://localhost:3000/api/ai/translations" -Method Get -Headers $headers
    Write-Host "✓ Traducciones recientes ($($recentTranslations.total)):" -ForegroundColor Green
    
    foreach ($translation in $recentTranslations.translations) {
        Write-Host "  📄 ID: $($translation.id)" -ForegroundColor Gray
        Write-Host "     Tipo: $($translation.logType) | Proveedor: $($translation.provider) | Tiempo: $($translation.processingTime)ms" -ForegroundColor Gray
        Write-Host "     Traducción: $($translation.translation)" -ForegroundColor White
        Write-Host ""
    }
} catch {
    Write-Host "✗ Error consultando traducciones: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "=== RESUMEN DE FUNCIONALIDADES ===" -ForegroundColor Cyan
Write-Host "✅ Traducción automática de logs CPI con IA" -ForegroundColor Green
Write-Host "✅ Detección automática del tipo de log" -ForegroundColor Green  
Write-Host "✅ Múltiples proveedores de IA soportados" -ForegroundColor Green
Write-Host "✅ Fallback cuando IA no está disponible" -ForegroundColor Green
Write-Host "✅ API para traducción manual" -ForegroundColor Green
Write-Host "✅ Historial de traducciones" -ForegroundColor Green

Write-Host "`n🤖 CONFIGURACIÓN RECOMENDADA:" -ForegroundColor Yellow
Write-Host "1. Para empezar gratis: Configura Groq API (https://console.groq.com/)" -ForegroundColor White
Write-Host "2. Para uso local: Instala Ollama (https://ollama.ai/)" -ForegroundColor White
Write-Host "3. Alternativa: Usa Hugging Face (https://huggingface.co/)" -ForegroundColor White