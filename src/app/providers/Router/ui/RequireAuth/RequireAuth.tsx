import { ReactNode } from "react"

type RequireAuthProps = {
  children: ReactNode
}

export const RequireAuth = (props: RequireAuthProps) => {
  const { children } = props

  // if (!isInited) {
  //   return <PageLoader />
  // }

  // if (!authData)
  //   return <Navigate to={RoutePaths.auth} state={{ from: location }} replace />

  return <>{children}</>
}
