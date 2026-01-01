import { useCallback, useMemo } from 'react'

import {
  DEFAULT_PORTAL_ID,
  usePortalStore,
  register,
  unregister,
  setSlotKey as setSlotKeyAction,
  setReturnPath as setReturnPathAction,
  resetPortal as resetPortalAction,
} from './store'

export function usePortal(portalId: string = DEFAULT_PORTAL_ID) {
  const portal = usePortalStore((portals) => portals.get(portalId))

  const slotKey = portal?.slotKey ?? null
  const returnPath = portal?.returnPath ?? null
  const targets = useMemo(() => portal?.targets ?? new Map(), [portal?.targets])

  const setSlotKey = useCallback(
    (newSlotKey: string | null) => setSlotKeyAction(portalId, newSlotKey),
    [portalId],
  )

  const setReturnPath = useCallback(
    (path: string | null) => setReturnPathAction(portalId, path),
    [portalId],
  )

  const reset = useCallback(() => resetPortalAction(portalId), [portalId])

  const registerTarget = useCallback(
    (targetSlotKey: string, target: HTMLElement) =>
      register(portalId, targetSlotKey, target),
    [portalId],
  )

  const unregisterTarget = useCallback(
    (targetSlotKey: string) => unregister(portalId, targetSlotKey),
    [portalId],
  )

  return {
    slotKey,
    returnPath,
    targets,
    setSlotKey,
    setReturnPath,
    reset,
    registerTarget,
    unregisterTarget,
  }
}
