import { createContext, useContext } from 'react'
import SwiftyperService from '@/services/SwiftyperService'

export const UserServiceContext = createContext<SwiftyperService | null>(null)

export const useSwiftyperServiceContext = () => useContext(UserServiceContext)
