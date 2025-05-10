import { useSwiftyperServiceContext } from '@/contexts/SwiftyperServiceContext'
import { useEffect, useState } from 'react'
import { Article } from '@/types/Article'

export default () => {
    const swiftyperService = useSwiftyperServiceContext()!
    const [popularArticles, setPopularArticles] = useState<Article[] | null>(
        null
    )
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const fetchPopularArticles = async () => {
            setLoading(true)
            setError(null)

            try {
                const articles = await swiftyperService.popularArticles()
                setPopularArticles(articles)
            } catch (err: unknown) {
                setError(err as Error)
            } finally {
                setLoading(false)
            }
        }

        fetchPopularArticles()
    }, [swiftyperService])

    return { popularArticles, loading, error }
}
