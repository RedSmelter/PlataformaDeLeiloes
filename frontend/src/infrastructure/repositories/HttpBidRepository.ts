import { apiGet, apiPost } from '../http/api'
import type { BidRepository, PlaceBidInput } from '../../domain/repositories/BidRepository'
import type { Bid } from '../../domain/entities/Bid'

interface BidApiResponse {
  id: string
  auctionId: string
  userId: string
  username: string
  amount: number
  createdAt: string
}

function mapToBid(row: BidApiResponse): Bid {
  return {
    id: row.id,
    auctionId: row.auctionId,
    userName: row.username,
    amount: row.amount,
    createdAt: new Date(row.createdAt),
  }
}

export class HttpBidRepository implements BidRepository {
  async getByAuctionId(auctionId: string): Promise<Bid[]> {
    const rows = await apiGet<BidApiResponse[]>(`/auctions/${auctionId}/bids`)
    return rows.map(mapToBid)
  }

  async placeBid(input: PlaceBidInput): Promise<Bid> {
    const row = await apiPost<BidApiResponse>(`/auctions/${input.auctionId}/bids`, {
      amount: input.amount,
    })
    return mapToBid(row)
  }
}