export const FOLDERS = [
  "prover",
  "improver",
  "verifier",
  "manager",
  "notetaker",
  "q",
  "q_decider",
] as const

type Folder = (typeof FOLDERS)[number]
type Key = Uppercase<Folder>

export default Object.fromEntries(
  await Promise.all(
    FOLDERS.map(async folder => {
      const base = new URL(`./${folder}/`, import.meta.url)
      const [USER, SYSTEM] = await Promise.all([
        Bun.file(new URL("user.md", base)).text(),
        Bun.file(new URL("system.md", base)).text(),
      ])
      return [folder.toUpperCase(), { USER, SYSTEM }] as const
    }),
  ),
) as Record<Key, { USER: string; SYSTEM: string }>
