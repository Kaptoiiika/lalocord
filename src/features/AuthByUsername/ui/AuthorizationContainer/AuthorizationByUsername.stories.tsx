import { ComponentStory, ComponentMeta } from "@storybook/react"
import { StoreDecorator } from "@/shared/config/storybook/decorators/StoreDecorator"
import { AuthorizationByUsername } from "./AuthorizationByUsername"

export default {
  title: "features/AuthorizationByUsername",
  component: AuthorizationByUsername,
} as ComponentMeta<typeof AuthorizationByUsername>

const Template: ComponentStory<typeof AuthorizationByUsername> = () => (
  <AuthorizationByUsername></AuthorizationByUsername>
)

export const Default = Template.bind({})
Default.decorators = [
  StoreDecorator({
    authByUsername: {},
  }),
]

export const LoginError = Template.bind({})
LoginError.decorators = [
  StoreDecorator({
    authByUsername: { loginError: "some error" },
  }),
]

export const RegistrationError = Template.bind({})
RegistrationError.decorators = [
  StoreDecorator({
    authByUsername: { registrationError: "some error" },
  }),
]

export const AuthIsLoading = Template.bind({})
AuthIsLoading.decorators = [
  StoreDecorator({
    authByUsername: { isloading: true },
  }),
]
