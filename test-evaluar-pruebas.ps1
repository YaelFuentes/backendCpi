# Pruebas de nuevas rutas /api/evaluar y /api/pruebas

param(
  [string]$BaseUrl = "http://localhost:3000",
  [pscredential]$Credential
)

$ErrorActionPreference = 'Stop'

function Get-BasicAuthHeader([pscredential]$cred) {
  $u = $cred.UserName
  $p = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($cred.Password))
  $b64 = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$u`:$p"))
  return @{ Authorization = "Basic $b64" }
}

# Construir credencial si no se pasó por parámetro
if (-not $Credential) {
  $username = if ($env:API_USER) { $env:API_USER } else { 'admin' }
  $passwordPlain = if ($env:API_PASSWORD) { $env:API_PASSWORD } else { 'Cpilogger' }
  $secure = ConvertTo-SecureString $passwordPlain -AsPlainText -Force
  $Credential = New-Object System.Management.Automation.PSCredential($username, $secure)
}

$headers = Get-BasicAuthHeader -cred $Credential
$api = "$BaseUrl/api"

Write-Host "== Probando /api/evaluar ==" -ForegroundColor Cyan
$payload = @{ ejemplo = 'dato'; origen = 'script pruebas'; ts = (Get-Date).ToString('o') } | ConvertTo-Json

$endpointsEvaluar = @(
  'orden', 'inventario', 'envio', 'generic/custom1'
)

foreach ($ep in $endpointsEvaluar) {
  $url = "$api/evaluar/$ep"
  try {
    $resp = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -ContentType 'application/json' -Body $payload
    Write-Host ("POST {0} -> {1} (status implícito 202)" -f $url, $resp.message) -ForegroundColor Green
  } catch {
    Write-Host ("Error en {0}: {1}" -f $url, $_.Exception.Message) -ForegroundColor Red
  }
}

Write-Host "`n== Probando /api/pruebas ==" -ForegroundColor Cyan
$endpointsPruebas = @(
  'ping', 'echo', 'evento', 'generic/custom2'
)

foreach ($ep in $endpointsPruebas) {
  $url = "$api/pruebas/$ep"
  try {
    $resp = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -ContentType 'application/json' -Body $payload
    Write-Host ("POST {0} -> {1} (status implícito 202)" -f $url, $resp.message) -ForegroundColor Green
  } catch {
    Write-Host ("Error en {0}: {1}" -f $url, $_.Exception.Message) -ForegroundColor Red
  }
}

Write-Host "`nListo. Verifica los logs locales y en Logtail si está configurado." -ForegroundColor Yellow
