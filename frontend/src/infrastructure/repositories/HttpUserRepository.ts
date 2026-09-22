import { apiPost } from '../http/api'
import type {
  UserRepository,
  RegisterCredentials,
  LoginCredentials,
  LoginResult,
} from '../../domain/repositories/UserRepository'
import type { User } from '../../domain/entities/User'

export class HttpUserRepository implements UserRepository {
  register(credentials: RegisterCredentials): Promise<User> {
    return apiPost<User>('/auth/register', credentials)
  }

  login(credentials: LoginCredentials): Promise<LoginResult> {
    return apiPost<LoginResult>('/auth/login', credentials)
  }
}