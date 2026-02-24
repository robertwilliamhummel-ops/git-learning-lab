# Cloud Run PDF Service Deployment Script for Windows PowerShell
# This script deploys the PDF service to Google Cloud Run

Write-Host "🚀 Starting Cloud Run PDF Service Deployment..." -ForegroundColor Green
Write-Host ""

# Check if gcloud is installed
try {
    $gcloudVersion = gcloud --version 2>$null
    Write-Host "✅ Google Cloud SDK is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Google Cloud SDK is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install it from: https://cloud.google.com/sdk/docs/install#windows" -ForegroundColor Yellow
    Write-Host "Then restart PowerShell and run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 Current Configuration:" -ForegroundColor Cyan
Write-Host "   Region: us-central1" -ForegroundColor White
Write-Host "   Memory: 1Gi" -ForegroundColor White
Write-Host "   CPU: 1" -ForegroundColor White
Write-Host "   Timeout: 60 seconds" -ForegroundColor White
Write-Host "   Max Instances: 10" -ForegroundColor White
Write-Host ""

# Confirm deployment
$confirm = Read-Host "Deploy to Cloud Run? (y/n)"
if ($confirm -ne "y") {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🔨 Deploying to Cloud Run..." -ForegroundColor Green
Write-Host ""

# Deploy to Cloud Run
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
    Write-Host "   1. Copy the Service URL from above" -ForegroundColor White
    Write-Host "   2. Update functions/index.js with the Cloud Run URL" -ForegroundColor White
    Write-Host "   3. Deploy your Firebase function: firebase deploy --only functions:sendInvoiceEmail" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "   1. Not authenticated: Run 'gcloud auth login'" -ForegroundColor White
    Write-Host "   2. No project set: Run 'gcloud config set project YOUR_PROJECT_ID'" -ForegroundColor White
    Write-Host "   3. APIs not enabled: See WINDOWS_DEPLOYMENT_GUIDE.md Step 4" -ForegroundColor White
    Write-Host ""
}