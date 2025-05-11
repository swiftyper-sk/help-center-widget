import { useEffect } from 'react'

const useAutosizeTextArea = (
    textAreaRef: HTMLTextAreaElement | null,
    enabled: boolean
) => {
    useEffect(() => {
        if (textAreaRef && enabled) {
            const minHeight = parseInt(getComputedStyle(textAreaRef).minHeight)

            textAreaRef.style.height = '0px'
            textAreaRef.style.height = `${Math.max(
                minHeight,
                textAreaRef.scrollHeight
            )}px`
        }
    }, [textAreaRef, textAreaRef?.value, enabled])
}

export default useAutosizeTextArea
