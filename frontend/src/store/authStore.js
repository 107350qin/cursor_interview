import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      userId: null,
      username: null,
      role: null,
      isAuthenticated: false,
      
      setAuth: (token, userId, username, role) => {
        set({
          token,
          userId,
          username,
          role,
          isAuthenticated: true,
        })
      },
      
      clearAuth: () => {
        set({
          token: null,
          userId: null,
          username: null,
          role: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

export { useAuthStore }
