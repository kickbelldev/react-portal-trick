# Video Portal Monorepo

Unmanaged DOM을 활용한 React 포털 라이브러리와 데모 앱.

## 패키지

| 패키지                                                                     | 설명                     |
| -------------------------------------------------------------------------- | ------------------------ |
| [`@charley-kim/react-unmanaged-portal`](./packages/react-unmanaged-portal) | 헤드리스 포털 라이브러리 |
| [`demo`](./apps/demo)                                                      | 비디오 플레이어 데모 앱  |

## 빠른 시작

```bash
pnpm install
pnpm dev        # demo 앱 실행
```

## 사용법

```tsx
import { Portal, usePortal } from '@charley-kim/react-unmanaged-portal'

function App() {
  return (
    <>
      {/* 포털 콘텐츠 */}
      <Portal.Host>
        <video src="..." />
      </Portal.Host>

      {/* 포털 슬롯들 */}
      <div className="main-area">
        <Portal.Slot mode="main" />
      </div>
      <div className="mini-area">
        <Portal.Slot mode="mini" />
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

이 라이브러리는 **React가 관리하지 않는 Unmanaged DOM 노드**를 중간에 두어 이 문제를 해결한다:

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
│   │                    │ mode state    │                            │   │
│   │                    └───────────────┘                            │   │
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

| 컴포넌트      | 설명                                                 | Props                                  |
| ------------- | ---------------------------------------------------- | -------------------------------------- |
| `Portal.Host` | unmanaged node 생성 + createPortal로 children 렌더링 | `portalId?`, `children`, `as?`         |
| `Portal.Slot` | 자신의 DOM ref를 store에 등록/해제                   | `portalId?`, `mode`, `as?`, `...props` |

### Hooks

#### `usePortal(portalId?)`

포털 상태 및 액션을 반환합니다.

**반환값:**

| 속성               | 타입                                          | 설명                                    |
| ------------------ | --------------------------------------------- | --------------------------------------- |
| `mode`             | `string \| null`                              | 현재 활성화된 모드                      |
| `returnPath`       | `string \| null`                              | 포털 복귀 경로                          |
| `targets`          | `Map<string, HTMLElement>`                    | 등록된 모든 타겟 모드와 DOM 요소 맵     |
| `setMode`          | `(mode: string \| null) => void`              | 모드 설정                               |
| `setReturnPath`    | `(path: string \| null) => void`              | 복귀 경로 설정                          |
| `reset`            | `() => void`                                  | 포털 상태 초기화                        |
| `registerTarget`   | `(mode: string, target: HTMLElement) => void` | 타겟 수동 등록 (일반적으로 사용 불필요) |
| `unregisterTarget` | `(mode: string) => void`                      | 타겟 수동 해제 (일반적으로 사용 불필요) |

### 다중 포털 인스턴스

```tsx
// 비디오 포털
<Portal.Host portalId="video"><VideoElement /></Portal.Host>
<Portal.Slot portalId="video" mode="main" />
<Portal.Slot portalId="video" mode="mini" />

// 모달 포털 (완전히 독립적)
<Portal.Host portalId="modal"><ModalContent /></Portal.Host>
<Portal.Slot portalId="modal" mode="center" />
```

### 커스텀 컨테이너 타입

`as` prop을 사용하여 컨테이너 요소 타입을 지정할 수 있습니다:

```tsx
<Portal.Host as="section">
  <video src="..." />
</Portal.Host>

<Portal.Slot mode="main" as="article" className="video-container" />
```

### 커스텀 모드

```tsx
<Portal.Slot mode="pip" />       // PIP 모드
<Portal.Slot mode="theater" />   // 극장 모드
<Portal.Slot mode="fullscreen" />
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
- **Demo App**: React 19 + React Compiler + Vite + TailwindCSS + React Router
