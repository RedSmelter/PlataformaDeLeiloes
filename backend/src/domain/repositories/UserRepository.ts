import type { User } from '../entities/User.js'

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>
  create(user: Omit<User, 'id' | 'createdAt'>): Promise<User>
}