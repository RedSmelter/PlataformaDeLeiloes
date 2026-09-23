import type { Auction } from '../entities/Auction'

export interface AuctionRepository {
  getAll(): Promise<Auction[]>
}