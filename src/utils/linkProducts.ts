import { ChatProduct } from '@/types/Chat.ts'
import { productAnchorId } from '@/components/chat/ProductCards.tsx'

const escapeRegExp = (text: string) =>
    text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const linkProducts = (
    content: string,
    products: ChatProduct[],
    messageId: string
): string => {
    if (!products.length) return content
    const sorted = [...products].sort((a, b) => b.name.length - a.name.length)
    const parts = content.split(/(\[[^\]]*\]\([^)]*\))/g)
    return parts
        .map((part, index) => {
            if (index % 2 === 1) return part
            let text = part
            for (const product of sorted) {
                const href =
                    product.productUrl ||
                    `#${productAnchorId(messageId, product.id)}`
                const re = new RegExp(
                    `(^|[^\\w\\[])(\\*{0,2})(${escapeRegExp(
                        product.name
                    )})(\\*{0,2})`,
                    'gi'
                )
                text = text.replace(
                    re,
                    (_m, before, open, name, close) =>
                        `${before}${open}[${name}](${href})${close}`
                )
            }
            return text
        })
        .join('')
}
