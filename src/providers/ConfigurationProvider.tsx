import { ReactElement, useEffect, useState } from 'react'
import { Configuration } from '@/types/Configuration'
import { ConfigurationContext } from '@/contexts/ConfigurationContext'
import { useSwiftyperServiceContext } from '@/contexts/SwiftyperServiceContext'
import fbt from 'fbt'

type ConfigurationProviderProps = {
    children: ReactElement
}

export const ConfigurationProvider = (props: ConfigurationProviderProps) => {
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<Error | null>(null)
    const [configuration, setConfiguration] = useState<Configuration>({
        header_text: fbt('Help Center', 'Widget main title'),
        introduction_text: fbt(
            "Find answers to the most commonly asked questions bellow. Search for topics you're interested in or sort by category.",
            'Widget introduction text'
        ),
        color: '#3b82f6',
        logo: true,
        locales: {},
    })
    const swiftyperService = useSwiftyperServiceContext()!

    useEffect(() => {
        const fetchConfiguration = async () => {
            setLoading(true)
            setError(null)

            try {
                const fetchedConfiguration =
                    await swiftyperService.configuration()
                setConfiguration(fetchedConfiguration)
            } catch (err: unknown) {
                setError(err as Error)
            } finally {
                setLoading(false)
            }
        }

        fetchConfiguration()
    }, [swiftyperService])

    const value = {
        configuration,
        loading,
        error,
    }

    return <ConfigurationContext.Provider value={value} {...props} />
}
