import type { Bid } from '../../domain/entities/Bid'

export interface BidApiResponse {
  id: string
  auctionId: string
  userId: string
  username: string
  amount: number
  createdAt: string
}

export function mapToBid(row: BidApiResponse): Bid {
  return {
    id: row.id,
    auctionId: row.auctionId,
    userName: row.username,
    amount: row.amount,
    createdAt: new Date(row.createdAt),
  }
}