export interface ContactType  {
    id: number
    firstname?: string
    lastname?: string
    company?: string
    email: string
    phone?: string
    link?: string
    subject: string
    description: string
    pro?: boolean
    budget?: string | null
}