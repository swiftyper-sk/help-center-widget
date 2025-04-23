import React from 'react'
import Link from '@/components/Link'
import { useParams } from 'react-router-dom'
import Breadcrumb from '@/components/Breadcrumb'
import Loader from '@/components/Loader'
import useFetchCategory from '@/hooks/useFetchCategory'
import formatDate from '@/utils/formatDate'
import fbt from 'fbt'

const Category: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const { category, loading, error } = useFetchCategory(id)

    if (loading || !category) {
        return <Loader />
    }

    if (error) {
        throw error
    }

    return (
        <>
            <div className="max-w-5xl mx-auto space-y-4 w-full pb-4">
                <Breadcrumb category={category} />
                <div className="flex justify-start flex-col items-start w-full gap-2">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-wide leading-[52.5px] text-slate-900 dark:text-white">
                            {category.name}
                        </h1>
                    </div>
                    <div className="flex flex-row items-center gap-1">
                        <span className="flex items-center text-base text-slate-600 dark:text-slate-400 font-medium">
                            {fbt(
                                fbt.plural(
                                    'article',
                                    category.articles_count!,
                                    {
                                        showCount: 'yes',
                                    }
                                ),
                                'Number of articles'
                            )}
                        </span>
                    </div>
                </div>
            </div>

            <section className="max-w-5xl w-full mx-auto flex flex-col items-center justify-center flex-grow">
                <div className="w-full flex flex-col gap-6 flex-grow">
                    {category.articles.map((article) => (
                        <div key={`article_${article.id}`} className="group">
                            <Link
                                className="px-0 py-1 text-slate-800 dark:text-slate-50 flex justify-between content-center hover:cursor-pointer"
                                to={`/article/${article.id}`}
                            >
                                <div className="flex flex-col gap-5">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-lg text-slate-900 tracking-[0.28px] dark:text-slate-50 font-semibold group-hover:underline">
                                            {article.title}
                                        </h3>
                                        <p className="text-base font-normal text-slate-600 dark:text-slate-200 line-clamp-1 break-all">
                                            {article.short_text ||
                                                article.full_text}
                                        </p>
                                    </div>
                                    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium flex items-center">
                                        {fbt(
                                            'Last updated on ' +
                                                fbt.param(
                                                    'date',
                                                    formatDate(
                                                        article.updated_at
                                                    )
                                                ),
                                            'Text for last updated date'
                                        )}
                                    </span>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>
        </>
    )
}

export default Category
