import type { UserRepository, RegisterCredentials } from '../../../domain/repositories/UserRepository'
import type { User } from '../../../domain/entities/User'

export class Register {
  private userRepository: UserRepository

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository
  }

  execute(credentials: RegisterCredentials): Promise<User> {
    return this.userRepository.register(credentials)
  }
}