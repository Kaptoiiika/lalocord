// import { rtkApi } from "src/shared/api/RtkApi"
// import { socketClient } from "src/shared/api/socket/socket"
// import { SocketActions } from "src/shared/api/socket/actions"
// import { RoomModel } from "../types/RoomSchema"
// import { FormateAtributedRoom } from "../service/formateRoom"

// const RoomApi = rtkApi.injectEndpoints({
//   endpoints: (build) => ({
//     getRooms: build.query({
//       query: () => `/api/rooms`,
//       transformResponse: (baseQueryReturnValue: {
//         data: RoomModel[]
//       }): RoomModel[] => {
//         const { data } = baseQueryReturnValue
//         return data.map((room) => FormateAtributedRoom(room))
//       },
//       async onCacheEntryAdded(
//         arg,
//         { cacheDataLoaded, cacheEntryRemoved, updateCachedData }
//       ) {
//         const handleUpdateRooms = (rooms: RoomModel[]) =>
//           updateCachedData(() => rooms)
//         try {
//           await cacheDataLoaded
//           socketClient.on(SocketActions.SHARE_ROOMS, handleUpdateRooms)
//         } catch (error) {}

//         await cacheEntryRemoved
//         socketClient.off(SocketActions.SHARE_ROOMS, handleUpdateRooms)
//       },
//     }),
//   }),
// })

// export const useGetRooms = RoomApi.useGetRoomsQuery

export default {};
