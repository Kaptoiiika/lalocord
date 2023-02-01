import { ComponentStory, ComponentMeta } from '@storybook/react'
import { RoomList } from './RoomList'

export default {
  title: 'entities/RoomList',
  component: RoomList,
} as ComponentMeta<typeof RoomList>

const Template: ComponentStory<typeof RoomList> = (args) => (
  <RoomList {...args}></RoomList>
)

export const Default = Template.bind({})
Default.args = {}