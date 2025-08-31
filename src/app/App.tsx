import { Suspense } from 'react'

import { Stack } from '@mui/material'
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
      <Stack
        className="app"
        direction="row"
      >
        <Navbar />
        <AppRouter />
      </Stack>
    </Suspense>
  )
}

export default App
