import { useState, FormEvent } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { styled } from "@linaria/react"
import BracketButton from "../components/action/BracketButton"

import { supabase } from "../config/supabase"

export const Route = createFileRoute("/login")({ component: LoginPage })


export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [message, setMessage] = useState<string>("");

  const handleEmailSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message ?? "Sign in failed");
      } else {
        navigate({ to: "/" })
      }
    } catch (err) {
      setMessage("Network error — please try again");
    }
  };

  const handleGoogleSignIn = async () => {
    setMessage("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
      if (error) setMessage(error.message ?? "Google Sign In failed");
    } catch (err) {
      setMessage("Network error — please try again");
    }
  };

  return (
    <MainContent>
      <h1>Sign In</h1>
      <AuthForm onSubmit={handleEmailSignIn}>
        <TextInput name="email" label="EMAIL ADDRESS"
          onInput={e => setEmail(e.target.value)}/>
        <TextInput name="password" label="PASSWORD" type="password"
          onInput={e => setPassword(e.target.value)}/>
        <BracketButton type="submit">Sign In with Email & Password</BracketButton>
        {message && (
          <p className="form-message">
            <span>ERROR</span>
            {message}
          </p>
        )} 
      </AuthForm>
      <GoogleSignIn>
        <p>or</p>
        <BracketButton onClick={handleGoogleSignIn}>Sign In with Google</BracketButton>
      </GoogleSignIn>
      <p>Google Sign In could possibly be broken – I didn't have the opportunity to test it yet.</p>
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
  /* border: var(--border-alpha); */
  border-radius: .4rem;
  /* padding: 1rem; */
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
  onInput: any,
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
/* // flex-flow: column */
background: var(--bg-beta);
/* // padding: 20px 25px */
/* // padding: 30px 0 10px 0 */
border-radius: 6px 6px 0 0;
/* // padding-top: 36px */
/* // overflow: hidden */
cursor: text;
// border: var(--border-alpha)
// border-bottom: 2px solid #c5625a
& label {
  position: absolute;
  // top: 20px
  // left: 22.5px
  // bottom: 23.5px
  // color: v(card-heading-color)
  text-transform: uppercase;
  // color: #c5625a
  color: var(--text-alpha);
  font-weight: 600;
  // margin-top: 2.5px
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
  // height: 23px
  // flex: 1
  font-size: 1.1rem;
  background: var(--bg-beta);
  color: var(--text-beta);
  font-weight: 500;
  border: 0;
  padding: 36px 22.5px 11px 22.5px;
  border-bottom: 2px solid var(--text-alpha);
  width: 100%;
  // margin-top: 29.5px
  // padding: 
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
    // top: 12.5px
    transform: translate(22.5px, 12.5px) scale(0.82);
    // font-size: .9rem
  }
}
&.unit input {
  padding-right: 48.75px;
  text-align: right;
  &:focus ~ p, &:not(:placeholder-shown) ~ p {
    display: flex;
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