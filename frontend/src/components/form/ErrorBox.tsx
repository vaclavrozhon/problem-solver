/* Written by AI */
import type { FieldErrors, FieldValues } from "react-hook-form"

type ErrorLike = {
  message?: unknown
  [key: string]: unknown
} | undefined

/**
 * Recursively collects all error messages from a nested react-hook-form error object.
 */
function collect_errors(
  error: ErrorLike,
  path: string[] = []
): { path: string[]; message: string }[] {
  if (!error || typeof error !== "object") {
    return []
  }

  if (typeof error.message === "string") {
    return [{ path, message: error.message }]
  }

  // recursive nested error objects
  const nested_entries = Object.entries(error).filter(
    ([key, value]) => value
      && typeof value === "object"
      /** Keys to skip when traversing react-hook-form error objects */
      && !["message", "ref", "type", "types", "root"].includes(key)
  )

  // No nested errors but object exists → generic fallback
  if (nested_entries.length === 0) {
    return [{ path, message: "Invalid value" }]
  }

  return nested_entries.flatMap(([key, value]) =>
    collect_errors(value as ErrorLike, [...path, key])
  )
}

interface ErrorBoxProps<T extends FieldValues = FieldValues> {
  errors: FieldErrors<T>
}

export default function ErrorBox<T extends FieldValues>({
  errors,
}: ErrorBoxProps<T>) {
  if (!errors || Object.keys(errors).length === 0) return null

  const all_errors = Object.entries(errors).flatMap(([name, error]) =>
    collect_errors(error as ErrorLike, [name])
  )

  if (all_errors.length === 0) return null

  /* Designed by human */
  return (
    <section className="relative w-fit flex flex-col gap-1.5 p-2.5 mt-3.5 pt-4 border-2 border-red-500 rounded">
      <p className="absolute -top-4 px-3 py-1 rounded-full bg-red-500 text-sm font-semibold text-white/90">
        Errors
      </p>

      {all_errors.map(({ path, message }, i) => (
        <div key={i}
          className="flex flex-col gap-1.5 w-full not-last:border-b-2 not-last:border-edge not-last:pb-1.5">
          <div className="flex flex-wrap items-center gap-[4px]">
            {path.map((key, j) => (
              <span key={j}
                className="px-1.5 py-0.5 text-sm font-medium bg-beta rounded">
                {key}
              </span>
            ))}
          </div>

          <p className="text-sm">{message}</p>
        </div>
      ))}
    </section>
  )
}
