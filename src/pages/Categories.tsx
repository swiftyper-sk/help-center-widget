import React from 'react'
import { ChevronRight } from 'lucide-react'
import Link from '@/components/Link'
import Loader from '@/components/Loader'
import useFetchCategories from '@/hooks/useFetchCategories'
import Tabs from '@/components/Tabs.tsx'

const Categories: React.FC = () => {
    const { categories, loading, error } = useFetchCategories()

    if (loading) {
        return <Loader />
    }

    if (error) {
        throw error
    }

    return (
        <div className="max-w-5xl w-full flex flex-col flex-grow mx-auto gap-6">
            <Tabs tab="articles" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <section className="flex flex-col w-full h-full lg:container">
                    {categories.map((category) => (
                        <div
                            className="flex flex-col gap-8 h-full "
                            key={`category_${category.id}`}
                        >
                            <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col items-start gap-1">
                                    <div className="flex flex-row items-center gap-2">
                                        <h3 className="text-xl text-slate-800 dark:text-slate-50 font-semibold leading-relaxed hover:cursor-pointer hover:underline ">
                                            <Link
                                                to={`/category/${category.id}`}
                                            >
                                                {category.name}
                                            </Link>
                                        </h3>
                                    </div>
                                    {category.description && (
                                        <span className="text-base text-slate-600 dark:text-slate-400">
                                            {category.description}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 flex-grow">
                                {category.articles.map((article) => (
                                    <Link
                                        key={`article_${article.id}`}
                                        className="leading-7 text-slate-700 dark:text-slate-100"
                                        to={`/article/${article.id}`}
                                    >
                                        <div className="flex justify-between hover:cursor-pointer items-start py-1 rounded-lg gap-6 hover:underline">
                                            {article.title}
                                            <span className="flex items-center font-normal mt-1.5">
                                                <ChevronRight className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    )
}

export default Categories
