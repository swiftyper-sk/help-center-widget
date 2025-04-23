import React from 'react'
import fbt from 'fbt'
import Link from '@/components/Link'
import { Article } from '@/types/Article'
import highlightClass from '@/utils/highlightClass'
import formatDate from '@/utils/formatDate'

type SearchResultsProps = {
    results: Article[]
    loading: boolean
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, loading }) => {
    if (loading) {
        return (
            <div className="space-y-6 w-full h-full">
                <div className="space-y-2 animate-pulse">
                    <div className="h-5 bg-slate-300 dark:bg-zinc-800 rounded w-4/5"></div>
                    <div className="h-5 bg-slate-300 dark:bg-zinc-800 rounded"></div>
                    <div className="h-5 bg-slate-300 dark:bg-zinc-800 rounded w-3/5"></div>
                </div>
                <div className="space-y-2 animate-pulse">
                    <div className="h-5 bg-slate-300 dark:bg-zinc-800 rounded w-2/5"></div>
                </div>
            </div>
        )
    }

    if (results.length > 0) {
        return (
            <>
                {results.map((article) => (
                    <div key={`article_${article.id}`} className="group">
                        <Link
                            className="px-0 py-1 text-slate-800 dark:text-slate-50 flex justify-between content-center hover:cursor-pointer"
                            to={`/article/${article.id}`}
                        >
                            <div className="flex flex-col gap-5">
                                <div className="flex flex-col gap-1">
                                    <h3
                                        className="text-lg text-slate-900 tracking-[0.28px] dark:text-slate-50 font-semibold group-hover:underline"
                                        dangerouslySetInnerHTML={{
                                            __html: highlightClass(
                                                article.title
                                            ),
                                        }}
                                    />
                                    <p
                                        className="text-base font-normal text-slate-600 dark:text-slate-200 line-clamp-1 break-all"
                                        dangerouslySetInnerHTML={{
                                            __html: highlightClass(
                                                article.short_text ||
                                                    article.full_text
                                            ),
                                        }}
                                    />
                                </div>
                                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium flex items-center">
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
                        </Link>
                    </div>
                ))}
            </>
        )
    }

    return (
        <>
            <h3 className="text-lg text-slate-900 tracking-[0.28px] dark:text-slate-50 font-semibold">
                {fbt('No results found', 'header for empty state')}
            </h3>
            <p className="text-base font-normal text-slate-600 dark:text-slate-200">
                {fbt(
                    "We couldn't find any articles matching your search.",
                    'description for empty state'
                )}
            </p>
        </>
    )
}

export default SearchResults
