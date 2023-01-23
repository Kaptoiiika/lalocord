import { render } from "@testing-library/react"
import { ReactNode } from "react"
import { MemoryRouter } from "react-router-dom"

export interface componentRenderOptions {
  route?: string
}

export function componentRender(
  component: ReactNode,
  options: componentRenderOptions = {}
) {
  const { route = "/" } = options

  return render(
    <MemoryRouter initialEntries={[route]}>{component}</MemoryRouter>
  )
}
