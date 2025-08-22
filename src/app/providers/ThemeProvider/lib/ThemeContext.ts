import { createContext } from 'react';

import type { Theme } from '@mui/material';

export enum ThemeName {
  light = 'light',
  dark = 'dark',
}

export interface ThemeContextProps {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  MuiTheme: Theme | null;
}

export const ThemeContext = createContext<ThemeContextProps>({
  theme: ThemeName.dark,
  setTheme: () => undefined,
  MuiTheme: null,
});
