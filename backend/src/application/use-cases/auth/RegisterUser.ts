import bcrypt from 'bcrypt'
import type { UserRepository } from '../../../domain/repositories/UserRepository.js'
import type { User } from '../../../domain/entities/User.js'

interface RegisterUserInput {
  username: string
  email: string
  password: string
}

export class RegisterUser {
  constructor(private userRepository: UserRepository) {}

  async execute(input: RegisterUserInput): Promise<Omit<User, 'passwordHash'>> {
    const existing = await this.userRepository.findByEmail(input.email)
    if (existing) {
      throw new Error('E-mail já cadastrado')
    }

    const passwordHash = await bcrypt.hash(input.password, 10)

    const user = await this.userRepository.create({
      username: input.username,
      email: input.email,
      passwordHash,
    })

    const { passwordHash: _discard, ...userWithoutPassword } = user
    return userWithoutPassword
  }
}