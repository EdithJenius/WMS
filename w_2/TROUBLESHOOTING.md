# 潮玩盲盒库存管理系统 - 问题解决方案

## 问题：DATABASE_URL 环境变量未找到

### 错误信息
```
Error: Prisma schema validation - (get-config wasm)
Error code: P1012
error: Environment variable not found: DATABASE_URL.
```

### 解决方案

#### 方法1：确保在正确的目录中运行命令

1. **切换到项目目录**
   ```bash
   cd /path/to/your/project
   # 或者如果您在 D:\Work\Sys\wss 目录下
   cd D:\Work\Sys\wss
   ```

2. **检查当前目录**
   ```bash
   pwd  # Linux/Mac
   # 或
   cd   # Windows
   ```

#### 方法2：检查 .env 文件

1. **确认 .env 文件存在**
   ```bash
   ls -la .env
   ```

2. **如果 .env 文件不存在，创建它**
   ```bash
   echo "# Database" > .env
   echo 'DATABASE_URL="file:./db/custom.db"' >> .env
   ```

3. **检查 .env 文件内容**
   ```bash
   cat .env
   ```
   应该显示：
   ```
   # Database
   DATABASE_URL="file:./db/custom.db"
   ```

#### 方法3：检查数据库目录结构

1. **确认 db 目录存在**
   ```bash
   ls -la db/
   ```

2. **如果 db 目录不存在，创建它**
   ```bash
   mkdir -p db
   ```

#### 方法4：手动设置环境变量

1. **在命令行中临时设置环境变量**
   ```bash
   # Linux/Mac
   export DATABASE_URL="file:./db/custom.db"
   npx prisma db push

   # Windows (Command Prompt)
   set DATABASE_URL="file:./db/custom.db"
   npx prisma db push

   # Windows (PowerShell)
   $env:DATABASE_URL = "file:./db/custom.db"
   npx prisma db push
   ```

#### 方法5：检查 Prisma 配置

1. **检查 prisma/schema.prisma 文件**
   ```bash
   cat prisma/schema.prisma
   ```

2. **确保 datasource 配置正确**
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

#### 方法6：重新安装依赖

1. **删除 node_modules 和 package-lock.json**
   ```bash
   rm -rf node_modules package-lock.json
   ```

2. **重新安装依赖**
   ```bash
   npm install
   ```

3. **重新生成 Prisma 客户端**
   ```bash
   npx prisma generate
   ```

#### 方法7：检查文件权限

1. **确保 .env 文件有正确的权限**
   ```bash
   chmod 644 .env
   ```

2. **确保 db 目录有写入权限**
   ```bash
   chmod 755 db/
   ```

### 完整的设置步骤

如果您是第一次设置项目，请按照以下步骤：

1. **克隆或下载项目**
   ```bash
   cd D:\Work\Sys\wss
   # 或您的项目目录
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **创建 .env 文件**
   ```bash
   echo "# Database" > .env
   echo 'DATABASE_URL="file:./db/custom.db"' >> .env
   ```

4. **创建 db 目录**
   ```bash
   mkdir -p db
   ```

5. **运行 Prisma 数据库推送**
   ```bash
   npx prisma db push
   ```

6. **启动开发服务器**
   ```bash
   npm run dev
   # 或
   npx tsx server.ts
   ```

### 验证设置

1. **检查数据库文件是否创建**
   ```bash
   ls -la db/custom.db
   ```

2. **测试数据库连接**
   ```bash
   npx prisma studio
   ```
   这应该会打开 Prisma Studio 界面。

### 常见问题

#### Q: 我在 Windows 上运行，路径有问题怎么办？
A: 在 Windows 上，使用正斜杠 `/` 而不是反斜杠 `\`：
```
DATABASE_URL="file:./db/custom.db"
```

#### Q: 我想要使用不同的数据库文件名？
A: 修改 .env 文件中的路径：
```
DATABASE_URL="file:./db/your_database_name.db"
```

#### Q: 我想要使用绝对路径？
A: 可以使用绝对路径：
```
DATABASE_URL="file:/absolute/path/to/your/database.db"
```

#### Q: 环境变量还是不生效？
A: 尝试在命令前直接设置环境变量：
```bash
DATABASE_URL="file:./db/custom.db" npx prisma db push
```

### 联系支持

如果以上方法都无法解决问题，请检查：
1. 您的操作系统版本
2. Node.js 版本 (`node --version`)
3. Prisma 版本 (`npx prisma --version`)
4. 完整的错误信息

然后提供这些信息以获得进一步的帮助。