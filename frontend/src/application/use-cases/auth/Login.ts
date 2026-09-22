import type { UserRepository, LoginCredentials, LoginResult } from '../../../domain/repositories/UserRepository'

export class Login {
  private userRepository: UserRepository

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository
  }

  execute(credentials: LoginCredentials): Promise<LoginResult> {
    return this.userRepository.login(credentials)
  }
}