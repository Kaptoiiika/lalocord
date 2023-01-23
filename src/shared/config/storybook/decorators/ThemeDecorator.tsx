/* eslint-disable boundaries/element-types */ // used for storybook 
import { Story } from "@storybook/react"
import { Theme } from "@/app/providers/ThemeProvider"

export const ThemeDecorator = (theme: Theme) => (StoryComponent: Story) => {
  return (
    <div className={`app ThemeProvider ${theme}`}>
      <StoryComponent />
    </div>
  )
}
