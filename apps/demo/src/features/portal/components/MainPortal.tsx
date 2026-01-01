import {
  Portal,
  DEFAULT_PORTAL_ID,
  usePortal,
} from '@charley-kim/react-unmanaged-portal'
import { useEffect } from 'react'

interface MainPortalProps {
  portalId?: string
  pathname: string
}

export function MainPortal({
  portalId = DEFAULT_PORTAL_ID,
  pathname,
}: MainPortalProps) {
  const { setReturnPath, setSlotKey } = usePortal(portalId)

  useEffect(() => {
    setReturnPath(pathname)
    setSlotKey('main')

    return () => setSlotKey('mini')
  }, [pathname, setSlotKey, setReturnPath])

  return <Portal.Slot slotKey="main" className="contents" />
}
