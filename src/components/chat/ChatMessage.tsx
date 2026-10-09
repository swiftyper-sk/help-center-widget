import React, { useState } from 'react'
import classNames from 'classnames'
import { Bot, ExternalLink, Mail, Phone, Clock, User, X } from 'lucide-react'
import Markdown from '@/components/Markdown.tsx'
import { useConfigurationContext } from '@/contexts/ConfigurationContext.ts'
import {
    ChatContact,
    ChatHandoff,
    ChatMessage,
    ChatSource,
} from '@/types/Chat.ts'
import ProductCards from '@/components/chat/ProductCards.tsx'
import { linkProducts } from '@/utils/linkProducts.ts'
import {
    CITE_SCHEME,
    citationsToLinks,
    hideProductIds,
} from '@/utils/citations.ts'
import fbt from 'fbt'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type Props = {
    message: ChatMessage
    assistantName?: string
    currency?: string
    locale?: string
    onHandoffContact?: (requestId: string, contact: string) => Promise<void>
    onHandoffSkip?: (requestId: string) => Promise<void>
    onUnsureEmail?: (email: string) => Promise<void>
    onUnsureDismiss?: () => void
}

const linkComponents = (sources: ChatSource[]) => ({
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => {
        if (href?.startsWith(CITE_SCHEME)) {
            const index = Number(href.slice(CITE_SCHEME.length))
            const source = sources.find((s) => s.index === index)
            const label = (
                <sup className="ml-0.5 rounded px-1 text-[10px] font-semibold leading-none bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-200">
                    {index}
                </sup>
            )
            return source?.url ? (
                <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    title={source.title}
                    className="!no-underline"
                >
                    {label}
                </a>
            ) : (
                <span title={source?.title}>{label}</span>
            )
        }
        return href?.startsWith('#') ? (
            <a
                href={href}
                className="underline font-medium"
                onClick={(e) => {
                    e.preventDefault()
                    document.getElementById(href.slice(1))?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    })
                }}
            >
                {children}
            </a>
        ) : (
            <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="underline font-medium"
            >
                {children}
            </a>
        )
    },
})

const ChatMessageView: React.FC<Props> = ({
    message,
    assistantName,
    currency = 'EUR',
    locale = 'sk-SK',
    onHandoffContact,
    onHandoffSkip,
    onUnsureEmail,
    onUnsureDismiss,
}) => {
    const { configuration } = useConfigurationContext()!
    const handoff = message.extraData?.handoff
    const contact = message.extraData?.contact
    const sources = message.extraData?.sources || []
    const products = message.products || []

    const agentName = message.extraData?.agent?.name || null

    if (message.type === 'ended') {
        return (
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-2">
                {message.content}
            </div>
        )
    }

    if (message.type === 'agent_joined' || message.type === 'agent_left') {
        return (
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-2">
                {!agentName
                    ? message.content
                    : message.type === 'agent_joined'
                    ? fbt(
                          fbt.param('name', agentName) +
                              ' joined the conversation',
                          'chat notice when a person from the store took the conversation over from the assistant'
                      )
                    : fbt(
                          fbt.param('name', agentName) +
                              ' left the conversation, the assistant answers again',
                          'chat notice when a person from the store handed the conversation back to the assistant'
                      )}
            </div>
        )
    }

    const fromAgent = message.type === 'agent'

    return (
        <div
            className={classNames('flex gap-2', {
                'justify-end': !message.isBot,
                'justify-start': message.isBot,
            })}
        >
            {message.isBot && (
                <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
                    style={{ backgroundColor: configuration.color }}
                    title={fromAgent ? agentName || undefined : assistantName}
                    aria-label={
                        fromAgent ? agentName || undefined : assistantName
                    }
                >
                    {fromAgent ? (
                        agentName ? (
                            <span className="text-sm font-semibold">
                                {agentName.charAt(0).toUpperCase()}
                            </span>
                        ) : (
                            <User className="h-5 w-5" />
                        )
                    ) : (
                        <Bot className="h-5 w-5" />
                    )}
                </div>
            )}
            <div
                className={classNames('max-w-[85%] space-y-2', {
                    'items-end': !message.isBot,
                })}
            >
                {fromAgent && agentName && (
                    <div className="pl-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                        {agentName}
                    </div>
                )}
                <div
                    className={classNames(
                        'rounded-2xl px-4 py-2.5 text-sm leading-6 break-words',
                        message.isBot
                            ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'
                            : 'text-white rounded-tr-sm'
                    )}
                    style={
                        message.isBot
                            ? undefined
                            : { backgroundColor: configuration.color }
                    }
                >
                    {message.isBot ? (
                        <div id="chat-content">
                            <Markdown components={linkComponents(sources)}>
                                {citationsToLinks(
                                    linkProducts(
                                        hideProductIds(message.content),
                                        products,
                                        message.id
                                    ),
                                    sources
                                )}
                            </Markdown>
                        </div>
                    ) : (
                        <span className="whitespace-pre-wrap">
                            {message.content}
                        </span>
                    )}
                </div>

                {products.length > 0 && (
                    <ProductCards
                        messageId={message.id}
                        products={products}
                        currency={currency}
                        locale={locale}
                    />
                )}

                {sources.length > 0 && <Sources sources={sources} />}

                {handoff?.stage === 'ask_contact' && handoff.requestId && (
                    <HandoffForm
                        handoff={handoff}
                        onSubmit={(email) =>
                            onHandoffContact?.(handoff.requestId!, email) ??
                            Promise.resolve()
                        }
                        onSkip={() =>
                            onHandoffSkip?.(handoff.requestId!) ??
                            Promise.resolve()
                        }
                    />
                )}
                {handoff?.stage === 'done' && <ContactCard contact={handoff} />}

                {contact && !handoff && (
                    <UnsurePrompt
                        contact={contact}
                        onSubmit={(email) =>
                            onUnsureEmail?.(email) ?? Promise.resolve()
                        }
                        onDismiss={() => onUnsureDismiss?.()}
                    />
                )}
            </div>
        </div>
    )
}

