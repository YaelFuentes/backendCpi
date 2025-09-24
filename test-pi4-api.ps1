# Pruebas específicas para API GMA/SSFFEV/PI4
# Este script demuestra cómo usar la nueva API con diferentes tipos de datos

# Configurar credenciales
$username = "admin"
$password = "password123"
$base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(("{0}:{1}" -f $username, $password)))
$headers = @{
    Authorization = "Basic $base64AuthInfo"
}

Write-Host "=== PRUEBAS API GMA/SSFFEV/PI4 ===" -ForegroundColor Cyan
Write-Host "URL Base: http://localhost:3000/api/gma/ssffev/PI4/" -ForegroundColor Gray

# Ejemplo 1: Datos de transacción comercial
Write-Host "`n1. Enviando datos de transacción comercial:" -ForegroundColor Yellow
$transactionData = @{
    transactionId = "TXN_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    customerInfo = @{
        customerId = "CUST001"
        name = "María González"
        email = "maria.gonzalez@empresa.com"
        phone = "+34-666-123-456"
        address = @{
            street = "Calle Mayor 25"
            city = "Madrid"
            postalCode = "28013"
            country = "España"
        }
    }
    orderDetails = @{
        orderId = "ORD001"
        items = @(
            @{
                productId = "PROD001"
                name = "Laptop Dell XPS 13"
                quantity = 1
                unitPrice = 1299.99
                category = "Electronics"
            },
            @{
                productId = "PROD002"
                name = "Mouse Inalámbrico"
                quantity = 2
                unitPrice = 29.99
                category = "Accessories"
            }
        )
        totalAmount = 1359.97
        currency = "EUR"
        taxes = 272.00
    }
    paymentInfo = @{
        method = "creditCard"
        cardType = "Visa"
        last4Digits = "1234"
        authorizationCode = "AUTH123456"
    }
    metadata = @{
        source = "WebPortal"
        userAgent = "Mozilla/5.0"
        sessionId = "SESS_789"
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        version = "2.1"
    }
} | ConvertTo-Json -Depth 10

try {
    $response1 = Invoke-RestMethod -Uri "http://localhost:3000/api/gma/ssffev/PI4/" -Method Post -Body $transactionData -ContentType "application/json" -Headers $headers
    Write-Host "✓ Transacción procesada exitosamente" -ForegroundColor Green
    Write-Host "Request ID: $($response1.requestId)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Ejemplo 2: Datos de inventario
Write-Host "`n2. Enviando datos de inventario:" -ForegroundColor Yellow
$inventoryData = @{
    warehouseId = "WH001"
    inventoryUpdate = @{
        updateId = "INV_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        products = @(
            @{
                sku = "SKU001"
                name = "Smartphone Samsung Galaxy"
                currentStock = 45
                minimumStock = 10
                location = "A1-B2-C3"
                lastUpdated = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            },
            @{
                sku = "SKU002"
                name = "Auriculares Bluetooth"
                currentStock = 120
                minimumStock = 25
                location = "A2-B1-C4"
                lastUpdated = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            }
        )
        totalItems = 2
        updateType = "stockAdjustment"
        reason = "Inventory reconciliation"
    }
    operator = @{
        employeeId = "EMP001"
        name = "Carlos Martínez"
        department = "Warehouse"
    }
} | ConvertTo-Json -Depth 10

try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:3000/api/gma/ssffev/PI4/" -Method Post -Body $inventoryData -ContentType "application/json" -Headers $headers
    Write-Host "✓ Inventario procesado exitosamente" -ForegroundColor Green
    Write-Host "Request ID: $($response2.requestId)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Ejemplo 3: Datos de configuración del sistema
Write-Host "`n3. Enviando datos de configuración:" -ForegroundColor Yellow
$configData = @{
    systemConfig = @{
        configId = "CONFIG_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        environment = "production"
        services = @{
            database = @{
                host = "db.empresa.com"
                port = 5432
                database = "production_db"
                connectionPoolSize = 20
                timeout = 30
            }
            api = @{
                baseUrl = "https://api.empresa.com"
                version = "v2"
                rateLimitPerMinute = 1000
                authenticationMethod = "Bearer"
            }
            cache = @{
                provider = "Redis"
                host = "cache.empresa.com"
                port = 6379
                ttl = 3600
            }
        }
        features = @{
            enableLogging = $true
            enableMetrics = $true
            enableAlerts = $true
            maintenanceMode = $false
        }
        lastModified = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        modifiedBy = "admin@empresa.com"
    }
} | ConvertTo-Json -Depth 10

try {
    $response3 = Invoke-RestMethod -Uri "http://localhost:3000/api/gma/ssffev/PI4/" -Method Post -Body $configData -ContentType "application/json" -Headers $headers
    Write-Host "✓ Configuración procesada exitosamente" -ForegroundColor Green
    Write-Host "Request ID: $($response3.requestId)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Consultar todos los datos procesados
Write-Host "`n4. Consultando todos los datos procesados:" -ForegroundColor Yellow
try {
    $allData = Invoke-RestMethod -Uri "http://localhost:3000/api/gma/ssffev/PI4/" -Method Get -Headers $headers
    Write-Host "✓ Total de registros procesados: $($allData.total)" -ForegroundColor Green
    
    foreach ($item in $allData.data) {
        Write-Host "  - ID: $($item.id) | Recibido: $($item.receivedAt) | Keys: $($item.dataKeys -join ', ')" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Error consultando datos: $($_.Exception.Message)" -ForegroundColor Red
}

# Consultar un dato específico (si hay datos)
if ($response1 -and $response1.requestId) {
    Write-Host "`n5. Consultando dato específico ($($response1.requestId)):" -ForegroundColor Yellow
    try {
        $specificData = Invoke-RestMethod -Uri "http://localhost:3000/api/gma/ssffev/PI4/$($response1.requestId)" -Method Get -Headers $headers
        Write-Host "✓ Dato específico recuperado:" -ForegroundColor Green
        Write-Host "  - ID: $($specificData.data.id)" -ForegroundColor Gray
        Write-Host "  - Status: $($specificData.data.status)" -ForegroundColor Gray
        Write-Host "  - IP: $($specificData.data.metadata.ipAddress)" -ForegroundColor Gray
        Write-Host "  - Tamaño del body: $($specificData.data.metadata.bodySize) bytes" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Error consultando dato específico: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Pruebas completadas ===" -ForegroundColor Cyan
Write-Host "La API GMA/SSFFEV/PI4 está lista para trabajar con los datos recibidos." -ForegroundColor Green
Write-Host "Próximos pasos: implementar la lógica de procesamiento específica en el body." -ForegroundColor Yellow