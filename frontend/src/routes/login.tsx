import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { login_schema } from "@shared/auth"

import {
  Form,
  TextField,
  Label,
  Input,
  FieldError,
  Button,
  Alert,
  Separator,
  Spinner
} from "@heroui/react"
import BracketLink from "../components/action/BracketLink"

import { supabase } from "../config/supabase"
import { api } from "../api"
import { Icon } from "@iconify/react"

export const Route = createFileRoute("/login")({
  component: LoginPage,
})

export default function LoginPage() {
  const navigate = useNavigate()

  const { register, formState: { errors }, handleSubmit } = useForm({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(login_schema),
  })

  const sign_in = useMutation({
    mutationFn: async (form_data: z.infer<typeof login_schema>) => {
      const { data, error } = await api.auth.signin.post(form_data)
      if (error || !data?.session) {
        throw new Error(error?.value?.message ?? "Sign In failed")
      }
      return data.session
    },
    onSuccess: async (session) => {
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      })
      navigate({ to: "/" })
    },
  })

  const google_sign_in = useMutation({
    mutationFn: async () => {
      const { data, error } = await api.auth.oauth.google.get()
      if (error || !data?.url) {
        throw new Error("Failed to initiate Google Sign In")
      }
      return data.url
    },
    onSuccess: (url) => {
      window.location.href = url
    },
  })

  const error = sign_in.error?.message ?? google_sign_in.error?.message

  return (
    <main className="flex-1 p-6">
      <div className="max-w-sm flex flex-col gap-6">
        <h1>Sign In</h1>

        <Form onSubmit={handleSubmit(data => sign_in.mutate(data))}
          className="flex flex-col gap-4">
          <TextField isInvalid={!!errors.email}>
            <Label>Email</Label>
            <Input type="text"
              placeholder="bernard@bolzano.app"
              {...register("email")}/>
            <FieldError>{errors.email?.message}</FieldError>
          </TextField>

          <TextField
            isInvalid={!!errors.password}>
            <Label>Password</Label>
            <Input
              type="password"
              {...register("password")} />
            <FieldError>{errors.password?.message}</FieldError>
          </TextField>

          <Button type="submit"
            isPending={sign_in.isPending}
            className="w-1/3">
            {sign_in.isPending ? (
              <>
                <Spinner size="sm" color="current"/>
                Loading&hellip;
              </>
            ) : "Sign In"}
          </Button>

          {error && (
            <Alert status="danger">
              <Alert.Indicator/>
              <Alert.Content>
                <Alert.Title>{error}</Alert.Title>
              </Alert.Content>
            </Alert>
          )}
        </Form>

        <p className="text-sm">
          Don't have an account?{" "}
          <BracketLink to="/signup">
            Create one
          </BracketLink>
        </p>

        <div className="relative">
          <p className="text-sm absolute w-full text-center -top-2.75">
            <span className="bg-alpha fade-edges px-6">or</span>
          </p>
          <Separator/>
        </div>

        <Button variant="tertiary"
          fullWidth
          onPress={() => google_sign_in.mutate()}
          isPending={google_sign_in.isPending}>
          <Icon icon="logos:google-icon"/>
          Continue with Google
        </Button>
      </div>
    </main>
  )
}
