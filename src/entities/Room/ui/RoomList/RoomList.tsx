import type React from 'react'
import { memo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import { Button, Divider, Skeleton, Stack, Typography, TextField } from '@mui/material'
import { apiClient } from 'src/shared/api/apiClient'
import { AppRoutes } from 'src/shared/config/routeConfig/routeConfig'
import { Link } from 'src/shared/ui/Link/Link'
import useSWR from 'swr'

import type { RoomModel } from '../../model/types/RoomSchema'

import styles from './RoomList.module.scss'

const fetcher = async (url: string) => {
  const res = await apiClient(url)

  return res.data
}

export const RoomList = memo(function RoomList() {
  const navigate = useNavigate()
  const { data, isLoading } = useSWR<RoomModel[]>('/room', fetcher, {
    refreshInterval: 5000,
  })
  const [roomName, setRoomName] = useState('')

  const roomList = Array.isArray(data) ? data : []

  const handleCreateRoom = () => {
    navigate(AppRoutes.ROOM_ID.replace(':id', roomName))
  }

  const handleChangeRoomName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomName(e.currentTarget.value)
  }

  const roomListIsEmpty = roomList?.length === 0 && !isLoading

  return (
    <Stack
      overflow="auto"
      className={styles.mobileWideContainer}
      gap={1}
    >
      <Stack
        className={styles.form}
        gap={1}
      >
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
          Create Room
        </Button>
      </Stack>

      <Typography variant="h5">Open rooms</Typography>
      <Stack gap={1}>
        {roomList?.map((room) => (
          <Stack
            direction="row"
            alignItems="center"
            key={room.id}
          >
            <Link
              className={styles.roomlink}
              to={AppRoutes.ROOM_ID.replace(':id', room.name)}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                padding={1}
              >
                <Typography className={styles.roomlinkName}>{room.name}</Typography>
                <Stack
                  direction="row"
                  alignItems="center"
                  gap={1}
                >
                  <Typography>{room.userList?.length}</Typography>
                  <PeopleAltIcon />
                </Stack>
              </Stack>
              <Divider />
            </Link>
            {!!room.userList.length && ' - '}
            {room.userList?.map((user) => user.username).join(', ')}
          </Stack>
        ))}
        {roomListIsEmpty && <Typography>nothing💤</Typography>}
        {isLoading && (
          <>
            <Skeleton
              className={styles.roomlink}
              animation="wave"
            />
            <Skeleton
              className={styles.roomlink}
              animation="wave"
            />
            <Skeleton
              className={styles.roomlink}
              animation="wave"
            />
          </>
        )}
      </Stack>
    </Stack>
  )
})

