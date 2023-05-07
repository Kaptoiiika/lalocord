import { useMountedEffect } from "@/shared/lib/hooks/useMountedEffect/useMountedEffect"
import { Navbar } from "@/widgets/Navbar"
import { Stack } from "@mui/material"
import { Suspense } from "react"
import { AppRouter } from "./providers/Router/ui/AppRouter"

const App = () => {
  useMountedEffect(() => {
    console.log("Build v", __BUILD_VERSION__ ?? "unknown")
  })

  return (
    <Suspense>
      <Stack className={"app"} direction={"row"}>
        <Navbar />
        <AppRouter />
      </Stack>
    </Suspense>
  )
}

export default App
