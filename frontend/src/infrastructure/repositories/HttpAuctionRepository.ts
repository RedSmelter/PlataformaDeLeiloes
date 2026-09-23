import { apiGet, apiPost, apiDelete, ApiError } from '../http/api'
import type { AuctionRepository, CreateAuctionInput } from '../../domain/repositories/AuctionRepository'
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
  bidsCount: number
}

function mapToAuction(row: AuctionApiResponse): Auction {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.imageUrl ?? 'https://placehold.co/600x400?text=Leilao',
    category: row.category,
    currentBid: row.currentPrice,
    bidsCount: row.bidsCount,
    endsAt: new Date(row.endsAt),
    status: row.status,
  }
}

export class HttpAuctionRepository implements AuctionRepository {
  async getAll(): Promise<Auction[]> {
    const rows = await apiGet<AuctionApiResponse[]>('/auctions')
    return rows.map(mapToAuction)
  }

  async getById(id: string): Promise<Auction | null> {
    try {
      const row = await apiGet<AuctionApiResponse>(`/auctions/${id}`)
      return mapToAuction(row)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        return null
      }
      throw err
    }
  }

  async create(input: CreateAuctionInput): Promise<Auction> {
    const row = await apiPost<AuctionApiResponse>('/auctions', {
      title: input.title,
      description: input.description,
      category: input.category,
      startingPrice: input.startingPrice,
      endsAt: input.endsAt.toISOString(),
    })
    return mapToAuction(row)
  }

  async remove(id: string): Promise<void> {
    await apiDelete(`/auctions/${id}`)
  }
}