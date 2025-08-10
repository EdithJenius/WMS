import { db } from './db'
import bcrypt from 'bcryptjs'

export async function getUserById(id: string) {
  const user = await db.user.findUnique({
    where: { id }
  })
  
  if (!user) {
    return null
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  }
}

export async function createUser(username: string, email: string, password: string) {
  // 加密密码
  const hashedPassword = await bcrypt.hash(password, 12)

  // 创建用户
  const user = await db.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      role: 'user'
    }
  })

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  }
}