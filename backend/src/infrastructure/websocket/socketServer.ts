import { Server } from 'socket.io'
import type { Server as HttpServer } from 'http'

let io: Server | null = null

export function createSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: '*' },
  })
  return io
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.IO não foi inicializado')
  }
  return io
}