const Sources: React.FC<{ sources: ChatSource[] }> = ({ sources }) => (
    <div className="flex flex-wrap items-center gap-1.5 pl-1 text-xs text-gray-500 dark:text-gray-400">
        <span>{fbt('Sources', 'label before the cited sources')}:</span>
        {sources.map((s) =>
            s.url ? (
                <a
                    key={s.index}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-gray-300 dark:border-zinc-700 px-1.5 py-0.5 hover:bg-gray-100 dark:hover:bg-zinc-800"
                    title={s.title}
                >
                    [{s.index}]{' '}
                    <span className="max-w-[160px] truncate">{s.title}</span>
                    <ExternalLink className="h-3 w-3" />
                </a>
            ) : (
                <span
                    key={s.index}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-300 dark:border-zinc-700 px-1.5 py-0.5"
                    title={s.title}
                >
                    [{s.index}]{' '}
                    <span className="max-w-[160px] truncate">{s.title}</span>
                </span>
            )
        )}
    </div>
)

const ContactCard: React.FC<{ contact: ChatContact | ChatHandoff }> = ({
    contact,
}) => {
    const hasDetails = contact.email || contact.phone || contact.openingHours
    if (!hasDetails) return null
    return (
        <div className="rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-sm space-y-1.5">
            {contact.storeName && (
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {contact.storeName}
                </div>
            )}
            {contact.email && (
                <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:underline"
                >
                    <Mail className="h-4 w-4" /> {contact.email}
                </a>
            )}
            {contact.phone && (
                <a
                    href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:underline"
                >
                    <Phone className="h-4 w-4" /> {contact.phone}
                </a>
            )}
            {contact.openingHours && (
                <div className="flex items-start gap-2 text-gray-700 dark:text-gray-200">
                    <Clock className="h-4 w-4 mt-0.5" />
                    <span className="whitespace-pre-line">
                        {contact.openingHours}
                    </span>
                </div>
            )}
        </div>
    )
}

type EmailFormProps = {
    text: string
    onSubmit: (email: string) => Promise<void>
    onSkip: () => void | Promise<void>
    skipLabel: string
    dismissIcon?: boolean
}

const EmailForm: React.FC<EmailFormProps> = ({
    text,
    onSubmit,
    onSkip,
    skipLabel,
    dismissIcon,
}) => {
    const { configuration } = useConfigurationContext()!
    const [email, setEmail] = useState('')
    const [busy, setBusy] = useState(false)
    const [invalid, setInvalid] = useState(false)

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        const value = email.trim()
        if (!EMAIL_RE.test(value)) {
            setInvalid(true)
            return
        }
        setBusy(true)
        try {
            await onSubmit(value)
        } finally {
            setBusy(false)
        }
    }

    return (
        <form
            onSubmit={submit}
            className="relative rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 space-y-2"
        >
            <div>
                {dismissIcon && (
                    <button
                        type="button"
                        onClick={() => onSkip()}
                        className="absolute right-2 top-2 p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        title={skipLabel}
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
                <p className="text-sm text-gray-700 dark:text-gray-200 pr-6">
                    {text}
                </p>
            </div>
            <div className="flex gap-2">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value)
                        setInvalid(false)
                    }}
                    placeholder={fbt('your@email.com', 'e-mail placeholder')}
                    disabled={busy}
                    className={classNames(
                        'flex-1 min-w-0 border rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none',
                        invalid
                            ? 'border-red-500'
                            : 'border-gray-300 dark:border-zinc-700'
                    )}
                />
                <button
                    type="submit"
                    disabled={busy}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    style={{ backgroundColor: configuration.color }}
                >
                    {fbt('Send', 'submit e-mail button')}
                </button>
            </div>
            {invalid && (
                <p className="text-xs text-red-600">
                    {fbt('Please enter a valid e-mail address.', 'validation')}
                </p>
            )}
            {!dismissIcon && (
                <button
                    type="button"
                    onClick={() => onSkip()}
                    disabled={busy}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                >
                    {skipLabel}
                </button>
            )}
        </form>
    )
}

const HandoffForm: React.FC<{
    handoff: ChatHandoff
    onSubmit: (email: string) => Promise<void>
    onSkip: () => Promise<void>
}> = ({ handoff, onSubmit, onSkip }) => (
    <EmailForm
        text={handoff.text}
        onSubmit={onSubmit}
        onSkip={onSkip}
        skipLabel={fbt(
            'Continue without leaving an e-mail',
            'skip the handoff e-mail'
        )}
    />
)

const UnsurePrompt: React.FC<{
    contact: ChatContact
    onSubmit: (email: string) => Promise<void>
    onDismiss: () => void
}> = ({ contact, onSubmit, onDismiss }) => (
    <EmailForm
        text={contact.text}
        onSubmit={onSubmit}
        onSkip={onDismiss}
        skipLabel={fbt('Dismiss', 'close the e-mail prompt')}
        dismissIcon
    />
)

export default ChatMessageView
