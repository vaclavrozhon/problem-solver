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

import UserPromptProver from "@shared/prompts/user/prover.md?raw"
import UserPromptVerifier from "@shared/prompts/user/verifier.md?raw"
import UserPromptSummarizer from "@shared/prompts/user/summarizer.md?raw"

import SystemPromptProver from "@shared/prompts/system/prover.md?raw"
import SystemPromptVerifier from "@shared/prompts/system/verifier.md?raw"
import SystemPromptSummarizer from "@shared/prompts/system/summarizer.md?raw"

import SplitViewEditor from "../../../components/app/SplitViewEditor"
import ModelSelect from "@frontend/components/form/ModelSelect"
import ProviderLogo from "@frontend/components/svg/ProviderLogo"

import { useAuthStore } from "@frontend/auth/store"

export const Route = createFileRoute("/problem/$problem_id/research")({
  component: RunNewResearchPage,
})

type EditorSelection =
  | "round_instructions"
  | "prover.prompt" | "verifier.prompt" | "summarizer.prompt"
  | "prover.system_prompt" | "verifier.system_prompt" | "summarizer.system_prompt"
type NewStandardResearchType = z.infer<typeof NewStandardResearch>
type EditorCategory = "instructions" | "system_prompts" | "prompts";

type EditorOptions = Record<EditorCategory, { id: EditorSelection, label: string }[]>;

const editor_options = {
  instructions: [
    { id: "round_instructions", label: "Additional Instructions" },
  ],
  prompts: [
    { id: "prover.prompt", label: "Prover" },
    { id: "verifier.prompt", label: "Verifier" },
    { id: "summarizer.prompt", label: "Summarizer" },
  ],
  system_prompts: [
  { id: "prover.system_prompt", label: "prover" },
  { id: "verifier.system_prompt", label: "verifier" },
  { id: "summarizer.system_prompt", label: "summarizer" },
  ],
} as const satisfies EditorOptions

const default_prompts = {
  prover: UserPromptProver,
  verifier: UserPromptVerifier,
  summarizer: UserPromptSummarizer,
}

const default_system_prompts = {
  prover: SystemPromptProver,
  verifier: SystemPromptVerifier,
  summarizer: SystemPromptSummarizer,
}

