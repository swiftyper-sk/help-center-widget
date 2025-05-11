export type MutationResult<T> = {
    mutate: (form: T) => void
    loading: boolean
    success: boolean
    error: Error | null
}
