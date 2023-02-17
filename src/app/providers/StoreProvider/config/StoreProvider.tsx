import { ReducersMapObject } from "@reduxjs/toolkit"
import { PropsWithChildren, useEffect } from "react"
import { Provider } from "react-redux"
import { StateSchema } from "@/shared/config/storeConfig"
import { createReduxStore } from "./store"
import { initalAuthData } from "@/entities/User"

type StoreProviderProps = {
  initialState?: StateSchema
  asyncReducers?: ReducersMapObject<StateSchema>
} & PropsWithChildren

export const StoreProvider = (props: StoreProviderProps) => {
  const { children, initialState, asyncReducers } = props

  const store = createReduxStore(initialState, asyncReducers)

  useEffect(() => {
    store.dispatch(initalAuthData())
  }, [store])

  return <Provider store={store}>{children}</Provider>
}
