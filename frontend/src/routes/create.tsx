import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useMutation } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import SplitViewEditor from "../components/app/SplitViewEditor"
import { Form } from "../styles/Form"
import { api } from "../api"
import { Button, Spinner, Alert, TextField, Label, Input, FieldError, Chip } from "@heroui/react"
import { CreateProblemFormSchema } from "@shared/types/problem"

export const Route = createFileRoute("/create")({ component: CreateProblem })

function CreateProblem() {
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, control } = useForm({
    defaultValues: {
      problem_name: "",
      problem_task: "",
    },
    resolver: zodResolver(CreateProblemFormSchema)
  })

  const create_problem = useMutation({
    mutationFn: async (form_data: z.infer<typeof CreateProblemFormSchema>) => {
      // @ts-expect-error Elysia BUG
      const { data, error } = await api.problems["create-new-problem"].post(form_data)
      if (error || !data?.data?.problem_id) {
        // @ts-expect-error Elysia BUG
        const message = error?.value?.message ?? "Failed to create problem"
        throw new Error(message)
      }
      return data.data.problem_id
    },
    onSuccess: (problem_id) => {
      navigate({
        to: "/problem/$problem_id",
        params: { problem_id }
      })
    },
  })

  return (
    <main className="flex-1 flex flex-col gap-4 pb-4">
      <h1 className="px-4">Create new research problem</h1>
      <Form onSubmit={handleSubmit(data => create_problem.mutate(data))}>
        <TextField isInvalid={!!errors.problem_name}
          className="px-4 max-w-md w-full">
          <Label>Problem Name</Label>
          <Input type="text"
            placeholder="Graph Coloring Problem"
            className="w-full"
            {...register("problem_name")}/>
          <FieldError>{errors.problem_name?.message}</FieldError>
        </TextField>
        <TextField isInvalid={!!errors.problem_task}
          className="w-full">
          <Label htmlFor="problem_task"
            className="px-4 pb-1">Problem Task</Label>
          <Controller name="problem_task"
            control={control}
            render={({ field }) => (
              <SplitViewEditor md={field.value}
                onChange={field.onChange}
                placeholder="Describe the problem you want to solve. Be specific about the goals, constraints and expected outcomes."/>
            )}/>
          <FieldError className="px-4 py-1">{errors.problem_task?.message}</FieldError>
        </TextField>
          <div className="flex flex-col px-4 items-start gap-2">
            <p>Feel free to include Markdown formatting and most importantly KaTeX (use only inline math: $...$).</p>
            <Chip className="p-0 py-2 pr-3 leading-none">
              <span className="rounded-full bg-warn/60 p-2.25 -my-2 text-xs kode font-bold leading-none">
                NOTE
              </span>
              It is not possible to edit the Problem Name & Task later
            </Chip>
            <Button type="submit"
              isPending={create_problem.isPending}
              className="w-44 mt-4">
              {create_problem.isPending ? (
                <>
                  <Spinner size="sm" color="current"/>
                  Creating&hellip;
                </>
              ) : "Create new problem"}
            </Button>
          </div>
      </Form>
      {create_problem.error && (
        <Alert status="danger"
          className="mx-4">
          <Alert.Indicator/>
          <Alert.Content>
            <Alert.Title>{create_problem.error.message}</Alert.Title>
          </Alert.Content>
        </Alert>
      )}
    </main>
  )
}