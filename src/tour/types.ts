export interface TargetRect {
  x: number
  y: number
  width: number
  height: number
  borderRadius?: number
  padding?: number
}

export interface TourStep {
  id: string
  targetId?: string
  title: string
  description: string
  tooltipPosition?: 'top' | 'bottom'
  requireInteraction?: boolean
  screen?: string
  anchorTargetId?: string
  forceBelow?: boolean
}
