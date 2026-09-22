import { Navigate, Route, Routes } from 'react-router-dom'

import Login from '../pages/Login'
import Register from '../pages/Register'
import Auctions from '../pages/Auctions'
import AuctionDetails from '../pages/AuctionDetails'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auctions" element={<Auctions />} />
      <Route path="/auctions/:id" element={<AuctionDetails />} />
      <Route path="*" element={<Navigate to="/auctions" replace />} />

      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  )
}

export default AppRoutes