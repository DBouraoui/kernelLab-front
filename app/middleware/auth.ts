export default defineNuxtRouteMiddleware(async () => {
    const accessToken = useCookie('access_token')

    if (!accessToken.value) {
        return navigateTo('/login')
    }
})
