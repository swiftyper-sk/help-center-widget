import { init, IntlVariations, IntlViewerContext } from 'fbt'
import intl from '@/locales/translatedFbts.json'

export const viewerContext: IntlViewerContext = {
    locale: 'en_US',
    GENDER: IntlVariations.GENDER_UNKNOWN,
}

export const initFbt = (): void => {
    init({
        translations: intl,
        hooks: {
            getViewerContext: (): IntlViewerContext => viewerContext,
        },
    })
}

export const changeLocale = (locale: string): void => {
    viewerContext.locale = locale
}
