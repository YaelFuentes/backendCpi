# Script para monitorear el progreso de la captura CPI
# Este script es seguro - solo verifica el estado

Write-Host "🔍 Verificando progreso de la captura CPI..." -ForegroundColor Cyan
Write-Host ""

$maxAttempts = 12
$attempt = 1

while ($attempt -le $maxAttempts) {
    try {
        Write-Host "Intento $attempt de $maxAttempts..." -ForegroundColor Yellow
        
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/monitoring/status" -Headers @{
            Authorization="Basic $([Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes('admin:Cpilogger')))"
        }
        
        if ($response.success) {
            $status = $response.status
            
            if ($status.isRunning) {
                Write-Host "⏳ Captura en progreso... (solo lectura - completamente seguro)" -ForegroundColor Green
            } else {
                Write-Host "✅ Captura completada!" -ForegroundColor Green
                
                if ($status.lastRun) {
                    if ($status.lastRun.success) {
                        Write-Host "✅ Resultado: EXITOSO" -ForegroundColor Green
                        Write-Host "📊 Reporte generado: $($status.lastRun.report)" -ForegroundColor Cyan
                        
                        # Obtener el reporte
                        try {
                            $reports = Invoke-RestMethod -Uri "http://localhost:3000/api/monitoring/reports" -Headers @{
                                Authorization="Basic $([Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes('admin:Cpilogger')))"
                            }
                            
                            if ($reports.success -and $reports.reports.Count -gt 0) {
                                $latestReport = $reports.reports[0]
                                Write-Host ""
                                Write-Host "📋 RESUMEN DEL MONITOREO:" -ForegroundColor Cyan
                                Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
                                Write-Host "📅 Fecha: $($latestReport.timestamp)" -ForegroundColor White
                                Write-Host "⏱️  Duración: $([math]::Round($latestReport.duration/1000, 2)) segundos" -ForegroundColor White
                                Write-Host "🔗 Total Integraciones: $($latestReport.summary.totalIntegrations)" -ForegroundColor White
                                Write-Host "✅ Exitosas: $($latestReport.summary.success)" -ForegroundColor Green
                                Write-Host "⚠️  Advertencias: $($latestReport.summary.warnings)" -ForegroundColor Yellow
                                Write-Host "❌ Errores: $($latestReport.summary.errors)" -ForegroundColor Red
                                Write-Host "📊 Estado General: $($latestReport.summary.overallStatus)" -ForegroundColor $(
                                    switch ($latestReport.summary.overallStatus) {
                                        "success" { "Green" }
                                        "warning" { "Yellow" }
                                        "error" { "Red" }
                                        default { "White" }
                                    }
                                )
                                Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
                            }
                        } catch {
                            Write-Host "ℹ️  No se pudo obtener detalles del reporte" -ForegroundColor Yellow
                        }
                        
                    } else {
                        Write-Host "❌ Resultado: ERROR" -ForegroundColor Red
                        Write-Host "📝 Error: $($status.lastRun.error)" -ForegroundColor Red
                    }
                }
                break
            }
        }
        
    } catch {
        Write-Host "⚠️  Error verificando estado: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    if ($attempt -lt $maxAttempts) {
        Write-Host "⏳ Esperando 5 segundos..." -ForegroundColor Gray
        Start-Sleep -Seconds 5
    }
    
    $attempt++
}

if ($attempt -gt $maxAttempts) {
    Write-Host "⏰ Tiempo de espera agotado. La captura puede estar tomando más tiempo del esperado." -ForegroundColor Yellow
    Write-Host "💡 Puedes verificar el estado manualmente con: Invoke-RestMethod -Uri 'http://localhost:3000/api/monitoring/status'" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🛡️  RECORDATORIO DE SEGURIDAD:" -ForegroundColor Cyan
Write-Host "✅ Esta captura es 100% segura - solo lectura" -ForegroundColor Green
Write-Host "✅ No modifica ningún dato en CPI" -ForegroundColor Green
Write-Host "✅ Solo toma screenshots y analiza visualmente" -ForegroundColor Green
Write-Host "✅ No ejecuta acciones ni hace clicks" -ForegroundColor Green