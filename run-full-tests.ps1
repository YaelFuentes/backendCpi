# Ejecutor de Pruebas Completas - Backend CPI con Basic Auth
# Este script ejecuta todas las pruebas de la API con y sin autenticación

Write-Host "================================" -ForegroundColor Cyan
Write-Host "🚀 PRUEBAS BACKEND CPI API" -ForegroundColor Cyan
Write-Host "🔐 Con Autenticación Basic Auth" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Verificar que el servidor esté corriendo
Write-Host "`n🔍 Verificando servidor..." -ForegroundColor Yellow
try {
    $serverCheck = Invoke-RestMethod -Uri "http://localhost:3000/" -Method Get -TimeoutSec 5
    Write-Host "✅ Servidor respondiendo correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: El servidor no está respondiendo en http://localhost:3000" -ForegroundColor Red
    Write-Host "   Asegúrate de que el servidor esté ejecutándose con: node server.js" -ForegroundColor Yellow
    exit 1
}

# Configurar credenciales para Basic Auth
$username = "admin"
$password = "password123"
$base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(("{0}:{1}" -f $username, $password)))
$headers = @{
    Authorization = "Basic $base64AuthInfo"
}

Write-Host "`n🔑 Usando credenciales: $username / $password" -ForegroundColor Cyan

Write-Host "`n" + "="*50 -ForegroundColor Cyan
Write-Host "🌐 RUTAS SIN AUTENTICACIÓN" -ForegroundColor Green
Write-Host "="*50 -ForegroundColor Cyan

Write-Host "`n1️⃣ Información general de la API:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/" -Method Get
    Write-Host "✅ Respuesta exitosa:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2️⃣ Información de autenticación:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/auth-info" -Method Get
    Write-Host "✅ Respuesta exitosa:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" + "="*50 -ForegroundColor Cyan
Write-Host "🔒 RUTAS CON AUTENTICACIÓN REQUERIDA" -ForegroundColor Green
Write-Host "="*50 -ForegroundColor Cyan

Write-Host "`n3️⃣ Health Check:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get -Headers $headers
    Write-Host "✅ Respuesta exitosa:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n4️⃣ Obtener usuarios:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method Get -Headers $headers
    Write-Host "✅ Respuesta exitosa:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n5️⃣ Obtener productos:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method Get -Headers $headers
    Write-Host "✅ Respuesta exitosa:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n6️⃣ Crear nuevo usuario:" -ForegroundColor Yellow
$newUser = @{
    name = "Ana Rodríguez"
    email = "ana@example.com"
    age = 28
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method Post -Body $newUser -ContentType "application/json" -Headers $headers
    Write-Host "✅ Usuario creado exitosamente:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n7️⃣ Crear nuevo producto:" -ForegroundColor Yellow
$newProduct = @{
    name = "Smartphone Galaxy"
    price = 699.99
    category = "Electronics"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method Post -Body $newProduct -ContentType "application/json" -Headers $headers
    Write-Host "✅ Producto creado exitosamente:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" + "="*50 -ForegroundColor Cyan
Write-Host "❌ PRUEBAS DE ERROR Y SEGURIDAD" -ForegroundColor Red
Write-Host "="*50 -ForegroundColor Cyan

Write-Host "`n8️⃣ Intentar acceso sin autenticación (debe fallar):" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method Get -ErrorAction Stop
    Write-Host "⚠️  ADVERTENCIA: La petición no debería haber tenido éxito sin autenticación" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "✅ Error esperado (sin autenticación): $($_.Exception.Message)" -ForegroundColor Green
}

Write-Host "`n9️⃣ Intentar acceso con credenciales incorrectas (debe fallar):" -ForegroundColor Yellow
$wrongAuth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("wrong:credentials"))
$wrongHeaders = @{ Authorization = "Basic $wrongAuth" }

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method Get -Headers $wrongHeaders -ErrorAction Stop
    Write-Host "⚠️  ADVERTENCIA: La petición no debería haber tenido éxito con credenciales incorrectas" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "✅ Error esperado (credenciales incorrectas): $($_.Exception.Message)" -ForegroundColor Green
}

Write-Host "`n🔟 Ruta inexistente con autenticación válida:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/nonexistent" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "⚠️  ADVERTENCIA: La ruta no debería existir" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "✅ Error esperado (ruta no encontrada): $($_.Exception.Message)" -ForegroundColor Green
}

Write-Host "`n" + "="*50 -ForegroundColor Cyan
Write-Host "📊 RESUMEN DE PRUEBAS COMPLETADAS" -ForegroundColor Cyan
Write-Host "="*50 -ForegroundColor Cyan

Write-Host "✅ Pruebas de rutas sin autenticación: Completadas" -ForegroundColor Green
Write-Host "✅ Pruebas de rutas con autenticación: Completadas" -ForegroundColor Green
Write-Host "✅ Pruebas de seguridad y errores: Completadas" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 ¡Todas las pruebas han sido ejecutadas!" -ForegroundColor Green
Write-Host "📝 Revisa los logs del servidor para ver el registro detallado de las peticiones" -ForegroundColor Yellow
Write-Host "🌐 Página de prueba disponible en: http://localhost:3000/test" -ForegroundColor Cyan