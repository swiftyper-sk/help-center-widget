// eslint-disable-next-line
// @ts-ignore
import { Swiftyper } from 'swiftyper-node'

export default class SwiftyperService {
    client!: Swiftyper
    locale: null | string = null

    constructor(client: Swiftyper) {
        this.client = client
    }

    configuration() {
        const { locale } = this

        return this.client.helpCenter.configuration({
            locale,
        })
    }

    category(id: string) {
        const { locale } = this

        return this.client.helpCenterCategories.detail(id, {
            locale,
        })
    }

    categories(query = '') {
        const { locale } = this

        return this.client.helpCenterCategories.query({
            query,
            locale,
            include_articles: true,
        })
    }

    popularArticles() {
        const { locale } = this

        return this.client.helpCenterArticles.popular({
            locale,
        })
    }

    articles(query = '') {
        const { locale } = this

        return this.client.helpCenterArticles.query({
            query,
            locale,
        })
    }

    article(id: string, params: { locale?: string } = {}) {
        const { locale } = this

        return this.client.helpCenterArticles.detail(id, {
            locale,
            ...params,
        })
    }
}
