import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middlewares/authMiddleware.js'
import { GetBids } from '../../application/use-cases/bid/GetBids.js'
import { PlaceBid } from '../../application/use-cases/bid/PlaceBid.js'
import { PostgresBidRepository } from '../../infrastructure/repositories/PostgresBidRepository.js'

const bidRepository = new PostgresBidRepository()
const getBids = new GetBids(bidRepository)
const placeBid = new PlaceBid(bidRepository)

export class BidController {
  async index(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params
    if (typeof id !== 'string') {
      return res.status(400).json({ message: 'Parâmetro id inválido' })
    }

    const bids = await getBids.execute(id)
    return res.status(200).json(bids)
  }

  async create(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params
    if (typeof id !== 'string') {
      return res.status(400).json({ message: 'Parâmetro id inválido' })
    }

    try {
      const { amount } = req.body

      if (!amount) {
        return res.status(400).json({ message: 'amount é obrigatório' })
      }

      const bid = await placeBid.execute({
        auctionId: id,
        userId: req.userId!,
        amount: Number(amount),
      })

      return res.status(201).json(bid)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao registrar lance'
      return res.status(400).json({ message })
    }
  }
}