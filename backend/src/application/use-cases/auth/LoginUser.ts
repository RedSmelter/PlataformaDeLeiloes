import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type { UserRepository } from '../../../domain/repositories/UserRepository.js'

interface LoginUserInput {
  email: string
  password: string
}

interface LoginUserOutput {
  token: string
  user: {
    id: string
    username: string
    email: string
  }
}

export class LoginUser {
  constructor(private userRepository: UserRepository) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const user = await this.userRepository.findByEmail(input.email)
    if (!user) {
      throw new Error('Credenciais inválidas')
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash)
    if (!passwordMatches) {
      throw new Error('Credenciais inválidas')
    }

    const token = jwt.sign(
      { sub: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '2h' }
    )

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    }
  }
}