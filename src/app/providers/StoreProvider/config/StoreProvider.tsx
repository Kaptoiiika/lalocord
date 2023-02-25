import { ReducersMapObject } from "@reduxjs/toolkit"
import { PropsWithChildren } from "react"
import { Provider } from "react-redux"
import { StateSchema } from "@/shared/config/storeConfig"
import { createReduxStore } from "./store"

type StoreProviderProps = {
  initialState?: StateSchema
  asyncReducers?: ReducersMapObject<StateSchema>
} & PropsWithChildren

export const StoreProvider = (props: StoreProviderProps) => {
  const { children, initialState, asyncReducers } = props

  const store = createReduxStore(initialState, asyncReducers)

  return <Provider store={store}>{children}</Provider>
}
