import { StrictMode, useEffect } from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useAuth, AuthProvider, AuthContextType } from "./contexts/AuthContext"
import { RouterProvider, createRouter } from '@tanstack/react-router'

import "./styles/global.css"
import "./styles/utils.css"

import { routeTree } from './routeTree.gen'

const queryClient = new QueryClient()
const router = createRouter({
  routeTree,
  context: {
    // initial state
    auth: undefined!,
  },
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

function App() {
  const auth = useAuth()

  useEffect(() => {
    if (auth.isLoading) return
    auth.loadAuth.resolve(auth)
  }, [auth])

  return (
    <RouterProvider router={router} context={{ auth }}/>
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App/>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
)
