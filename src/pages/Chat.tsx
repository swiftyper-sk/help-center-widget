import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSwiftyperContext } from '@/contexts/SwiftyperContext.ts'
import { useConfigurationContext } from '@/contexts/ConfigurationContext.ts'
import Tabs from '@/components/Tabs.tsx'
import ChatMessageView from '@/components/chat/ChatMessage.tsx'
import ChatInput from '@/components/chat/ChatInput.tsx'
import { ChatMessage } from '@/types/Chat.ts'
import { RotateCcw, Square } from 'lucide-react'
import fbt from 'fbt'
import { useSwiftyperServiceContext } from '@/contexts/SwiftyperServiceContext.ts'
import { generateUUID } from '@/utils/generateUUID.ts'

const STORAGE_PREFIX = 'swiftyper-help-center-chat'
const MAX_STORED_MESSAGES = 60

type StoredChat = {
    sessionId: string
    messages: ChatMessage[]
    ended: boolean
    feedback?: number | null
}

const FEEDBACK_CONFIG = [
    { value: 1, emoji: '😞' },
    { value: 2, emoji: '🙁' },
    { value: 3, emoji: '😐' },
    { value: 4, emoji: '🙂' },
    { value: 5, emoji: '😀' },
]

const feedbackLabel = (value: number): string =>
    ({
        1: fbt('Bad', 'chat feedback rating 1 of 5'),
        2: fbt('Not great', 'chat feedback rating 2 of 5'),
        3: fbt('Okay', 'chat feedback rating 3 of 5'),
        4: fbt('Good', 'chat feedback rating 4 of 5'),
        5: fbt('Great', 'chat feedback rating 5 of 5'),
    }[value] as string)

