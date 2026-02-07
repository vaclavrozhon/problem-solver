import { $ } from "bun"

const SRC = "../shared/prompts"
const DEST = "./dist"

const FOLDERS = [
  "prover",
  "improver",
  "verifier",
  "manager",
  "notetaker",
  "q",
  "q_decider",
] as const

await $`mkdir -p ${DEST}`

// clean + copy each folder into dist/<folder>
for (const f of FOLDERS) {
  await $`rm -rf ${`${DEST}/${f}`}`
  await $`mkdir -p ${`${DEST}/${f}`}`
  await $`cp -R ${`${SRC}/${f}/.`} ${`${DEST}/${f}`}`
}

console.log(`Prompts successfully copied: ${SRC} -> ${DEST}`);
