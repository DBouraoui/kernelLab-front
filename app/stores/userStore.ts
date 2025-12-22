import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        username: '',
        email: ''
    }),

    actions: {
        setUser(user: { username: string; email: string }) {
            this.username = user.username
            this.email = user.email
        },

        clear() {
            this.username = ''
            this.email = ''
        }
    }
})
