import { Category } from './Category'

export type Article = {
    id: number
    category: Category
    object: string
    locale: string
    locales: string[]
    title: string
    short_text: string
    full_text: string
    created_at: number
    updated_at: number
}
