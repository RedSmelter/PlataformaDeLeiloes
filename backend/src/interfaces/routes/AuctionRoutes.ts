import { Router } from 'express'
import { AuctionController } from '../controllers/AuctionController.js'
import { BidController } from '../controllers/BidController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = Router()
const auctionController = new AuctionController()
const bidController = new BidController()

router.get('/', (req, res) => auctionController.index(req, res))
router.get('/:id', (req, res) => auctionController.show(req, res))
router.post('/', authMiddleware, (req, res) => auctionController.create(req, res))
router.delete('/:id', authMiddleware, (req, res) => auctionController.remove(req, res))

router.get('/:id/bids', (req, res) => bidController.index(req, res))
router.post('/:id/bids', authMiddleware, (req, res) => bidController.create(req, res))

export default router