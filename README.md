# @charley-kim/react-unmanaged-portal

[![npm version](https://img.shields.io/npm/v/@charley-kim/react-unmanaged-portal.svg)](https://www.npmjs.com/package/@charley-kim/react-unmanaged-portal)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@charley-kim/react-unmanaged-portal)](https://bundlephobia.com/package/@charley-kim/react-unmanaged-portal)
[![license](https://img.shields.io/npm/l/@charley-kim/react-unmanaged-portal.svg)](https://github.com/kickbelldev/react-unmanaged-portal/blob/main/LICENSE)

A React portal library that leverages Unmanaged DOM to dynamically move portal content while preserving DOM instances.

## Installation

```bash
npm install @charley-kim/react-unmanaged-portal
# or
pnpm add @charley-kim/react-unmanaged-portal
# or
yarn add @charley-kim/react-unmanaged-portal
```

## Quick Start

```tsx
import { Portal, usePortal } from '@charley-kim/react-unmanaged-portal'

function App() {
  return (
    <>
      {/* Portal content */}
      <Portal.Host>
        <video src="..." />
      </Portal.Host>

      {/* Portal slots */}
      <div className="main-area">
        <Portal.Slot slotKey="main" />
      </div>
      <div className="mini-area">
        <Portal.Slot slotKey="mini" />
      </div>
    </>
  )
}

function Controls() {
  const { slotKey, setSlotKey } = usePortal()

  return (
    <button onClick={() => setSlotKey(slotKey === 'main' ? 'mini' : 'main')}>
      Toggle
    </button>
  )
}
```

## Core Concept: Unmanaged DOM Node

React's `createPortal` alone cannot preserve DOM instances. When the portal target changes, React unmounts the existing DOM and creates a new one.

This library solves this problem by placing an **Unmanaged DOM node** (not managed by React) in between:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              React                                      │
│                                                                         │
│   PortalHost                                                            │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  unmanagedNodeRef = useRef(document.createElement('div'))       │   │
│   │                           │                                     │   │
│   │              createPortal(children, unmanagedNode)              │   │
│   │                           │                                     │   │
│   │                           ▼                                     │   │
│   │  ┌─────────────────────────────────────────────┐                │   │
│   │  │           Unmanaged DOM Node (div)          │ ◄── Outside    │   │
│   │  │  ┌───────────────────────────────────────┐  │     of React   │   │
│   │  │  │           <video> Element             │  │                │   │
│   │  │  │         (Keep video instance)         │  │                │   │
│   │  │  └───────────────────────────────────────┘  │                │   │
│   │  └─────────────────────────────────────────────┘                │   │
│   │                           │                                     │   │
│   │                      appendChild                                │   │
│   │                           │                                     │   │
│   │              ┌────────────┴──────────────┐                      │   │
│   │              ▼                           ▼                      │   │
│   │     PortalSlot (main)           PortalSlot (mini)               │   │
│   │       ┌─────────────┐            ┌─────────────┐                │   │
│   │       │ <div ref /> │            │ <div ref /> │                │   │
│   │       └─────────────┘            └─────────────┘                │   │
│   │              ▲                           ▲                      │   │
│   │              │                           │                      │   │
│   │          register()                  register()                 │   │
│   │              │                           │                      │   │
│   │              └────────────┬──────────────┘                      │   │
│   │                           ▼                                     │   │
│   │                    ┌───────────────┐                            │   │
│   │                    │ externalStore │                            │   │
│   │                    │ targets Map   │                            │   │
│   │                    │ slotKey state    │                            │   │
│   │                    └───────────────┘                            │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Why This Approach?

#### Limitations of Standard createPortal

```tsx
// This causes the video to be recreated every time the target changes
createPortal(<video />, slotKey === 'main' ? mainRef : miniRef)
```

#### Benefits of Unmanaged DOM

1. **Complete DOM Instance Preservation**: The video element never gets unmounted
2. **State Preservation**: Playback position, buffer, network connections, and all other state are maintained
3. **Independent of React**: Only uses appendChild/removeChild to change location

## API

### Components

#### `Portal.Host`

A component that renders portal content. It creates an Unmanaged DOM node and renders children via `createPortal`.

**Props:**

| Prop       | Type                          | Default     | Description            |
| ---------- | ----------------------------- | ----------- | ---------------------- |
| `portalId` | `string`                      | `'default'` | Portal instance ID     |
| `children` | `ReactNode`                   | -           | Content to render      |
| `as`       | `keyof HTMLElementTagNameMap` | `'div'`     | Container element type |

**Example:**

```tsx
<Portal.Host>
  <video src="video.mp4" />
</Portal.Host>

<Portal.Host portalId="custom" as="section">
  <CustomComponent />
</Portal.Host>
```

#### `Portal.Slot`

A component that specifies where portal content should be rendered. It registers/unregisters its own DOM ref in the store.

**Props:**

| Prop       | Type                          | Default     | Description                      |
| ---------- | ----------------------------- | ----------- | -------------------------------- |
| `portalId` | `string`                      | `'default'` | Portal instance ID               |
| `slotKey`  | `string`                      | -           | **Required** Target slotKey name |
| `as`       | `keyof HTMLElementTagNameMap` | `'div'`     | Container element type           |
| `...props` | `HTMLAttributes`              | -           | HTML element attributes          |

**Example:**

```tsx
<Portal.Slot slotKey="main" />
<Portal.Slot slotKey="mini" className="mini-player" />
<Portal.Slot slotKey="pip" as="section" id="pip-container" />
```

### Hooks

#### `usePortal(portalId?)`

A hook that returns portal state and actions.

**Parameters:**

| Parameter  | Type     | Default     | Description        |
| ---------- | -------- | ----------- | ------------------ |
| `portalId` | `string` | `'default'` | Portal instance ID |

**Returns:**

| Property           | Type                                             | Description                                            |
| ------------------ | ------------------------------------------------ | ------------------------------------------------------ |
| `slotKey`          | `string \| null`                                 | Currently active slotKey                               |
| `returnPath`       | `string \| null`                                 | Portal return path                                     |
| `targets`          | `Map<string, HTMLElement>`                       | Map of all registered target slotKeys and DOM elements |
| `setSlotKey`       | `(slotKey: string \| null) => void`              | Set slotKey                                            |
| `setReturnPath`    | `(path: string \| null) => void`                 | Set return path                                        |
| `reset`            | `() => void`                                     | Reset portal state                                     |
| `registerTarget`   | `(slotKey: string, target: HTMLElement) => void` | Manually register target (usually not needed)          |
| `unregisterTarget` | `(slotKey: string) => void`                      | Manually unregister target (usually not needed)        |

**Example:**

```tsx
function VideoControls() {
  const { slotKey, setSlotKey, targets } = usePortal()

  return (
    <div>
      <p>Current slotKey: {slotKey || 'none'}</p>
      <p>Available targets: {Array.from(targets.keys()).join(', ')}</p>
      <button onClick={() => setSlotKey('main')}>Main</button>
      <button onClick={() => setSlotKey('mini')}>Mini</button>
      <button onClick={() => setSlotKey(null)}>Hide</button>
    </div>
  )
}
```

### Constants

#### `DEFAULT_PORTAL_ID`

The default portal ID. Value is `'default'`.

```tsx
import { DEFAULT_PORTAL_ID } from '@charley-kim/react-unmanaged-portal'
```

## Usage Examples

### Video Player (Main ↔ Mini Player)

```tsx
import { Portal, usePortal } from '@charley-kim/react-unmanaged-portal'

function VideoApp() {
  const { slotKey, setSlotKey } = usePortal()

  return (
    <>
      <Portal.Host>
        <video src="video.mp4" controls />
      </Portal.Host>

      <main>
        <Portal.Slot slotKey="main" />
        <button onClick={() => setSlotKey('mini')}>Minimize</button>
      </main>

      <aside>
        <Portal.Slot slotKey="mini" />
        <button onClick={() => setSlotKey('main')}>Maximize</button>
      </aside>
    </>
  )
}
```

### Multiple Portal Instances

You can use multiple independent portals simultaneously:

```tsx
function App() {
  return (
    <>
      {/* Video portal */}
      <Portal.Host portalId="video">
        <VideoElement />
      </Portal.Host>
      <Portal.Slot portalId="video" slotKey="main" />
      <Portal.Slot portalId="video" slotKey="mini" />

      {/* Modal portal (completely independent) */}
      <Portal.Host portalId="modal">
        <ModalContent />
      </Portal.Host>
      <Portal.Slot portalId="modal" slotKey="center" />
    </>
  )
}
```

### Custom Container Type

Use the `as` prop to specify the container element type:

```tsx
<Portal.Host as="section">
  <video src="..." />
</Portal.Host>

<Portal.Slot slotKey="main" as="article" className="video-container" />
```

### Custom SlotKeys

SlotKeys can be freely defined:

```tsx
<Portal.Slot slotKey="pip" />       // Picture-in-Picture slotKey
<Portal.Slot slotKey="theater" />   // Theater slotKey
<Portal.Slot slotKey="fullscreen" />
```

### Usage with Routing

Use with React Router to maintain video state across page transitions:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Portal } from '@charley-kim/react-unmanaged-portal'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/video/:id" element={<VideoPage />} />
      </Routes>

      {/* Maintain video state across all pages */}
      <Portal.Host>
        <VideoElement />
      </Portal.Host>
      <MiniPlayer />
    </BrowserRouter>
  )
}
```

## Requirements

- React >= 18.0.0
- React DOM >= 18.0.0

## License

MIT

## Contributing

Issues and PRs are welcome!
