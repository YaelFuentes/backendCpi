# Test de APIs con Basic Auth - Backend CPI

# Aquí tienes algunos comandos para probar las APIs usando PowerShell con autenticación

# Configurar credenciales para Basic Auth
$username = "admin"
$password = "password123"
$base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(("{0}:{1}" -f $username, $password)))
$headers = @{
    Authorization = "Basic $base64AuthInfo"
}

# Método alternativo usando PSCredential
$securePassword = ConvertTo-SecureString "password123" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ("admin", $securePassword)

Write-Host "=== RUTAS SIN AUTENTICACIÓN ===" -ForegroundColor Green

# 1. Obtener información general de la API (sin auth)
Write-Host "1. Información general:" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:3000/" -Method Get | ConvertTo-Json -Depth 10

# 2. Información de autenticación (sin auth)
Write-Host "`n2. Información de autenticación:" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:3000/auth-info" -Method Get | ConvertTo-Json -Depth 10

Write-Host "`n=== RUTAS CON AUTENTICACIÓN REQUERIDA ===" -ForegroundColor Green

# 3. Health Check (con auth usando headers)
Write-Host "`n3. Health Check (con headers):" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get -Headers $headers | ConvertTo-Json -Depth 10

# 4. Health Check (con auth usando credential)
Write-Host "`n4. Health Check (con credential):" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get -Credential $credential | ConvertTo-Json -Depth 10

# 5. Obtener todos los usuarios (con auth)
Write-Host "`n5. Obtener usuarios:" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method Get -Headers $headers | ConvertTo-Json -Depth 10

# 6. Obtener un usuario específico (con auth)
Write-Host "`n6. Obtener usuario específico:" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:3000/api/users/1" -Method Get -Headers $headers | ConvertTo-Json -Depth 10

# 7. Crear un nuevo usuario (con auth)
Write-Host "`n7. Crear nuevo usuario:" -ForegroundColor Yellow
$newUser = @{
    name = "Ana Rodriguez"
    email = "ana@example.com"
    age = 28
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method Post -Body $newUser -ContentType "application/json" -Headers $headers | ConvertTo-Json -Depth 10

# 8. Obtener todos los productos (con auth)
Write-Host "`n8. Obtener productos:" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method Get -Headers $headers | ConvertTo-Json -Depth 10

# 9. Crear un nuevo producto (con auth)
Write-Host "`n9. Crear nuevo producto:" -ForegroundColor Yellow
$newProduct = @{
    name = "Smartphone"
    price = 599.99
    category = "Electronics"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method Post -Body $newProduct -ContentType "application/json" -Headers $headers | ConvertTo-Json -Depth 10

# 10. Actualizar un usuario (con auth)
Write-Host "`n10. Actualizar usuario:" -ForegroundColor Yellow
$updateUser = @{
    name = "Juan Carlos Pérez"
    age = 31
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/users/1" -Method Put -Body $updateUser -ContentType "application/json" -Headers $headers | ConvertTo-Json -Depth 10

Write-Host "`n=== PRUEBAS DE ERROR ===" -ForegroundColor Red

# 11. Intentar acceder sin autenticación (debe fallar)
Write-Host "`n11. Intentar acceso sin auth (debe fallar):" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method Get
} catch {
    Write-Host "Error esperado (sin auth): $($_.Exception.Message)" -ForegroundColor Red
}

# 12. Intentar acceder con credenciales incorrectas (debe fallar)
Write-Host "`n12. Intentar acceso con credenciales incorrectas:" -ForegroundColor Yellow
$wrongAuth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("wrong:credentials"))
$wrongHeaders = @{ Authorization = "Basic $wrongAuth" }

try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method Get -Headers $wrongHeaders
} catch {
    Write-Host "Error esperado (credenciales incorrectas): $($_.Exception.Message)" -ForegroundColor Red
}

# 13. Intentar acceder a una ruta que no existe (con auth válida)
Write-Host "`n13. Ruta inexistente con auth válida:" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/nonexistent" -Method Get -Headers $headers
} catch {
    Write-Host "Error esperado (ruta no encontrada): $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== PRUEBAS API GMA/SSFFEV/PI4 ===" -ForegroundColor Cyan

# 14. Enviar datos a la nueva API GMA/SSFFEV/PI4
Write-Host "`n14. Enviando datos a GMA/SSFFEV/PI4:" -ForegroundColor Yellow
$pi4Data = @{
    transactionId = "TXN001"
    customerInfo = @{
        id = "CUST001"
        name = "Juan Pérez"
        email = "juan@empresa.com"
    }
    productData = @{
        productId = "PROD001"
        quantity = 5
        unitPrice = 199.99
    }
    metadata = @{
        source = "WebPortal"
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        version = "1.0"
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/gma/ssffev/PI4/" -Method Post -Body $pi4Data -ContentType "application/json" -Headers $headers
    Write-Host "Respuesta exitosa:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 15. Obtener lista de datos PI4 procesados
Write-Host "`n15. Obteniendo lista de datos GMA/SSFFEV/PI4:" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/gma/ssffev/PI4/" -Method Get -Headers $headers | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 16. Enviar otro conjunto de datos diferentes
Write-Host "`n16. Enviando segundo conjunto de datos a GMA/SSFFEV/PI4:" -ForegroundColor Yellow
$pi4Data2 = @{
    orderId = "ORD002"
    items = @(
        @{ sku = "SKU001"; name = "Producto A"; price = 50.00 }
        @{ sku = "SKU002"; name = "Producto B"; price = 75.50 }
    )
    shipping = @{
        address = "Calle Principal 123"
        city = "Madrid"
        postalCode = "28001"
    }
    payment = @{
        method = "creditCard"
        amount = 125.50
        currency = "EUR"
    }
} | ConvertTo-Json -Depth 10

try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:3000/api/gma/ssffev/PI4/" -Method Post -Body $pi4Data2 -ContentType "application/json" -Headers $headers
    Write-Host "Segunda respuesta exitosa:" -ForegroundColor Green
    $response2 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 17. Probar envío sin body (debe fallar)
Write-Host "`n17. Probando envío sin body (debe fallar):" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/gma/ssffev/PI4/" -Method Post -Body "{}" -ContentType "application/json" -Headers $headers
} catch {
    Write-Host "Error esperado (sin body): $($_.Exception.Message)" -ForegroundColor Red
}