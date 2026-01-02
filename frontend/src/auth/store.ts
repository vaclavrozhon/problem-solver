import { create } from "zustand"
import { is_admin } from "@shared/auth"
import type { User as Profile } from "@shared/auth"
import { api } from "../api"

interface AuthState {
  profile: Profile | null
  is_loading: boolean
  error: Error | null
}

interface AuthActions {
  check_auth: () => Promise<void>,
  sign_out: () => Promise<{ success: boolean; error: Error | null }>,
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>(set => ({
  profile: null,
  is_loading: true,
  error: null,

  check_auth: async () => {
    set({ is_loading: true, error: null })

    const { data, error } = await api.auth.me.get()
    if (error) {
      set({ profile: null, is_loading: false, error: null })
      return
    }

    set({ profile: data.user, is_loading: false, error: null })
  },

  sign_out: async () => {
    const { error } = await api.auth.signout.post()
    if (!error) {
      set({ profile: null })
    }
    return { success: !error, error: error ? new Error("Sign out failed") : null }
  },
}))

export const select_is_authenticated = (s: AuthState) => s.profile !== null
export const select_is_admin = (s: AuthState) =>
  s.profile ? is_admin(s.profile.role) : false

/**
 * Resolves when initial auth check completes.
 * Should be awaited before rendering protected routes.
 */
export const auth_ready = new Promise<void>((resolve) => {
  useAuthStore.getState().check_auth().finally(resolve)
})

// re-check auth when window regains focus
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      const { profile } = useAuthStore.getState()
      // only check if we think we're logged in
      if (profile) {
        useAuthStore.getState().check_auth()
      }
    }
  })
}
