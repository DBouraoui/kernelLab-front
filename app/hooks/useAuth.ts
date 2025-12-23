export const useAuth = () => {
    const accessToken = useCookie('access_token')
    const toast = useToast();

    const login = async (payload: { email: string; password: string }) => {
        const config = useRuntimeConfig()

        const data = await $fetch<{ token: string }>(
            `${config.public.apiBase}/api/login_check`,
            {
                method: 'POST',
                body: payload
            }
        )

        accessToken.value = data.token
        return data
    }

    const logout = () => {
        accessToken.value = null
        toast.add({ title: 'Deconnexion réussite !', description: 'A bientôt', color: 'success' })
    }

    return { login, logout, accessToken }
}
