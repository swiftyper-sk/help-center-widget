export type ChatSource = {
    index: number
    title: string
    url: string | null
}

export type ChatContact = {
    email?: string | null
    phone?: string | null
    openingHours?: string | null
    storeName?: string
    text: string
}

export type ChatHandoff = ChatContact & {
    stage: 'ask_contact' | 'done'
    requestId?: string
    customerContact?: string | null
}

export type ChatProduct = {
    id: string
    name: string
    description: string
    price: number
    currency: string
    originalPrice?: number | null
    brand: string
    category: string
    imageUrl: string | null
    productUrl?: string | null
    inStock: boolean
    availability: 'in_stock' | 'presale' | 'out_of_stock'
    isOnSale: boolean
    salePercentage?: number | null
    itemType?: 'product' | 'service'
    priceUnit?: string | null
    rating?: number
}

export type ChatMessage = {
    id: string
    content: string
    isBot: boolean
    type: 'text' | 'product' | 'handoff' | 'ended'
    ended?: boolean
    timestamp: string
    products?: ChatProduct[]
    extraData?: {
        sources?: ChatSource[]
        handoff?: ChatHandoff
        contact?: ChatContact
    }
}

export type ChatStreamEvent =
    | { type: 'start'; sessionId: string }
    | { type: 'status'; tool: string | null; kind: string }
    | { type: 'ack'; text: string }
    | { type: 'token'; text: string }
    | { type: 'done'; response: ChatMessage }
    | { type: 'error'; message: string }
