import { apiGet } from '../http/api'
import type { AuctionRepository } from '../../domain/repositories/AuctionRepository'
import type { Auction, AuctionCategory } from '../../domain/entities/Auction'

interface AuctionApiResponse {
  id: string
  sellerId: string
  title: string
  description: string
  imageUrl: string | null
  category: AuctionCategory
  startingPrice: number
  currentPrice: number
  endsAt: string
  status: 'open' | 'closed'
  winnerId: string | null
  createdAt: string
}

function mapToAuction(row: AuctionApiResponse): Auction {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.imageUrl ?? 'https://placehold.co/600x400?text=Leilao',
    category: row.category,
    currentBid: row.currentPrice,
    bidsCount: 0, // backend ainda não devolve a contagem de lances na listagem — próximo passo
    endsAt: new Date(row.endsAt),
    status: row.status,
  }
}

export class HttpAuctionRepository implements AuctionRepository {
  async getAll(): Promise<Auction[]> {
    const rows = await apiGet<AuctionApiResponse[]>('/auctions')
    return rows.map(mapToAuction)
  }
}