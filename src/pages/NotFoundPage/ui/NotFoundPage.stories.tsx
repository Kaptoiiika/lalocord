import { ComponentStory, ComponentMeta } from "@storybook/react"
import { NotFoundPage } from "./NotFoundPage"

export default {
  title: "pages/NotFoundPage",
  component: NotFoundPage,
} as ComponentMeta<typeof NotFoundPage>

const Story: ComponentStory<typeof NotFoundPage> = () => <NotFoundPage />

export const Default = Story.bind({})
