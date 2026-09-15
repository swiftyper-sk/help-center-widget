import React, { useRef, useState } from 'react'
import { SendHorizontal } from 'lucide-react'
import { useConfigurationContext } from '@/contexts/ConfigurationContext.ts'
import useAutosizeTextArea from '@/hooks/useAutogrowTextarea.ts'
import fbt from 'fbt'

const MAX_LENGTH = 1000

type Props = {
    onSend: (text: string) => void
    disabled?: boolean
    placeholder?: string
}

const ChatInput: React.FC<Props> = ({ onSend, disabled, placeholder }) => {
    const { configuration } = useConfigurationContext()!
    const [value, setValue] = useState('')
    const ref = useRef<HTMLTextAreaElement>(null)

    useAutosizeTextArea(ref.current, true)

    const submit = () => {
        const text = value.trim()
        if (!text || disabled) return
        onSend(text)
        setValue('')
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit()
        }
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                submit()
            }}
            className="flex items-end gap-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 focus-within:border-blue-500"
        >
            <textarea
                ref={ref}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                maxLength={MAX_LENGTH}
                rows={1}
                disabled={disabled}
                className="flex-1 min-w-0 min-h-[34px] resize-none bg-transparent px-2 py-1.5 text-sm leading-5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none disabled:opacity-60"
            />
            <button
                type="submit"
                disabled={disabled || !value.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition disabled:opacity-40"
                style={{ backgroundColor: configuration.color }}
                title={fbt('Send', 'send chat message button')}
            >
                <SendHorizontal className="h-4 w-4" />
            </button>
        </form>
    )
}

export default ChatInput
