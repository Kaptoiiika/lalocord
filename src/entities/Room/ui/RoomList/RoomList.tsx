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
import { useMountedEffect } from "@/shared/lib/hooks/useMountedEffect/useMountedEffect"
import { apiClient } from "@/shared/api/apiClient"
import { RoomModel } from "../../model/types/RoomSchema"
import PeopleAltIcon from "@mui/icons-material/PeopleAlt"

type RoomListProps = {
  className?: string
}

export const RoomList = memo(function RoomList(props: RoomListProps) {
  const navigate = useNavigate()
  const [roomName, setRoomName] = useState("")
  const [isLoading, setIsloading] = useState(true)
  const [roomList, setRoomList] = useState<RoomModel[] | undefined>()

  useMountedEffect(() => {
    apiClient
      .get("/room")
      .then((res) => {
        const rooms: RoomModel[] = res.data
        setRoomList(rooms)
        setIsloading(false)
      })
      .catch(() => {
        setRoomList([])
        setIsloading(false)
      })
  })

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
        <OutlinedInput
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
            <Stack direction="row" justifyContent="space-between">
              <Typography className={styles.roomlinkName}>
                {room.name}
              </Typography>
              <Stack direction="row" alignItems="center">
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
