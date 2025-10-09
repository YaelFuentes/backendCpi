# Script para abrir el Dashboard del Backend CPI

param(
    [string]$Port = "3000",
    [switch]$OnlyOpen,
    [switch]$DevMode
)

$dashboardUrl = "http://localhost:$Port/dashboard"
$serverUrl = "http://localhost:$Port"

Write-Host "=== Backend CPI Dashboard Launcher ===" -ForegroundColor Cyan

if (-not $OnlyOpen) {
    Write-Host "Verificando si el servidor está ejecutándose..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $serverUrl -UseBasicParsing -TimeoutSec 5
        Write-Host "✅ Servidor detectado en puerto $Port" -ForegroundColor Green
    } catch {
        Write-Host "❌ Servidor no detectado. Iniciando servidor..." -ForegroundColor Red
        
        if ($DevMode) {
            Write-Host "Iniciando en modo desarrollo..." -ForegroundColor Yellow
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"
        } else {
            Write-Host "Iniciando servidor..." -ForegroundColor Yellow
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm start"
        }
        
        Write-Host "Esperando 5 segundos para que el servidor inicie..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

Write-Host "Abriendo dashboard en el navegador..." -ForegroundColor Green
Write-Host "URL: $dashboardUrl" -ForegroundColor Gray

try {
    Start-Process $dashboardUrl
    Write-Host "✅ Dashboard abierto exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error abriendo el navegador: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Abra manualmente: $dashboardUrl" -ForegroundColor Yellow
}

Write-Host "`n📋 Información del Dashboard:" -ForegroundColor Cyan
Write-Host "• URL Dashboard: $dashboardUrl" -ForegroundColor White
Write-Host "• URL API: $serverUrl/api/" -ForegroundColor White
Write-Host "• Credenciales por defecto: admin / Cpilogger" -ForegroundColor White
Write-Host "• Puedes cambiar las credenciales en el dashboard" -ForegroundColor White

Write-Host "`n🔧 Comandos útiles:" -ForegroundColor Cyan
Write-Host "• .\open-dashboard.ps1              # Abrir dashboard" -ForegroundColor White
Write-Host "• .\open-dashboard.ps1 -DevMode    # Iniciar en modo dev" -ForegroundColor White
Write-Host "• .\open-dashboard.ps1 -OnlyOpen   # Solo abrir (no iniciar servidor)" -ForegroundColor White
Write-Host "• .\open-dashboard.ps1 -Port 8080  # Usar puerto personalizado" -ForegroundColor White

if (-not $OnlyOpen) {
    Write-Host "`n⚡ El servidor se está ejecutando en segundo plano" -ForegroundColor Yellow
    Write-Host "   Cierra la ventana de PowerShell del servidor para detenerlo" -ForegroundColor Gray
}