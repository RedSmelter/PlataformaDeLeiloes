import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'

export interface AuthenticatedRequest extends Request {
  userId?: string
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não informado' })
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string }
    req.userId = payload.sub
    next()
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado' })
  }
}