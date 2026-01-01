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
  const { setReturnPath, setMode } = usePortal(portalId)

  useEffect(() => {
    setReturnPath(pathname)
    setMode('main')

    return () => setMode('mini')
  }, [pathname, setMode, setReturnPath])

  return <Portal.Slot mode="main" className="contents" />
}
