import { Server } from 'socket.io'
import type { Server as HttpServer } from 'http'
import { createClient } from 'redis'
import { createAdapter } from '@socket.io/redis-adapter'

let io: Server | null = null

export async function createSocketServer(httpServer: HttpServer): Promise<Server> {
  io = new Server(httpServer, {
    cors: { origin: '*' },
  })

  const pubClient = createClient({ url: process.env.REDIS_URL ?? 'redis://localhost:6379' })
  const subClient = pubClient.duplicate()

  await Promise.all([pubClient.connect(), subClient.connect()])

  io.adapter(createAdapter(pubClient, subClient))

  console.log('Socket.IO conectado ao Redis Pub/Sub')

  return io
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.IO não foi inicializado')
  }
  return io
}