const Chat: React.FC = () => {
    const swiftyperService = useSwiftyperServiceContext()!
    const { locale } = useSwiftyperContext()!
    const { configuration } = useConfigurationContext()!
    const storageKey = `${STORAGE_PREFIX}:${configuration.uuid}`

    const [sessionId, setSessionId] = useState<string>('')
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [ended, setEnded] = useState(false)
    const [feedback, setFeedback] = useState<number | null>(null)
    const [sending, setSending] = useState(false)
    const [status, setStatus] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const bottomRef = useRef<HTMLDivElement>(null)
    const abortRef = useRef<AbortController | null>(null)

    useEffect(() => {
        let stored: StoredChat | null
        try {
            const raw = localStorage.getItem(storageKey)
            stored = raw ? (JSON.parse(raw) as StoredChat) : null
        } catch {
            stored = null
        }
        setSessionId(stored?.sessionId || generateUUID())
        setMessages(stored?.messages || [])
        setEnded(stored?.ended || false)
        setFeedback(stored?.feedback ?? null)
    }, [storageKey])

    useEffect(() => {
        if (!sessionId) return
        try {
            localStorage.setItem(
                storageKey,
                JSON.stringify({
                    sessionId,
                    messages: messages.slice(-MAX_STORED_MESSAGES),
                    ended,
                    feedback,
                } as StoredChat)
            )
        } catch {
            /* empty */
        }
    }, [storageKey, sessionId, messages, ended, feedback])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, status])

    const appendReply = useCallback((reply: ChatMessage) => {
        setMessages((prev) => [
            ...prev.map((m) =>
                m.extraData?.handoff?.stage === 'ask_contact'
                    ? {
                          ...m,
                          extraData: { ...m.extraData, handoff: undefined },
                      }
                    : m
            ),
            reply,
        ])
        if (reply.ended) setEnded(true)
    }, [])

    const handleError = (err: unknown) => {
        if (err && err.status === 429) {
            setError(
                fbt(
                    'Too many messages, please wait a moment.',
                    'chat rate limit error'
                )
            )
        } else {
            setError(
                (err as Error)?.message ||
                    fbt('Something went wrong.', 'chat generic error')
            )
        }
    }

    const send = async (content: string) => {
        if (!sessionId || sending || ended) return
        const text = content.trim()
        if (!text) return
        setError(null)

        const userMessage: ChatMessage = {
            id: `u-${generateUUID()}`,
            content: text,
            isBot: false,
            type: 'text',
            timestamp: new Date().toISOString(),
        }
        const draftId = `draft-${generateUUID()}`
        setMessages((prev) => [...prev, userMessage])
        setSending(true)
        setStatus(fbt('Thinking…', 'chat status while waiting for the answer'))

        let streamed = ''
        let draftShown = false
        const controller = new AbortController()
        abortRef.current = controller

        try {
            const stream = swiftyperService.streamChat({
                message: text,
                session_id: sessionId,
                locale,
            })

            for await (const event of stream) {
                if (event.type === 'ack') {
                    if (event.text) {
                        setMessages((prev) => [
                            ...prev,
                            {
                                id: `ack-${generateUUID()}`,
                                content: event.text,
                                isBot: true,
                                type: 'text',
                                timestamp: new Date().toISOString(),
                            },
                        ])
                    }
                } else if (event.type === 'status') {
                    setStatus(statusLabel(event.kind))
                } else if (event.type === 'token') {
                    setStatus(null)
                    streamed += event.text
                    if (!draftShown) {
                        draftShown = true
                        setMessages((prev) => [
                            ...prev,
                            {
                                id: draftId,
                                content: '',
                                isBot: true,
                                type: 'text',
                                timestamp: new Date().toISOString(),
                            },
                        ])
                    }
                    const current = streamed
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === draftId ? { ...m, content: current } : m
                        )
                    )
                } else if (event.type === 'done') {
                    setMessages((prev) => prev.filter((m) => m.id !== draftId))
                    appendReply(event.response)
                } else if (event.type === 'error') {
                    throw new Error(event.message)
                }
            }
        } catch (err) {
            setMessages((prev) => prev.filter((m) => m.id !== draftId))
            if (!(err instanceof DOMException && err.name === 'AbortError')) {
                handleError(err)
            }
        } finally {
            abortRef.current = null
            setSending(false)
            setStatus(null)
        }
    }

    const submitHandoffContact = async (requestId: string, contact: string) => {
        try {
            appendReply(
                await swiftyperService.handoffContact(
                    requestId,
                    contact,
                    locale
                )
            )
        } catch (err) {
            handleError(err)
        }
    }

    const skipHandoffContact = async (requestId: string) => {
        try {
            appendReply(await swiftyperService.handoffSkip(requestId, locale))
        } catch (err) {
            handleError(err)
        }
    }

    const submitUnsureEmail = async (email: string) => {
        if (!sessionId) return
        const lastQuestion = [...messages].reverse().find((m) => !m.isBot)
        try {
            appendReply(
                await swiftyperService.handoff(sessionId, {
                    locale,
                    contact: email,
                    keep_open: true,
                    reason: lastQuestion
                        ? `Unsure answer, customer asked: ${lastQuestion.content}`
                        : 'Customer left an e-mail after an unsure answer',
                })
            )
        } catch (err) {
            handleError(err)
        }
    }

    const dismissUnsure = (messageId: string) => {
        setMessages((prev) =>
            prev.map((m) =>
                m.id === messageId
                    ? {
                          ...m,
                          extraData: { ...m.extraData, contact: undefined },
                      }
                    : m
            )
        )
    }

    const endChat = async () => {
        if (!sessionId || ended) return
        abortRef.current?.abort()
        setEnded(true)
        try {
            const result = await swiftyperService.endSession(sessionId, locale)
            setMessages((prev) => [
                ...prev,
                {
                    id: `ended-${Date.now()}`,
                    content:
                        result.message ||
                        fbt('The conversation has ended.', 'chat ended notice'),
                    isBot: true,
                    type: 'ended',
                    ended: true,
                    timestamp: new Date().toISOString(),
                },
            ])
        } catch (err) {
            handleError(err)
        }
    }

    const startNew = () => {
        abortRef.current?.abort()
        setSessionId(generateUUID())
        setMessages([])
        setEnded(false)
        setFeedback(null)
        setError(null)
    }

    const hasStarted = messages.length > 0
    const suggestedQuestions = configuration.suggested_questions[locale] || []

    return (
        <div className="flex flex-1 flex-col max-w-5xl mx-auto w-full min-h-0 space-y-4">
            <Tabs tab="chat" />

            <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
                {configuration.welcome_message && (
                    <ChatMessageView
                        message={{
                            id: 'welcome',
                            content: configuration.welcome_message,
                            isBot: true,
                            type: 'text',
                            timestamp: '',
                        }}
                        assistantName={configuration.assistant_name}
                    />
                )}

                {!hasStarted && suggestedQuestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pl-1">
                        {suggestedQuestions.map((question) => (
                            <button
                                key={question}
                                type="button"
                                onClick={() => send(question)}
                                className="rounded-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                )}

                {messages.map((message) => (
                    <ChatMessageView
                        key={message.id}
                        message={message}
                        assistantName={configuration.assistant_name}
                        locale={locale}
                        onHandoffContact={submitHandoffContact}
                        onHandoffSkip={skipHandoffContact}
                        onUnsureEmail={submitUnsureEmail}
                        onUnsureDismiss={() => dismissUnsure(message.id)}
                    />
                ))}

                {status && (
                    <div className="flex items-center gap-2 pl-1 text-xs text-gray-500 dark:text-gray-400">
                        <span
                            className="inline-block h-2 w-2 rounded-full animate-pulse"
                            style={{ backgroundColor: configuration.color }}
                        />
                        {status}
                    </div>
                )}
                {error && (
                    <p className="text-sm text-red-600 pl-1" role="alert">
                        {error}
                    </p>
                )}
                <div ref={bottomRef} />
            </div>

            {ended ? (
                <div className="space-y-2">
                    <div className="flex flex-col items-center gap-2 text-sm text-gray-600">
                        <span>
                            {feedback === null
                                ? fbt(
                                      'How was this conversation?',
                                      'chat feedback question after the conversation ended'
                                  )
                                : fbt(
                                      'Thank you for your feedback.',
                                      'chat feedback thanks'
                                  )}
                        </span>
                        <div className="flex items-center gap-1">
                            {FEEDBACK_CONFIG.map(({ value, emoji }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={async () => {
                                        await swiftyperService.saveFeedback(
                                            sessionId,
                                            value
                                        )
                                        setFeedback(value)
                                    }}
                                    aria-label={feedbackLabel(value)}
                                    title={feedbackLabel(value)}
                                    className={`rounded-full border p-1.5 text-xl leading-none transition hover:bg-gray-100 ${
                                        feedback === value
                                            ? 'border-gray-800 bg-gray-100'
                                            : feedback === null
                                            ? 'border-transparent'
                                            : 'border-transparent opacity-40'
                                    }`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={startNew}
                        className="w-full rounded-lg p-3 text-sm font-semibold text-white transition hover:opacity-90"
                        style={{ backgroundColor: configuration.color }}
                    >
                        <span className="inline-flex items-center gap-2">
                            <RotateCcw className="h-4 w-4" />
                            {fbt(
                                'Start a new conversation',
                                'chat restart button'
                            )}
                        </span>
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    <ChatInput
                        onSend={send}
                        disabled={sending}
                        placeholder={fbt(
                            'Write a message…',
                            'chat input placeholder'
                        )}
                    />
                    {hasStarted && (
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={endChat}
                                className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            >
                                <Square className="h-3 w-3" />
                                {fbt(
                                    'End chat',
                                    'button that ends the conversation'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function statusLabel(kind: string): string {
    switch (kind) {
        case 'faq':
        case 'knowledge':
            return fbt('Searching the knowledge base…', 'chat status')
        case 'catalog':
        case 'products':
            return fbt('Searching the catalog…', 'chat status')
        case 'handoff':
            return fbt('Contacting a colleague…', 'chat status')
        default:
            return fbt('Thinking…', 'chat status while waiting for the answer')
    }
}

export default Chat
