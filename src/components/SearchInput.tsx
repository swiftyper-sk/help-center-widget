import React from 'react'
import { Search } from 'lucide-react'
import fbt from 'fbt'
import Input from './Input'

type SearchInputProps = {
    query: string
    onInput: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void
}

const SearchInput: React.FC<SearchInputProps> = ({ query, onInput }) => (
    <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </div>
        <Input
            className="pl-10"
            onInput={onInput}
            value={query}
            placeholder={fbt(
                'Search articles...',
                'Help center search input placeholder'
            )}
        />
    </div>
)

export default SearchInput
