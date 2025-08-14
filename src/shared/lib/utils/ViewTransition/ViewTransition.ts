export const startViewTransition = async () => {
  return new Promise((resolve) => {
    //@ts-ignore
    if (document.startViewTransition)
      //@ts-ignore
      document.startViewTransition(() => {
        resolve(true)
      })
    else {
      resolve(true)
    }
  })
}
