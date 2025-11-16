import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { styled } from "@linaria/react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import Markdown from "../components/Markdown"
import BracketButton from "../components/action/BracketButton"
import ErrorBox from "../components/form/ErrorBox"
import { Form, FormField, FormLabel, FormInput, FormTextarea } from "../styles/Form"

export const Route = createFileRoute("/create")({ component: CreateProblem })

const CreateProblemFormSchema = z.object({
  // TODO: check also in backend
  problem_name: z.string().nonempty("Problem needs name!").min(5, "Problem Name needs to be at least 5 characters long."),
  problem_task: z.string().nonempty("Problem needs task description!").min(20, "Problem Task description needs to be at least 20 characters long."),
})

function CreateProblem() {
  const [show_preview, setShowPreview] = useState(false)

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
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
      <h1>Create new research problem</h1>
      <Form onSubmit={handleSubmit(onFormSubmit)}>
        <FormField>
          <FormLabel htmlFor="problem_name">Problem Name</FormLabel>
          <FormInput {...register("problem_name")}
            id="problem_name"
            type="text"
            placeholder="e.g. Graph Coloring Problem"/>
        </FormField>
        <FormField>
          <FormLabel htmlFor="problem_task">Problem Task</FormLabel>
          <FormTextarea {...register("problem_task")}
            id="problem_task"
            placeholder="Describe the problem you want to solve. Be specific about the goals, constraints and expected outcomes."
            rows={15}/>
          <p>Feel free to include Markdown formatting and most importantly KaTeX (use only inline math: $...$).</p>
          <p>It is not possible to edit the Problem Task later!</p>
        </FormField>
        <BracketButton type="submit">Create new problem</BracketButton>
      </Form>
      <ErrorBox errors={errors}/>
      <LivePreviewSection>
        {show_preview ? (
          <div>
            <h2>Live Task Preview</h2>
            <Markdown md={watch("problem_task") || "Problem task not specified yet."}/>
          </div>
        ) : (
          <div>
            <p>You can enable live preview of Problem Task in Markdown & KaTeX by clicking this button</p>
            <BracketButton onClick={() => setShowPreview(true)}>Show preview</BracketButton>
          </div>
        )}
      </LivePreviewSection>
    </MainContent>
  )
}

const LivePreviewSection = styled.section`
  margin-top: 1rem;
`

const MainContent = styled.main`
  display: flex;
  flex-flow: column;
  padding: 1rem;
  gap: 1rem;
`