import { useState, useEffect } from 'react'
import { Category } from '@/types/Category'
import { useSwiftyperServiceContext } from '@/contexts/SwiftyperServiceContext'

type UseFetchCategoryResult = {
    category: Category | null
    loading: boolean
    error: Error | null
}

export default (id: string | undefined): UseFetchCategoryResult => {
    const swiftyperService = useSwiftyperServiceContext()!
    const [category, setCategory] = useState<Category | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const fetchCategory = async () => {
            if (!id) return

            setLoading(true)
            setError(null)

            try {
                const fetchedCategory = await swiftyperService.category(id)
                setCategory(fetchedCategory)
            } catch (err: unknown) {
                setError(err as Error)
            } finally {
                setLoading(false)
            }
        }

        fetchCategory()
    }, [id, swiftyperService])

    return { category, loading, error }
}
