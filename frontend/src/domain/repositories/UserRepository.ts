import type { User } from '../entities/User'

export interface RegisterCredentials {
  username: string
  email: string
  password: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResult {
  token: string
  user: User
}

export interface UserRepository {
  register(credentials: RegisterCredentials): Promise<User>
  login(credentials: LoginCredentials): Promise<LoginResult>
}