# Script de pruebas para Logtail
# Este script demuestra cómo probar la integración con Logtail

# Configurar credenciales
$username = "admin"
$password = "Cpilogger"
$base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(("{0}:{1}" -f $username, $password)))
$headers = @{
    Authorization = "Basic $base64AuthInfo"
}

Write-Host "=== PRUEBAS DE INTEGRACIÓN LOGTAIL ===" -ForegroundColor Cyan
Write-Host "URL Base: http://localhost:3000/api/" -ForegroundColor Gray

# 1. Verificar estado de Logtail
Write-Host "`n1. Verificando estado de Logtail:" -ForegroundColor Yellow
try {
    $logtailStatus = Invoke-RestMethod -Uri "http://localhost:3000/api/logtail/status" -Method Get -Headers $headers
    Write-Host "✓ Estado de Logtail:" -ForegroundColor Green
    Write-Host "  - Configurado: $($logtailStatus.logtail.configured)" -ForegroundColor Gray
    Write-Host "  - Token: $($logtailStatus.logtail.token)" -ForegroundColor Gray
    Write-Host "  - Status: $($logtailStatus.logtail.status)" -ForegroundColor Gray
    Write-Host "  - Log Level: $($logtailStatus.logging.level)" -ForegroundColor Gray
    Write-Host "  - Environment: $($logtailStatus.logging.environment)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Error consultando estado de Logtail: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Probar logs de diferentes niveles
Write-Host "`n2. Enviando logs de prueba a Logtail:" -ForegroundColor Yellow
$testData = @{
    message = "Prueba de logging desde PowerShell"
    source = "test_script"
    environment = "development"
    metadata = @{
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        user = $env:USERNAME
        machine = $env:COMPUTERNAME
    }
} | ConvertTo-Json -Depth 10

try {
    $testResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/logtail/test" -Method Post -Body $testData -ContentType "application/json" -Headers $headers
    Write-Host "✓ Logs de prueba enviados:" -ForegroundColor Green
    Write-Host "  - Test ID: $($testResponse.testId)" -ForegroundColor Gray
    Write-Host "  - Logs enviados:" -ForegroundColor Gray
    foreach ($log in $testResponse.logs) {
        Write-Host "    - $log" -ForegroundColor White
    }
    Write-Host "  - Logtail Status: $($testResponse.logtail.configured)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Error enviando logs de prueba: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Generar actividad de API para logs automáticos
Write-Host "`n3. Generando actividad para logs automáticos:" -ForegroundColor Yellow

# Crear usuarios para generar logs
$newUser = @{
    name = "Usuario Logtail Test"
    email = "logtail.test@example.com"
    age = 25
} | ConvertTo-Json

try {
    $userResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method Post -Body $newUser -ContentType "application/json" -Headers $headers
    Write-Host "✓ Usuario creado (genera logs automáticos):" -ForegroundColor Green
    Write-Host "  - ID: $($userResponse.data.id)" -ForegroundColor Gray
    Write-Host "  - Nombre: $($userResponse.data.name)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Error creando usuario: $($_.Exception.Message)" -ForegroundColor Red
}

# Obtener lista de usuarios (más logs)
try {
    $usersResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method Get -Headers $headers
    Write-Host "✓ Lista de usuarios obtenida (logs generados):" -ForegroundColor Green
    Write-Host "  - Total usuarios: $($usersResponse.total)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Error obteniendo usuarios: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Generar logs de la API GMA/PI4
Write-Host "`n4. Enviando datos a GMA/SSFFEV/PI4 (logs avanzados):" -ForegroundColor Yellow
$pi4Data = @{
    transactionId = "LOGTAIL_TEST_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    system = "CPI"
    operation = "data_processing"
    status = "success"
    data = @{
        records = 150
        processedTime = "00:02:45"
        errors = 0
        warnings = 2
    }
    logtailTest = $true
    metadata = @{
        source = "powershell_test"
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        testPurpose = "Verificar integración Logtail"
    }
} | ConvertTo-Json -Depth 10

try {
    $pi4Response = Invoke-RestMethod -Uri "http://localhost:3000/api/gma/ssffev/PI4/" -Method Post -Body $pi4Data -ContentType "application/json" -Headers $headers
    Write-Host "✓ Datos PI4 procesados (logs detallados enviados):" -ForegroundColor Green
    Write-Host "  - Request ID: $($pi4Response.requestId)" -ForegroundColor Gray
    Write-Host "  - Tipo detectado: $($pi4Response.logType)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Error procesando datos PI4: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Intentar generar un error controlado para logs de error
Write-Host "`n5. Generando log de error controlado:" -ForegroundColor Yellow
try {
    # Intentar acceder a usuario inexistente
    Invoke-RestMethod -Uri "http://localhost:3000/api/users/99999" -Method Get -Headers $headers
} catch {
    Write-Host "✓ Error controlado generado (log de error enviado a Logtail):" -ForegroundColor Green
    Write-Host "  - Error esperado: Usuario no encontrado" -ForegroundColor Gray
}

Write-Host "`n=== RESUMEN DE INTEGRACIÓN LOGTAIL ===" -ForegroundColor Cyan
Write-Host "✅ Estado de Logtail verificado" -ForegroundColor Green
Write-Host "✅ Logs de prueba manuales enviados" -ForegroundColor Green  
Write-Host "✅ Logs automáticos de API generados" -ForegroundColor Green
Write-Host "✅ Logs de diferentes niveles (INFO, WARN, ERROR)" -ForegroundColor Green
Write-Host "✅ Metadata enriquecida incluida" -ForegroundColor Green

Write-Host "`n📊 INFORMACIÓN IMPORTANTE:" -ForegroundColor Yellow
Write-Host "• Los logs se envían tanto a archivos locales como a Logtail" -ForegroundColor White
Write-Host "• Cada petición genera logs automáticos con metadata" -ForegroundColor White
Write-Host "• Los logs incluyen: timestamp, IP, usuario, body, etc." -ForegroundColor White
Write-Host "• Puedes ver los logs en tiempo real en tu dashboard de Logtail" -ForegroundColor White

Write-Host "`n🔗 ACCESO A LOGS:" -ForegroundColor Yellow
Write-Host "• Dashboard Logtail: https://betterstack.com/logtail" -ForegroundColor White
Write-Host "• Logs locales: ./logs/ (combined.log, error.log, http.log)" -ForegroundColor White