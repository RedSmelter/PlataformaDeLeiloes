import { Avatar, Typography } from '@mui/material'
import type { Bid } from '../../domain/entities/Bid'

interface BidListProps {
  bids: Bid[]
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function BidList({ bids }: BidListProps) {
  if (bids.length === 0) {
    return (
      <Typography color="text.secondary" className="text-center py-6">
        Nenhum lance ainda. Seja o primeiro!
      </Typography>
    )
  }

  const sortedBids = [...bids].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )

  return (
    <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
      {sortedBids.map((bid) => (
        <div key={bid.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
          <Avatar sx={{ width: 36, height: 36, bgcolor: '#1a3a6b', fontSize: 14 }}>
            {getInitials(bid.userName)}
          </Avatar>

          <div className="flex-1">
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {bid.userName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatTime(bid.createdAt)}
            </Typography>
          </div>

          <Typography variant="body1" sx={{ fontWeight: 700, color: '#1a3a6b' }}>
            {formatCurrency(bid.amount)}
          </Typography>
        </div>
      ))}
    </div>
  )
}

export default BidList