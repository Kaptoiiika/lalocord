import { House } from 'lucide-react'
import { ThemeSwitcher } from 'src/features/ThemeSwitcher'
import { AppRoutes } from 'src/shared/config/routeConfig/routeConfig'
import { IconButton } from 'src/shared/ui'
import { Link } from 'src/shared/ui/Link/Link'

export const Navbar = () => (
  <nav className="w-[var(--navbar-size)] shrink-0 bg-[rgb(var(--bg-primary-color))] [border-right:var(--box-border)] max-[625px]:h-[var(--navbar-size)] max-[625px]:w-full max-[625px]:border-r-0 max-[625px]:[border-bottom:var(--box-border)]">
    <div className="flex h-full flex-col items-center justify-between gap-4 max-[625px]:flex-row">
      <div className="flex flex-col items-center gap-1">
        <Link
          className="flex w-full items-center justify-center"
          to={AppRoutes.MAIN_PAGE}
        >
          <IconButton aria-label="home page">
            <House />
          </IconButton>
        </Link>
      </div>

      <div className="flex">
        <ThemeSwitcher />
      </div>
    </div>
  </nav>
)
