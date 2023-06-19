export const startViewTransition = async () => {
  return new Promise((res) => {
    //@ts-ignore
    if (document.startViewTransition)
      //@ts-ignore
      document.startViewTransition(() => {
        res({})
      })
    else {
      res({})
    }
  })
}
