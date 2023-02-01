import { Reducer } from "@reduxjs/toolkit"
import { useEffect } from "react"
import { useDispatch, useStore } from "react-redux"
import {
  ReduxStoreWithManager,
  StateSchemaKey,
} from "@/shared/config/storeConfig"

export type ReducersList = {
  [name in StateSchemaKey]?: Reducer
}

interface DynamicModuleLoaderProps {
  reducers: ReducersList
}

export function useDynamicModuleLoader({
  reducers,
}: DynamicModuleLoaderProps) {
  const store = useStore() as ReduxStoreWithManager
  const dispatch = useDispatch()

  useEffect(() => {
    Object.entries(reducers).forEach(([name, reducer]) => {
      if (store.reducerManager.getReducerMap()[name as StateSchemaKey]) return
      store.reducerManager.add(name as StateSchemaKey, reducer)
      dispatch({ type: `@INIT ${name} reducer` })
    })

    // return () => {
    //   Object.entries(reducers).forEach(([name]) => {
    //     store.reducerManager.remove(name as StateSchemaKey)
    //     dispatch({ type: `@DESTROY ${name} reducer` })
    //   })
    // }
    // eslint-disable-next-line
  }, [])

  return
}
