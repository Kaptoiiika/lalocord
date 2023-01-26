import { DeepPartial, ReducersMapObject } from "@reduxjs/toolkit"
import { Story } from "@storybook/react"
import { StoreProvider } from "../../../../src/app/providers/StoreProvider"
import { StateSchema } from "../../../../src/shared/config/storeConfig"

const defaultAsyncReducers: DeepPartial<ReducersMapObject<StateSchema>> = {}

export const StoreDecorator =
  (
    state: DeepPartial<StateSchema>,
    asyncReducers?: DeepPartial<ReducersMapObject<StateSchema>>
  ) =>
  (StoryComponent: Story) =>
    (
      <StoreProvider>
        <StoryComponent />
      </StoreProvider>
    )
