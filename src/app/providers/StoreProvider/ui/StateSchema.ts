import {
  AnyAction,
  CombinedState,
  EnhancedStore,
  Reducer,
  ReducersMapObject,
} from "@reduxjs/toolkit"
import { AxiosInstance } from "axios"
import { rtkApi } from "@/shared/api/RtkApi"
import { RoomSchema } from "@/pages/RoomPage/model/types/RoomSchema"
import { UserSchema } from "@/entities/User"
import { AuthByUsernameSchema } from "@/features/AuthByUsername"

export interface StateSchema {
  user: UserSchema
  [rtkApi.reducerPath]: ReturnType<typeof rtkApi.reducer>

  authByUsername?: AuthByUsernameSchema
  rooms?: RoomSchema
}

export type StateSchemaKey = keyof StateSchema

export interface ReducerManager {
  getReducerMap: () => ReducersMapObject<StateSchema>
  reduce: (state: StateSchema, action: AnyAction) => CombinedState<StateSchema>
  add: (key: StateSchemaKey, reducer: Reducer) => void
  remove: (key: StateSchemaKey) => void
}

export interface ReduxStoreWithManager extends EnhancedStore<StateSchema> {
  reducerManager: ReducerManager
}

export interface ThunkExtraArg {
  api: AxiosInstance
}

export interface ThunkConfig<T> {
  rejectValue: T
  extra: ThunkExtraArg
  state: StateSchema
}
