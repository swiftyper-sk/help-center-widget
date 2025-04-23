import { useSwiftyperServiceContext } from '@/contexts/SwiftyperServiceContext'
import { useEffect, useState } from 'react'
import { Article } from '@/types/Article'

export default (query: string) => {
    const swiftyperService = useSwiftyperServiceContext()!
    const [results, setResults] = useState<Article[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query) {
                setResults([])
                return
            }

            setLoading(true)
            setError(null)

            try {
                const searchResults = await swiftyperService.articles(query)
                setResults(searchResults)
            } catch (err: unknown) {
                setError(err as Error)
            } finally {
                setLoading(false)
            }
        }

        fetchSearchResults()
    }, [query, swiftyperService])

    return { results, loading, error }
}
