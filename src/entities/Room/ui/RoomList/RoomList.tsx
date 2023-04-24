import React, { memo, useState } from "react"
import {
  Button,
  Divider,
  OutlinedInput,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material"
import { Link, useNavigate } from "react-router-dom"
import { AppRoutes } from "@/shared/config/routeConfig/routeConfig"
import styles from "./RoomList.module.scss"
import { RoomModel } from "../../model/types/RoomSchema"
import PeopleAltIcon from "@mui/icons-material/PeopleAlt"
import useSWR from "swr"
import { apiClient } from "@/shared/api/apiClient"
import TextField from "@mui/material/TextField"

type RoomListProps = {
  className?: string
}
const fetcher = async (url: string) => {
  const res = await apiClient(url)
  return res.data
}

export const RoomList = memo(function RoomList(props: RoomListProps) {
  const navigate = useNavigate()
  const { data: roomList, isLoading } = useSWR<RoomModel[]>("/room", fetcher, {
    refreshInterval: 5000,
  })
  const [roomName, setRoomName] = useState("")

  const handleCreateRoom = () => {
    navigate(AppRoutes.ROOM_ID.replace(":id", roomName))
  }

  const handleChangeRoomName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomName(e.currentTarget.value)
  }

  const roomListIsEmpty = roomList?.length === 0 && !isLoading

  return (
    <Stack gap={1}>
      <Stack direction="row" gap={1}>
        <TextField
          label="Room name"
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
        {roomList?.map((room) => (
          <Link
            className={styles.roomlink}
            to={AppRoutes.ROOM_ID.replace(":id", room.name)}
            key={room.id}
          >
            <Stack direction="row" justifyContent="space-between" padding={1}>
              <Typography className={styles.roomlinkName}>
                {room.name}
              </Typography>
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography>{room.userList?.length}</Typography>
                <PeopleAltIcon />
              </Stack>
            </Stack>
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
