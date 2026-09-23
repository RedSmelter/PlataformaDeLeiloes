import type { Bid } from '../entities/Bid'

export interface PlaceBidInput {
  auctionId: string
  amount: number
}

export interface BidRepository {
  getByAuctionId(auctionId: string): Promise<Bid[]>
  placeBid(input: PlaceBidInput): Promise<Bid>
}
