import React, { useEffect, useState } from 'react'
import SearchInput from '@/components/SearchInput'
import SearchResults from '@/components/SearchResults.tsx'
import Loader from '@/components/Loader'
import PopularArticles from '@/components/PopularArticles.tsx'
import { useConfigurationContext } from '@/contexts/ConfigurationContext'
import useFetchSearchResults from '@/hooks/useFetchSearchResults'
import useFetchPopularArticles from '@/hooks/useFetchPopularArticles'
import { useSearchParams } from 'react-router-dom'
import Tabs from '@/components/Tabs.tsx'

const Home: React.FC = () => {
    const { configuration } = useConfigurationContext()!
    const [searchParams] = useSearchParams()
    const [query, setQuery] = useState<string>('')

    useEffect(() => {
        setQuery(searchParams.get('query') || '')
    }, [searchParams])

    const {
        popularArticles,
        loading: popularLoading,
        error: popularError,
    } = useFetchPopularArticles()
    const {
        results,
        loading: searchLoading,
        error: searchError,
    } = useFetchSearchResults(query)

    const handleQuery = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setQuery(event.target.value)
    }

    if (popularLoading) {
        return <Loader />
    }

    if (popularError || searchError) {
        throw popularError || searchError
    }

    const introductionText = configuration.introduction_text

    return (
        <div className="max-w-5xl mx-auto w-full pb-4 space-y-6">
            <Tabs tab="articles" />

            {introductionText && (
                <div className="w-full text-lg leading-normal text-gray-600 dark:text-gray-400">
                    {introductionText}
                </div>
            )}

            <SearchInput query={query} onInput={handleQuery} />
            {query ? (
                <SearchResults results={results} loading={searchLoading} />
            ) : (
                popularArticles &&
                popularArticles.length > 0 && (
                    <PopularArticles articles={popularArticles} />
                )
            )}
        </div>
    )
}

export default Home
