#!/bin/bash

# 部署设置脚本
echo "🚀 开始设置部署环境..."

# 检查是否已安装必要的工具
command -v git >/dev/null 2>&1 || { echo "❌ 需要安装 git"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ 需要安装 node"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ 需要安装 npm"; exit 1; }

# 生成随机密钥
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "✅ 生成 NEXTAUTH_SECRET: $NEXTAUTH_SECRET"

# 询问数据库类型
echo "请选择数据库类型:"
echo "1) PlanetScale (MySQL)"
echo "2) Supabase (PostgreSQL)"
read -p "请输入选择 (1/2): " db_choice

case $db_choice in
    1)
        echo "您选择了 PlanetScale (MySQL)"
        read -p "请输入 PlanetScale 数据库 URL: " database_url
        
        # 备份原始schema
        cp prisma/schema.prisma prisma/schema.prisma.backup
        
        # 使用PlanetScale schema
        cp prisma/schema-planetscale.prisma prisma/schema.prisma
        
        echo "✅ 已切换到 PlanetScale 配置"
        ;;
    2)
        echo "您选择了 Supabase (PostgreSQL)"
        read -p "请输入 Supabase 数据库 URL: " database_url
        
        # 备份原始schema
        cp prisma/schema.prisma prisma/schema.prisma.backup
        
        # 使用Supabase schema
        cp prisma/schema-supabase.prisma prisma/schema.prisma
        
        echo "✅ 已切换到 Supabase 配置"
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

# 创建环境变量文件
cat > .env.production << EOF
DATABASE_URL="$database_url"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
NEXTAUTH_URL="https://your-app.vercel.app"
EOF

echo "✅ 创建了 .env.production 文件"

# 安装依赖
echo "📦 安装依赖..."
npm install

# 生成Prisma客户端
echo "🔧 生成Prisma客户端..."
npx prisma generate

# 推送数据库schema
echo "🗄️ 推送数据库schema..."
npx prisma db push

# 构建项目
echo "🏗️ 构建项目..."
npm run build

echo "✅ 部署设置完成！"
echo ""
echo "下一步："
echo "1. 提交代码到GitHub"
echo "2. 在Vercel中导入项目"
echo "3. 配置环境变量"
echo "4. 部署到Vercel"
echo ""
echo "环境变量："
echo "DATABASE_URL=$database_url"
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
echo "NEXTAUTH_URL=https://your-app.vercel.app"