function RunNewResearchPage() {
  const { problem_id } = Route.useParams()
  const navigate = useNavigate()
  const { profile, is_loading } = useAuthStore()
  // BUG: quick workaround for nona-uth personas viewing reserach problem
  if (!is_loading) {
    if (!profile) navigate({
      to: "/problem/$problem_id",
      params: { problem_id },
    })
  }

  const [selected_editor, setSelectedEditor] = useState<EditorSelection>("round_instructions")
  const [pending_data, setPendingData] = useState<NewStandardResearchType | null>(null)

  const research_modal_controller = useOverlayState()

  const { data: problem, isError, isPending } = useQuery({
    queryKey: ["problem-research"],
    queryFn: () => get_research_overview(problem_id)
  })

  const run_research = useMutation({
    mutationFn: async (form_data: NewStandardResearchType) => {
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
      round_instructions: "",
      prover: {
        count: "1",
        prompt: default_prompts["prover"],
        system_prompt: default_system_prompts["prover"],
        provers: [{
          model: choose_model("google/gemini-3-pro-preview", {
            reasoning_effort: "high",
            web_search: false,
          })
        }],
      },
      verifier: {
        prompt: default_prompts["verifier"],
        system_prompt: default_system_prompts["verifier"],
        model: choose_model("openai/gpt-5.2", {
          reasoning_effort: "high",
          web_search: false,
        }),
      },
      summarizer: {
        prompt: default_prompts["summarizer"],
        system_prompt: default_system_prompts["summarizer"],
        model: choose_model("openai/gpt-5-mini", {
          reasoning_effort: "high",
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

            <section className="flex flex-col">
              <div className="grid grid-cols-[calc(7.5rem+2px)_1fr_16rem] divide-x-2 divide-edge border-edge border-2 *:px-2 *:py-1.5 *:bg-beta *:text-ink-2 *:font-bold *:kode *:text-sm">
                <p>Prover #</p>
                <p>Instructions for this prover (optional)</p>
                <p>Model</p>
              </div>
              {provers.map((prover, i) => (
                <div key={prover.id}
                  className="grid grid-cols-[7.5rem_2px_1fr_2px_16rem] border-edge border-x-2 border-b-2">
                  <p className="px-2 flex items-center">Prover {i + 1}</p>
                  <Separator orientation="vertical"
                    className="w-1 bg-edge rounded-none"/>
                  <TextArea {...register(`prover.provers.${i}.instructions`)}
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

            <p className="text-sm">Per-prover instructions will be appended to prover's prompt automatically during processing in the backend.</p>
          </section>

          <section>
            <h3>Verifier config</h3>
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

        <section className="flex flex-col border-t-6 border-double border-edge gap-4">
          <h3 className="p-4 pb-0">Prompts & Instructions</h3>

          <div className="flex flex-col px-4 gap-2">
            <EditorTagSection title="Task"
              aria_label="Task Instructions Selection"
              options={editor_options["instructions"]}
              selectedEditor={selected_editor}
              onChange={setSelectedEditor}/>

            <Separator/>

            <EditorTagSection title="System Prompts"
              aria_label="System Prompt Selection"
              options={editor_options["system_prompts"]}
              selectedEditor={selected_editor}
              onChange={setSelectedEditor}/>

            <Separator/>

            <EditorTagSection title="User Prompts"
              aria_label="User Prompt Selection"
              options={editor_options["prompts"]}
              selectedEditor={selected_editor}
              onChange={setSelectedEditor}/>

            <Separator/>

            <div className="flex flex-col text-sm gap-2">
              <h4>
                Explanation for{" "}
                <span className="px-1.5 py-0.5 bg-beta rounded">{selected_editor}</span>
              </h4>

              {selected_editor === "round_instructions" && (
                <p>
                  Round Instructions are included in prompts for <strong>all agents</strong> (provers, verifier, summarizer).
                  <br/>
                  Use this for research-wide guidance when the task needs clarification or you want to steer the research direction.
                </p>
              )}
              {selected_editor !== "round_instructions" && (
                <>
                  <p><strong>System Prompt</strong> should give the LLM an identity.</p>
                  <p><strong>User Prompt</strong> should simply define the task. All User Prompts undergo additional edits during backend processing – previous round results, task definition, proofs, notes, etc. are all appended.</p>
                </>
              )}
              <p><strong>Don't</strong> specify output structure. That's handled automatically in the backend.</p>
            </div>
          </div>

          <Controller key={selected_editor}
            name={selected_editor}
            control={control}
            render={({ field }) => (
              <SplitViewEditor
                md={field.value}
                onChange={field.onChange}/>
            )}/>
        </section>

        <section className="flex flex-col p-4 gap-4">
          <p className="text-sm">Be aware it's not possible to stop running research.</p>

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
  models: ModelConfig[],
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
interface EditorTagSectionProps {
  title: string,
  aria_label: string,
  options: {
    id: EditorSelection,
    label: string,
  }[],
  selectedEditor: EditorSelection,
  onChange: (value: EditorSelection) => void,
}

export function EditorTagSection({
  title,
  aria_label,
  options,
  selectedEditor,
  onChange,
}: EditorTagSectionProps) {
  return (
    <div className="grid grid-cols-[9rem_1fr] items-center">
      <p className="text-sm kode font-semibold">{title}</p>

      <TagGroup
        selectionMode="single"
        aria-label={aria_label}
        selectedKeys={[selectedEditor]}
        onSelectionChange={keys =>
          onChange(Array.from(keys)[0] as EditorSelection)
        }>
        <TagGroup.List className="gap-2">
          {options.map(option => (
              <Tag key={option.id}
                id={option.id}
                className={`
                  px-3 py-1 text-sm text-ink-1
                  ${selectedEditor === option.id ? "text-ink-2 bg-brand/20 pointer-events-none" : ""}
                `}>
                {option.label}
              </Tag>
            ))}
        </TagGroup.List>
      </TagGroup>
    </div>
  );
}
