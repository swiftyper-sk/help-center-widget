import React from 'react'
import { ChevronsUpDown, Info } from 'lucide-react'
import fbt from 'fbt'
import { useConfigurationContext } from '@/contexts/ConfigurationContext.ts'
import { useSwiftyperContext } from '@/contexts/SwiftyperContext.ts'

type LocaleSelectorProps = {
    availableLocales: string[]
}

const LocaleSelector: React.FC<LocaleSelectorProps> = ({
    availableLocales,
}) => {
    const {
        configuration: { locales },
    } = useConfigurationContext()!
    const { setArticleLocale, articleLocale } = useSwiftyperContext()!

    const LocaleSelect = (
        <select
            className="border appearance-none border-gray-300 text-slate-800 text-sm rounded-lg pl-3 pr-8 py-2 bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:placeholder-gray-400 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            onChange={(e) => setArticleLocale(e.target.value)}
            value={articleLocale || ''}
        >
            <option value="" disabled>
                {fbt('Select a language', 'Placeholder for language selector')}
            </option>
            {availableLocales.map((locale) => (
                <option key={locale} value={locale}>
                    {locales[locale]}
                </option>
            ))}
        </select>
    )

    return (
        <div className="flex max-w-5xl mx-auto w-full gap-2.5 shadow-lg shadow-gray-900/5 rounded-xl border border-yellow-500/20 bg-yellow-50/50 p-4 text-sm/6 text-yellow-900 dark:border-yellow-500/30 dark:bg-yellow-500/5 dark:text-yellow-200">
            <Info className="h-5 w-5 flex-shrink-0 text-yellow-500 dark:text-yellow-400" />
            <div>
                <p>
                    {fbt(
                        'This help content is not available in your language. Please choose from one of our supported languages:',
                        'Shown to help center users in an unsupported locale'
                    )}
                </p>
                <div className="relative inline-block mt-2">
                    {LocaleSelect}
                    <ChevronsUpDown className="h-4 w-4 ml-1 absolute top-0 bottom-0 my-auto right-2.5 text-gray-400" />
                </div>
            </div>
        </div>
    )
}

export default LocaleSelector
