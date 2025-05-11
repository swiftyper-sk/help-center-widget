// eslint-disable-next-line
// @ts-ignore
import { Swiftyper } from 'swiftyper-node'
import { AsyncCacheAdapter } from './AsyncCacheAdapter'
import { Category } from '@/types/Category.ts'
import { Article } from '@/types/Article.ts'
import { Configuration } from '@/types/Configuration.ts'

export default class SwiftyperService {
    private readonly client: Swiftyper
    private readonly cache: AsyncCacheAdapter
    public locale: null | string = null

    constructor(client: Swiftyper) {
        this.client = client
        this.cache = new AsyncCacheAdapter()
    }

    proxy<T>([ns, method]: [string, string], ...params: any[]): Promise<T> {
        const service = this.client[ns]
        const factory = this.cache.wrap(
            [ns, method].join('.'),
            service[method].bind(service)
        )

        return factory(...params)
    }

    configuration() {
        return this.proxy<Configuration>(['helpCenter', 'configuration'], {
            locale: this.locale,
        })
    }

    contact(data: { name: string; email: string; message: string }) {
        return this.proxy(['helpCenter', 'contact'], data)
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
