import { useCallback, useMemo } from 'react'

import {
  DEFAULT_PORTAL_ID,
  usePortalStore,
  register,
  unregister,
  setMode as setModeAction,
  setReturnPath as setReturnPathAction,
  resetPortal as resetPortalAction,
} from './store'

export function usePortal(portalId: string = DEFAULT_PORTAL_ID) {
  const portal = usePortalStore((portals) => portals.get(portalId))

  const mode = portal?.mode ?? null
  const returnPath = portal?.returnPath ?? null
  const targets = useMemo(() => portal?.targets ?? new Map(), [portal?.targets])

  const setMode = useCallback(
    (newMode: string | null) => setModeAction(portalId, newMode),
    [portalId],
  )

  const setReturnPath = useCallback(
    (path: string | null) => setReturnPathAction(portalId, path),
    [portalId],
  )

  const reset = useCallback(() => resetPortalAction(portalId), [portalId])

  const registerTarget = useCallback(
    (targetMode: string, target: HTMLElement) =>
      register(portalId, targetMode, target),
    [portalId],
  )

  const unregisterTarget = useCallback(
    (targetMode: string) => unregister(portalId, targetMode),
    [portalId],
  )

  return {
    mode,
    returnPath,
    targets,
    setMode,
    setReturnPath,
    reset,
    registerTarget,
    unregisterTarget,
  }
}
