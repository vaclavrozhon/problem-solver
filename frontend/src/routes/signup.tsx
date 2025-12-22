import { useState, FormEvent, FormEventHandler } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { styled } from "@linaria/react"
import BracketButton from "../components/action/BracketButton"
import BracketLink from "../components/action/BracketLink"

import { supabase } from "../config/supabase"
import { api } from "../api"

export const Route = createFileRoute("/signup")({
  component: SignupPage
})


export default function SignupPage() {
  const navigate = useNavigate()
  const [name, set_name] = useState<string>("")
  const [email, set_email] = useState<string>("")
  const [password, set_password] = useState<string>("")
  const [message, set_message] = useState<string>("")
  const [is_loading, set_loading] = useState(false)

  // TODO: migrate to react-form-hook
  const handle_signup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    set_message("")
    set_loading(true)

    try {
      const { data, error } = await api.auth.signup.post({
        name,
        email,
        password,
      })

      if (error) {
        set_message(error.value?.message ?? "Signup failed")
        set_loading(false)
        return
      }

      if (data?.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })
        navigate({ to: "/" })
      } else {
        navigate({ to: "/login", search: { error: undefined, message: undefined } })
      }
    } catch (err) {
      set_message("Network error - please try again")
    } finally {
      set_loading(false)
    }
  }

  const handle_google_signup = async () => {
    set_message("")
    set_loading(true)

    try {
      const { data, error } = await api.auth.oauth.google.get()

      if (error || !data?.url) {
        set_message("Failed to initiate Google sign up")
        set_loading(false)
        return
      }

      window.location.href = data.url
    } catch (err) {
      set_message("Network error - please try again")
      set_loading(false)
    }
  }

  return (
    <MainContent>
      <h1>Create Account</h1>
      <AuthForm onSubmit={handle_signup}>
        <TextInput name="name" label="YOUR NAME"
          onInput={e => set_name(e.currentTarget.value)} />
        <TextInput name="email" label="EMAIL ADDRESS"
          onInput={e => set_email(e.currentTarget.value)} />
        <TextInput name="password" label="PASSWORD" type="password"
          onInput={e => set_password(e.currentTarget.value)} />
        <BracketButton type="submit" disabled={is_loading}>
          {is_loading ? "Creating..." : "Create Account"}
        </BracketButton>
        {message && (
          <p className="form-message">
            <span>ERROR</span>
            {message}
          </p>
        )}
      </AuthForm>
      <p>Already have an account? <BracketLink to="/login" search={{ error: undefined, message: undefined }}>Sign In</BracketLink></p>
      <GoogleSignIn>
        <p>Or simly</p>
        <BracketButton onClick={handle_google_signup} disabled={is_loading}>
          Get In with Google
        </BracketButton>
      </GoogleSignIn>
    </MainContent>
  )
}

const GoogleSignIn = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  width: 100%;
  gap: 1rem;
  max-width: 24rem;
`

const AuthForm = styled.form`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  max-width: 24rem;
  gap: 1rem;
  border-radius: .4rem;
  & p.form-message {
    background: var(--bg-beta);
    padding: .3rem .6rem;
    border: var(--border-alpha);
    border-radius: .2rem;
    & span {
      font-weight: 500;
      color: var(--accent-alpha);
      margin-right: .2rem;
      border-right: var(--border-alpha);
      padding: .3rem 0;
      margin: -.3rem 0;
      padding-right: .6rem;
      margin-right: .6rem;
    }
  }
`

const MainContent = styled.main`
  display: flex;
  flex-flow: column;
  gap: 1rem;
  padding: 1.5rem;
`

interface InputProps {
  name: string,
  label: string,
  type?: "text" | "password",
  onInput: FormEventHandler<HTMLInputElement>,
}

function TextInput({ name, label, type = "text", onInput }: InputProps) {
  return (
    <TextInputStyled>
      <input
        id={`input-${name}`}
        type={type}
        name={name}
        placeholder=" "
        onInput={onInput}
        autoComplete="off"
        autoCorrect="off"/>
      <label htmlFor={name}>{label}</label>
    </TextInputStyled>
  )
}

const TextInputStyled = styled.div`
position: relative;
display: flex;
width: 100%;
background: var(--bg-beta);
border-radius: 6px 6px 0 0;
cursor: text;
& label {
  position: absolute;
  text-transform: uppercase;
  color: var(--text-alpha);
  font-weight: 600;
  font-size: 1.1rem;
  cursor: text;
  user-select: none;
  pointer-events: none;
  transform: translate(22.5px, 25.5px);
  transform-origin: top left;
  transition: all 0.15s ease-out;
  z-index: 2;
}
& input {
  font-size: 1.1rem;
  background: var(--bg-beta);
  color: var(--text-beta);
  font-weight: 500;
  border: 0;
  padding: 36px 22.5px 11px 22.5px;
  border-bottom: 2px solid var(--text-alpha);
  width: 100%;
  &:autofill {
    -webkit-text-fill-color: var(--text-beta);
  }
  &:focus {
    border-color: var(--accent-alpha);
    & + label {
      color: var(--accent-alpha);
    }
  }
  &:focus + label, &:not(:placeholder-shown) + label {
    transform: translate(22.5px, 12.5px) scale(0.82);
  }
}
& p {
  display: none;
  position: absolute;
  right: 22.5px;
  color: var(--text-alpha);
  font-weight: 500;
  bottom: 13px;
  font-size: 1.1rem;
  pointer-events: none;
  user-select: none;
}
`
