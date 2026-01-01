# Video Portal Monorepo

Unmanaged DOM을 활용한 React 포털 라이브러리와 데모 앱.

## 패키지

| 패키지 | 설명 |
|--------|------|
| [`@kayce/react-unmanaged-portal`](./packages/react-unmanaged-portal) | 헤드리스 포털 라이브러리 |
| [`demo`](./apps/demo) | 비디오 플레이어 데모 앱 |

## 빠른 시작

```bash
pnpm install
pnpm dev        # demo 앱 실행
```

## 라이브러리 사용법

```bash
pnpm add @kayce/react-unmanaged-portal
```

```tsx
import { PortalHost, PortalSlot, usePortal } from '@kayce/react-unmanaged-portal'

function App() {
  return (
    <>
      {/* 포털 콘텐츠 */}
      <PortalHost>
        <video src="..." />
      </PortalHost>

      {/* 포털 슬롯들 */}
      <div className="main-area">
        <PortalSlot mode="main" />
      </div>
      <div className="mini-area">
        <PortalSlot mode="mini" />
      </div>
    </>
  )
}

function Controls() {
  const { mode, setMode, reset } = usePortal()

  return (
    <button onClick={() => setMode(mode === 'main' ? 'mini' : 'main')}>
      Toggle
    </button>
  )
}
```

---

## 핵심 개념: Unmanaged DOM Node

React의 `createPortal`만으로는 DOM 인스턴스 유지가 불가능하다. portal의 target이 바뀌면 React는 기존 DOM을 언마운트하고 새로 생성한다.

이 라이브러리는 **React가 관리하지 않는 DOM 노드(Unmanaged DOM)**를 중간에 두어 이 문제를 해결한다:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              React 영역                                  │
│                                                                          │
│   PortalHost                                                             │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  unmanagedNodeRef = useRef(document.createElement('div'))       │   │
│   │                           │                                     │   │
│   │              createPortal(children, unmanagedNode)              │   │
│   │                           │                                     │   │
│   │                           ▼                                     │   │
│   │  ┌─────────────────────────────────────────────┐                │   │
│   │  │         Unmanaged DOM Node (div)            │ ◄── React 외부 │   │
│   │  │  ┌───────────────────────────────────────┐  │                │   │
│   │  │  │           <video> 요소                │  │                │   │
│   │  │  │    (재생 상태, 버퍼 등 유지됨)         │  │                │   │
│   │  │  └───────────────────────────────────────┘  │                │   │
│   │  └─────────────────────────────────────────────┘                │   │
│   │                           │                                     │   │
│   │                    appendChild                                  │   │
│   │                           │                                     │   │
│   │              ┌────────────┴────────────┐                        │   │
│   │              ▼                         ▼                        │   │
│   │     PortalSlot (main)          PortalSlot (mini)                │   │
│   │     ┌─────────────┐            ┌─────────────┐                  │   │
│   │     │ <div ref /> │            │ <div ref /> │                  │   │
│   │     └─────────────┘            └─────────────┘                  │   │
│   │          ▲                          ▲                           │   │
│   │          │                          │                           │   │
│   │      register()                 register()                      │   │
│   │          │                          │                           │   │
│   │          └──────────┬───────────────┘                           │   │
│   │                     ▼                                           │   │
│   │              ┌─────────────┐                                    │   │
│   │              │ Zustand     │                                    │   │
│   │              │ targets Map │                                    │   │
│   │              │ mode state  │                                    │   │
│   │              └─────────────┘                                    │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## 왜 이 방식인가?

### 일반적인 createPortal의 한계

```tsx
// 이렇게 하면 target이 바뀔 때마다 video가 재생성됨
createPortal(<video />, mode === 'main' ? mainRef : miniRef)
```

### Unmanaged DOM의 장점

1. **DOM 인스턴스 완전 유지**: video 요소가 절대 언마운트되지 않음
2. **상태 보존**: 재생 위치, 버퍼, 네트워크 연결 등 모든 상태 유지
3. **React와 독립적**: appendChild/removeChild만 사용하여 위치 변경

## 라이브러리 API

### Components

| 컴포넌트 | 설명 |
|---------|------|
| `PortalHost` | unmanaged node 생성 + createPortal로 children 렌더링 |
| `PortalSlot` | 자신의 DOM ref를 store에 등록/해제 |

### Hooks

| 훅 | 설명 |
|---|------|
| `usePortal(portalId?)` | 포털 상태 및 액션 (mode, setMode, reset 등) |
| `usePortalStore` | 직접 Zustand 스토어 접근 |

### 다중 포털 인스턴스

```tsx
// 비디오 포털
<PortalHost portalId="video"><VideoElement /></PortalHost>
<PortalSlot portalId="video" mode="main" />
<PortalSlot portalId="video" mode="mini" />

// 모달 포털 (완전히 독립적)
<PortalHost portalId="modal"><ModalContent /></PortalHost>
<PortalSlot portalId="modal" mode="center" />
```

### 커스텀 모드

```tsx
<PortalSlot mode="pip" />       // PIP 모드
<PortalSlot mode="theater" />   // 극장 모드
<PortalSlot mode="fullscreen" />
```

## 프로젝트 구조

```
video-portal/
├── apps/
│   └── demo/                          # 데모 앱
│       ├── src/
│       │   ├── App.tsx
│       │   ├── features/
│       │   │   ├── portal/            # 앱 전용 포털 컴포넌트
│       │   │   │   ├── MainPortal.tsx
│       │   │   │   ├── MiniPortal.tsx
│       │   │   │   └── MiniPortalContainer.tsx
│       │   │   └── player/            # 비디오 플레이어
│       │   ├── pages/
│       │   └── layouts/
│       ├── package.json
│       └── vite.config.ts
│
├── packages/
│   └── react-unmanaged-portal/        # @kayce/react-unmanaged-portal
│       ├── src/
│       │   ├── index.ts               # Public API
│       │   ├── PortalHost.tsx
│       │   ├── PortalSlot.tsx
│       │   ├── usePortal.ts
│       │   └── store.ts
│       ├── package.json
│       └── vite.config.ts
│
├── nx.json
├── pnpm-workspace.yaml
└── package.json
```

## 스크립트

```bash
pnpm dev          # demo 앱 실행
pnpm build        # 전체 빌드
pnpm build:lib    # 라이브러리만 빌드
```

## 기술 스택

- **Monorepo**: Nx + pnpm workspace
- **Library**: Vite (library mode) + TypeScript
- **Demo App**: React 19 + React Compiler + Vite + TailwindCSS
- **State**: Zustand
- **Routing**: React Router
