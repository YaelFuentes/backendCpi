# Script de Configuración del Sistema de Monitoreo CPI
# Autor: Sistema Backend CPI
# Fecha: Octubre 2024

param(
    [Parameter(Mandatory=$false)]
    [string]$Action = "menu",
    
    [Parameter(Mandatory=$false)]
    [string]$Username,
    
    [Parameter(Mandatory=$false)]
    [string]$Password,
    
    [Parameter(Mandatory=$false)]
    [string]$ServerUrl = "http://localhost:3000"
)

# Configuración de colores
$Host.UI.RawUI.BackgroundColor = "Black"
$Host.UI.RawUI.ForegroundColor = "White"
Clear-Host

function Write-ColorText {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Color
}

function Show-Header {
    Write-ColorText "╔══════════════════════════════════════════════════════════════╗" "Cyan"
    Write-ColorText "║            🚀 SISTEMA DE MONITOREO CPI - CONFIGURADOR        ║" "Cyan" 
    Write-ColorText "╚══════════════════════════════════════════════════════════════╝" "Cyan"
    Write-ColorText ""
}

function Show-Menu {
    Write-ColorText "📋 OPCIONES DISPONIBLES:" "Yellow"
    Write-ColorText ""
    Write-ColorText "1. 🔧 Configurar credenciales CPI" "Green"
    Write-ColorText "2. 🔍 Probar conexión a CPI" "Green"
    Write-ColorText "3. ▶️  Ejecutar monitoreo manual" "Green"
    Write-ColorText "4. 📊 Ver estado del sistema" "Green"
    Write-ColorText "5. 📝 Ver reportes generados" "Green"
    Write-ColorText "6. 🏗️  Verificar instalación" "Green"
    Write-ColorText "7. 🧹 Limpiar reportes antiguos" "Green"
    Write-ColorText "8. ❌ Salir" "Red"
    Write-ColorText ""
}

function Test-ServerConnection {
    Write-ColorText "🌐 Probando conexión al servidor..." "Yellow"
    
    try {
        $response = Invoke-RestMethod -Uri "$ServerUrl/auth-info" -Method GET -ErrorAction Stop
        Write-ColorText "✅ Servidor disponible en: $ServerUrl" "Green"
        return $true
    }
    catch {
        Write-ColorText "❌ Error conectando al servidor: $($_.Exception.Message)" "Red"
        Write-ColorText "💡 Asegúrate de que el servidor esté corriendo: npm start" "Yellow"
        return $false
    }
}

function Get-AuthHeaders {
    param(
        [string]$User,
        [string]$Pass
    )
    
    $credentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${User}:${Pass}"))
    return @{ Authorization = "Basic $credentials" }
}

function Set-CPICredentials {
    Write-ColorText "🔐 CONFIGURACIÓN DE CREDENCIALES CPI" "Cyan"
    Write-ColorText ""
    
    if (-not $Username) {
        $Username = Read-Host "Ingresa tu usuario de CPI"
    }
    
    if (-not $Password) {
        $securePassword = Read-Host "Ingresa tu contraseña de CPI" -AsSecureString
        $Password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))
    }
    
    Write-ColorText "📤 Enviando credenciales al servidor..." "Yellow"
    
    try {
        $headers = Get-AuthHeaders -User "admin" -Pass "Cpilogger"
        $body = @{
            credentials = @{
                username = $Username
                password = $Password
            }
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$ServerUrl/api/monitoring/config" -Method POST -Headers $headers -Body $body -ContentType "application/json"
        
        Write-ColorText "✅ Credenciales configuradas exitosamente" "Green"
        Write-ColorText "📋 Usuario configurado: $Username" "White"
    }
    catch {
        Write-ColorText "❌ Error configurando credenciales: $($_.Exception.Message)" "Red"
        
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-ColorText "🔑 Error de autenticación. Verifica las credenciales del dashboard (admin:Cpilogger)" "Yellow"
        }
    }
}

function Test-CPIConnection {
    Write-ColorText "🔍 PROBANDO CONEXIÓN A CPI" "Cyan"
    Write-ColorText ""
    
    try {
        $headers = Get-AuthHeaders -User "admin" -Pass "Cpilogger"
        
        Write-ColorText "🌐 Conectando al portal CPI..." "Yellow"
        
        $response = Invoke-RestMethod -Uri "$ServerUrl/api/monitoring/test-connection" -Method POST -Headers $headers -TimeoutSec 30
        
        if ($response.result.success) {
            Write-ColorText "✅ Conexión exitosa al portal CPI" "Green"
            Write-ColorText "📋 Título de página: $($response.result.pageTitle)" "White"
            Write-ColorText "🌍 URL: $($response.result.url)" "White"
        }
        else {
            Write-ColorText "❌ Error de conexión: $($response.result.error)" "Red"
            Write-ColorText "💡 Verifica las credenciales de CPI" "Yellow"
        }
    }
    catch {
        Write-ColorText "❌ Error probando conexión: $($_.Exception.Message)" "Red"
    }
}

