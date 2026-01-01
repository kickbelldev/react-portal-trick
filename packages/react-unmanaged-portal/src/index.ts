// Compound component pattern
import { PortalHost } from './components/PortalHost'
import { PortalSlot } from './components/PortalSlot'

export const Portal = {
  Host: PortalHost,
  Slot: PortalSlot,
} as const
