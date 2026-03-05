Write-Host "🚀 Starting Cloud Run PDF Service Deployment..." -ForegroundColor Green
Write-Host ""

# Check if gcloud is installed
try {
    $null = gcloud --version 2>$null
    Write-Host "✅ Google Cloud SDK is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Google Cloud SDK is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install it from: https://cloud.google.com/sdk/docs/install#windows" -ForegroundColor Yellow
    Write-Host "Then restart PowerShell and run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 Current Configuration:" -ForegroundColor Cyan
Write-Host "   Service: pdf-service" -ForegroundColor White
Write-Host "   Region: us-central1" -ForegroundColor White
Write-Host "   Memory: 1Gi" -ForegroundColor White
Write-Host "   CPU: 1" -ForegroundColor White
Write-Host "   Timeout: 60 seconds" -ForegroundColor White
Write-Host "   Max Instances: 10" -ForegroundColor White
Write-Host ""

Write-Host "🔨 Deploying to Cloud Run..." -ForegroundColor Green
Write-Host ""

gcloud run deploy pdf-service `
  --source . `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --memory 1Gi `
  --cpu 1 `
  --timeout 60 `
  --max-instances 10

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Copy the Service URL from the deploy output" -ForegroundColor White
    Write-Host "   2. Confirm functions/index.js CLOUD_RUN_URL matches it" -ForegroundColor White
    Write-Host "   3. Deploy Firebase functions: firebase deploy --only functions" -ForegroundColor White
    Write-Host ""
    exit 0
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "   1. Not authenticated: gcloud auth login" -ForegroundColor White
    Write-Host "   2. No project set: gcloud config set project YOUR_PROJECT_ID" -ForegroundColor White
    Write-Host "   3. APIs not enabled: see WINDOWS_DEPLOYMENT_GUIDE.md Step 4" -ForegroundColor White
    Write-Host ""
    exit 1
}
