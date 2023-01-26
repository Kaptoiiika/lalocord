import { Story } from "@storybook/react"
import { Theme } from "../../../../src/app/providers/ThemeProvider"

export const ThemeDecorator = (theme: Theme) => (StoryComponent: Story) => {
  return (
    <div className={`app ThemeProvider ${theme}`}>
      <StoryComponent />
    </div>
  )
}
