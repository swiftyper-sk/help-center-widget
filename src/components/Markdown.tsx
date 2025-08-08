import classNames from 'classnames'
import ReactMarkdown from 'react-markdown'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const alertStyles = {
    NOTE: 'border-blue-500/20 bg-blue-50/50 text-blue-900 dark:border-blue-500/30 dark:bg-blue-500/5 dark:text-blue-200',
    TIP: 'border-green-500/20 bg-green-50/50 text-green-900 dark:border-green-500/30 dark:bg-green-500/5 dark:text-green-200',
    WARNING:
        'border-yellow-500/20 bg-yellow-50/50 text-yellow-900 dark:border-yellow-500/30 dark:bg-yellow-500/5 dark:text-yellow-200',
    DANGER: 'border-red-500/20 bg-red-50/50 text-red-900 dark:border-red-500/30 dark:bg-red-500/5 dark:text-red-200',
    DEFAULT:
        'border-gray-500/20 bg-gray-50/50 text-gray-900 dark:border-gray-500/30 dark:bg-gray-500/5 dark:text-gray-200',
}

type AlertProps = {
    type?: keyof typeof alertStyles
    children: string
}

const Alert = ({ type = 'DEFAULT', children }: AlertProps) => {
    const alertClass = alertStyles[type] ?? alertStyles.DEFAULT

    return (
        <div
            className={classNames(
                `mt-4 max-w-5xl mx-auto w-full gap-2.5 shadow-lg shadow-gray-900/5 rounded-xl border p-4 text-sm leading-6`,
                alertClass
            )}
            dangerouslySetInnerHTML={{ __html: children }}
        />
    )
}

type MarkdownProps = {
    children: string
}

const Markdown = ({ children }: MarkdownProps) => (
    <ReactMarkdown
        components={{
            blockquote({ children }) {
                const nodes = React.Children.toArray(children)
                const element = nodes.find((node) => React.isValidElement(node))
                const textContent = renderToStaticMarkup(
                    element?.props?.children ?? ''
                )
                const match = textContent.match(/^\[!(\w+)\]\s*(.*)$/s)

                if (match) {
                    const type = match[1].toUpperCase() as AlertProps['type']

                    return <Alert type={type}>{match[2]}</Alert>
                }

                return (
                    <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4">
                        {children}
                    </blockquote>
                )
            },
        }}
    >
        {children}
    </ReactMarkdown>
)

export default Markdown
