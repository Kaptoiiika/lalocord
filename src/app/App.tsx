import { Suspense } from "react"
import { AppRouter } from "./providers/Router/ui/AppRouter"

const App = () => {
  return (
    <div className={`app`}>
      <Suspense>
        <AppRouter />
      </Suspense>
    </div>
  )
}

export default App
