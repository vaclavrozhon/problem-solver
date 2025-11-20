import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { styled } from "@linaria/react"
import { css } from "@linaria/core"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import DetailsLayout from "../../../components/problem/DetailsLayout"

import { FormField, FormInput, FormLabel, FormTextarea} from "../../../styles/Form"
import { useForm } from "react-hook-form"
import ErrorBox from "../../../components/form/ErrorBox"

import SplitViewEditor from "../../../components/app/SplitViewEditor"
import BracketButton from "../../../components/action/BracketButton"

export const Route = createFileRoute("/problem/$problem_id/research")({
  component: RunNewResearchPage,
})

const AvailableModels = z.enum(["GPT5", "GPT5.1"])
// TODO: add max number of provers & rounds? in backend
// like 10?
const RunResearchConfigSchema = z.object({
  rounds_count: z.coerce.number().min(1).max(10),
  provers: z.object({
    count: z.coerce.number().min(1).max(10),
    general_advice: z.string(),
    list: z.array(z.object({
      num: z.coerce.number().min(1).max(10), // these numbers related to provers.count
      advice: z.string(),
      model: AvailableModels,
    })),
  }),
  verifier: z.object({
    advice: z.string(),
    model: AvailableModels,
  }),
  summarizer: z.object({
    model: AvailableModels,
  }),
  prompts: z.object({
    prover: z.string(),
    verifier: z.string(),
    summarizer: z.string(),
  })
})

function RunNewResearchPage() {
  const { problem_id } = Route.useParams()
  const [selected_prompt, setSelectedPrompt] = useState<"prover" | "verifier" | "summarizer">("prover")
  const [prompts, setPrompts] = useState({
    prover: "",
    verifier: "Verify this!",
    summarizer: "Summa summarum!",
  })

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      rounds_count: 1,
      provers: {
        count: 1,
      },
      prompts,
    },
    resolver: zodResolver(RunResearchConfigSchema)
  })
  const provers_count = Number(watch("provers.count")) >= 1 && Number(watch("provers.count")) <= 10 ? Number(watch("provers.count")) : 0

  function onFormSubmit(data: z.infer<typeof RunResearchConfigSchema>) {
    console.log(data)
  }

  return (
    <DetailsLayout problem_id={problem_id}>
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

      <h2 className={css`
        padding: 1rem;
      `}>⚙️ New run configuration</h2>
      <NewRunForm onSubmit={handleSubmit(onFormSubmit)}>
        <section className="form_inputs">
          <ConfigSection>
            <h3>General</h3>
            <div className="row_input">
              <FormLabel htmlFor="rounds_count">Rounds</FormLabel>
              <FormInput {...register("rounds_count")}
                id="rounds_count"
                type="number"
                min={1}
                max={10}
                defaultValue={1}/>
            </div>
            <div className="row_input">
              <FormLabel htmlFor="provers_count">Provers</FormLabel>
              <FormInput {...register("provers.count")}
                id="provers.count"
                type="number"
                min={1}
                max={10}
                defaultValue={1}/>
            </div>
            {/* TODO: Add timeout option. Should discuss this in relation to price.... how many rounds & prover should we allow. So time for each prover/round. */} 
          </ConfigSection>

          <ConfigSection>
            <h3>Provers config</h3>
            {provers_count === 0 ? (
              <p>Can't configure provers – something went wrong.</p>
            ) : (
              <>
                <div className="row_input">
                  <FormLabel>General Advice</FormLabel>
                  <FormTextarea {...register("provers.general_advice")}
                    id="provers.general_advice"
                    placeholder="Give all the provers some expert advice..."
                    rows={1}/>
                </div>
                <ProversConfig>
                  <div className="header">
                    <p>Prover #</p>
                    <p>Advice for the prover (optional)</p>
                    <p>Model</p>
                  </div>
                  {Array.from({ length: provers_count }, (_, i) => (
                    <>
                      <input {...register(`provers.list.${i}.num`)}
                        defaultValue={i + 1}
                        type="hidden"/>
                      <div key={i}>
                        <p>Prover {i + 1}</p>
                        <textarea {...register(`provers.list.${i}.advice`)}
                          placeholder="Describe what this prover should focus on..."
                          rows={2}/>
                        <select {...register(`provers.list.${i}.model`)}>
                          <option value="GPT5">GPT-5</option>
                          <option value="Gemini3">Gemini 3</option>
                        </select>
                      </div>
                    </>
                  ))}
                </ProversConfig>
                <p>The General Advice is included in prompt for all provers. Additionally, you can give each prover some indiviual advice on top of the General Advice. (So that each prover focuses on something else – or leave it empty.) Both advices will be included in the prompt.</p>
              </>
            )}
          </ConfigSection>

          {/* TODO: is it necessary to include 'Calculator' in the prompt? */}
          <ConfigSection>
            <h3>Verifier config</h3>
            <div className="row_input">
              <FormLabel htmlFor="verifier.advice">Advice</FormLabel>
              <FormTextarea {...register("verifier.advice")}
                id="verifier.advice"
                placeholder="Describe what the verifier should focus on..."
                rows={1}/>
            </div>
            <div className="row_input">
              <FormLabel htmlFor="verifier.model">Model</FormLabel>
              <select {...register("verifier.model")}
                id="verifier.model">
                <option value="GPT5">GPT 5</option>
              </select>
            </div>
          </ConfigSection>

          <ConfigSection>
            <h3>Summarizer config</h3>
            <div className="row_input">
              <FormLabel htmlFor="summarizer.model">Model</FormLabel>
              <select {...register("summarizer.model")}
                id="summarizer.model">
                <option value="GPT5">GPT 5</option>
              </select>
            </div>
          </ConfigSection>

        </section>

        <PromptSection>
          <h3>Prompts config</h3>
          <div>
            <p>Edit/preview the:</p>
            {Object.entries(prompts).map(([prompt_name]) => (
              <button type="button"
                className={selected_prompt === prompt_name ? "selected" : ""}
                onClick={() => setSelectedPrompt(prompt_name)}
                key={prompt_name}>{prompt_name}.prompt</button>
            ))}
          </div>
          <SplitViewEditor md={watch(`prompts.${selected_prompt}`)}
            onChange={new_value => setValue(`prompts.${selected_prompt}`, new_value)}/>
          {/* TODO: How to enforce where results from e.g. prover.prompt will go into verifier.prompt? */}
          <p>These prompts are not final! comment on...</p>
        </PromptSection>
        <BracketButton type="submit">Run Research!</BracketButton>
      </NewRunForm>
      <ErrorBox errors={errors}/>
    </DetailsLayout>
  )
}

