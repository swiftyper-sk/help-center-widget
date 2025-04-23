import { Category } from '@/types/Category'

export default function extractCategories(obj: Category): Category[] {
    const results: Category[] = []

    if (obj) {
        results.push(obj)

        if (obj.parent) {
            results.push(...extractCategories(obj.parent))
        }
    }

    return results.reverse()
}
