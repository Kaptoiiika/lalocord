// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FormateError = (error: any) => error?.response?.data?.error?.message || error?.message || 'unknownError';
