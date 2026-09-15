// eslint-disable-next-line
// @ts-ignore
import { Swiftyper } from 'swiftyper-node'
import { AsyncCacheAdapter } from './AsyncCacheAdapter'
import { Category } from '@/types/Category.ts'
import { Article } from '@/types/Article.ts'
import { Configuration } from '@/types/Configuration.ts'
import { ChatMessage, ChatStreamEvent } from '@/types/Chat.ts'

export default class SwiftyperService {
    private readonly client: Swiftyper
    private readonly cache: AsyncCacheAdapter
    public locale: null | string = null

    constructor(client: Swiftyper) {
        this.client = client
        this.cache = new AsyncCacheAdapter()
    }

    private invoke([ns, method]: [string, string], ...params: any[]) {
        const service = this.client[ns]
        return service[method].bind(service)(...params)
    }

    proxy<T>([ns, method]: [string, string], ...params: any[]): Promise<T> {
        const service = this.client[ns]
        const factory = this.cache.wrap(
            [ns, method].join('.'),
            service[method].bind(service)
        )

        return factory(...params)
    }

    call<T>(route: [string, string], ...params: any[]): Promise<T> {
        return this.invoke(route, ...params)
    }

    callStream<T>(route: [string, string], ...params: any[]): AsyncIterable<T> {
        return this.invoke(route, ...params)
    }

    configuration() {
        return this.proxy<Configuration>(['helpCenter', 'configuration'], {
            locale: this.locale,
        })
    }

    handoffContact(requestId: string, contact: string, locale: string) {
        return this.call<ChatMessage>(
            ['helpCenterChat', 'contact'],
            requestId,
            {
                contact,
                locale,
            }
        )
    }

    streamChat(
        data: { message: string; session_id: string; locale: string },
        signal?: AbortSignal // todo
    ) {
        return this.callStream<ChatStreamEvent>(
            ['helpCenterChat', 'stream'],
            data
        )
    }

    handoffSkip(requestId: string, locale: string) {
        return this.call<ChatMessage>(['helpCenterChat', 'skip'], requestId, {
            locale,
        })
    }

    handoff(
        session_id: string,
        data: {
            locale: string
            contact: string
            keep_open: boolean
            reason: string
        }
    ) {
        return this.call<ChatMessage>(
            ['helpCenterChat', 'handoff'],
            session_id,
            data
        )
    }

    saveFeedback(sessionId: string, rating: number) {
        return this.call<{ message: string }>(
            ['helpCenterChat', 'feedback'],
            sessionId,
            {
                rating,
            }
        )
    }

    endSession(sessionId: string, locale: string) {
        return this.call<{ message: string; contact?: unknown }>(
            ['helpCenterChat', 'end'],
            sessionId,
            {
                locale,
                reason: 'user',
            }
        )
    }

    contact(data: { name: string; email: string; message: string }) {
        return this.call(['helpCenter', 'contact'], data)
    }

    category(id: string) {
        return this.proxy<Category>(['helpCenterCategories', 'detail'], id, {
            locale: this.locale,
        })
    }

    categories(query = '') {
        return this.proxy<Category[]>(['helpCenterCategories', 'query'], {
            query,
            locale: this.locale,
            include_articles: true,
        })
    }

    popularArticles() {
        return this.proxy<Article[]>(['helpCenterArticles', 'popular'], {
            locale: this.locale,
        })
    }

    articles(query = '') {
        return this.proxy<Article[]>(['helpCenterArticles', 'query'], {
            query,
            locale: this.locale,
        })
    }

    article(id: string, params: { locale?: string } = {}) {
        return this.proxy<Article>(['helpCenterArticles', 'detail'], id, {
            locale: this.locale,
            ...params,
        })
    }
}
