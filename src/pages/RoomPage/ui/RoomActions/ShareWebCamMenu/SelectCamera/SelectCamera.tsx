import { useState } from 'react';

import type { SelectChangeEvent } from '@mui/material';
import { Select, MenuItem,InputLabel ,FormControl,Typography } from '@mui/material';
import { useRoomRTCStore } from 'src/entities/RTCClient';
import { getUserStreamSettings } from 'src/entities/RTCClient/model/selectors/RoomRTCSelectors';
import { useMountedEffect } from 'src/shared/lib/hooks/useMountedEffect/useMountedEffect';

import type { UserStreamSettings } from 'src/entities/RTCClient/model/types/RoomRTCSchema';

export const SelectCamera = () => {
  const userStreamSettings = useRoomRTCStore(getUserStreamSettings);
  const setStreamingSettings = useRoomRTCStore(
    (state) => state.setStreamSettings
  );
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [error, setError] = useState('');

  useMountedEffect(() => {
    navigator.mediaDevices
      ?.enumerateDevices()
      .then((devices) => {
        const cameras = devices.filter((device) => device.kind === 'videoinput');

        setCameras(cameras);
      })
      .catch(() => {
        setError('No access');
      });
  });

  const handleChange = (event: SelectChangeEvent) => {
    const newstreamSettings: UserStreamSettings = {
      ...userStreamSettings,
      video: {
        ...userStreamSettings.video,
        deviceId: event.target.value,
      },
    };

    setStreamingSettings(newstreamSettings);
  };

  const selectedCamera = cameras.find((camera) => {
    if (typeof userStreamSettings.video === 'object')
      return camera.deviceId === userStreamSettings.video.deviceId;
  });

  if (error) {
    return (
      <FormControl
        sx={{
          m: 1,
          width: 200,
        }}
      >
        <InputLabel>{error}</InputLabel>
      </FormControl>
    );
  }

  return (
    <FormControl
      sx={{
        m: 1,
        width: 200,
      }}
    >
      <Typography>Camera</Typography>
      <Select
        fullWidth
        value={selectedCamera?.deviceId || ''}
        onChange={handleChange}
      >
        {cameras.map((camera) => (
          <MenuItem key={camera.deviceId} value={camera.deviceId}>
            {camera.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
