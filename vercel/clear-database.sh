#!/bin/bash

echo "正在清空数据库..."

# 删除数据库文件
rm -f db/custom.db
rm -f prisma/db/custom.db

echo "数据库文件已删除"

# 重新生成数据库
echo "正在重新创建数据库..."
npm run db:push

echo "数据库已重置完成！"

# 生成 Prisma 客户端
echo "正在生成 Prisma 客户端..."
npm run db:generate

echo "所有操作完成！"