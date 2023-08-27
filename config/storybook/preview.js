
export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(color)$/i,
      date: /Date$/,
    },
  },
}

//addDecorator(ThemeDecorator(Theme.DARK))
