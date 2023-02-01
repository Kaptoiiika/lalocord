import { ComponentStory, ComponentMeta } from '@storybook/react'
import { StartupStream } from './StartupStream'

export default {
  title: 'features/StartupStream',
  component: StartupStream,
} as ComponentMeta<typeof StartupStream>

const Template: ComponentStory<typeof StartupStream> = (args) => (
  <StartupStream {...args}></StartupStream>
)

export const Default = Template.bind({})
Default.args = {}