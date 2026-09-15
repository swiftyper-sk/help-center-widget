export type Configuration = {
    uuid: string
    header_text: string
    introduction_text: string
    privacy_policy_url: string
    color: string
    logo: boolean
    name: string
    welcome_message: string
    assistant_name: string
    suggested_questions: Record<string, Array<string>>
    assistant_enabled: boolean
    faq_enabled: boolean
    locales: Record<string, string>
}
