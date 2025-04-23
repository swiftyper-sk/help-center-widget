import { useState, useEffect } from 'react'
import { Article as ArticleType } from '@/types/Article'
import { useSwiftyperServiceContext } from '@/contexts/SwiftyperServiceContext'

type UseFetchArticleResult = {
    article: ArticleType | null
    loading: boolean
    error: Error | null
}

export const useFetchArticle = (
    id: string | undefined,
    params: { locale?: string } = {}
): UseFetchArticleResult => {
    const swiftyperService = useSwiftyperServiceContext()!
    const [article, setArticle] = useState<ArticleType | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const fetchArticle = async () => {
            if (!id) return

            setLoading(true)
            setError(null)

            try {
                const fetchedArticle = await swiftyperService.article(
                    id,
                    params
                )
                setArticle(fetchedArticle)
            } catch (err) {
                setError(err as Error)
            } finally {
                setLoading(false)
            }
        }

        fetchArticle()
    }, [id, params, swiftyperService])

    return { article, loading, error }
}
