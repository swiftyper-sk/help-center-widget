import React, { useState } from 'react'
import { Search } from 'lucide-react'
import fbt from 'fbt'
import { useConfigurationContext } from '@/contexts/ConfigurationContext.ts'

type SearchInputProps = {
    query: string
    handleQuery: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const SearchInput: React.FC<SearchInputProps> = ({ query, handleQuery }) => {
    const { configuration } = useConfigurationContext()!
    const [isFocused, setIsFocused] = useState(false)

    const handleFocus = () => setIsFocused(true)
    const handleBlur = () => setIsFocused(false)

    const borderColor = isFocused ? configuration?.color : undefined

    return (
        <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
            <input
                style={{ borderColor }}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="bg-gray-50 border border-gray-500/5 text-gray-900 rounded-lg focus:outline-none focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-zinc-800 dark:border-gray-300/[0.06] dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500"
                onInput={handleQuery}
                value={query}
                placeholder={fbt(
                    'Search articles...',
                    'Help center search input placeholder'
                )}
                type="text"
            />
        </div>
    )
}
export default SearchInput
