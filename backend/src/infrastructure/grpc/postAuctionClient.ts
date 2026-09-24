import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PROTO_PATH = path.resolve(__dirname, './proto/post_auction.proto')

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})

const proto = grpc.loadPackageDefinition(packageDefinition) as any

const POST_AUCTION_SERVICE_URL = process.env.POST_AUCTION_SERVICE_URL ?? 'localhost:50051'

const client = new proto.postauction.PostAuctionService(
  POST_AUCTION_SERVICE_URL,
  grpc.credentials.createInsecure()
)

export interface NotifyAuctionClosedInput {
  auctionId: string
  auctionTitle: string
  winnerId: string
  winnerUsername: string
  finalPrice: number
}

export function notifyAuctionClosed(input: NotifyAuctionClosedInput): Promise<void> {
  return new Promise((resolve) => {
    client.NotifyAuctionClosed(
      input,
      { deadline: Date.now() + 2000 },
      (error: grpc.ServiceError | null) => {
        if (error) {
          console.error(
            `[grpc] Falha ao notificar serviço de pós-leilão (leilão ${input.auctionId}):`,
            error.message
          )
        }
        // Resolve sempre — mesmo com erro. O leilão já fechou antes desta
        // chamada; uma falha aqui não pode reverter ou travar isso.
        resolve()
      }
    )
  })
}