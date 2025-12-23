import { create } from "zustand"
import { Session, User as SupabaseUser } from "@supabase/supabase-js"
import { supabase } from "../config/supabase"
import { is_admin } from "@shared/auth"
import type { User as Profile } from "@shared/auth"
import { api } from "../api"

interface AuthState {
  user: SupabaseUser | null
  session: Session | null
  profile: Profile | null
  is_loading: boolean
  error: Error | null
}

interface AuthActions {
  sign_out: () => Promise<{ success: boolean; error: Error | null }>
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>(() => ({
  user: null,
  session: null,
  profile: null,
  is_loading: true,
  error: null,

  sign_out: async () => {
    const { error } = await supabase.auth.signOut()
    return { success: !error, error }
  },
}))

export const select_is_authenticated = (s: AuthState) =>
  s.user !== null && s.session !== null
export const select_is_admin = (s: AuthState) =>
  s.profile ? is_admin(s.profile.role) : false

/**
 * Retrieves user's profile from API based on user session access token
 */
const fetch_profile = async (): Promise<Profile | null> => {
  const { data, error } = await api.profile.me.get()
  return error ? null : data
}

/**
 * Fetches user's profile based on auth session from API
 * and sets everything up in store
 * @returns complete auth state object
 */
const build_state = async (session: Session | null, error: Error | null = null): Promise<AuthState> => {
  if (error || !session) {
    return { user: null, session: null, profile: null, is_loading: false, error }
  }
  const profile = await fetch_profile()
  return { user: session.user, session, profile, is_loading: false, error: null }
}

/**
 * Resolves when initial auth check completes
 * 
 * **IMPORTANT**: Should be called only once per app!
 */
export const auth_ready = new Promise<void>((resolve) => {
  const set = useAuthStore.setState

  async function init() {
    try {
      const { data, error } = await supabase.auth.getSession()
      /** 
       * [WORKAROUND] Set session to expose access token for API call
       * whilst fetching profile data inside `build_state`
       */
      if (data.session) set({ session: data.session })

      const state = await build_state(data.session, error)
      set(state)
      resolve()
      
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event !== "INITIAL_SESSION") {
          set(await build_state(session))
        }
      })
    } catch (e) {
      const state = await build_state(
        null,
        e instanceof Error ? e : new Error("Auth Initialization Failed!")
      )
      set(state)
      resolve()
    }
  }
  init()
})
