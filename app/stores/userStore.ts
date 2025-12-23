import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        email: ''
    }),

    actions: {
        setUser(user: { email: string }) {
            this.email = user.email
        },

        clear() {
            this.email = ''
        }
    }
})
