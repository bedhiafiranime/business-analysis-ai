$process = Start-Process -FilePath '.\mvnw.cmd' -ArgumentList 'spring-boot:run' -PassThru -RedirectStandardOutput 'boot.log' -RedirectStandardError 'boot_err.log'
Start-Sleep -Seconds 25

$body = @{ fullName='Test'; email='debug@test.com'; password='password'; role='USER' } | ConvertTo-Json
$response = Invoke-RestMethod -Uri 'http://localhost:8081/api/v1/auth/register' -Method Post -Body $body -ContentType 'application/json'
$token = $response.token
Write-Host "Token: $token"

try {
    $demo = Invoke-RestMethod -Uri 'http://localhost:8081/api/v1/demo-controller' -Method Get -Headers @{ Authorization="Bearer $token" }
    Write-Host "Demo success: $demo"
} catch {
    Write-Host "Demo failed: $_"
}

Stop-Process -Id $process.Id -Force
