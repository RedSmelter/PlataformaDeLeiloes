import { pool } from '../database/postgres.js'
import type { BidRepository, CreateBidInput } from '../../domain/repositories/BidRepository.js'
import type { Bid } from '../../domain/entities/Bid.js'
import { AuctionNotFoundError, AuctionClosedError, BidTooLowError } from '../../domain/errors/AuctionErrors.js'

function mapRow(row: any): Bid {
  return {
    id: row.id,
    auctionId: row.auction_id,
    userId: row.user_id,
    username: row.username,
    amount: Number(row.amount),
    createdAt: row.created_at,
  }
}

export class PostgresBidRepository implements BidRepository {
  async findByAuctionId(auctionId: string): Promise<Bid[]> {
    const result = await pool.query(
      `SELECT bids.*, users.username
       FROM bids
       JOIN users ON users.id = bids.user_id
       WHERE bids.auction_id = $1
       ORDER BY bids.created_at DESC`,
      [auctionId]
    )
    return result.rows.map(mapRow)
  }

  async placeBid(input: CreateBidInput): Promise<Bid> {
    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      const auctionResult = await client.query(
        'SELECT current_price, status, ends_at FROM auctions WHERE id = $1 FOR UPDATE',
        [input.auctionId]
      )

      if (auctionResult.rows.length === 0) {
        throw new AuctionNotFoundError()
      }

      const auction = auctionResult.rows[0]
      const isClosed =
        auction.status === 'closed' || new Date(auction.ends_at).getTime() <= Date.now()

      if (isClosed) {
        throw new AuctionClosedError()
      }

      if (input.amount <= Number(auction.current_price)) {
        throw new BidTooLowError()
      }

      const bidResult = await client.query(
        `INSERT INTO bids (auction_id, user_id, amount)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [input.auctionId, input.userId, input.amount]
      )

      const userResult = await client.query('SELECT username FROM users WHERE id = $1', [
        input.userId,
      ])

      await client.query('UPDATE auctions SET current_price = $1 WHERE id = $2', [
        input.amount,
        input.auctionId,
      ])

      await client.query('COMMIT')

      return mapRow({ ...bidResult.rows[0], username: userResult.rows[0].username })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
}