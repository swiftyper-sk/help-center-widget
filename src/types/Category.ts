import { Article } from './Article'

export interface Category {
    id: number
    articles_count: number | null
    articles: Article[]
    parent: Category | null
    object: string
    locale: string
    name: string
    description: string
    created_at: number
    updated_at: number
}
