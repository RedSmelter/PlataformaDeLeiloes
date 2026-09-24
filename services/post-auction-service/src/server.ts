import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import { fileURLToPath } from 'url'
import path from 'path'
import { processAuctionClosed } from './processAuctionClosed.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PROTO_PATH = path.resolve(__dirname, '../proto/post_auction.proto')

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})

const proto = grpc.loadPackageDefinition(packageDefinition) as any

function notifyAuctionClosed(
  call: grpc.ServerUnaryCall<any, any>,
  callback: grpc.sendUnaryData<any>
) {
  const request = call.request

  // Responde na hora — o processamento roda depois, em background,
  // sem o chamador (backend principal) ficar esperando.
  callback(null, { accepted: true })

  processAuctionClosed({
    auctionId: request.auctionId,
    auctionTitle: request.auctionTitle,
    winnerId: request.winnerId,
    winnerUsername: request.winnerUsername,
    finalPrice: request.finalPrice,
  }).catch((error) => {
    console.error('[pos-leilao] Erro inesperado ao processar leilão encerrado:', error)
  })
}

const server = new grpc.Server()

server.addService(proto.postauction.PostAuctionService.service, {
  NotifyAuctionClosed: notifyAuctionClosed,
})

const PORT = process.env.PORT ?? 50051

server.bindAsync(
  `0.0.0.0:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error('Erro ao iniciar servidor gRPC:', error)
      return
    }
    console.log(`Serviço de pós-leilão (gRPC) rodando na porta ${port}`)
  }
)