import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { styled } from "@linaria/react"
import { css } from "@linaria/core"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"

import ProblemDetailsLayout, { MainContent } from "../../../components/problem/DetailsLayout"

import { FormField, FormInput, FormLabel, FormTextarea} from "../../../styles/Form"
import { useForm } from "react-hook-form"
import ErrorBox from "../../../components/form/ErrorBox"
import { api } from "../../../api"
import { get_research_overview } from "../../../api/problems"
import { NewStandardResearch, MaxProversPerRound, MaxRoundsPerResearch, LLMModelsMap } from "@shared/types/research"

import ProverPromptTemplate from "@shared/prompts/prover.md?raw"
import VerifierPromptTemplate from "@shared/prompts/verifier.md?raw"
import SummarizerPromptTemplate from "@shared/prompts/summarizer.md?raw"

import SplitViewEditor from "../../../components/app/SplitViewEditor"
import BracketButton from "../../../components/action/BracketButton"

export const Route = createFileRoute("/problem/$problem_id/research")({
  component: RunNewResearchPage,
})

type PromptTypes = "prover" | "verifier" | "summarizer"

function RunNewResearchPage() {
  const { problem_id } = Route.useParams()
  const [selected_prompt, setSelectedPrompt] = useState<PromptTypes>("prover")
  // TODO: Load prompts from @shared
  const [prompts, setPrompts] = useState({
    prover: ProverPromptTemplate,
    verifier: VerifierPromptTemplate,
    summarizer: SummarizerPromptTemplate,
  })
  const { data: problem, isError, isPending } = useQuery({
    queryKey: ["problem-research"],
    queryFn: () => get_research_overview(problem_id)
  })

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      rounds: "1",
      prover: {
        count: "1",
        prompt: prompts["prover"],
      },
      verifier: {
        prompt: prompts["verifier"],
      },
      summarizer: {
        prompt: prompts["summarizer"],
      }
    },
    resolver: zodResolver(NewStandardResearch)
  })

  if (isPending) return (
    <ProblemDetailsLayout problem_id={problem_id} problem_name="" loading>
      <p>Loading research run config...</p>
    </ProblemDetailsLayout>
  )

  if (isError) return (
    <MainContent>
      <p>Failed to load research run config for problem with id: {problem_id}</p>
    </MainContent>
  )

  if (problem.status === "running" || problem.status === "queued") return (
    <ProblemDetailsLayout problem_id={problem_id}
      problem_name={problem.name}>
        <p>Active research running – can't run anything else for now.</p>
    </ProblemDetailsLayout>
  )

  let provers_count = Number(watch("prover.count"))
  provers_count = provers_count >= 1 && provers_count <= MaxProversPerRound ? provers_count : 0

  async function onFormSubmit(data: z.infer<typeof NewStandardResearch>) {
    const result = await api.research["run-standard-research"].post(data)
    if (result.error) {
      // TODO: Handle error!
      alert("ERROR!")
      console.log(result.error)
      return
    }
    alert("success!")
  }

  return (
    <ProblemDetailsLayout problem_id={problem_id}
      problem_name={problem.name}>
      <h2 className={css`
        padding: 1rem;
      `}>⚙️ New run configuration</h2>
      <NewRunForm onSubmit={handleSubmit(onFormSubmit)}>
        <input {...register("problem_id")}
          type="hidden"
          value={problem_id}/>
        <section className="form_inputs">
          <ConfigSection>
            <h3>General</h3>
            <div className="row_input">
              <FormLabel htmlFor="rounds">Rounds</FormLabel>
              <FormInput {...register("rounds")}
                id="rounds"
                type="number"
                inputMode="numeric"
                min={1}
                max={MaxRoundsPerResearch}
                defaultValue={1}/>
            </div>
            <div className="row_input">
              <FormLabel htmlFor="prover_count">Provers</FormLabel>
              <FormInput {...register("prover.count")}
                id="prover_count"
                type="number"
                inputMode="numeric"
                min={1}
                max={MaxProversPerRound}
                defaultValue={1}/>
            </div>
          </ConfigSection>

          <ConfigSection>
            <h3>Provers config</h3>
            {provers_count === 0 ? (
              <p>Can't configure provers – something went wrong.</p>
            ) : (
              <>
                <div className="row_input">
                  <FormLabel>General Advice</FormLabel>
                  <FormTextarea {...register("prover.general_advice")}
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
                    <div key={i}>
                      <p>Prover {i + 1}</p>
                      <textarea {...register(`prover.provers.${i}.advice`)}
                        placeholder="Describe what this prover should focus on..."
                        rows={2}/>
                      <select {...register(`prover.provers.${i}.model`)}>
                        {Object.keys(LLMModelsMap["smart"]).map(model => (
                          <option key={model}
                            value={model}>{model}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </ProversConfig>
                <p>The General Advice is included in prompt for all provers. Additionally, you can give each prover some indiviual advice on top of the General Advice. (So that each prover focuses on something else – or leave it empty.) Both advices will be included in the prompt.</p>
              </>
            )}
          </ConfigSection>

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
                {Object.keys(LLMModelsMap["smart"]).map(model => (
                  <option key={model}
                    value={model}>{model}</option>
                ))}
              </select>
            </div>
          </ConfigSection>

          <ConfigSection>
            <h3>Summarizer config</h3>
            <div className="row_input">
              <FormLabel htmlFor="summarizer.model">Model</FormLabel>
              <select {...register("summarizer.model")}
                id="summarizer.model">
                {Object.keys(LLMModelsMap["summarizer"]).map(model => (
                  <option key={model}
                    value={model}>{model}</option>
                ))}
              </select>
            </div>
          </ConfigSection>

        </section>
        
        <PromptSection>
          <h3>Prompts config</h3>
          <div className="prompt_switcher">
            <p>Edit/preview the:</p>
            {Object.entries(prompts).map(([prompt_name]) => (
              <button type="button"
                className={selected_prompt === prompt_name ? "selected" : ""}
                // BUG: This "as" cast seems sketchy... 
                onClick={() => setSelectedPrompt(prompt_name as PromptTypes)}
                key={prompt_name}>{prompt_name}.prompt</button>
            ))}
          </div>
          <SplitViewEditor md={watch(`${selected_prompt}.prompt`)}
            onChange={new_value => setValue(`${selected_prompt}.prompt`, new_value)}/>
          {/* TODO/NOTE: OpenRouter easily supports extracting text from PDF. It might be pricier depending on the model/pdf size but it should be implemented easily if required.  */}
          <div className="flex-col pad-1">
            <p>Generald Advice & Individual Advice for provers will be appended to the prompt automatically during processing in the backend.</p>
            <p><strong>Don't</strong> specify output JSON structure. That's handled automatically in the backend. But you can specify what the output should look like it's drafted in the prompt template.</p>
          </div>
        </PromptSection>

        <section className="final flex-col pad-1 gap-1">
          <div>
            <BracketButton type="submit">Run Research</BracketButton>
          </div>
          <ErrorBox errors={errors}/>
        </section>
      </NewRunForm>
    </ProblemDetailsLayout>
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
      flex: 7;
    }
    & > *:nth-child(3) {
      max-width: 14rem;
      width: 100%;
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
    max-width: 60rem;
    width: 100%;
  }
  & > section.final {
    margin-top: -1rem;
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
  & > div.prompt_switcher {
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