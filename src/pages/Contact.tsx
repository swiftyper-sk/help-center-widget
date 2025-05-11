import React, { useState, useRef } from 'react'
import Input from '@/components/Input.tsx'
import Tabs from '@/components/Tabs.tsx'
import { useConfigurationContext } from '@/contexts/ConfigurationContext.ts'
import Link from '@/components/Link.tsx'
import { useContactMutation } from '@/hooks/useContactMutation.ts'
import { MailCheck } from 'lucide-react'
import classNames from 'classnames'
import fbt from 'fbt'

const MAX_MESSAGE_LENGTH = 1000

const Contact: React.FC = () => {
    const { configuration } = useConfigurationContext()!
    const messageRef = useRef<HTMLTextAreaElement>(null)
    const [form, setForm] = useState({ name: '', email: '', message: '' })
    const [messageLength, setMessageLength] = useState(0)
    const { mutate, error, loading, success } = useContactMutation()

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        if (name === 'message') setMessageLength(value.length)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        mutate(form)
    }

    return (
        <div
            className={classNames('max-w-5xl mx-auto w-full pb-4 space-y-4', {
                'flex flex-1 flex-col': success,
            })}
        >
            <Tabs tab="contact" />
            <div className="flex items-center gap-px mb-6">
                <Link
                    to="/contact"
                    className="text-slate-500 dark:text-slate-200 text-sm font-semibold gap-1 hover:underline hover:cursor-pointer leading-8"
                >
                    {fbt('Contact Form', 'Link to the contact form')}
                </Link>
            </div>
            {success ? (
                <div className="flex flex-1 flex-col items-center justify-center space-y-4">
                    <MailCheck className="h-14 w-14 text-green-500" />
                    <div className="text-center space-y-2">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-200">
                            {fbt(
                                'We have received your message!',
                                'success message'
                            )}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {fbt(
                                'Thank you for reaching out to us. We appreciate your message and will get back to you as soon as possible.',
                                'success message'
                            )}
                        </p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            {fbt('Full Name', 'form label')}
                        </label>
                        <Input
                            name="name"
                            value={form.name}
                            onInput={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            {fbt('Email', 'form label')}
                        </label>
                        <Input
                            name="email"
                            type="email"
                            value={form.email}
                            onInput={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            {fbt('How can we help?', 'form label')}
                        </label>
                        <Input
                            ref={messageRef}
                            name="message"
                            autoGrow
                            multiline
                            value={form.message}
                            onInput={handleChange}
                            maxLength={MAX_MESSAGE_LENGTH}
                            required
                            className="min-h-[80px]"
                            aria-describedby="message-length"
                        />
                        <p
                            id="message-length"
                            className="text-xs text-gray-500 dark:text-gray-400"
                        >
                            {messageLength}/{MAX_MESSAGE_LENGTH}
                        </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-300">
                        <fbt desc="contact form terms and conditions">
                            We will use this personal data to process your
                            question and answer it. More information on the
                            processing of personal data can be found in our{' '}
                            <a
                                href={configuration.privacy_policy_url}
                                target="_blank"
                                className="text-blue-500 hover:underline"
                                style={{
                                    color: configuration.color,
                                }}
                            >
                                Privacy Policy
                            </a>.
                        </fbt>
                    </div>
                    {error?.message && (
                        <p className="text-red-600 text-sm">{error.message}</p>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg p-3 text-sm font-semibold transition bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading
                            ? fbt('Sending...', 'button loading label')
                            : fbt('Send Message', 'button label')}
                    </button>
                </form>
            )}
        </div>
    )
}

export default Contact
