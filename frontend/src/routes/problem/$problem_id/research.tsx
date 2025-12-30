import { useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useMutation } from "@tanstack/react-query"

import { Button, Spinner, Alert, AlertDialog, TextField, TextArea, NumberField, Label, Separator, Description, TagGroup, Tag, useOverlayState , UseOverlayStateReturn} from "@heroui/react"

import ProblemDetailsLayout from "../../../components/problem/DetailsLayout"

import ReasoningTag from "@frontend/components/problem/ReasoningTag"
import WebSearchTag from "@frontend/components/problem/WebSearchTag"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import ErrorBox from "../../../components/form/ErrorBox"
import { api } from "../../../api"
import { get_research_overview } from "../../../api/problems"
import { NewStandardResearch, MaxProversPerRound, MaxRoundsPerResearch, choose_model, get_model_by_id, ModelConfig } from "@shared/types/research"

import ProverPromptTemplate from "@shared/prompts/prover.md?raw"
import VerifierPromptTemplate from "@shared/prompts/verifier.md?raw"
import SummarizerPromptTemplate from "@shared/prompts/summarizer.md?raw"

import SplitViewEditor from "../../../components/app/SplitViewEditor"
import ModelSelect from "@frontend/components/form/ModelSelect"
import ProviderLogo from "@frontend/components/svg/ProviderLogo"

export const Route = createFileRoute("/problem/$problem_id/research")({
  component: RunNewResearchPage,
})

// TODO: better type
type PromptTypes = "prover" | "verifier" | "summarizer"
type NewStandardResearchType = z.infer<typeof NewStandardResearch>

