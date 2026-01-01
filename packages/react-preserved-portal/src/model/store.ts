import { useSyncExternalStore } from 'react'

export const DEFAULT_PORTAL_ID = 'default'

export interface PortalInstance {
  targets: Map<string, HTMLElement>
  slotKey: string | null
  returnPath: string | null
}

// Module-level state
let portals = new Map<string, PortalInstance>()
const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach((listener) => listener())
}

function getSnapshot() {
  return portals
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const createEmptyInstance = (): PortalInstance => ({
  targets: new Map(),
  slotKey: null,
  returnPath: null,
})

// Actions
export function getOrCreatePortal(portalId: string): PortalInstance {
  const existing = portals.get(portalId)
  if (existing) return existing

  const newInstance = createEmptyInstance()
  portals = new Map(portals)
  portals.set(portalId, newInstance)
  emitChange()
  return newInstance
}

export function register(
  portalId: string,
  slotKey: string,
  target: HTMLElement,
): void {
  const instance = portals.get(portalId) ?? createEmptyInstance()
  const targets = new Map(instance.targets)
  targets.set(slotKey, target)

  portals = new Map(portals)
  portals.set(portalId, { ...instance, targets })
  emitChange()
}

export function unregister(portalId: string, slotKey: string): void {
  const instance = portals.get(portalId)
  if (!instance) return

  const targets = new Map(instance.targets)
  targets.delete(slotKey)

  portals = new Map(portals)
  portals.set(portalId, { ...instance, targets })
  emitChange()
}

export function setSlotKey(portalId: string, slotKey: string | null): void {
  const instance = portals.get(portalId) ?? createEmptyInstance()

  portals = new Map(portals)
  portals.set(portalId, { ...instance, slotKey })
  emitChange()
}

export function setReturnPath(portalId: string, path: string | null): void {
  const instance = portals.get(portalId) ?? createEmptyInstance()

  portals = new Map(portals)
  portals.set(portalId, { ...instance, returnPath: path })
  emitChange()
}

export function resetPortal(portalId: string): void {
  const instance = portals.get(portalId)
  if (!instance) return

  portals = new Map(portals)
  portals.set(portalId, createEmptyInstance())
  emitChange()
}

// Hook
export function usePortalStore<T>(
  selector: (portals: Map<string, PortalInstance>) => T,
): T {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return selector(snapshot)
}
