import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Button, Spinner } from "@heroui/react"
import { Icon } from "@iconify/react"
import { useAuth } from "../../auth/hook"

export function SignOut() {
  const navigate = useNavigate()
  const { sign_out } = useAuth()
  const [is_pending, setIsPending] = useState(false)

  async function handle_sign_out() {
    setIsPending(true)
    const { error } = await sign_out()
    if (error) {
      console.error("Sign out failed:", error)
      setIsPending(false)
      return
    }
    navigate({ to: "/login", search: { error: undefined, message: undefined } })
  }

  return (
    <Button variant="danger-soft"
      onPress={handle_sign_out}
      isPending={is_pending}
      className="w-37">
      {is_pending ? (
        <>
          <Spinner color="current" size="sm"/>
          Signing out&hellip;
        </>
      ) : (
        <>
          <Icon icon="gravity-ui:arrow-right-from-square"/>
          Sign Out
        </>
      )}
    </Button>
  )
}