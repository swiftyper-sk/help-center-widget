import React, { useState, forwardRef, useRef, useEffect } from 'react'
import { useConfigurationContext } from '@/contexts/ConfigurationContext.ts'
import classNames from 'classnames'
import useAutosizeTextArea from '@/hooks/useAutogrowTextarea.ts'

type InputProps = {
    multiline?: boolean
    autoGrow?: boolean
    value?: string
    name?: string
    type?: string
    className?: string
    placeholder?: string
    maxLength?: number
    required?: boolean
    onInput?: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void
}

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
    (
        {
            multiline = false,
            autoGrow = false,
            type = 'text',
            className,
            value = '',
            ...props
        },
        ref
    ) => {
        const { configuration } = useConfigurationContext()!
        const [isFocused, setIsFocused] = useState(false)

        const textAreaRef = useRef<HTMLTextAreaElement>(null)

        useAutosizeTextArea(textAreaRef.current, autoGrow)

        const handleFocus = () => setIsFocused(true)
        const handleBlur = () => setIsFocused(false)

        const borderColor = isFocused ? configuration?.color : undefined

        const commonProps = {
            style: { borderColor },
            onFocus: handleFocus,
            onBlur: handleBlur,
            className: classNames(
                'border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:border-blue-500 block w-full p-2.5 dark:bg-zinc-800 dark:border-zinc-700 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500',
                className
            ),
            value,
            ...props,
        }

        return multiline ? (
            <textarea
                ref={textAreaRef}
                {...(commonProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
        ) : (
            <input
                type={type}
                ref={ref}
                {...(commonProps as React.InputHTMLAttributes<HTMLInputElement>)}
            />
        )
    }
)

export default Input
