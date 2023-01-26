import { Navbar } from "@/widgets/Navbar"
import { Grid } from "@mui/material"
import { Stack } from "@mui/system"
import { Suspense } from "react"
import { AppRouter } from "./providers/Router/ui/AppRouter"

const App = () => {
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
