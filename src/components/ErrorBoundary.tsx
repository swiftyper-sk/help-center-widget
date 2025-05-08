import React, {
    ReactNode,
    useEffect,
    useRef,
    forwardRef,
    useImperativeHandle,
    ErrorInfo,
} from 'react'
import { AlertTriangle } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import fbt from 'fbt'

type ErrorBoundaryProps = {
    children: ReactNode
}

type ErrorBoundaryState = {
    hasError: boolean
}

type ErrorBoundaryHandles = {
    resetErrorBoundary: () => void
}

class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
        this.resetErrorBoundary = this.resetErrorBoundary.bind(this)
    }

    static getDerivedStateFromError(): { hasError: boolean } {
        return { hasError: true }
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, info)
    }

    resetErrorBoundary(): void {
        this.setState({ hasError: false })
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="flex flex-1 flex-col items-center justify-center space-y-4">
                    <AlertTriangle className="h-14 w-14 text-yellow-500" />
                    <div className="text-center space-y-2">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-200 sm:text-xl md:text-2xl">
                            {fbt(
                                'Oops! Something went wrong.',
                                'Title for error page'
                            )}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {fbt(
                                'It seems like something went wrong.',
                                'Generic error message when something goes wrong'
                            )}
                        </p>
                    </div>
                    <button
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                        onClick={this.resetErrorBoundary}
                    >
                        {fbt('Try Again', 'Refresh page button')}
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}

const ErrorBoundaryWithReset = forwardRef<
    ErrorBoundaryHandles,
    { children: ReactNode }
>(({ children }, ref) => {
    const errorBoundaryRef = useRef<ErrorBoundary>(null)
    const location = useLocation()

    useImperativeHandle(ref, () => ({
        resetErrorBoundary: () => {
            errorBoundaryRef.current?.resetErrorBoundary()
        },
    }))

    useEffect(() => {
        errorBoundaryRef.current?.resetErrorBoundary()
    }, [location.pathname])

    return <ErrorBoundary ref={errorBoundaryRef}>{children}</ErrorBoundary>
})

export default ErrorBoundaryWithReset