function RunNewResearchPage() {
  const { problem_id } = Route.useParams()
  const navigate = useNavigate()

  const [selected_prompt, setSelectedPrompt] = useState<PromptTypes>("prover")
  const [pending_data, setPendingData] = useState<NewStandardResearchType | null>(null)

  const default_prompts = {
    prover: ProverPromptTemplate,
    verifier: VerifierPromptTemplate,
    summarizer: SummarizerPromptTemplate,
  }

  const research_modal_controller = useOverlayState()

  const { data: problem, isError, isPending } = useQuery({
    queryKey: ["problem-research"],
    queryFn: () => get_research_overview(problem_id)
  })

  const run_research = useMutation({
    mutationFn: async (form_data: NewStandardResearchType) => {
      // @ts-expect-error Elysia BUG
      const { error } = await api.research["run-standard-research"].post(form_data)
      // @ts-expect-error Elysia BUG
      if (error) throw new Error(error.value?.message ?? "Failed to start research")
    },
    onSuccess: () => navigate({
      to: "/problem/$problem_id",
      params: { problem_id }
    }),
  })

  const { register, handleSubmit, formState: { errors }, control } = useForm({
    defaultValues: {
      rounds: "1",
      prover: {
        count: "1",
        prompt: default_prompts["prover"],
        provers: [{
          model: choose_model("xiaomi/mimo-v2-flash:free", {
            reasoning_effort: true,
            web_search: false,
          })
        }],
      },
      verifier: {
        prompt: default_prompts["verifier"],
        model: choose_model("xiaomi/mimo-v2-flash:free", {
          reasoning_effort: true,
          web_search: false,
        }),
      },
      summarizer: {
        prompt: default_prompts["summarizer"],
        model: choose_model("xiaomi/mimo-v2-flash:free", {
          reasoning_effort: true,
          web_search: false,
        }),
      }
    },
    resolver: zodResolver(NewStandardResearch)
  })

  const { fields: provers, append, remove } = useFieldArray({
    control,
    name: "prover.provers",
  })

  const sync_provers_array = (new_prover_count: number) => {
    const current_count = provers.length
    if (new_prover_count > current_count) {
      for (let i = current_count; i < new_prover_count; i++) {
        append({ model: undefined } as any)
      }
    } else if (new_prover_count < current_count) {
      for (let i = current_count - 1; i >= new_prover_count; i--) {
        remove(i)
      }
    }
  }

  if (isPending) return (
    <ProblemDetailsLayout problem_id={problem_id} problem_name="" loading>
      <p>Loading research run config...</p>
    </ProblemDetailsLayout>
  )

  if (isError) return (
    <main className="flex-1 flex-center">
      <p>Failed to load research run config for problem with id: {problem_id}</p>
    </main>
  )

  if (problem.status === "running" || problem.status === "queued") return (
    <ProblemDetailsLayout problem_id={problem_id}
      problem_name={problem.name}>
      <div className="flex-1 flex-center">
        <p>Active research running – can't run anything else for now</p>
      </div>
    </ProblemDetailsLayout>
  )


  return (
    <ProblemDetailsLayout problem_id={problem_id}
      problem_name={problem.name}>
      <h2 className="p-4 pb-0 tracking-tight">New run configuration</h2>
      <form id="new_research_form"
        onSubmit={handleSubmit(data => {
          setPendingData(data)
          run_research.reset()
          research_modal_controller.open()
        })}
        className="flex flex-col [&_h3]:kode">
        <input {...register("problem_id")}
          type="hidden"
          value={problem_id}/>
        <section className="max-w-4xl divide-y-6 divide-double divide-edge *:flex *:flex-col *:gap-4 *:p-4">
          <section>
            <h3>General</h3>
            <Controller name="rounds"
              control={control}
              render={({ field }) => (
                <NumberField value={Number(field.value)}
                  onChange={field.onChange}
                  minValue={1}
                  maxValue={MaxRoundsPerResearch}
                  className="grid grid-cols-[5rem_8rem] items-center">
                  <Label>Rounds</Label>
                  <NumberField.Group>
                    <NumberField.DecrementButton/>
                    <NumberField.Input className="w-12 text-center"/>
                    <NumberField.IncrementButton/>
                  </NumberField.Group>
                </NumberField>
              )}/>
            <Controller name="prover.count"
              control={control}
              render={({ field }) => (
                <NumberField value={Number(field.value)}
                  onChange={(value) => {
                    field.onChange(value)
                    sync_provers_array(value)
                  }}
                  minValue={1}
                  maxValue={MaxProversPerRound}
                  className="grid grid-cols-[5rem_8rem] items-center">
                  <Label>Provers</Label>
                  <NumberField.Group>
                    <NumberField.DecrementButton/>
                    <NumberField.Input className="w-12 text-center"/>
                    <NumberField.IncrementButton/>
                  </NumberField.Group>
                </NumberField>
              )}/>
          </section>

          <section>
            <h3>Provers config</h3>

            <TextField>
              <Label>General Advice (optional)</Label>
              <TextArea {...register("prover.general_advice")}
                placeholder="Give all the provers some expert advice..."
                rows={1}/>
              <Description>
                The General Advice is included in prompt for all provers. Additionally, you can give each prover some indiviual advice on top of the General Advice. (So that each prover focuses on something else – or leave it empty.){" "}
                <strong>
                  Both advices will be included in the prompt.
                </strong>
              </Description>
            </TextField>

            <section className="flex flex-col">
              <div className="grid grid-cols-[calc(7.5rem+2px)_1fr_16rem] divide-x-2 divide-edge border-edge border-2 *:px-2 *:py-1.5 *:bg-beta *:text-ink-2 *:font-bold *:kode *:text-sm">
                <p>Prover #</p>
                <p>Advice for the prover (optional)</p>
                <p>Model</p>
              </div>
              {provers.map((prover, i) => (
                <div key={prover.id}
                  className="grid grid-cols-[7.5rem_2px_1fr_2px_16rem] border-edge border-x-2 border-b-2">
                  <p className="px-2 flex items-center">Prover {i + 1}</p>
                  <Separator orientation="vertical"
                    className="w-1 bg-edge rounded-none"/>
                  <TextArea {...register(`prover.provers.${i}.advice`)}
                    placeholder="Describe what this prover should focus on..."
                    rows={1}
                    className="rounded-none bg-alpha px-2 placeholder:text-ink-1/50"/>
                  <Separator orientation="vertical"
                    className="w-1 bg-edge rounded-none"/>
                  <Controller name={`prover.provers.${i}.model`}
                    control={control}
                    render={({ field }) => (
                      <ModelSelect trigger_style="rounded-none h-full flex-center bg-alpha shadow-none pl-2"
                        selected={field.value}
                        onChange={field.onChange}/>
                    )}
                  />
                </div>
              ))}
            </section>
          </section>

          <section>
            <h3>Verifier config</h3>
            <TextField className="flex flex-row items-center gap-4">
              <Label>Advice</Label>
              <TextArea {...register("verifier.advice")}
                placeholder="Describe what the verifier should focus on..."
                rows={1}
                className="w-full"/>
            </TextField>
            <div className="flex items-center gap-4">
              <Label>Model</Label>
              <Controller
                name="verifier.model"
                control={control}
                render={({ field }) => (
                  <ModelSelect
                    selected={field.value}
                    onChange={field.onChange}/>
                )}/>
            </div>
          </section>

          <section>
            <h3>Summarizer config</h3>
            <div className="flex items-center gap-4">
              <Label>Model</Label>
              <Controller name="summarizer.model"
                control={control}
                render={({ field }) => (
                  <ModelSelect
                    selected={field.value}
                    onChange={field.onChange}/>
                )}/>
            </div>
          </section>

        </section>

        <section className="flex flex-col border-t-6 border-double border-edge">
          <h3 className="p-4">Prompts</h3>
          <div className="flex items-center p-4 pt-0 gap-4">
            <p>Edit/preview the:</p>
            <TagGroup selectionMode="single"
              aria-label="Prompt Selection"
              selectedKeys={selected_prompt}
              onSelectionChange={key => setSelectedPrompt(Array.from(key)[0] as PromptTypes)}>
              <TagGroup.List className="gap-2">
                {(Object.keys(default_prompts) as PromptTypes[]).map(prompt_name => (
                  <Tag key={prompt_name}
                    id={prompt_name}
                    className={`
                      px-3 py-1 text-sm text-ink-1
                      ${selected_prompt === prompt_name ? "text-ink-2 bg-brand/20 pointer-events-none" : ""}
                    `}>
                    {prompt_name}.prompt
                  </Tag>
                ))}
              </TagGroup.List>
            </TagGroup>
          </div>
          <Controller key={selected_prompt}
            name={`${selected_prompt}.prompt`}
            control={control}
            render={({ field }) => (
              <SplitViewEditor
                md={field.value}
                onChange={field.onChange}/>
            )}/>

          <div className="flex flex-col p-4 text-sm gap-2">
            <p>Generald Advice & Individual Advice for provers will be appended to the prompt automatically during processing in the backend.</p>
            <p><strong>Don't</strong> specify output JSON structure. That's handled automatically in the backend. But you can specify what the output should look like it's drafted in the prompt template.</p>
          </div>
        </section>

        <section className="flex flex-col p-4 gap-4">
          <Button type="submit"
            form="new_research_form">Confirm Research</Button>
          <ConfirmResearchRun research={pending_data}
            isPending={run_research.isPending}
            onRunResearch={() => {
              if (pending_data) {
                run_research.mutate(pending_data)
              }
            }}
            controller={research_modal_controller}
            error={run_research.error?.message}/>

          <ErrorBox errors={errors}/>
        </section>
      </form>
    </ProblemDetailsLayout>
  )
}

