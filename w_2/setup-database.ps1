# 潮玩盲盒库存管理系统 - 数据库设置脚本 (PowerShell)

Write-Host "正在设置数据库..." -ForegroundColor Green

# 检查是否在正确的目录中
if (-not (Test-Path "package.json")) {
    Write-Host "错误：请在项目根目录中运行此脚本" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
}

# 创建 .env 文件（如果不存在）
if (-not (Test-Path ".env")) {
    Write-Host "创建 .env 文件..." -ForegroundColor Yellow
    "# Database" | Out-File -FilePath ".env" -Encoding UTF8
    'DATABASE_URL="file:./db/custom.db"' | Out-File -FilePath ".env" -Encoding UTF8 -Append
    Write-Host ".env 文件已创建" -ForegroundColor Green
} else {
    Write-Host ".env 文件已存在" -ForegroundColor Yellow
}

# 创建 db 目录（如果不存在）
if (-not (Test-Path "db")) {
    Write-Host "创建 db 目录..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "db" | Out-Null
    Write-Host "db 目录已创建" -ForegroundColor Green
} else {
    Write-Host "db 目录已存在" -ForegroundColor Yellow
}

# 设置环境变量并运行 Prisma
Write-Host "设置环境变量..." -ForegroundColor Yellow
$env:DATABASE_URL = "file:./db/custom.db"

Write-Host "运行 Prisma 数据库推送..." -ForegroundColor Yellow
try {
    npx prisma db push
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 数据库设置成功！" -ForegroundColor Green
        Write-Host "您现在可以运行以下命令启动开发服务器：" -ForegroundColor Cyan
        Write-Host "npm run dev" -ForegroundColor Cyan
        Write-Host "或" -ForegroundColor Cyan
        Write-Host "npx tsx server.ts" -ForegroundColor Cyan
    } else {
        Write-Host "❌ 数据库设置失败" -ForegroundColor Red
        Write-Host "请检查错误信息并重试" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 运行命令时出错：$($_.Exception.Message)" -ForegroundColor Red
}

Read-Host "按任意键退出"