import { useCallback, useEffect } from 'react'
import {
    Routes,
    Route,
    useNavigate,
    createSearchParams,
} from 'react-router-dom'
import ErrorBoundary from '@/components/ErrorBoundary'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Home from '@/pages/Home'
import Categories from '@/pages/Categories'
import Article from '@/pages/Article'
import Category from '@/pages/Category'
import { useConfigurationContext } from '@/contexts/ConfigurationContext'
import { initFbt } from '@/utils/fbt.ts'

initFbt()

type NavigateMessage = {
    type: 'NAVIGATE'
    payload: {
        pathname: string
        params?: Record<string, string>
    }
}

export default function App() {
    const { configuration, loading } = useConfigurationContext()!

    const navigate = useNavigate()

    const handlePostMessageFromIframe = useCallback(
        (event: MessageEvent) => {
            const message = event.data as NavigateMessage
            if (message?.type !== 'NAVIGATE') return

            const { pathname, params } = message.payload
            if (pathname) {
                navigate({
                    pathname,
                    search: createSearchParams(params ?? {}).toString(),
                })
            }
        },
        [navigate]
    )

    useEffect(() => {
        window.addEventListener('message', handlePostMessageFromIframe)
        return () => {
            window.removeEventListener('message', handlePostMessageFromIframe)
        }
    }, [handlePostMessageFromIframe])

    if (loading) {
        return
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-col flex-1 overflow-y-auto p-4">
                <ErrorBoundary>
                    <Routes>
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/category/:id" element={<Category />} />
                        <Route path="/article/:id" element={<Article />} />
                        <Route path="*" element={<Home />} />
                    </Routes>
                </ErrorBoundary>
            </div>

            {configuration.logo && <Footer />}
        </div>
    )
}
