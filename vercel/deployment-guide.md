# 潮玩盲盒库存管理系统部署指南

## 🚀 部署到Vercel

### 前置条件
1. GitHub账号
2. Vercel账号
3. 云数据库账号（推荐PlanetScale或Supabase）

### 步骤一：准备数据库

#### 选项A：使用PlanetScale（推荐）
1. 注册 [PlanetScale](https://planetscale.com/)
2. 创建新数据库
3. 获取数据库连接字符串
4. 修改 `.env` 文件：

```env
DATABASE_URL="mysql://user:password@host/db?sslaccept=strict"
```

#### 选项B：使用Supabase
1. 注册 [Supabase](https://supabase.com/)
2. 创建新项目
3. 获取数据库连接字符串
4. 修改 `.env` 文件：

```env
DATABASE_URL="postgresql://user:password@host/db?pgbouncer=true"
```

### 步骤二：修改Prisma配置

1. 修改 `prisma/schema.prisma`：

```prisma
// 如果使用PlanetScale（MySQL）
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  relationMode = "foreignKeys"
}

// 如果使用Supabase（PostgreSQL）
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. 重新生成Prisma客户端：

```bash
npx prisma generate
npx prisma db push
```

### 步骤三：上传到GitHub

1. 创建 `.gitignore` 文件：

```gitignore
# Dependencies
node_modules/
*.log

# Production
.next/
out/
build
dist/

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Database
*.db
*.sqlite
*.sqlite3
```

2. 初始化Git仓库：

```bash
git init
git add .
git commit -m "Initial commit: 盲盒库存管理系统"
```

3. 创建GitHub仓库并推送：

```bash
git remote add origin https://github.com/your-username/your-repo.git
git branch -M main
git push -u origin main
```

### 步骤四：部署到Vercel

1. 登录 [Vercel](https://vercel.com/)
2. 点击 "New Project"
3. 选择您的GitHub仓库
4. 配置环境变量：

```env
# 数据库连接
DATABASE_URL="your_database_url"

# NextAuth.js
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your_nextauth_secret"

# 邮件配置（可选）
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"
```

5. 点击 "Deploy"

### 步骤五：初始化数据库

部署完成后，需要在生产环境中初始化数据库：

1. 通过Vercel控制台打开函数日志
2. 访问 `https://your-app.vercel.app/api/reset-database` 来初始化数据库
3. 或者使用Vercel CLI运行数据库迁移：

```bash
vercel env pull .env.production
npx prisma db push
```

## 🔧 环境变量配置

### 必需的环境变量
```env
DATABASE_URL=your_database_url
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_secret_key
```

### 可选的环境变量
```env
# 邮件通知
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# 管理员密码
ADMIN_PASSWORD=your_admin_password
```

## 📱 移动端访问

部署完成后，移动端可以通过以下方式访问：

1. 直接访问Vercel分配的域名：`https://your-app.vercel.app`
2. 如果绑定了自定义域名，访问自定义域名

## 🚨 注意事项

1. **数据库限制**：免费数据库通常有连接数和存储限制
2. **函数执行时间**：Vercel函数有10秒执行时间限制
3. **文件上传**：需要配置外部存储服务（如AWS S3）
4. **安全性**：确保环境变量不泄露，特别是数据库密码

## 🔄 数据库迁移

如果需要从SQLite迁移到其他数据库：

1. 导出现有数据
2. 修改数据库配置
3. 运行 `prisma db push`
4. 导入数据到新数据库

## 💡 成本估算

### 免费方案
- **Vercel**: 免费额度足够个人使用
- **PlanetScale**: 免费计划包含1个数据库，5GB存储
- **Supabase**: 免费计划包含500MB数据库，2GB带宽

### 付费方案
- **Vercel Pro**: $20/月，更多功能和带宽
- **PlanetScale Pro**: $29/月，更多数据库和存储
- **Supabase Pro**: $25/月，更多资源和功能

## 🛠️ 故障排除

### 常见问题
1. **数据库连接失败**：检查DATABASE_URL是否正确
2. **认证失败**：检查NEXTAUTH_SECRET和NEXTAUTH_URL
3. **构建失败**：检查依赖项和TypeScript错误
4. **函数超时**：优化数据库查询，减少处理时间

### 调试方法
1. 查看Vercel函数日志
2. 使用本地环境复现问题
3. 检查网络连接和数据库状态
4. 逐步排查环境变量配置