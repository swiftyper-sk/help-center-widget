import { ReactNode, useState } from 'react'
import { SwiftyperContext } from '@/contexts/SwiftyperContext'

type SwiftyperProviderProps = {
    children: ReactNode
    token: string | null
    locale: string
}

export const SwiftyperProvider = ({
    children,
    ...props
}: SwiftyperProviderProps) => {
    const [articleLocale, setArticleLocale] = useState<string | undefined>(
        undefined
    )

    const value = {
        ...props,
        articleLocale,
        setArticleLocale,
    }

    return (
        <SwiftyperContext.Provider value={value}>
            {children}
        </SwiftyperContext.Provider>
    )
}
