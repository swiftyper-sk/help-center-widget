import React from 'react'
import { ExternalLink, Package } from 'lucide-react'
import { ChatProduct } from '@/types/Chat.ts'
import fbt from 'fbt'

export const productAnchorId = (messageId: string, productId: string) =>
    `chat-product-${messageId}-${productId}`

export const formatPrice = (
    value: number,
    currency: string,
    locale: string,
    unit?: string | null
) => {
    let text: string
    try {
        text = new Intl.NumberFormat(locale.replace('_', '-'), {
            style: 'currency',
            currency,
        }).format(value)
    } catch {
        text = `${value.toFixed(2)} ${currency}`
    }
    return unit ? `${text} ${unit}` : text
}

type Props = {
    messageId: string
    products: ChatProduct[]
    currency: string
    locale: string
}

const ProductCards: React.FC<Props> = ({
    messageId,
    products,
    currency,
    locale,
}) => {
    return (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
            {products.map((product) => {
                const body = (
                    <>
                        <div className="h-24 w-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="h-full w-full object-contain"
                                    loading="lazy"
                                />
                            ) : (
                                <Package className="h-8 w-8 text-gray-400" />
                            )}
                        </div>
                        <div className="p-2.5 space-y-1">
                            <div
                                className="text-sm font-semibold leading-tight text-gray-900 dark:text-gray-100 line-clamp-2"
                                title={product.name}
                            >
                                {product.name}
                            </div>
                            {product.brand && (
                                <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                    {product.brand}
                                </div>
                            )}
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                                <span className="text-sm font-bold  text-black dark:text-white">
                                    {formatPrice(
                                        product.price,
                                        product.currency || currency,
                                        locale,
                                        product.priceUnit
                                    )}
                                </span>
                                {product.isOnSale &&
                                    product.originalPrice != null && (
                                        <span className="text-[11px] text-gray-400 line-through">
                                            {formatPrice(
                                                product.originalPrice,
                                                product.currency || currency,
                                                locale
                                            )}
                                        </span>
                                    )}
                            </div>
                            {product.itemType !== 'service' && (
                                <div
                                    className={
                                        product.availability === 'in_stock'
                                            ? 'text-[11px] text-green-600 dark:text-green-400'
                                            : product.availability === 'presale'
                                            ? 'text-[11px] text-yellow-600 dark:text-yellow-400'
                                            : 'text-[11px] text-red-500'
                                    }
                                >
                                    {product.availability === 'in_stock'
                                        ? fbt(
                                              'In stock',
                                              'product availability'
                                          )
                                        : product.availability === 'presale'
                                        ? fbt(
                                              'Pre-sale',
                                              'product availability'
                                          )
                                        : fbt(
                                              'Out of stock',
                                              'product availability'
                                          )}
                                </div>
                            )}
                            {product.productUrl && (
                                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-black dark:text-white">
                                    {fbt('View', 'open the product page')}
                                    <ExternalLink className="h-3 w-3" />
                                </div>
                            )}
                        </div>
                    </>
                )
                const className =
                    'snap-start shrink-0 w-40 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden text-left transition-shadow hover:shadow-md'

                return product.productUrl ? (
                    <a
                        key={product.id}
                        id={productAnchorId(messageId, product.id)}
                        href={product.productUrl}
                        title={product.name}
                        target="_blank"
                        rel="noreferrer"
                        className={className}
                    >
                        {body}
                    </a>
                ) : (
                    <div
                        key={product.id}
                        id={productAnchorId(messageId, product.id)}
                        title={product.name}
                        className={className}
                    >
                        {body}
                    </div>
                )
            })}
        </div>
    )
}

export default ProductCards
