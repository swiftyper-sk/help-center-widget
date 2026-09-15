import { ChatSource } from '@/types/Chat.ts'

export const CITE_SCHEME = '#cite-'

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
const PRODUCT_ID_MARKERS = new RegExp(
    '\\s?[\\[(](?:\\s*(?:id|ID)\\s*:\\s*)?' +
        UUID +
        '(?:\\s*[,;]\\s*' +
        UUID +
        ')*\\s*[\\])]',
    'g'
)
const BARE_PRODUCT_ID = new RegExp('\\s?\\b' + UUID + '\\b', 'g')

export const hideProductIds = (content: string): string =>
    content.replace(PRODUCT_ID_MARKERS, '').replace(BARE_PRODUCT_ID, '')

export const citationsToLinks = (
    content: string,
    sources: ChatSource[]
): string => {
    const known = new Set(sources.map((s) => s.index))
    const seen = new Set<number>()
    return content.replace(
        /( ?)\[([\d\s,;–-]+)\]/g,
        (match, space: string, group: string) => {
            const numbers: number[] = []
            for (const part of group.split(/[,;\s]+/)) {
                if (!part) continue
                const span = part.match(/^(\d{1,2})\s*[–-]\s*(\d{1,2})$/)
                if (span) {
                    const a = Number(span[1])
                    const b = Number(span[2])
                    for (let n = Math.min(a, b); n <= Math.max(a, b); n++)
                        numbers.push(n)
                } else if (/^\d{1,2}$/.test(part)) {
                    numbers.push(Number(part))
                } else {
                    return match
                }
            }
            if (!numbers.length) return match
            const fresh = numbers.filter((n) => known.has(n) && !seen.has(n))
            fresh.forEach((n) => seen.add(n))
            if (!fresh.length) return ''
            return (
                space + fresh.map((n) => `[${n}](${CITE_SCHEME}${n})`).join('')
            )
        }
    )
}