function Start-ManualMonitoring {
    Write-ColorText "▶️  EJECUTANDO MONITOREO MANUAL" "Cyan"
    Write-ColorText ""
    
    try {
        $headers = Get-AuthHeaders -User "admin" -Pass "Cpilogger"
        
        Write-ColorText "🚀 Iniciando proceso de monitoreo..." "Yellow"
        Write-ColorText "⏳ Esto puede tomar varios minutos..." "Yellow"
        
        $response = Invoke-RestMethod -Uri "$ServerUrl/api/monitoring/run" -Method POST -Headers $headers -TimeoutSec 120
        
        if ($response.success) {
            Write-ColorText "✅ Monitoreo completado exitosamente" "Green"
            Write-ColorText "📊 ID del reporte: $($response.result.id)" "White"
            Write-ColorText "🕒 Duración: $([math]::Round($response.result.duration / 1000, 2)) segundos" "White"
            
            if ($response.result.integrationStatus) {
                $status = $response.result.integrationStatus
                Write-ColorText "📈 Integraciones analizadas: $($status.total)" "White"
                Write-ColorText "✅ Exitosas: $($status.statusCounts.success)" "Green"
                Write-ColorText "⚠️  Advertencias: $($status.statusCounts.warning)" "Yellow"
                Write-ColorText "❌ Errores: $($status.statusCounts.error)" "Red"
            }
        }
        else {
            Write-ColorText "❌ Error en el monitoreo: $($response.error)" "Red"
        }
    }
    catch {
        Write-ColorText "❌ Error ejecutando monitoreo: $($_.Exception.Message)" "Red"
        
        if ($_.Exception.Message -match "timeout") {
            Write-ColorText "⏰ El proceso tardó más de lo esperado. Revisa los logs del servidor." "Yellow"
        }
    }
}

function Show-SystemStatus {
    Write-ColorText "📊 ESTADO DEL SISTEMA" "Cyan"
    Write-ColorText ""
    
    try {
        $headers = Get-AuthHeaders -User "admin" -Pass "Cpilogger"
        $response = Invoke-RestMethod -Uri "$ServerUrl/api/monitoring/status" -Method GET -Headers $headers
        
        if ($response.success) {
            $status = $response.status
            
            Write-ColorText "🔄 Sistema en ejecución: $($status.isRunning)" "White"
            Write-ColorText "📅 Programación: $($status.nextRun)" "White"
            Write-ColorText "⚙️  Programado activo: $($status.isScheduled)" "White"
            Write-ColorText "🔑 Credenciales configuradas: $($status.config.hasCredentials)" "White"
            Write-ColorText "🌍 URL CPI: $($status.config.baseUrl)" "White"
            
            if ($status.lastRun) {
                Write-ColorText ""
                Write-ColorText "📊 ÚLTIMA EJECUCIÓN:" "Yellow"
                Write-ColorText "🕒 Fecha: $($status.lastRun.timestamp)" "White"
                Write-ColorText "✅ Exitosa: $($status.lastRun.success)" "White"
                
                if ($status.lastRun.error) {
                    Write-ColorText "❌ Error: $($status.lastRun.error)" "Red"
                }
            }
        }
        else {
            Write-ColorText "❌ Error obteniendo estado: $($response.error)" "Red"
        }
    }
    catch {
        Write-ColorText "❌ Error consultando estado: $($_.Exception.Message)" "Red"
    }
}

function Show-Reports {
    Write-ColorText "📝 REPORTES GENERADOS" "Cyan"
    Write-ColorText ""
    
    try {
        $headers = Get-AuthHeaders -User "admin" -Pass "Cpilogger"
        $response = Invoke-RestMethod -Uri "$ServerUrl/api/monitoring/reports" -Method GET -Headers $headers
        
        if ($response.success -and $response.reports.Count -gt 0) {
            Write-ColorText "📊 Total de reportes: $($response.reports.Count)" "White"
            Write-ColorText ""
            
            foreach ($report in $response.reports | Select-Object -First 10) {
                Write-ColorText "🔹 ID: $($report.id)" "White"
                Write-ColorText "   📅 Fecha: $($report.timestamp)" "Gray"
                Write-ColorText "   ⏱️  Duración: $([math]::Round($report.duration / 1000, 2))s" "Gray"
                
                if ($report.summary) {
                    $summary = $report.summary
                    Write-ColorText "   📈 Total: $($summary.totalIntegrations) | ✅ $($summary.success) | ⚠️ $($summary.warnings) | ❌ $($summary.errors)" "Gray"
                    Write-ColorText "   🎯 Estado: $($summary.overallStatus)" "Gray"
                }
                Write-ColorText ""
            }
        }
        else {
            Write-ColorText "📭 No hay reportes generados aún" "Yellow"
            Write-ColorText "💡 Ejecuta un monitoreo manual para generar tu primer reporte" "Yellow"
        }
    }
    catch {
        Write-ColorText "❌ Error obteniendo reportes: $($_.Exception.Message)" "Red"
    }
}

