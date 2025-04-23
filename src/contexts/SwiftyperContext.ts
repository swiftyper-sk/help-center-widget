import { createContext, useContext } from 'react'

type SwiftyperContextType = {
    token: string | null
    locale: string
    articleLocale: string | undefined
    setArticleLocale: (locale: string | undefined) => void
}

export const SwiftyperContext = createContext<SwiftyperContextType | null>(null)

export const useSwiftyperContext = () => useContext(SwiftyperContext)
