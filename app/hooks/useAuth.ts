export const useAuth = () => {
    const accessToken = useCookie('access_token')
    const toast = useToast();

    const login = async (payload: { username: string; password: string }) => {
        const config = useRuntimeConfig()

        const data = await $fetch<{ access: string; refresh: string }>(
            `${config.public.apiBase}/api/auth/login/`,
            {
                method: 'POST',
                body: payload
            }
        )

        accessToken.value = data.access
        return data
    }

    const logout = () => {
        accessToken.value = null
        toast.add({ title: 'Deconnexion réussite !', description: 'A bientôt', color: 'success' })
    }

    return { login, logout, accessToken }
}
