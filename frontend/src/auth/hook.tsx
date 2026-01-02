import { useShallow } from "zustand/react/shallow"
import { useAuthStore, select_is_authenticated, select_is_admin } from "./store"

/**
 * Hook to access auth state
 */
export function useAuth() {
  return useAuthStore(
    useShallow((s) => ({
      profile: s.profile,
      is_loading: s.is_loading,
      error: s.error,
      sign_out: s.sign_out,
      is_authenticated: select_is_authenticated(s),
      is_admin: select_is_admin(s),
    }))
  )
}
