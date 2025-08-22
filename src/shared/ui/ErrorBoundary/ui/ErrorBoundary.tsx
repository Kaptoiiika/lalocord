import type { PropsWithChildren } from 'react';
import { Component, Suspense } from 'react';

import { PageError } from 'src/widgets/PageError';

type ErrorBoundaryProps = {
  errorText?: string;
} & PropsWithChildren;

type ErrorBoundaryState = { hasError: boolean;
  error: unknown; };

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: unknown) {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    // You can also log the error to an error reporting service
    console.log(error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    const { children, errorText } = this.props;

    if (hasError) {
      return (
        <Suspense>
          <PageError title={errorText} description={String(error)} />
        </Suspense>
      );
    }

    return children;
  }
}
