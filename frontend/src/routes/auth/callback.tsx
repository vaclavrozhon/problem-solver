import { useEffect, useState } from "react"
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import { styled } from "@linaria/react"
import { supabase } from "../../config/supabase"

export const Route = createFileRoute("/auth/callback")({ component: AuthCallback })


export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, set_error] = useState<string | null>(null)

  useEffect(() => {
    const handle_callback = async () => {
      // Get tokens from URL hash (fragment)
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)

      const access_token = params.get("access_token")
      const refresh_token = params.get("refresh_token")

      if (!access_token || !refresh_token) {
        set_error("Authentication failed. Missing tokens.")
        return
      }

      try {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        })

        if (error) {
          set_error(error.message)
          return
        }

        // Clear the hash from URL for security
        window.history.replaceState(null, "", window.location.pathname)

        navigate({ to: "/" })
      } catch (err) {
        set_error("Failed to establish session")
      }
    }

    handle_callback()
  }, [navigate])

  return (
    <MainContent>
      {error ? (
        <>
          <h1>Authentication Error</h1>
          <p>{error}</p>
          <Link to="/login" search={{ error: undefined, message: undefined }}>Return to login</Link>
        </>
      ) : (
        <>
          <h1>Authenticating...</h1>
          <p>Please wait while we sign you in.</p>
        </>
      )}
    </MainContent>
  )
}

const MainContent = styled.main`
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  min-height: 50vh;
`
