import type { ReactNode } from 'react'

export interface ChartProps {
  kind: 'bar' | 'line'
  series: readonly { label: string; value: number }[]
  label: string
}

const WIDTH = 480
const HEIGHT = 200
const PAD = 24

// Plain SVG, no library. The accessible name is `label`; each point carries its own title.
export function Chart({ kind, series, label }: ChartProps): ReactNode {
  const max = Math.max(1, ...series.map((point) => point.value))
  const step = (WIDTH - PAD * 2) / Math.max(1, series.length)
  const y = (value: number): number => HEIGHT - PAD - (value / max) * (HEIGHT - PAD * 2)
  const x = (index: number): number => PAD + step * index + step / 2
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full max-w-full"
    >
      <line x1={PAD} y1={HEIGHT - PAD} x2={WIDTH - PAD} y2={HEIGHT - PAD} stroke="currentColor" />
      {kind === 'bar'
        ? series.map((point, index) => (
            <rect
              key={point.label}
              x={x(index) - step * 0.35}
              y={y(point.value)}
              width={step * 0.7}
              height={HEIGHT - PAD - y(point.value)}
              fill="currentColor"
            >
              <title>{`${point.label}: ${point.value}`}</title>
            </rect>
          ))
        : null}
      {kind === 'line' ? (
        <>
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            points={series.map((point, index) => `${x(index)},${y(point.value)}`).join(' ')}
          />
          {series.map((point, index) => (
            <circle key={point.label} cx={x(index)} cy={y(point.value)} r="4" fill="currentColor">
              <title>{`${point.label}: ${point.value}`}</title>
            </circle>
          ))}
        </>
      ) : null}
    </svg>
  )
}
