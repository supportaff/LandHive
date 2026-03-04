import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Search from './pages/Search'
import ListingDetail from './pages/ListingDetail'
import PostListing from './pages/PostListing'
import SellerDashboard from './pages/SellerDashboard'
import BuyerDashboard from './pages/BuyerDashboard'
import AdminPanel from './pages/AdminPanel'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import RoleSelect from './pages/RoleSelect'
import { AuthContext } from './hooks/useAuth'

export default function App() {
  const [user, setUser] = useState(null)

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#f8fafc]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/listing/:id" element={<ListingDetail />} />
              <Route path="/post" element={<PostListing />} />
              <Route path="/dashboard/seller" element={<SellerDashboard />} />
              <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/role-select" element={<RoleSelect />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}
