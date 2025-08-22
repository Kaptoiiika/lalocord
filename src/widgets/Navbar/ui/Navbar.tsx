import HomeIcon from '@mui/icons-material/Home';
import { IconButton } from '@mui/material';
import { Stack } from '@mui/material';
import { ThemeSwitcher } from 'src/features/ThemeSwitcher';
import { AppRoutes } from 'src/shared/config/routeConfig/routeConfig';
import { Link } from 'src/shared/ui/Link/Link';

import styles from './Navbar.module.scss';
// import { UserSettingsModal } from "src/entities/UserSettings"

// const links = [
//   {
//     to: AppRoutes.MAIN_PAGE,
//     label: "home",
//     icon: <HomeIcon />,
//   },
// ]

export const Navbar = () => (
  <nav className={styles.NavbarContainer}>
    <Stack
      className={styles.stack}
      justifyContent="space-between"
      alignItems="center"
      gap={4}
    >
      <Stack alignItems="center" gap={1}>
        <Link className={styles.headerLink} to={AppRoutes.MAIN_PAGE}>
          <IconButton aria-label="home page">
            <HomeIcon />
          </IconButton>
        </Link>
      </Stack>

      <Stack>
        {/* <UserSettingsModal /> */}
        <ThemeSwitcher />
      </Stack>
    </Stack>
  </nav>
);
