import { createRoot } from 'react-dom/client'
import App from './App'
import { SwiftyperProvider } from './providers/SwiftyperProvider'
import { SwiftyperServiceProvider } from './providers/SwiftyperServiceProvider'
import { ConfigurationProvider } from './providers/ConfigurationProvider'
import './index.css'

const params = new URLSearchParams(window.location.search)
const token = params.get('api_key')
const locale = params.get('locale') ?? 'en_US'

createRoot(document.getElementById('root')!).render(
    <SwiftyperProvider token={token} locale={locale}>
        <SwiftyperServiceProvider>
            <ConfigurationProvider>
                <App />
            </ConfigurationProvider>
        </SwiftyperServiceProvider>
    </SwiftyperProvider>
)
