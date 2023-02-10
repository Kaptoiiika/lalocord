import { memo, useState } from "react"
import { useGetRooms } from "../../model/api/RoomApi"
import { Button, Stack, TextField } from "@mui/material"
import { Link, useNavigate } from "react-router-dom"
import { AppRoutes } from "@/shared/config/routeConfig/routeConfig"
import { useAppDispatch } from "@/shared/lib/hooks/useAppDispatch/useAppDispatch"
import { createRoomApi } from "../../model/service/createRoomApi"

type RoomListProps = {
  className?: string
}

export const RoomList = memo((props: RoomListProps) => {
  const { data } = useGetRooms({})
  const navigate = useNavigate()
  const [roomName, setRoomName] = useState("")

  const hundleCreateRoom = () => {
    navigate(AppRoutes.ROOM_ID.replace(":id", roomName))
  }

  const hundleChangeRoomName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomName(e.currentTarget.value)
  }

  return (
    <Stack gap={1} alignItems="start">
      <Stack direction="row" gap={1}>
        <TextField
          variant="outlined"
          value={roomName}
          onChange={hundleChangeRoomName}
        />
        <Button onClick={hundleCreateRoom} variant="contained">
          CreateRoom
        </Button>
      </Stack>

      <Stack gap={1}>
        {data?.map((room) => (
          <Link to={AppRoutes.ROOM_ID.replace(":id", room.name)} key={room.id}>
            {room.name}
          </Link>
        ))}
      </Stack>
    </Stack>
  )
})
