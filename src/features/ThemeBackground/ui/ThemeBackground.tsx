import { Grape, Heart, Moon, Sun } from 'lucide-react'
import { ThemeName } from 'src/app/providers/ThemeProvider/lib/ThemeContext'
import { useTheme } from 'src/shared/lib/hooks/useTheme/useTheme'

const themeIcon: Record<Exclude<ThemeName, ThemeName.leopard>, typeof Sun> = {
  [ThemeName.light]: Sun,
  [ThemeName.dark]: Moon,
  [ThemeName.pink]: Heart,
  [ThemeName.purple]: Grape,
}

type ThemeIconSpot = {
  top: string
  left: string
  size: string
  rotate: number
  opacity: number
}

const iconSpots: ThemeIconSpot[] = [
  { top: '-7%', left: '-3%', size: '22%', rotate: -18, opacity: 0.055 },
  { top: '-2%', left: '22%', size: '15%', rotate: 16, opacity: 0.04 },
  { top: '1%', left: '48%', size: '19%', rotate: -8, opacity: 0.06 },
  { top: '-4%', left: '74%', size: '17%', rotate: 14, opacity: 0.045 },
  { top: '26%', left: '4%', size: '18%', rotate: 10, opacity: 0.04 },
  { top: '30%', left: '36%', size: '25%', rotate: -22, opacity: 0.055 },
  { top: '22%', left: '68%', size: '15%', rotate: 20, opacity: 0.045 },
  { top: '24%', left: '90%', size: '17%', rotate: -12, opacity: 0.05 },
  { top: '52%', left: '-5%', size: '21%', rotate: -14, opacity: 0.05 },
  { top: '56%', left: '26%', size: '14%', rotate: 24, opacity: 0.04 },
  { top: '48%', left: '54%', size: '22%', rotate: -6, opacity: 0.06 },
  { top: '54%', left: '82%', size: '16%', rotate: 18, opacity: 0.045 },
  { top: '78%', left: '8%', size: '19%', rotate: -16, opacity: 0.05 },
  { top: '82%', left: '42%', size: '24%', rotate: 8, opacity: 0.04 },
  { top: '74%', left: '72%', size: '17%', rotate: -20, opacity: 0.055 },
]

const layerClassName = 'pointer-events-none absolute inset-0 -z-10 overflow-hidden'

const rosettes = [
  { x: 70, y: 78, rotate: -16, scale: 1.15, gap: 2 },
  { x: 230, y: 36, rotate: 28, scale: 0.62, gap: 5 },
  { x: 390, y: 112, rotate: -8, scale: 1.28, gap: 0 },
  { x: 560, y: 48, rotate: 18, scale: 0.74, gap: 4 },
  { x: 720, y: 130, rotate: -24, scale: 0.9, gap: 1 },
  { x: 40, y: 230, rotate: 12, scale: 0.7, gap: 6 },
  { x: 190, y: 210, rotate: -32, scale: 1.22, gap: 3 },
  { x: 370, y: 250, rotate: 20, scale: 0.68, gap: 5 },
  { x: 530, y: 200, rotate: -14, scale: 1.05, gap: 2 },
  { x: 700, y: 270, rotate: 36, scale: 0.82, gap: 0 },
  { x: 110, y: 370, rotate: 8, scale: 1.1, gap: 4 },
  { x: 290, y: 350, rotate: -20, scale: 0.58, gap: 1 },
  { x: 460, y: 390, rotate: 22, scale: 1.32, gap: 6 },
  { x: 650, y: 360, rotate: -10, scale: 0.76, gap: 3 },
  { x: 60, y: 510, rotate: -18, scale: 0.86, gap: 5 },
  { x: 230, y: 500, rotate: 14, scale: 1.18, gap: 2 },
  { x: 420, y: 520, rotate: -28, scale: 0.64, gap: 0 },
  { x: 580, y: 490, rotate: 10, scale: 1, gap: 4 },
  { x: 750, y: 510, rotate: -6, scale: 0.72, gap: 1 },
]

