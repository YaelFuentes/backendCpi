# Script para configurar credenciales CPI de forma segura
# Ejecutar este script desde PowerShell

# Configurar credenciales CPI
$cpiUsername = Read-Host "Ingresa tu usuario de CPI"
$cpiPassword = Read-Host "Ingresa tu contraseña de CPI" -AsSecureString

# Convertir a texto plano (solo para el API)
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($cpiPassword))

# Configurar credenciales mediante API
$credentials = @{
    credentials = @{
        username = $cpiUsername
        password = $plainPassword
    }
} | ConvertTo-Json

$authHeader = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("admin:Cpilogger"))

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/monitoring/config" `
        -Method POST `
        -Headers @{Authorization="Basic $authHeader"} `
        -Body $credentials `
        -ContentType "application/json"
    
    Write-Host "✅ Credenciales configuradas exitosamente" -ForegroundColor Green
    Write-Host $response.message
} catch {
    Write-Host "❌ Error configurando credenciales: $($_.Exception.Message)" -ForegroundColor Red
}

# Limpiar variables sensibles
Remove-Variable plainPassword -ErrorAction SilentlyContinue
Remove-Variable cpiPassword -ErrorAction SilentlyContinue