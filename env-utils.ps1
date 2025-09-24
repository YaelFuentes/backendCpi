# Script de utilidades para variables de entorno
# Este script ayuda a configurar y validar las variables de entorno

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("setup", "validate", "show", "help")]
    [string]$Action = "help"
)

function Show-Help {
    Write-Host "=== Utilidades de Variables de Entorno - Backend CPI ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Uso: .\env-utils.ps1 -Action <acción>" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Acciones disponibles:" -ForegroundColor Green
    Write-Host "  setup    - Configurar archivo .env desde .env.example" -ForegroundColor White
    Write-Host "  validate - Validar que todas las variables estén configuradas" -ForegroundColor White
    Write-Host "  show     - Mostrar variables actuales (sin contraseñas)" -ForegroundColor White
    Write-Host "  help     - Mostrar esta ayuda" -ForegroundColor White
    Write-Host ""
}

function Setup-EnvFile {
    Write-Host "🔧 Configurando archivo .env..." -ForegroundColor Yellow
    
    if (Test-Path ".env") {
        $overwrite = Read-Host "El archivo .env ya existe. ¿Deseas sobrescribirlo? (s/N)"
        if ($overwrite -notmatch "^[sS]") {
            Write-Host "❌ Operación cancelada" -ForegroundColor Red
            return
        }
    }
    
    if (-not (Test-Path ".env.example")) {
        Write-Host "❌ Error: No se encontró .env.example" -ForegroundColor Red
        return
    }
    
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Archivo .env creado desde .env.example" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Ahora debes editar .env con tus credenciales:" -ForegroundColor Yellow
    Write-Host "   notepad .env" -ForegroundColor Gray
    Write-Host ""
    Write-Host "⚠️  Recuerda cambiar todas las contraseñas por valores seguros!" -ForegroundColor Red
}

function Validate-EnvFile {
    Write-Host "🔍 Validando variables de entorno..." -ForegroundColor Yellow
    
    if (-not (Test-Path ".env")) {
        Write-Host "❌ Error: No se encontró archivo .env" -ForegroundColor Red
        Write-Host "   Ejecuta: .\env-utils.ps1 -Action setup" -ForegroundColor Gray
        return
    }
    
    # Variables requeridas
    $requiredVars = @(
        "AUTH_ADMIN_USER", "AUTH_ADMIN_PASS",
        "AUTH_USER_USER", "AUTH_USER_PASS", 
        "AUTH_CLIENT_USER", "AUTH_CLIENT_PASS",
        "PORT", "NODE_ENV", "AUTH_REALM", "LOG_LEVEL"
    )
    
    # Leer archivo .env
    $envContent = Get-Content ".env" | Where-Object { $_ -match "^[^#].*=" }
    $envVars = @{}
    
    foreach ($line in $envContent) {
        if ($line -match "^([^=]+)=(.*)$") {
            $envVars[$matches[1]] = $matches[2]
        }
    }
    
    $missing = @()
    $empty = @()
    
    foreach ($var in $requiredVars) {
        if (-not $envVars.ContainsKey($var)) {
            $missing += $var
        } elseif ([string]::IsNullOrWhiteSpace($envVars[$var])) {
            $empty += $var
        }
    }
    
    if ($missing.Count -eq 0 -and $empty.Count -eq 0) {
        Write-Host "✅ Todas las variables de entorno están configuradas correctamente" -ForegroundColor Green
        
        # Verificar valores por defecto que deberían cambiarse
        $defaultValues = @{
            "AUTH_ADMIN_PASS" = @("your_strong_admin_password", "password123", "admin")
            "AUTH_USER_PASS" = @("your_user_password", "user123", "user")
            "AUTH_CLIENT_PASS" = @("your_client_password", "client456", "client")
        }
        
        $warnings = @()
        foreach ($var in $defaultValues.Keys) {
            if ($envVars.ContainsKey($var) -and $envVars[$var] -in $defaultValues[$var]) {
                $warnings += $var
            }
        }
        
        if ($warnings.Count -gt 0) {
            Write-Host ""
            Write-Host "⚠️  Advertencias de seguridad:" -ForegroundColor Yellow
            foreach ($warn in $warnings) {
                Write-Host "   - $warn tiene un valor por defecto inseguro" -ForegroundColor Red
            }
            Write-Host "   Cambia estas contraseñas por valores más seguros" -ForegroundColor Gray
        }
        
    } else {
        Write-Host "❌ Problemas encontrados:" -ForegroundColor Red
        
        if ($missing.Count -gt 0) {
            Write-Host "   Variables faltantes:" -ForegroundColor Red
            foreach ($var in $missing) {
                Write-Host "     - $var" -ForegroundColor Gray
            }
        }
        
        if ($empty.Count -gt 0) {
            Write-Host "   Variables vacías:" -ForegroundColor Red
            foreach ($var in $empty) {
                Write-Host "     - $var" -ForegroundColor Gray
            }
        }
    }
}

function Show-EnvVars {
    Write-Host "📋 Variables de entorno actuales:" -ForegroundColor Yellow
    
    if (-not (Test-Path ".env")) {
        Write-Host "❌ Error: No se encontró archivo .env" -ForegroundColor Red
        return
    }
    
    $envContent = Get-Content ".env" | Where-Object { $_ -match "^[^#].*=" }
    
    Write-Host ""
    Write-Host "🔐 Autenticación:" -ForegroundColor Green
    Write-Host "   AUTH_ADMIN_USER = $((Get-Content .env | Select-String "AUTH_ADMIN_USER=") -replace "AUTH_ADMIN_USER=","")" -ForegroundColor Gray
    Write-Host "   AUTH_ADMIN_PASS = ********" -ForegroundColor Gray
    Write-Host "   AUTH_USER_USER = $((Get-Content .env | Select-String "AUTH_USER_USER=") -replace "AUTH_USER_USER=","")" -ForegroundColor Gray
    Write-Host "   AUTH_USER_PASS = ********" -ForegroundColor Gray
    Write-Host "   AUTH_CLIENT_USER = $((Get-Content .env | Select-String "AUTH_CLIENT_USER=") -replace "AUTH_CLIENT_USER=","")" -ForegroundColor Gray
    Write-Host "   AUTH_CLIENT_PASS = ********" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "⚙️  Servidor:" -ForegroundColor Green
    Write-Host "   PORT = $((Get-Content .env | Select-String "PORT=") -replace "PORT=","")" -ForegroundColor Gray
    Write-Host "   NODE_ENV = $((Get-Content .env | Select-String "NODE_ENV=") -replace "NODE_ENV=","")" -ForegroundColor Gray
    Write-Host "   LOG_LEVEL = $((Get-Content .env | Select-String "LOG_LEVEL=") -replace "LOG_LEVEL=","")" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "🔒 Auth Config:" -ForegroundColor Green
    Write-Host "   AUTH_REALM = $((Get-Content .env | Select-String "AUTH_REALM=") -replace "AUTH_REALM=","")" -ForegroundColor Gray
    Write-Host "   AUTH_CHALLENGE = $((Get-Content .env | Select-String "AUTH_CHALLENGE=") -replace "AUTH_CHALLENGE=","")" -ForegroundColor Gray
}

# Ejecutar acción
switch ($Action) {
    "setup" { Setup-EnvFile }
    "validate" { Validate-EnvFile }
    "show" { Show-EnvVars }
    "help" { Show-Help }
    default { Show-Help }
}