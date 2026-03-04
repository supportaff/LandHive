import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export const DEMO_USERS = {
  buyer: { id: 'buyer_1', name: 'Arjun Mehta', email: 'arjun@example.com', role: 'buyer', phone: '+91 98765 11111' },
  seller: { id: 'seller_1', name: 'Ramesh Kumar', email: 'ramesh@example.com', role: 'seller', phone: '+91 98765 43210' },
  admin: { id: 'admin_1', name: 'Admin User', email: 'admin@landhive.in', role: 'admin', phone: '+91 99999 00000' },
}
