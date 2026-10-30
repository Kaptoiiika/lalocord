import { Suspense } from 'react'
import { useLocation } from 'react-router-dom'

import LoadingBars from 'src/shared/assets/icons/LoaderBars.svg?react'
import { AppRoutes } from 'src/shared/config/routeConfig/routeConfig'
import { useMountedEffect } from 'src/shared/lib/hooks/useMountedEffect/useMountedEffect'
import { Navbar } from 'src/widgets/Navbar'

import { AppRouter } from './providers/Router/ui/AppRouter'

const bareRoutes: string[] = [AppRoutes.GAME_SESSION]

const App = () => {
  const { pathname } = useLocation()
  const isBareWindow = bareRoutes.includes(pathname)

  useMountedEffect(() => {
    console.log('Build v', __BUILD_VERSION__ ?? 'unknown')
  })

  return (
    <Suspense fallback={<LoadingBars />}>
      <div className={isBareWindow ? 'app appBare' : 'app'}>
        {!isBareWindow && <Navbar />}
        <AppRouter />
      </div>
    </Suspense>
  )
}

export default App