interface ConfirmResearchRunProps {
  research: NewStandardResearchType | null,
  isPending: boolean,
  onRunResearch: () => void,
  controller: UseOverlayStateReturn,
  error?: string,
}

function ConfirmResearchRun({ research, isPending, onRunResearch, controller, error }: ConfirmResearchRunProps) {
  return (
    <AlertDialog isOpen={controller.isOpen}
      onOpenChange={controller.setOpen}>
      <AlertDialog.Backdrop isDismissable>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="max-w-sm">
            <AlertDialog.CloseTrigger/>
            <AlertDialog.Header>
              <AlertDialog.Heading className="font-sans">Confirm Research</AlertDialog.Heading>
            </AlertDialog.Header>

            <AlertDialog.Body>
              {research && (
                <section className="flex flex-col gap-4 py-2">
                  <div className="flex gap-4">
                    <div className="flex flex-col">
                      <h3 className="text-xs kode font-semibold">Rounds</h3>
                      <span className="text-lg font-semibold">{research.rounds}</span>
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-xs kode font-semibold">Provers</h3>
                      <span className="text-lg font-semibold">{research.prover.provers.length}</span>
                    </div>
                  </div>

                  <ModelList label="Provers"
                    models={research.prover.provers.map(prover => prover.model)}/>
                  <ModelList label="Verifier"
                    models={[research.verifier.model]}/>
                  <ModelList label="Summarizer"
                    models={[research.summarizer.model]}/>
                </section>
              )}

              {error && (
                <Alert status="danger">
                  <Alert.Indicator/>
                  <Alert.Content>
                    <Alert.Title>{error}</Alert.Title>
                  </Alert.Content>
                </Alert>
              )}
            </AlertDialog.Body>

            <AlertDialog.Footer>
              <Button variant="tertiary" slot="close">
                Cancel
              </Button>
              <Button variant="primary"
                isPending={isPending}
                onPress={onRunResearch}
                className="w-31">
                {isPending ? (
                  <>
                    <Spinner size="sm" color="current"/>
                    Running&hellip;
                  </>
                ) : "Run Research"}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  )
}

interface ModelListProps {
  label: string,
  models: z.infer<typeof ModelConfig>[],
}

function ModelList({ label, models }: ModelListProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs kode font-semibold">{label}</h3>
      <div className="flex flex-col gap-2">
        {models.map((model, i) => (
          <div key={i}
            className="flex items-center gap-2">
            {models.length > 1 && (
              <p className="bg-gamma h-5 w-5 flex-center text-xs rounded-sm">#{i + 1}</p>
            )}
            <ProviderLogo model_id={model.id} size={14}/>
            <span className="font-medium">{get_model_by_id(model.id)?.name}</span>
            <div className="flex gap-[4px]">
              <ReasoningTag reasoning={model.config.reasoning_effort}
                size="xs"/>
              <WebSearchTag enabled={model.config.web_search}
                size="xs"/>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}