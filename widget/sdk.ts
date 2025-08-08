declare global {
    interface Window {
        helpCenterWidgetSDK: {
            run: (config: HelpCenterWidgetConfig) => void
            toggle: (state?: boolean) => void
            navigate: (
                route: 'search' | 'category' | 'article',
                idOrQuery: string
            ) => void
            hasLoaded: boolean
            isReady: boolean
        }
    }
}

const STORAGE_KEY = 'swiftyper-help-center-widget'
const IFRAME_ID = 'swiftyper-help-center-iframe'
const BACKDROP_ID = 'swiftyper-help-center-widget-backdrop'
const BUTTON_ID = 'swiftyper-help-center-widget-button'
const WIDGET_IFRAME_ENDPOINT = 'https://widget.swiftyper.sk/index.html'

export interface HelpCenterWidgetConfig {
    apiKey: string
    locale?: string
    isOpen?: boolean
    launcherPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
    launcherColor?: string
    launcherBackgroundColor?: string
    launcherSize?: string
    launcherMargin?: string
    launcherAnimation?: boolean
    widgetRadius?: string
    widgetWidth?: string
    widgetHeight?: string
    displayMode?: 'popup' | 'modal'
    showModalBackdrop?: boolean
    backdropColor?: string
    launcherIconSvg?: string
}

const defaultConfig: Omit<HelpCenterWidgetConfig, 'apiKey'> = {
    locale: 'en_US',
    isOpen: false,
    launcherPosition: 'bottom-right',
    launcherColor: '#ffffff',
    launcherBackgroundColor: '#155dfc',
    launcherSize: '3.5rem',
    launcherAnimation: true,
    launcherMargin: '1rem',
    widgetRadius: '12px',
    widgetWidth: '400px',
    widgetHeight: '650px',
    displayMode: 'popup',
    showModalBackdrop: true,
    backdropColor: 'rgba(0, 0, 0, 0.5)',
}

const widgetStyle = `#swiftyper-help-center-widget > svg {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
    pointer-events: none;
    will-change: transform, opacity;
}

#swiftyper-help-center-widget.is-visible > svg {
    display: block;
    opacity: 0.2;
    animation:
        swiftyper-pulse-scale 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s both,
        swiftyper-pulse-fade-out 1.1s ease 0.5s both;
}

@keyframes swiftyper-pulse-scale {
    0% {
        transform: scale(1);
    }

    100% {
        transform: scale(4);
    }
}

@keyframes swiftyper-pulse-fade-out {
    0% {
        opacity: 0.2;
    }

    100% {
        opacity: 0;
    }
}`

export class HelpCenterWidget {
    private config: HelpCenterWidgetConfig
    private storage: Record<string, any> = {}
    private button?: HTMLButtonElement
    private wrapper?: HTMLDivElement
    private iframe?: HTMLIFrameElement
    private backdrop?: HTMLDivElement

    constructor(config: HelpCenterWidgetConfig) {
        this.config = { ...defaultConfig, ...config }
        if (!this.config.apiKey) {
            console.error('[swiftyper] API key is required')
            return
        }
        this.initialize()
    }

    static run(config: HelpCenterWidgetConfig) {
        if (window.helpCenterWidgetSDK.hasLoaded) {
            return
        }

        const widget = new HelpCenterWidget(config)
        window.helpCenterWidgetSDK.hasLoaded = true
        window.helpCenterWidgetSDK.toggle = widget.toggle.bind(widget)
        window.helpCenterWidgetSDK.navigate = widget.navigate.bind(widget)
    }

    public navigate(
        route: 'search' | 'category' | 'article',
        idOrQuery: string
    ) {
        if (!this.config.isOpen) {
            this.toggle(true)
        }

        let pathname
        const params: { [key: string]: string } = {}
        switch (route) {
            case 'search':
                pathname = '/search'
                params.query = idOrQuery
                break
            case 'category':
                pathname = `/category/${idOrQuery}`
                break
            case 'article':
                pathname = `/article/${idOrQuery}`
                break
            default:
                throw new Error(`Invalid route: ${route}`)
        }

        const handleMessage = () => {
            this.iframe!.contentWindow!.postMessage(
                {
                    type: 'NAVIGATE',
                    payload: {
                        pathname,
                        params,
                    },
                },
                '*'
            )
        }
        if (window.helpCenterWidgetSDK.isReady) {
            handleMessage()
        } else {
            this.iframe!.addEventListener('widget:load', handleMessage, {
                once: true,
            })
        }
    }

    public toggle(state?: boolean) {
        const nextState = state ?? !this.config.isOpen
        const isModal = this.config.displayMode === 'modal'
        const transform = isModal ? 'translate(-50%, -50%)' : 'translateY(0)'

        if (!this.iframe) {
            this.createIframe()
            if (isModal && this.config.showModalBackdrop) {
                this.createBackdrop()
            }
        }

        this.setElementVisibility(this.iframe!, nextState, {
            transform,
        })

        if (this.backdrop) {
            this.setElementVisibility(this.backdrop, nextState)
        }

        if (this.button) {
            this.button.style.opacity = nextState ? '0' : '1'
        }

        this.config.isOpen = nextState
    }

    private injectWidgetStyles(cssText: string) {
        const styleEl = document.createElement('style')
        styleEl.type = 'text/css'

        if (styleEl.styleSheet) {
            styleEl.styleSheet.cssText = cssText
        } else {
            styleEl.appendChild(document.createTextNode(cssText))
        }

        document.head.appendChild(styleEl)
    }

