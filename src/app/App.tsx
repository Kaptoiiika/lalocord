import { Suspense } from 'react'

import LoadingBars from 'src/shared/assets/icons/LoaderBars.svg?react'
import { useMountedEffect } from 'src/shared/lib/hooks/useMountedEffect/useMountedEffect'
import { Navbar } from 'src/widgets/Navbar'

import { AppRouter } from './providers/Router/ui/AppRouter'

const App = () => {
  useMountedEffect(() => {
    console.log('Build v', __BUILD_VERSION__ ?? 'unknown')
  })

  return (
    <Suspense fallback={<LoadingBars />}>
      <div className="app">
        <Navbar />
        <AppRouter />
      </div>
    </Suspense>
  )
}

export default App
