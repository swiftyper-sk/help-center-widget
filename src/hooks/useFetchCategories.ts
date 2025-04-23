import { useState, useEffect } from 'react'
import { Category } from '@/types/Category'
import { useSwiftyperServiceContext } from '@/contexts/SwiftyperServiceContext'

type UseFetchCategoriesResult = {
    categories: Category[]
    loading: boolean
    error: Error | null
}

export default (): UseFetchCategoriesResult => {
    const swiftyperService = useSwiftyperServiceContext()!
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true)
            setError(null)

            try {
                const fetchedCategories = await swiftyperService.categories()
                setCategories(fetchedCategories)
            } catch (err) {
                setError(err as Error)
            } finally {
                setLoading(false)
            }
        }

        fetchCategories()
    }, [swiftyperService])

    return { categories, loading, error }
}
