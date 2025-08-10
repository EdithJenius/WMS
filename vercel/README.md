# 潮玩盲盒库存管理系统

一个基于 Next.js 15 + TypeScript + Prisma 的现代化盲盒库存管理系统，支持进货、出货、库存管理和退货处理。

## 🌟 功能特点

### 核心功能
- **进货管理** - 支持箱/端盒/盒多单位进货，自动计算成本
- **出货管理** - 灵活的出货记录，实时库存验证
- **库存查询** - 实时库存状态，低库存预警
- **退货管理** - 完整的退货流程，记录价格和包装状态
- **统计分析** - 财务报表，利润分析
- **用户管理** - 角色权限控制

### 特色功能
- **盲盒规格系统** - 支持一箱几端、一端几盒的层级管理
- **单位转换** - 自动在不同单位间转换计算
- **移动端适配** - 响应式设计，支持手机访问
- **实时通知** - 库存不足邮件提醒
- **数据导入** - 支持测试数据生成

## 🚀 快速开始

### 本地开发

1. **克隆项目**
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env
   ```
   编辑 `.env` 文件：
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   ```

4. **初始化数据库**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **启动开发服务器**
   ```bash
   npm run dev
   ```

6. **访问应用**
   打开浏览器访问 `http://localhost:3000`

### 默认账号
- **用户名**: `admin`
- **密码**: `admin123`

## 📱 移动端访问

### 局域网访问
1. 确保电脑和手机连接同一WiFi
2. 查看电脑局域网IP（通常在开发服务器启动时显示）
3. 在手机浏览器访问 `http://电脑IP:3000`

### 公网访问
部署到Vercel后，可直接访问分配的域名

## 🌐 云端部署

### Vercel部署（推荐）

#### 1. 准备数据库
选择以下任一云数据库服务：

**PlanetScale**（推荐）
```bash
# 注册 PlanetScale 并创建数据库
# 获取连接字符串
DATABASE_URL="mysql://user:password@host/db?sslaccept=strict"
```

**Supabase**
```bash
# 注册 Supabase 并创建项目
# 获取连接字符串
DATABASE_URL="postgresql://user:password@host/db?pgbouncer=true"
```

#### 2. 修改Prisma配置
```prisma
# prisma/schema.prisma
datasource db {
  provider = "mysql"  # 或 "postgresql"
  url      = env("DATABASE_URL")
}
```

#### 3. 推送到GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

#### 4. 部署到Vercel
1. 登录 [Vercel](https://vercel.com/)
2. 导入GitHub仓库
3. 配置环境变量：
   ```env
   DATABASE_URL=your_database_url
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your_secret_key
   ```
4. 点击部署

#### 5. 初始化生产数据库
部署后，需要初始化数据库结构：
```bash
# 安装Vercel CLI
npm i -g vercel

# 拉取环境变量
vercel env pull .env.production

# 推送数据库结构
npx prisma db push
```

### 其他部署平台

#### Netlify
```bash
# 构建项目
npm run build

# 部署到Netlify
netlify deploy --prod --dir=.next
```

#### Railway
```bash
# 安装Railway CLI
npm install -g @railway/cli

# 登录并部署
railway login
railway init
railway up
```

## 🔧 技术栈

### 前端
- **Next.js 15** - React框架，支持App Router
- **TypeScript** - 类型安全
- **Tailwind CSS** - 现代CSS框架
- **shadcn/ui** - 高质量UI组件库
- **Lucide React** - 图标库
- **Framer Motion** - 动画库

### 后端
- **Next.js API Routes** - API路由
- **Prisma** - 数据库ORM
- **NextAuth.js** - 认证系统
- **Zod** - 数据验证

### 数据库
- **开发环境**: SQLite
- **生产环境**: MySQL/PostgreSQL（PlanetScale/Supabase）

## 📊 数据库结构

### 核心表结构
- **User** - 用户表
- **Product** - 产品表（支持盲盒规格）
- **Purchase** - 进货表（支持多单位）
- **Sale** - 销货表（支持多单位）
- **Inventory** - 库存表（以盒为单位）
- **Return** - 退货表（记录价格和状态）
- **InventoryNotification** - 库存通知表
- **NotificationLog** - 通知日志表

### 盲盒规格字段
- `boxesPerCase` - 一箱有几端
- `boxesPerSet` - 一端有几盒

## 🎮 使用指南

### 基础操作
1. **产品管理** - 添加盲盒产品，设置规格参数
2. **进货管理** - 选择产品，输入进货数量和单位
3. **出货管理** - 选择产品，输入出货数量，系统自动验证库存
4. **库存查询** - 查看实时库存状态和成本
5. **退货管理** - 创建退货记录，更新退货状态

### 高级功能
- **单位转换** - 系统自动在不同单位间转换
- **库存预警** - 库存不足时自动发送邮件通知
- **统计分析** - 查看财务报表和利润分析
- **测试数据** - 管理员可生成测试数据

## 🔍 故障排除

### 常见问题

**1. 数据库连接失败**
```bash
# 检查数据库URL格式
# 确保数据库服务正常运行
# 验证网络连接
```

**2. 认证失败**
```bash
# 检查NEXTAUTH_SECRET和NEXTAUTH_URL
# 确保环境变量正确设置
# 清除浏览器缓存
```

**3. 构建失败**
```bash
# 检查TypeScript错误
# 确保所有依赖已安装
# 查看构建日志
```

**4. 移动端无法访问**
```bash
# 确保设备在同一网络
# 检查防火墙设置
# 验证开发服务器配置
```

### 调试工具
- **浏览器开发者工具** - 查看网络请求和控制台错误
- **Vercel函数日志** - 查看云端函数执行情况
- **Prisma日志** - 查看数据库查询日志

## 📈 性能优化

### 前端优化
- 使用图片压缩和懒加载
- 启用缓存策略
- 优化Bundle大小

### 后端优化
- 数据库查询优化
- 使用CDN加速
- 启用Gzip压缩

### 数据库优化
- 添加适当索引
- 使用连接池
- 定期清理无用数据

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 支持

如果您在使用过程中遇到问题，请：

1. 查看 [故障排除](#故障排除) 部分
2. 搜索现有的 [Issues](https://github.com/your-username/your-repo/issues)
3. 创建新的 Issue 描述问题
4. 联系维护者

## 🎉 致谢

感谢以下开源项目：
- [Next.js](https://nextjs.org/)
- [Prisma](https://prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

**开始使用潮玩盲盒库存管理系统，让库存管理变得简单高效！** 📦✨