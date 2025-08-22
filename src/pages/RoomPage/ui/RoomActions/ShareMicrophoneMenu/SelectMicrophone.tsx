import { useState } from 'react';

import type { SelectChangeEvent } from '@mui/material';
import {
  FormControl,
  InputLabel,
  Typography,
  Select,
  MenuItem,
} from '@mui/material';
import { useRoomRTCStore } from 'src/entities/RTCClient';
import { getUserStreamSettings } from 'src/entities/RTCClient/model/selectors/RoomRTCSelectors';
import { useMountedEffect } from 'src/shared/lib/hooks/useMountedEffect/useMountedEffect';

import type { UserStreamSettings } from 'src/entities/RTCClient/model/types/RoomRTCSchema';

export const SelectMicrophone = () => {
  const userStreamSettings = useRoomRTCStore(getUserStreamSettings);
  const setStreamingSettings = useRoomRTCStore(
    (state) => state.setStreamSettings
  );
  const [microphones, setmicrophones] = useState<MediaDeviceInfo[]>([]);
  const [error, setError] = useState('');

  useMountedEffect(() => {
    navigator.mediaDevices
      ?.enumerateDevices()
      .then((devices) => {
        const microphones = devices.filter(
          (device) => device.kind === 'audioinput'
        );

        setmicrophones(microphones);
      })
      .catch(() => {
        setError('No access');
      });
  });

  const handleChange = (event: SelectChangeEvent) => {
    const newstreamSettings: UserStreamSettings = {
      ...userStreamSettings,
      audio: {
        ...userStreamSettings.audio,
        deviceId: event.target.value,
      },
    };

    setStreamingSettings(newstreamSettings);
  };

  const selectedMicrophone = microphones.find((microphone) => {
    if (typeof userStreamSettings.video === 'object')
      return microphone.deviceId === userStreamSettings.audio.deviceId;
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
      <Typography>Microphone</Typography>
      <Select
        fullWidth
        value={selectedMicrophone?.deviceId || ''}
        onChange={handleChange}
      >
        {microphones.map((microphone) => (
          <MenuItem key={microphone.deviceId} value={microphone.deviceId}>
            {microphone.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
