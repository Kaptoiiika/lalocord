export const startViewTransition = async () =>
  new Promise((resolve) => {
    if (document.startViewTransition)
      document.startViewTransition(() => {
        resolve(true)
      })
    else {
      resolve(true)
    }
  })
