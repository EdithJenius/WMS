# 快速修复 DATABASE_URL 错误

## 问题分析
您遇到的错误是因为系统找不到 `DATABASE_URL` 环境变量。这通常发生在以下情况：

1. 不在正确的项目目录中
2. `.env` 文件不存在或配置错误
3. 数据库目录结构不正确

## 快速解决方案

### 步骤1：确认您在正确的目录中

**Windows 用户：**
```cmd
cd D:\Work\Sys\wss
```

**或者检查您当前的位置：**
```cmd
cd
```

### 步骤2：创建 .env 文件

**在项目根目录创建 .env 文件，内容如下：**
```
# Database
DATABASE_URL="file:./db/custom.db"
```

**创建方法：**
1. 打开记事本
2. 复制上面的内容
3. 保存为 `.env` 文件（注意：文件名就是 `.env`，没有后缀）
4. 保存在项目根目录

### 步骤3：创建数据库目录

**在项目根目录创建 `db` 文件夹：**
```cmd
mkdir db
```

### 步骤4：运行命令

**现在在项目根目录运行：**
```cmd
npx prisma db push
```

### 步骤5：验证成功

如果成功，您会看到类似这样的输出：
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": SQLite database "custom.db" at "file:./db/custom.db"

🚀  Your database is now in sync with your Prisma schema. Done in 309ms
```

## 如果还是不行，尝试这个方法

### 方法A：直接在命令中设置环境变量

```cmd
set DATABASE_URL="file:./db/custom.db"
npx prisma db push
```

### 方法B：使用绝对路径

修改 `.env` 文件为：
```
# Database
DATABASE_URL="file:/D:/Work/Sys/wss/db/custom.db"
```

### 方法C：检查文件结构

确保您的项目结构是这样的：
```
D:\Work\Sys\wss\
├── .env
├── db\
│   └── custom.db
├── prisma\
│   └── schema.prisma
├── package.json
└── 其他文件...
```

## 完整的一键命令

如果您想要一个快速的方法，可以尝试这个：

```cmd
cd D:\Work\Sys\wss && echo # Database > .env && echo DATABASE_URL="file:./db/custom.db" >> .env && mkdir db 2>nul && set DATABASE_URL="file:./db/custom.db" && npx prisma db push
```

这个命令会：
1. 切换到正确的目录
2. 创建 .env 文件
3. 创建 db 目录
4. 设置环境变量
5. 运行 Prisma

## 常见问题

### Q: 我看到 "access denied" 错误
A: 确保您有权限在目录中创建文件和文件夹。尝试以管理员身份运行命令提示符。

### Q: 我看到 "command not found" 错误
A: 确保 Node.js 和 npm 已正确安装。运行 `node --version` 和 `npm --version` 检查。

### Q: 数据库文件已经存在但还是报错
A: 尝试删除现有的数据库文件，然后重新运行命令：
```cmd
del db\custom.db
npx prisma db push
```

### Q: 我使用的是 PowerShell 而不是 CMD
A: 在 PowerShell 中，设置环境变量的命令不同：
```powershell
$env:DATABASE_URL = "file:./db/custom.db"
npx prisma db push
```

## 联系支持

如果以上方法都无法解决问题，请提供以下信息：
1. 您的操作系统版本
2. 您使用的命令行工具（CMD、PowerShell、Git Bash等）
3. 完整的错误信息
4. 您当前的工作目录（运行 `cd` 命令的结果）