const ringSpots = [
  { rotate: -18, x: 0, y: -32, scale: 1.05, shape: 0 },
  { rotate: 34, x: 26, y: -20, scale: 0.95, shape: 1 },
  { rotate: 82, x: 30, y: 6, scale: 1.12, shape: 2 },
  { rotate: 136, x: 12, y: 30, scale: 0.9, shape: 1 },
  { rotate: 190, x: -18, y: 28, scale: 1.05, shape: 0 },
  { rotate: 240, x: -32, y: 2, scale: 0.95, shape: 2 },
  { rotate: 296, x: -22, y: -22, scale: 1, shape: 1 },
]

const solidSpots = [
  { x: 150, y: 140, rx: 11, ry: 7, rotate: 20 },
  { x: 310, y: 160, rx: 8, ry: 5, rotate: -24 },
  { x: 490, y: 150, rx: 13, ry: 8, rotate: 36 },
  { x: 640, y: 180, rx: 7, ry: 5, rotate: 12 },
  { x: 90, y: 300, rx: 9, ry: 6, rotate: -10 },
  { x: 270, y: 280, rx: 6, ry: 4, rotate: 48 },
  { x: 600, y: 310, rx: 12, ry: 7, rotate: -32 },
  { x: 180, y: 450, rx: 8, ry: 5, rotate: 16 },
  { x: 360, y: 440, rx: 14, ry: 8, rotate: -18 },
  { x: 700, y: 440, rx: 9, ry: 6, rotate: 28 },
  { x: 500, y: 40, rx: 7, ry: 4, rotate: -40 },
  { x: 20, y: 140, rx: 6, ry: 4, rotate: 8 },
]

const spotPaths = [
  'M-14-2C-6-16 12-14 18-2 24 10 12 18 0 16-14 14-22 4-14-2Z',
  'M-10-8C2-16 18-8 16 2 14 14 2 16-8 12-18 8-16-2-10-8Z',
  'M-16 0C-8-14 8-16 18-6 24 2 14 16 2 14-12 18-22 8-16 0Z',
]

const LeopardSkinBackground = () => (
  <div
    aria-hidden
    className={layerClassName}
  >
    <svg className="h-full w-full opacity-20">
      <defs>
        <pattern
          id="leopard-skin"
          width="820"
          height="560"
          patternUnits="userSpaceOnUse"
        >
          <rect
            width="820"
            height="560"
            fill={`var(--background)`}
          />
          {rosettes.map((rosette) => (
            <g
              key={`${rosette.x}-${rosette.y}`}
              transform={`translate(${rosette.x} ${rosette.y}) rotate(${rosette.rotate}) scale(${rosette.scale})`}
            >
              <ellipse
                cx="0"
                cy="2"
                rx="24"
                ry="23"
                fill="#c48932"
              />
              {ringSpots.map((spot, index) =>
                index === rosette.gap ? null : (
                  <path
                    key={`${spot.x}-${spot.y}`}
                    d={spotPaths[spot.shape]}
                    fill="#1c100c"
                    transform={`translate(${spot.x} ${spot.y}) rotate(${spot.rotate}) scale(${spot.scale})`}
                  />
                )
              )}
              <ellipse
                cx="-2"
                cy="2"
                rx="4"
                ry="3"
                fill="#1c100c"
                transform="rotate(-16)"
              />
              <ellipse
                cx="6"
                cy="-3"
                rx="3"
                ry="2"
                fill="#1c100c"
                transform="rotate(24)"
              />
            </g>
          ))}
          {solidSpots.map((spot) => (
            <ellipse
              key={`${spot.x}-${spot.y}`}
              cx={spot.x}
              cy={spot.y}
              rx={spot.rx}
              ry={spot.ry}
              fill="#24140b"
              transform={`rotate(${spot.rotate} ${spot.x} ${spot.y})`}
            />
          ))}
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="url(#leopard-skin)"
      />
    </svg>
  </div>
)

export const ThemeBackground = () => {
  const { theme } = useTheme()

  if (theme === ThemeName.leopard) {
    return <LeopardSkinBackground />
  }

  const Icon = themeIcon[theme]

  return (
    <div
      aria-hidden
      className={layerClassName}
    >
      {iconSpots.map((spot) => (
        <Icon
          key={`${spot.top}-${spot.left}`}
          strokeWidth={1.25}
          className="absolute aspect-square h-auto"
          style={{
            top: spot.top,
            left: spot.left,
            width: spot.size,
            opacity: spot.opacity,
            transform: `rotate(${spot.rotate}deg)`,
          }}
        />
      ))}
    </div>
  )
}
