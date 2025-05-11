import React from 'react'
import fbt from 'fbt'
import { ChevronRight } from 'lucide-react'
import Link from '@/components/Link.tsx'
import { Article } from '@/types/Article.ts'
import { useConfigurationContext } from '@/contexts/ConfigurationContext.ts'

type PopularArticlesProps = {
    articles: Article[]
}

const PopularArticles: React.FC<PopularArticlesProps> = ({ articles }) => {
    const { configuration } = useConfigurationContext()!

    return (
        <div className="w-full mx-auto shadow-lg shadow-gray-900/5 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 px-5 py-4">
            <div className="flex flex-col gap-3">
                <h3 className="font-bold text-gray-900 dark:text-gray-200">
                    {fbt('Popular Articles', 'Title in the home page')}
                </h3>
                <div className="flex flex-col gap-4">
                    {articles.map((article) => (
                        <Link
                            key={`article_${article.id}`}
                            to={`/article/${article.id}`}
                            className="flex items-center justify-between rounded hover:cursor-pointer text-slate-700 dark:text-slate-100 gap-2 hover:underline"
                            role="button"
                        >
                            <span className="underline-offset-2 leading-6 ltr:text-left rtl:text-right text-base">
                                {article.title}
                            </span>
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    ))}
                </div>
                <div>
                    <Link
                        to="/categories"
                        className="font-medium text-blue-500 inline-flex"
                        style={{
                            color: configuration.color,
                        }}
                    >
                        <span>
                            {fbt(
                                'View all articles',
                                'Link/button: View all articles'
                            )}
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
export default PopularArticles
