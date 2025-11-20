import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { styled } from "@linaria/react"
import { css } from "@linaria/core"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import Markdown from "../components/Markdown"
import SplitViewEditor from "../components/app/SplitViewEditor"
import BracketButton from "../components/action/BracketButton"
import ErrorBox from "../components/form/ErrorBox"
import { Form, FormField, FormLabel, FormInput, FormTextarea } from "../styles/Form"

export const Route = createFileRoute("/create")({ component: CreateProblem })

export const CreateProblemFormSchema = z.object({
  // TODO: to @shared
  problem_name: z.string().nonempty("Problem needs name!").min(5, "Problem Name needs to be at least 5 characters long."),
  problem_task: z.string().nonempty("Problem needs task description!").min(20, "Problem Task description needs to be at least 20 characters long."),
})

function CreateProblem() {
  const [show_preview, setShowPreview] = useState(false)

  const { register, handleSubmit, formState: { errors }, watch, control } = useForm({
    defaultValues: {
      problem_name: "",
      problem_task: "",
    },
    resolver: zodResolver(CreateProblemFormSchema)
  })

  function onFormSubmit(data: z.infer<typeof CreateProblemFormSchema>) {
    // TODO: create problem in DB, then navigate to the created problem
  }

  return (
    <MainContent>
      <div className={css`
          background: yellow;
          color: black;
          padding: 2rem;
          font-weight: 600;
          border: 6px solid black;
          & span {
            text-decoration: underline;
          }
        `}>
        <p>THIS IS JUST INTERFACE PREVIEW AND IS NOT YET CONNECTED TO THE BACKEND. <span>DO NOT USE!</span></p>
      </div>
      <h1>Create new research problem</h1>
      <Form onSubmit={handleSubmit(onFormSubmit)}>
        <FormField className="max-width">
          <FormLabel htmlFor="problem_name">Problem Name</FormLabel>
          <FormInput {...register("problem_name")}
            id="problem_name"
            type="text"
            placeholder="e.g. Graph Coloring Problem"/>
        </FormField>
        <FormField>
          <FormLabel htmlFor="problem_task">Problem Task</FormLabel>
          <Controller name="problem_task"
            control={control}
            render={({ field }) => (
              <SplitViewEditor md={field.value}
                onChange={field.onChange}
                placeholder="Describe the problem you want to solve. Be specific about the goals, constraints and expected outcomes."/>
            )}
            />
          <div className="padded">
            <p>Feel free to include Markdown formatting and most importantly KaTeX (use only inline math: $...$).</p>
            <p>It is not possible to edit the Problem Task later!</p>
          </div>
        </FormField>
        <BracketButton type="submit">Create new problem</BracketButton>
      </Form>
      <div className="padded">
        <ErrorBox errors={errors}/>
      </div>
    </MainContent>
  )
}

const MainContent = styled.main`
  display: flex;
  flex-flow: column;
  gap: 1rem;
  padding-bottom: 1rem;
  & button {
    margin: 0 1rem;
  }
  & div.padded {
    display: flex;
    flex-flow: column;
    padding: 0 1rem;
  }
  & h1 {
    padding: 0 1rem;
  }
`