    private createElement<K extends keyof HTMLElementTagNameMap>(
        tagName: K,
        id: string,
        styles: Partial<CSSStyleDeclaration>
    ): HTMLElementTagNameMap[K] {
        const element = document.createElement(tagName)
        element.id = id
        Object.assign(element.style, styles)
        return element
    }

    private getPositionStyles(isModal = false): Partial<CSSStyleDeclaration> {
        if (isModal) {
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) translateY(20px)',
            }
        }
        const m = this.config.launcherMargin
        const positionMap: Record<
            NonNullable<HelpCenterWidgetConfig['launcherPosition']>,
            Partial<CSSStyleDeclaration>
        > = {
            'bottom-right': { bottom: m, right: m },
            'bottom-left': { bottom: m, left: m },
            'top-right': { top: m, right: m },
            'top-left': { top: m, left: m },
        }
        return positionMap[this.config.launcherPosition!]
    }

    private getDimensionStyles(): Partial<CSSStyleDeclaration> {
        if (this.config.displayMode === 'modal') {
            return {
                width: `min(${this.config.widgetWidth}, 90vw)`,
                height: `min(${this.config.widgetHeight}, 90vh)`,
            }
        }
        return {
            width: this.config.widgetWidth,
            height: this.config.widgetHeight,
            maxWidth: 'calc(100vw - 40px)',
            maxHeight: 'calc(100vh - 100px)',
        }
    }

    private createBackdrop(): void {
        this.backdrop = this.createElement('div', BACKDROP_ID, {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: this.config.backdropColor,
            zIndex: '9999998',
            opacity: '0',
            transition: 'opacity 0.3s',
        })

        document.body.appendChild(this.backdrop)
    }

    private createIframe(): void {
        this.iframe = this.createElement('iframe', IFRAME_ID, {
            boxSizing: 'border-box',
            position: 'fixed',
            ...this.getPositionStyles(this.config.displayMode === 'modal'),
            ...this.getDimensionStyles(),
            border: 'none',
            borderRadius: this.config.widgetRadius,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: '9999999',
            opacity: '0',
            transition: 'opacity 0.3s, transform 0.3s',
        })

        this.iframe.src = `${WIDGET_IFRAME_ENDPOINT}?api_key=${this.config.apiKey}&locale=${this.config.locale}`

        this.iframe.addEventListener(
            'widget:load',
            () => {
                window.helpCenterWidgetSDK.isReady = true
            },
            { once: true }
        )

        document.body.appendChild(this.iframe)
    }

    private createButton(): void {
        this.button = this.createElement('button', BUTTON_ID, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: this.config.launcherSize,
            height: this.config.launcherSize,
            border: 'none',
            backgroundColor: this.config.launcherBackgroundColor,
            color: this.config.launcherColor,
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            position: 'fixed',
            ...this.getPositionStyles(),
            zIndex: '50',
            cursor: 'pointer',
            transition:
                'background-color 0.3s, opacity 0.3s, transform 0.2s ease',
        })

        this.wrapper = this.createElement(
            'div',
            'swiftyper-help-center-widget',
            {}
        )
        if (this.config.launcherAnimation && !this.storage?.animationShown) {
            this.wrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" preserveAspectRatio="none" aria-hidden="true" fill="${this.config.launcherBackgroundColor}"><path d="M60 30c0 21.25-8.75 30-30 30S0 51.25 0 30 8.75 0 30 0s30 8.75 30 30Z"></path></svg>`
            this.wrapper.classList.add('is-visible')
            this.saveToStorage('animationShown', true)
        }

        this.button.innerHTML =
            this.config.launcherIconSvg ||
            `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>`
        this.button.addEventListener('click', () => this.toggle())

        this.button.appendChild(this.wrapper)

        document.body.appendChild(this.button)
    }

    private setElementVisibility(
        element: HTMLElement,
        isVisible: boolean,
        additionalStyles?: Partial<CSSStyleDeclaration>
    ): void {
        Object.assign(element.style, {
            ...additionalStyles,
            opacity: isVisible ? '1' : '0',
            pointerEvents: isVisible ? 'auto' : 'none',
        })
    }

    private bindEvents(): void {
        window.addEventListener('message', ({ data }) => {
            if (data === 'close-help-center') {
                this.toggle()
            } else if (data === 'help-center-ready') {
                this.iframe!.dispatchEvent(new CustomEvent('widget:load'))
            }
        })
        document.addEventListener('click', ({ target }) => {
            const backdrop = this.backdrop
            if (target === backdrop) {
                this.toggle()
            }
        })
    }

    private loadStorage(): void {
        try {
            const storage = localStorage.getItem(STORAGE_KEY)
            if (storage) {
                this.storage = JSON.parse(storage)
            }
        } catch (e) {
            this.storage = {}
            console.warn('Unable to load from localStorage:', e)
        }
    }

    private saveToStorage(key: string, value: any): void {
        try {
            this.storage = { ...this.storage, [key]: value }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.storage))
        } catch (e) {
            console.warn('Unable to save to localStorage:', e)
        }
    }

    private initialize(): void {
        this.loadStorage()
        this.injectWidgetStyles(widgetStyle)
        this.createButton()
        this.bindEvents()
        if (this.config.isOpen) {
            this.toggle(true)
        }
        window.dispatchEvent(new Event('helpCenterWidgetReady'))
    }
}

window.helpCenterWidgetSDK = {
    run: HelpCenterWidget.run,
    toggle: () => {},
    navigate: () => {},
    hasLoaded: false,
    isReady: false,
}