function Test-Installation {
    Write-ColorText "🏗️  VERIFICANDO INSTALACIÓN" "Cyan"
    Write-ColorText ""
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version
        Write-ColorText "✅ Node.js: $nodeVersion" "Green"
    }
    catch {
        Write-ColorText "❌ Node.js no encontrado" "Red"
    }
    
    # Verificar npm
    try {
        $npmVersion = npm --version
        Write-ColorText "✅ npm: $npmVersion" "Green"
    }
    catch {
        Write-ColorText "❌ npm no encontrado" "Red"
    }
    
    # Verificar dependencias
    if (Test-Path "package.json") {
        Write-ColorText "✅ package.json encontrado" "Green"
        
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        $requiredDeps = @("puppeteer", "sharp", "node-cron")
        
        foreach ($dep in $requiredDeps) {
            if ($packageJson.dependencies.$dep) {
                Write-ColorText "✅ $dep: $($packageJson.dependencies.$dep)" "Green"
            }
            else {
                Write-ColorText "❌ $dep: No instalado" "Red"
            }
        }
    }
    else {
        Write-ColorText "❌ package.json no encontrado" "Red"
    }
    
    # Verificar archivos de servicio
    $requiredFiles = @(
        "services/monitoring-service.js",
        "routes/monitoring.js", 
        "config/monitoring-config.json"
    )
    
    foreach ($file in $requiredFiles) {
        if (Test-Path $file) {
            Write-ColorText "✅ $file" "Green"
        }
        else {
            Write-ColorText "❌ $file no encontrado" "Red"
        }
    }
    
    # Verificar directorios de reportes
    if (Test-Path "reports") {
        Write-ColorText "✅ Directorio reports/" "Green"
        
        if (Test-Path "reports/screenshots") {
            Write-ColorText "✅ Directorio reports/screenshots/" "Green"
        }
        else {
            Write-ColorText "⚠️  Directorio reports/screenshots/ no encontrado" "Yellow"
        }
    }
    else {
        Write-ColorText "⚠️  Directorio reports/ no encontrado" "Yellow"
    }
}

function Clean-OldReports {
    Write-ColorText "🧹 LIMPIAR REPORTES ANTIGUOS" "Cyan"
    Write-ColorText ""
    
    if (Test-Path "reports") {
        $reportFiles = Get-ChildItem "reports" -Filter "*.json" | Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-30) }
        $screenshotFiles = Get-ChildItem "reports/screenshots" -Filter "*.png" | Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-30) }
        
        $totalFiles = $reportFiles.Count + $screenshotFiles.Count
        
        if ($totalFiles -gt 0) {
            Write-ColorText "📁 Archivos antiguos encontrados: $totalFiles" "Yellow"
            $confirm = Read-Host "¿Deseas eliminar archivos de más de 30 días? (s/n)"
            
            if ($confirm -eq "s" -or $confirm -eq "S") {
                $reportFiles | Remove-Item -Force
                $screenshotFiles | Remove-Item -Force
                
                Write-ColorText "✅ Archivos antiguos eliminados: $totalFiles" "Green"
            }
            else {
                Write-ColorText "❌ Operación cancelada" "Yellow"
            }
        }
        else {
            Write-ColorText "✅ No hay archivos antiguos para eliminar" "Green"
        }
    }
    else {
        Write-ColorText "📁 Directorio de reportes no encontrado" "Yellow"
    }
}

# Función principal
function Main {
    Show-Header
    
    # Verificar conexión al servidor
    if (-not (Test-ServerConnection)) {
        Write-ColorText ""
        Write-ColorText "⚠️  No se puede continuar sin conexión al servidor" "Red"
        Write-ColorText "💡 Inicia el servidor con: npm start" "Yellow"
        Read-Host "Presiona Enter para salir"
        return
    }
    
    while ($true) {
        Write-ColorText ""
        
        if ($Action -eq "menu") {
            Show-Menu
            
            $choice = Read-Host "Selecciona una opción (1-8)"
            
            switch ($choice) {
                "1" { Set-CPICredentials }
                "2" { Test-CPIConnection }
                "3" { Start-ManualMonitoring }
                "4" { Show-SystemStatus }
                "5" { Show-Reports }
                "6" { Test-Installation }
                "7" { Clean-OldReports }
                "8" { 
                    Write-ColorText "👋 ¡Hasta luego!" "Green"
                    return 
                }
                default { 
                    Write-ColorText "❌ Opción no válida" "Red"
                }
            }
        }
        else {
            # Ejecutar acción directa
            switch ($Action.ToLower()) {
                "credentials" { Set-CPICredentials }
                "test" { Test-CPIConnection }
                "run" { Start-ManualMonitoring }
                "status" { Show-SystemStatus }
                "reports" { Show-Reports }
                "install" { Test-Installation }
                "clean" { Clean-OldReports }
                default { 
                    Write-ColorText "❌ Acción no válida: $Action" "Red"
                    return
                }
            }
            return
        }
        
        Write-ColorText ""
        Read-Host "Presiona Enter para continuar"
        Clear-Host
        Show-Header
    }
}

# Ejecutar script
Main