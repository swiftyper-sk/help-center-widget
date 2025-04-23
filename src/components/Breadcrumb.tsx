import React, { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import Link from './Link'
import extractCategories from '@/utils/extractCategories'
import { Category } from '@/types/Category'
import fbt from 'fbt'

type BreadcrumbProps = {
    category: Category
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ category }) => {
    const [categories, setCategories] = useState<Category[]>([])

    useEffect(() => {
        setCategories(extractCategories(category))
    }, [category])

    return (
        <div className="flex flex-row items-center gap-px mb-6">
            <Link
                className="text-slate-500 dark:text-slate-200 text-sm gap-1 hover:cursor-pointer hover:underline leading-8 font-semibold"
                to="/"
            >
                {fbt('Home', 'Link to the home page')}
            </Link>
            {categories.map((category) => (
                <React.Fragment key={`category_${category.id}`}>
                    <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <Link
                        className="text-slate-500 dark:text-slate-200 text-sm gap-1 whitespace-nowrap hover:cursor-pointer hover:underline leading-8 font-semibold"
                        to={`/category/${category.id}`}
                    >
                        {category.name}
                    </Link>
                </React.Fragment>
            ))}
        </div>
    )
}

export default Breadcrumb
