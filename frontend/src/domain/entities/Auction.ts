export type AuctionCategory =
  | 'Eletrônicos'
  | 'Veículos'
  | 'Móveis'
  | 'Instrumentos Musicais'
  | 'Vestuário'
  | 'Esportes'
  | 'Outros'

export const AUCTION_CATEGORIES: AuctionCategory[] = [
  'Eletrônicos',
  'Veículos',
  'Móveis',
  'Instrumentos Musicais',
  'Vestuário',
  'Esportes',
  'Outros',
]

export interface Auction {
  id: string
  title: string
  description: string
  imageUrl: string
  category: AuctionCategory
  currentBid: number
  bidsCount: number
  endsAt: Date
  status: 'open' | 'closed'
  winnerName?: string
}

export function isAuctionClosed(auction: Auction): boolean {
  return auction.status === 'closed' || auction.endsAt.getTime() <= Date.now()
}