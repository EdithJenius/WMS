#!/bin/bash

# 潮玩盲盒库存管理系统 - 数据库设置脚本

echo "正在设置数据库..."

# 检查是否在正确的目录中
if [ ! -f "package.json" ]; then
    echo "错误：请在项目根目录中运行此脚本"
    exit 1
fi

# 创建 .env 文件（如果不存在）
if [ ! -f ".env" ]; then
    echo "创建 .env 文件..."
    echo "# Database" > .env
    echo 'DATABASE_URL="file:./db/custom.db"' >> .env
    echo ".env 文件已创建"
else
    echo ".env 文件已存在"
fi

# 创建 db 目录（如果不存在）
if [ ! -d "db" ]; then
    echo "创建 db 目录..."
    mkdir -p db
    echo "db 目录已创建"
else
    echo "db 目录已存在"
fi

# 设置环境变量并运行 Prisma
echo "设置环境变量..."
export DATABASE_URL="file:./db/custom.db"

echo "运行 Prisma 数据库推送..."
npx prisma db push

if [ $? -eq 0 ]; then
    echo "✅ 数据库设置成功！"
    echo "您现在可以运行以下命令启动开发服务器："
    echo "npm run dev"
    echo "或"
    echo "npx tsx server.ts"
else
    echo "❌ 数据库设置失败"
    echo "请检查错误信息并重试"
fi