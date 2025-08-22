import { useMemo, useRef, useState } from 'react'
import '../styles/feed.css'

type Heart = { id: number; x: number; y: number }

function generateColors(count: number): string[] {
	// Pleasant evenly-spaced HSL flat colors
	return Array.from({ length: count }, (_, i) => {
		const hue = Math.round((360 / count) * i)
		return `hsl(${hue} 80% 50%)`
	})
}

function useDoubleTap(callback: (x: number, y: number) => void, thresholdMs: number = 300) {
	const lastTap = useRef<number>(0)
	const lastX = useRef<number>(0)
	const lastY = useRef<number>(0)

	function handleTouchEnd(e: React.TouchEvent) {
		const now = Date.now()
		const touch = e.changedTouches[0]
		const x = touch.clientX
		const y = touch.clientY
		if (now - lastTap.current < thresholdMs) {
			callback(x, y)
			lastTap.current = 0
			return
		}
		lastTap.current = now
		lastX.current = x
		lastY.current = y
	}

	function handleDoubleClick(e: React.MouseEvent) {
		callback(e.clientX, e.clientY)
	}

	return { handleTouchEnd, handleDoubleClick }
}

export default function Feed() {
	const colors = useMemo(() => generateColors(24), [])
	const [liked, setLiked] = useState<Record<number, boolean>>({})
	const [hearts, setHearts] = useState<Record<number, Heart[]>>({})

	function toggleLike(index: number, x: number, y: number) {
		setLiked(prev => ({ ...prev, [index]: true }))
		setHearts(prev => {
			const id = Math.random()
			const next: Heart[] = [
				...(prev[index] || []),
				{ id, x, y },
			]
			return { ...prev, [index]: next }
		})
	}

	return (
		<div className="feed">
			{colors.map((color, index) => (
				<ColorPage
					key={index}
					index={index}
					color={color}
					liked={!!liked[index]}
					hearts={hearts[index] || []}
					onLike={(x, y) => toggleLike(index, x, y)}
				/>
			))}
		</div>
	)
}

function ColorPage({ index, color, liked, hearts, onLike }: {
	index: number
	color: string
	liked: boolean
	hearts: Heart[]
	onLike: (x: number, y: number) => void
}) {
	const containerRef = useRef<HTMLDivElement | null>(null)
	const { handleTouchEnd, handleDoubleClick } = useDoubleTap((x, y) => {
		// Translate viewport coords to element-relative coords
		const rect = containerRef.current?.getBoundingClientRect()
		const relX = rect ? x - rect.left : x
		const relY = rect ? y - rect.top : y
		onLike(relX, relY)
	})

	return (
		<div
			ref={containerRef}
			className="page"
			style={{ backgroundColor: color }}
			onTouchEnd={handleTouchEnd}
			onDoubleClick={handleDoubleClick}
		>
			<div className="page__label">with-tok • {index + 1}</div>
			<RightRail liked={liked} />
			<div className="hearts">
				{hearts.map(h => (
					<Heart key={h.id} x={h.x} y={h.y} />
				))}
			</div>
		</div>
	)
}

function RightRail({ liked }: { liked: boolean }) {
	return (
		<div className="rail">
			<button className={`like ${liked ? 'like--active' : ''}`} aria-pressed={liked} aria-label="Like">
				<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
					<path d="M12.001 4.529c2.349-2.532 6.16-2.532 8.509 0 2.349 2.532 2.349 6.639 0 9.171l-7.103 7.664a2 2 0 0 1-2.812 0L3.492 13.7c-2.349-2.532-2.349-6.64 0-9.172 2.349-2.532 6.16-2.532 8.509 0Z"/>
				</svg>
			</button>
		</div>
	)
}

function Heart({ x, y }: { x: number; y: number }) {
	return (
		<span className="heart" style={{ left: x, top: y }} />
	)
}