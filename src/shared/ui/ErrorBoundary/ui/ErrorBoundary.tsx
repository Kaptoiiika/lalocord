// eslint-disable-next-line boundaries/element-types
import { PageError } from "@/widgets/PageError"
import { Component, PropsWithChildren, Suspense } from "react"

type ErrorBoundaryProps = {
  errorText?: string
} & PropsWithChildren

type ErrorBoundaryState = { hasError: boolean; error: any }

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
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
    const { children, errorText } = this.props
    if (hasError) {
      return (
        <Suspense>
          <PageError title={errorText} />
        </Suspense>
      )
    }

    return children
  }
}
