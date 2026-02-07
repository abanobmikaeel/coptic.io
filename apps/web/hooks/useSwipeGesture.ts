'use client'

import { useCallback, useEffect, useRef } from 'react'

interface SwipeGestureOptions {
	onSwipeLeft?: () => void
	onSwipeRight?: () => void
	minSwipeDistance?: number
	maxVerticalDistance?: number
}

interface TouchPoint {
	x: number
	y: number
	time: number
}

/**
 * Hook for detecting horizontal swipe gestures on touch devices.
 *
 * @param options.onSwipeLeft - Callback for left swipe (e.g., go to next day)
 * @param options.onSwipeRight - Callback for right swipe (e.g., go to previous day)
 * @param options.minSwipeDistance - Minimum horizontal distance to trigger swipe (default: 50px)
 * @param options.maxVerticalDistance - Maximum vertical distance before canceling swipe (default: 100px)
 *
 * @returns ref to attach to the swipeable element
 */
export function useSwipeGesture<T extends HTMLElement = HTMLElement>({
	onSwipeLeft,
	onSwipeRight,
	minSwipeDistance = 50,
	maxVerticalDistance = 100,
}: SwipeGestureOptions) {
	const elementRef = useRef<T>(null)
	const touchStartRef = useRef<TouchPoint | null>(null)
	const isSwiping = useRef(false)

	const handleTouchStart = useCallback((e: TouchEvent) => {
		const touch = e.touches[0]
		touchStartRef.current = {
			x: touch.clientX,
			y: touch.clientY,
			time: Date.now(),
		}
		isSwiping.current = true
	}, [])

	const handleTouchMove = useCallback(
		(e: TouchEvent) => {
			if (!touchStartRef.current || !isSwiping.current) return

			const touch = e.touches[0]
			const deltaY = Math.abs(touch.clientY - touchStartRef.current.y)

			// If vertical movement exceeds threshold, cancel swipe detection
			// This allows normal scrolling to work
			if (deltaY > maxVerticalDistance) {
				isSwiping.current = false
			}
		},
		[maxVerticalDistance],
	)

	const handleTouchEnd = useCallback(
		(e: TouchEvent) => {
			if (!touchStartRef.current || !isSwiping.current) {
				touchStartRef.current = null
				isSwiping.current = false
				return
			}

			const touch = e.changedTouches[0]
			const deltaX = touch.clientX - touchStartRef.current.x
			const deltaY = Math.abs(touch.clientY - touchStartRef.current.y)
			const deltaTime = Date.now() - touchStartRef.current.time

			// Only trigger swipe if:
			// 1. Horizontal distance exceeds minimum
			// 2. Vertical distance is within bounds
			// 3. Swipe completed within reasonable time (1 second)
			const isValidSwipe =
				Math.abs(deltaX) >= minSwipeDistance &&
				deltaY <= maxVerticalDistance &&
				deltaTime < 1000

			if (isValidSwipe) {
				if (deltaX > 0 && onSwipeRight) {
					onSwipeRight()
				} else if (deltaX < 0 && onSwipeLeft) {
					onSwipeLeft()
				}
			}

			touchStartRef.current = null
			isSwiping.current = false
		},
		[minSwipeDistance, maxVerticalDistance, onSwipeLeft, onSwipeRight],
	)

	useEffect(() => {
		const element = elementRef.current
		if (!element) return

		// Use passive: false only for touchmove if we need to prevent default
		// Otherwise use passive: true for better scroll performance
		element.addEventListener('touchstart', handleTouchStart, { passive: true })
		element.addEventListener('touchmove', handleTouchMove, { passive: true })
		element.addEventListener('touchend', handleTouchEnd, { passive: true })

		return () => {
			element.removeEventListener('touchstart', handleTouchStart)
			element.removeEventListener('touchmove', handleTouchMove)
			element.removeEventListener('touchend', handleTouchEnd)
		}
	}, [handleTouchStart, handleTouchMove, handleTouchEnd])

	return elementRef
}
