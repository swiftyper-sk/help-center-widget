import React from 'react'
import Link from '@/components/Link.tsx'
import { AtSign, LifeBuoy, MessageCircle } from 'lucide-react'
import { useConfigurationContext } from '@/contexts/ConfigurationContext.ts'
import classNames from 'classnames'
import fbt from 'fbt'

type TabsProps = {
    tab?: string
}

const Tabs: React.FC<TabsProps> = ({ tab }) => {
    const { configuration } = useConfigurationContext()!

    const TABS = [
        {
            key: 'articles',
            label: fbt('Articles', 'tab label'),
            href: '/',
            icon: LifeBuoy,
            enabled: configuration.faq_enabled,
        },
        {
            key: 'chat',
            label: fbt('Chat', 'tab label'),
            href: '/chat',
            icon: MessageCircle,
            enabled: configuration.assistant_enabled,
        },
        {
            key: 'contact',
            label: fbt('Contact Us', 'tab label'),
            href: '/contact',
            icon: AtSign,
            enabled: configuration.contact_enabled,
        },
    ].filter(({ enabled }) => enabled)

    if (TABS.length < 2) {
        return null
    }

    return (
        <div className="relative z-0 rounded-lg shadow-lg shadow-gray-900/5 flex border border-gray-300 dark:border-zinc-700 divide-x divide-gray-300 dark:divide-zinc-700">
            {TABS.map(({ key, label, href, icon: Icon }, index) => {
                const isActive = tab === key
                const isFirst = index === 0
                const isLast = index === TABS.length - 1

                return (
                    <Link
                        key={key}
                        to={href}
                        className={classNames(
                            `group relative min-w-0 flex-1 overflow-hidden px-2 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm font-semibold text-center bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-200 hover:bg-zinc-100 hover:dark:bg-zinc-700 focus:z-10 transition-colors`,
                            {
                                'rounded-l-lg': isFirst,
                                'rounded-r-lg': isLast,
                            }
                        )}
                    >
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2">
                            <Icon className="h-5 w-5 shrink-0 text-gray-500 dark:text-gray-400" />
                            {label}
                        </div>
                        <span
                            aria-hidden="true"
                            className="absolute inset-x-0 bottom-0 h-0.5"
                            style={{
                                backgroundColor: isActive
                                    ? configuration.color
                                    : 'transparent',
                            }}
                        />
                    </Link>
                )
            })}
        </div>
    )
}

export default Tabs