const ProversConfig = styled.div`
  display: flex;
  flex-flow: column;
  width: 100%;
  border: var(--border-alpha);
  border-radius: .2rem;
  & > div {
    display: flex;
    width: 100%;
    &:not(:last-child) {
      border-bottom: var(--border-alpha);
    }
    &.header {
      font-family: Kode;
      text-transform: uppercase;
      font-weight: 600;
      background: var(--bg-beta);
      color: var(--text-beta);
    }
    & textarea, select {
      background: var(--bg-alpha);
      color: var(--text-alpha);
    }
    & textarea {
      border: none;
      resize: none;
    }
    & select {
      border-radius: none;
      border: none;
      font-size: 1rem;
    }
    & p {
      display: flex;
      align-items: center;
    }
    & > * {
      padding: .3rem .6rem;
    }
    & > *:not(:last-child) {
      border-right: var(--border-alpha);
    }
    & > *:first-child {
      flex: 1;
    }
    & > *:nth-child(2) {
      flex: 3;
    }
    & > *:nth-child(3) {
      flex: 1;
    }
  }
`

const ConfigSection = styled.section`
  display: flex;
  flex-flow: column;
  gap: 1rem;
  padding: 1rem;
  &:not(:last-of-type) {
    border-bottom: 6px double var(--border-alpha-color);
  }
  & > div.row_input {
    display: flex;
    align-items: center;
    gap: 1rem;
    & textarea {
      flex: 1;
    }
  }
  & input[type=number] {
    min-width: 4rem;
  }
`

const NewRunForm = styled.form`
  display: flex;
  flex-flow: column;
  & > section.form_inputs {
    max-width: 45rem;
    width: 100%;
  }
  & h3 {
    font-family: Kode;
    text-transform: uppercase;
  }
`

const PromptSection = styled.section`
  display: flex;
  flex-flow: column;
  border-top: var(--border-beta);
  & > h3 {
    padding: 1rem;
    padding-bottom: 0;
  }
  & > div {
    display: flex;
    align-items: center;
    padding: 1rem;
    gap: 1rem;
    & > p {

    }
    & > button {
      padding: .3rem .6rem;
      border-radius: .2rem;
      background: var(--bg-beta);
      &:hover {
        background: var(--bg-gamma);
      }
      &.selected {
        background: var(--bg-delta);
        color: var(--text-beta);
        outline: 2px solid var(--text-alpha);
        pointer-events: none;
      }
    }
  }
`