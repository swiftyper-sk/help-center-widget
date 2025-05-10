// eslint-disable-next-line
// @ts-ignore
import { Swiftyper } from 'swiftyper-node'
import { AsyncCacheAdapter } from './AsyncCacheAdapter'

export default class SwiftyperService {
    private client: Swiftyper
    private cache: AsyncCacheAdapter
    private locale: null | string = null

    constructor(client: Swiftyper) {
        this.client = client
        this.cache = new AsyncCacheAdapter()
    }

    proxy(
        [ns, method]: [string, string],
        ...params: any
    ): ReturnType<AsyncCacheAdapter['wrap']> {
        const service = this.client[ns]
        const factory = this.cache.wrap(
            [ns, method].join('.'),
            service[method].bind(service)
        )

        return factory(...params)
    }

    configuration() {
        return this.proxy(['helpCenter', 'configuration'], {
            locale: this.locale,
        })
    }

    category(id: string) {
        return this.proxy(['helpCenterCategories', 'detail'], id, {
            locale: this.locale,
        })
    }

    categories(query = '') {
        return this.proxy(['helpCenterCategories', 'query'], {
            query,
            locale: this.locale,
            include_articles: true,
        })
    }

    popularArticles() {
        return this.proxy(['helpCenterArticles', 'popular'], {
            locale: this.locale,
        })
    }

    articles(query = '') {
        return this.proxy(['helpCenterArticles', 'query'], {
            query,
            locale: this.locale,
        })
    }

    article(id: string, params: { locale?: string } = {}) {
        return this.proxy(['helpCenterArticles', 'detail'], id, {
            locale: this.locale,
            ...params,
        })
    }
}
