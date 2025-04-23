import { createContext, useContext } from 'react'
import { Configuration } from '@/types/Configuration'

type ConfigurationContextType = {
    configuration: Configuration
    loading: boolean
    error: Error | null
}

export const ConfigurationContext = createContext<
    ConfigurationContextType | undefined
>(undefined)

export const useConfigurationContext = () => useContext(ConfigurationContext)
