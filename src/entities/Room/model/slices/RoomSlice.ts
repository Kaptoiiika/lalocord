import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit"
import { RoomModel } from "../types/RoomSchema"

export const RoomAdapter = createEntityAdapter<RoomModel>({
  selectId: (room) => {
    return room.id
  },
})

export const RoomSlice = createSlice({
  name: "Room",
  initialState: RoomAdapter.getInitialState(),
  reducers: {
    template: (state, action: PayloadAction<string>) => {},
  },
  // extraReducers: (builder) => {
  //     builder
  //         .addCase(asyncTemplate.pending, (state) => {
  //             state.error = undefined;
  //             state.isLoading = true;
  //         })
  //         .addCase(asyncTemplate.fulfilled, (state, action) => {
  //             state.isLoading = false;
  //         })
  //         .addCase(asyncTemplate.rejected, (state, action) => {
  //             state.isLoading = false;
  //             state.error = action.payload;
  //         });
  // },
})

export const { actions: RoomActions } = RoomSlice
export const { reducer: RoomReducer } = RoomSlice
