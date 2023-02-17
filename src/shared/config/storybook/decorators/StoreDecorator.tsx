//@ts-nocheck
/* eslint-disable boundaries/element-types */ // used for storybook
import { ReducersMapObject } from "@reduxjs/toolkit"
import { Story } from "@storybook/react"
import { StoreProvider } from "@/app/providers/StoreProvider"
import { StateSchema } from "@/shared/config/storeConfig"

const defaultAsyncReducers: DeepPartial<ReducersMapObject<StateSchema>> = {}

export const StoreDecorator = (
  state: DeepPartial<StateSchema>,
  asyncReducers?: DeepPartial<ReducersMapObject<StateSchema>>
) =>
  function StoreDecorator(StoryComponent: Story) {
    return (
      <StoreProvider
        initialState={state}
        asyncReducers={{ ...defaultAsyncReducers, ...asyncReducers }}
      >
        <StoryComponent />
      </StoreProvider>
    )
  }
