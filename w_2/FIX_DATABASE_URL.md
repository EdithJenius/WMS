# 修复 DATABASE_URL 错误的完整步骤

## 立即解决方案

### 方法1：使用完整命令（推荐）

打开命令提示符（CMD）或 PowerShell，然后运行以下命令：

```cmd
cd D:\Work\Sys\wss
echo # Database > .env
echo DATABASE_URL="file:./db/custom.db" >> .env
mkdir db 2>nul
set DATABASE_URL="file:./db/custom.db"
npx prisma db push
```

### 方法2：手动步骤

1. **打开命令提示符**
   - 按 `Win + R`，输入 `cmd`，回车

2. **切换到项目目录**
   ```cmd
   cd D:\Work\Sys\wss
   ```

3. **创建 .env 文件**
   ```cmd
   echo # Database > .env
   echo DATABASE_URL="file:./db/custom.db" >> .env
   ```

4. **创建数据库目录**
   ```cmd
   mkdir db
   ```

5. **设置环境变量**
   ```cmd
   set DATABASE_URL="file:./db/custom.db"
   ```

6. **运行 Prisma 命令**
   ```cmd
   npx prisma db push
   ```

### 方法3：PowerShell 用户

如果您使用 PowerShell，请运行：

```powershell
cd D:\Work\Sys\wss
"# Database" | Out-File -FilePath ".env" -Encoding UTF8
'DATABASE_URL="file:./db/custom.db"' | Out-File -FilePath ".env" -Encoding UTF8 -Append
New-Item -ItemType Directory -Path "db" -ErrorAction SilentlyContinue
$env:DATABASE_URL = "file:./db/custom.db"
npx prisma db push
```

## 验证是否成功

成功的输出应该类似这样：
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": SQLite database "custom.db" at "file:./db/custom.db"

🚀  Your database is now in sync with your Prisma schema. Done in 309ms

Running generate... (Use --skip-generate to skip the generators)
✔ Generated Prisma Client (v6.12.0) to ./node_modules/@prisma/client in 62ms
```

## 如果还是失败，请检查：

### 1. 确认目录结构
运行以下命令确认文件结构：
```cmd
dir
dir db
dir prisma
type .env
```

应该看到：
- `.env` 文件存在
- `db` 目录存在
- `prisma` 目录存在，里面有 `schema.prisma` 文件

### 2. 检查 Node.js 和 Prisma
```cmd
node --version
npm --version
npx prisma --version
```

### 3. 清理并重试
如果还是不行，尝试清理：
```cmd
rd /s /q node_modules
del package-lock.json
npm install
set DATABASE_URL="file:./db/custom.db"
npx prisma db push
```

## 常见错误和解决方案

### 错误："'npx' is not recognized"
**解决方案：**
```cmd
npm install -g npx
```

### 错误："Access is denied"
**解决方案：**
以管理员身份运行命令提示符

### 错误："The system cannot find the path specified"
**解决方案：**
确保您在正确的目录中：
```cmd
cd D:\Work\Sys\wss
dir
```

### 错误："Database already exists"
**解决方案：**
删除现有数据库并重新创建：
```cmd
del db\custom.db
set DATABASE_URL="file:./db/custom.db"
npx prisma db push
```

## 最后的备选方案

如果以上方法都不行，请尝试使用绝对路径：

1. **修改 .env 文件内容为：**
```
# Database
DATABASE_URL="file:/D:/Work/Sys/wss/db/custom.db"
```

2. **运行命令：**
```cmd
set DATABASE_URL="file:/D:/Work/Sys/wss/db/custom.db"
npx prisma db push
```

## 获取帮助

如果问题仍然存在，请提供：
1. 您的 Windows 版本
2. 您使用的命令行工具（CMD/PowerShell）
3. 完整的错误信息
4. 运行 `dir` 命令的输出

这样我可以为您提供更精确的帮助。