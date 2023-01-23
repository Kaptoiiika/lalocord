import { Component, PropsWithChildren, Suspense } from "react"
import { PageError } from "@/widgets/PageError"

type ErrorBoundaryProps = {} & PropsWithChildren

type ErrorBoundaryState = { hasError: boolean }

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    console.log(error, errorInfo)
  }

  render() {
    const { hasError } = this.state
    const { children } = this.props
    if (hasError) {
      return (
        <Suspense>
          <PageError />
        </Suspense>
      )
    }

    return children
  }
}
