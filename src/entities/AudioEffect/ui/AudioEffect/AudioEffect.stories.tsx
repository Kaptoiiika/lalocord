import { ComponentStory, ComponentMeta } from '@storybook/react'
import { AudioEffect } from './AudioEffect'

export default {
  title: 'entities/AudioEffect',
  component: AudioEffect,
} as ComponentMeta<typeof AudioEffect>

const Template: ComponentStory<typeof AudioEffect> = (args) => (
  <AudioEffect {...args}></AudioEffect>
)

export const Default = Template.bind({})
Default.args = {}