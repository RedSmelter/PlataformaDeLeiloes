import { pool } from '../database/postgres.js'
import type { UserRepository } from '../../domain/repositories/UserRepository.js'
import type { User } from '../../domain/entities/User.js'

export class PostgresUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT id, username, email, password_hash, created_at FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) return null

    const row = result.rows[0]
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
    }
  }

  async create(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, password_hash, created_at`,
      [user.username, user.email, user.passwordHash]
    )

    const row = result.rows[0]
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
    }
  }
}