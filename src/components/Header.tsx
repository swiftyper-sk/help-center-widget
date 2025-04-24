import React from 'react'
import { ArrowLeft, X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useConfigurationContext } from '@/contexts/ConfigurationContext'
import fbt from 'fbt'

const Header: React.FC = () => {
    const { configuration } = useConfigurationContext()!
    const location = useLocation()
    const navigate = useNavigate()

    const handleBack = (): void => {
        navigate(-1)
    }

    const handleClose = () => {
        window.parent.postMessage('close-help-center', '*')
    }

    return (
        <div className="flex items-center justify-between p-4 text-gray-900 dark:text-gray-200 border-b border-gray-500/5 dark:border-gray-300/[0.06]">
            <div className="flex items-center gap-2">
                {location.state?.canGoBack && (
                    <button
                        onClick={handleBack}
                        className="p-2 rounded-lg hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                        title={fbt(
                            'Go Back',
                            'Button: navigate to the previous page'
                        )}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                )}
                <h1 className="text-xl font-semibold">
                    {configuration.header_text}
                </h1>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={handleClose}
                    className="p-2 rounded-lg hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 hover:dark:bg-zinc-800 transition-colors relative group"
                    title={fbt('Close', 'Button: close the help center')}
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}

export default Header
