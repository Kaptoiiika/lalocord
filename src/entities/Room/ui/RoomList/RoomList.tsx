import React, { memo, useState } from "react"
import { useGetRooms } from "../../model/api/RoomApi"
import {
  Button,
  Divider,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { Link, useNavigate } from "react-router-dom"
import { AppRoutes } from "@/shared/config/routeConfig/routeConfig"
import styles from "./RoomList.module.scss"

type RoomListProps = {
  className?: string
}

export const RoomList = memo(function RoomList(props: RoomListProps) {
  const { data, isLoading } = useGetRooms({})
  const navigate = useNavigate()
  const [roomName, setRoomName] = useState("")

  const handleCreateRoom = () => {
    navigate(AppRoutes.ROOM_ID.replace(":id", roomName))
  }

  const handleChangeRoomName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomName(e.currentTarget.value)
  }

  const roomListIsEmpty = data?.length === 0 && !isLoading

  return (
    <Stack gap={1}>
      <Stack direction="row" gap={1}>
        <TextField
          label={"Room name"}
          variant="outlined"
          value={roomName}
          onChange={handleChangeRoomName}
        />
        <Button
          disabled={!roomName}
          onClick={handleCreateRoom}
          variant="contained"
        >
          CreateRoom
        </Button>
      </Stack>

      <Typography variant="h5">Open rooms</Typography>
      <Stack gap={1}>
        {data?.map((room) => (
          <Link
            className={styles.roomlink}
            to={AppRoutes.ROOM_ID.replace(":id", room.name)}
            key={room.id}
          >
            {room.name}
            <Divider />
          </Link>
        ))}
        {roomListIsEmpty && <Typography>nothing💤</Typography>}
        {isLoading && (
          <>
            <Skeleton className={styles.roomlink} animation="wave" />
            <Skeleton className={styles.roomlink} animation="wave" />
            <Skeleton className={styles.roomlink} animation="wave" />
          </>
        )}
      </Stack>
    </Stack>
  )
})
