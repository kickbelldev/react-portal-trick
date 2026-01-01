import { Portal } from '@kayce/react-unmanaged-portal'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { MiniPlayer, VideoElement } from '@/features/player'

import { RootLayout } from '@/layouts/RootLayout'

import { AboutPage } from '@/pages/AboutPage'
import { HomePage } from '@/pages/HomePage'
import { VideoPage } from '@/pages/VideoPage'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="video/:id" element={<VideoPage />} />
          </Route>
        </Routes>
        <Portal.Host>
          <VideoElement />
        </Portal.Host>
        <MiniPlayer />
      </BrowserRouter>
    </>
  )
}

export default App
