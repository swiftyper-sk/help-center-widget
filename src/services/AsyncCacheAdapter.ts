type AnyFn = (...args: any[]) => Promise<any>

export class AsyncCacheAdapter {
    private cache = new Map<string, Promise<any>>()

    wrap<F extends AnyFn>(
        ns: string,
        fn: F
    ): (...args: Parameters<F>) => ReturnType<F> {
        return (...args: Parameters<F>) => {
            const key = JSON.stringify([ns, args])
            const entry = this.cache.get(key)

            if (entry) {
                return entry as ReturnType<F>
            }

            const promise = fn(...args).catch((err) => {
                this.cache.delete(key)
                throw err
            })

            this.cache.set(key, promise)

            return promise as ReturnType<F>
        }
    }
}
