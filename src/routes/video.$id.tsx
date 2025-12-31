import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

import { MainPlayer, usePlayerStore } from '@/features/player'
import { usePortalStore } from '@/features/portal'

import { VIDEO_SOURCES } from '@/constants/VIDEO_SOURCES'

export const Route = createFileRoute('/video/$id')({
  component: VideoPage,
})

function VideoPage() {
  const { id } = Route.useParams() as { id: string }

  // portal
  const activate = usePortalStore((s) => s.activate)
  const setMode = usePortalStore((s) => s.setMode)

  // player
  const play = usePlayerStore((s) => s.play)
  const stop = usePlayerStore((s) => s.stop)

  const src = VIDEO_SOURCES[id] ?? VIDEO_SOURCES['1']

  useEffect(() => {
    activate(stop) // 이전 비디오 자동 정리 + onClose 등록
    play(src)

    return () => setMode('mini')
  }, [src, activate, play, stop, setMode])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Video {id}</h1>
      <MainPlayer />
    </div>
  )
}
