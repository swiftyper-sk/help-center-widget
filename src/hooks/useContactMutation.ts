import { useCallback, useState } from 'react'
import { useSwiftyperServiceContext } from '@/contexts/SwiftyperServiceContext.ts'
import { MutationResult } from '@/types/Mutation.ts'

type ContactForm = {
    name: string
    email: string
    message: string
}

export function useContactMutation(): MutationResult<ContactForm> {
    const swiftyperService = useSwiftyperServiceContext()!
    const [loading, setLoading] = useState<boolean>(false)
    const [success, setSuccess] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)

    const mutate = useCallback(
        async (form: ContactForm) => {
            setLoading(true)
            setSuccess(false)
            setError(null)

            const sendMessage = async () => {
                setLoading(true)
                setError(null)

                try {
                    await swiftyperService.contact(form)
                    setSuccess(true)
                } catch (err) {
                    setError(err as Error)
                } finally {
                    setLoading(false)
                }
            }

            sendMessage()
        },
        [swiftyperService]
    )

    return {
        mutate,
        loading,
        success,
        error,
    }
}
