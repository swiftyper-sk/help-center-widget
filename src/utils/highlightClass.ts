export default (text: string): string => {
    return text.replace(
        /<em>/g,
        '<em class="bg-yellow-100 text-yellow-800 px-0.5 rounded-sm dark:bg-yellow-900 dark:text-yellow-300">'
    )
}
