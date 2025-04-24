import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSwiftyperContext } from '@/contexts/SwiftyperContext.ts'
import Breadcrumb from '@/components/Breadcrumb'
import Loader from '@/components/Loader'
import LocaleSelector from '@/components/LocaleSelector.tsx'
import { useFetchArticle } from '@/hooks/useFetchArticle'
import formatDate from '@/utils/formatDate'
import fbt from 'fbt'

const Article: React.FC = () => {
    const swiftyper = useSwiftyperContext()!
    const { id } = useParams<{ id: string }>()
    const [fetchOptions, setFetchOptions] = useState({})
    const { article, loading, error } = useFetchArticle(id, fetchOptions)

    useEffect(() => {
        if (!swiftyper.articleLocale) return

        setFetchOptions({ locale: swiftyper.articleLocale })
    }, [swiftyper.articleLocale])

    if (error) {
        throw error
    }

    if (loading || !article) {
        return <Loader />
    }

    return (
        <>
            <div className="max-w-5xl mx-auto space-y-4 w-full pb-4">
                <Breadcrumb category={article.category} />
                <h1 className="text-3xl font-semibold leading-normal md:tracking-normal md:text-4xl text-slate-900 dark:text-white">
                    {article.title}
                </h1>
                <div className="flex flex-col items-start justify-between w-full md:flex-row md:items-center">
                    <div className="flex items-start space-x-1">
                        <span className="flex items-center text-base font-medium text-slate-600 dark:text-slate-400">
                            {fbt(
                                'Last updated on ' +
                                    fbt.param(
                                        'date',
                                        formatDate(article.updated_at)
                                    ),
                                'Text for last updated date'
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {article.locale !== swiftyper.locale && (
                <LocaleSelector availableLocales={article.locales} />
            )}

            <div className="flex max-w-5xl w-full mx-auto">
                <article
                    id="cw-article-content"
                    className="flex-grow flex-2 mx-auto text-slate-800 dark:text-slate-50 text-lg max-w-5xl break-words w-full py-4"
                >
                    {article.full_text}
                </article>
            </div>
        </>
    )
}

export default Article
