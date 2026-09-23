import type { Bid } from '../entities/Bid.js'

export interface CreateBidInput {
  auctionId: string
  userId: string
  amount: number
}

export interface BidRepository {
  findByAuctionId(auctionId: string): Promise<Bid[]>
  placeBid(input: CreateBidInput): Promise<Bid>
}