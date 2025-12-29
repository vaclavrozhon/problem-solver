import { useLocation } from "@tanstack/react-router"

export default function PageNotFound() {
  const pathname = useLocation().pathname

  return (
    <main className="flex-1 flex-center flex-col gap-5">
      <h1 className="font-kode text-9xl font-bold leading-none -tracking-wider text-brand">
        404
      </h1> 
      <p className="px-10">
        Page
        <span className="p-1 mx-1 bg-beta rounded-sm box-decoration-clone font-medium">
          {pathname}
        </span>
        doesn't exist.
      </p>
    </main>
  )
}