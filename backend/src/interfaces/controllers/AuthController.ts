import type { Request, Response } from 'express'
import { RegisterUser } from '../../application/use-cases/auth/RegisterUser.js'
import { LoginUser } from '../../application/use-cases/auth/LoginUser.js'
import { PostgresUserRepository } from '../../infrastructure/repositories/PostgresUserRepository.js'

const userRepository = new PostgresUserRepository()
const registerUser = new RegisterUser(userRepository)
const loginUser = new LoginUser(userRepository)

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body

      if (!username || !email || !password) {
        return res.status(400).json({ message: 'username, email e password são obrigatórios' })
      }

      const user = await registerUser.execute({ username, email, password })
      return res.status(201).json(user)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao registrar usuário'
      return res.status(400).json({ message })
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({ message: 'email e password são obrigatórios' })
      }

      const result = await loginUser.execute({ email, password })
      return res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login'
      return res.status(401).json({ message })
    }
  }
}