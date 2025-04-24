import { ReactElement } from 'react'
import { useSwiftyperContext } from '@/contexts/SwiftyperContext'
import { UserServiceContext } from '@/contexts/SwiftyperServiceContext'
// eslint-disable-next-line
// @ts-ignore
import { Swiftyper } from 'swiftyper-node'
import SwiftyperService from '@/services/SwiftyperService'
import { changeLocale } from '@/utils/fbt.ts'

const client = new Swiftyper()

const swiftyperServiceInstance = new SwiftyperService(client)

type SwiftyperServiceProviderProps = {
    children: ReactElement
}

export const SwiftyperServiceProvider = (
    props: SwiftyperServiceProviderProps
) => {
    const swiftyper = useSwiftyperContext()!
    const { token, locale } = swiftyper

    client._setApiKey(token)
    swiftyperServiceInstance.locale = locale

    changeLocale(locale)

    return (
        <UserServiceContext.Provider
            value={swiftyperServiceInstance}
            {...props}
        />
    )
}
