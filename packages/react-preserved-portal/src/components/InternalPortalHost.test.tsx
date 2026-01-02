import { render, screen, waitFor, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { resetPortal, setSlotKey, register } from '../model/store'
import { InternalPortalHost } from './InternalPortalHost'

describe('InternalPortalHost', () => {
  beforeEach(() => {
    resetPortal('test-portal')
    resetPortal('default')
  })

  it('renders with default portal ID', () => {
    const target = document.createElement('div')
    document.body.appendChild(target)

    register('default', 'main', target)
    setSlotKey('default', 'main')

    render(<InternalPortalHost node={<div>Test Content</div>} />)

    expect(screen.getByText('Test Content')).toBeInTheDocument()
    expect(
      target.contains(screen.getByText('Test Content').parentElement),
    ).toBe(true)

    document.body.removeChild(target)
  })

  it('renders with custom portal ID', () => {
    const target = document.createElement('div')
    document.body.appendChild(target)

    register('custom-portal', 'main', target)
    setSlotKey('custom-portal', 'main')

    render(
      <InternalPortalHost
        portalId="custom-portal"
        node={<div>Custom Portal Content</div>}
      />,
    )

    expect(screen.getByText('Custom Portal Content')).toBeInTheDocument()

    document.body.removeChild(target)
  })

  it('renders with custom container tag', () => {
    const target = document.createElement('div')
    document.body.appendChild(target)

    register('default', 'main', target)
    setSlotKey('default', 'main')

    render(
      <InternalPortalHost as="section" node={<div>Section Content</div>} />,
    )

    const content = screen.getByText('Section Content')
    const container = content.parentElement

    expect(container?.tagName.toLowerCase()).toBe('section')

    document.body.removeChild(target)
  })

  it('does not render when slot key is not set', () => {
    const target = document.createElement('div')
    document.body.appendChild(target)

    register('default', 'main', target)
    // setSlotKey is not called

    render(<InternalPortalHost node={<div>Should Not Render</div>} />)

    // Portal is not connected to target, so it's not rendered to body
    expect(screen.queryByText('Should Not Render')).not.toBeInTheDocument()

    document.body.removeChild(target)
  })

  it('moves to new target when slot key changes', async () => {
    const target1 = document.createElement('div')
    const target2 = document.createElement('div')
    target1.id = 'target1'
    target2.id = 'target2'
    document.body.appendChild(target1)
    document.body.appendChild(target2)

    register('default', 'slotKey1', target1)
    register('default', 'slotKey2', target2)
    setSlotKey('default', 'slotKey1')

    render(<InternalPortalHost node={<div>Moving Content</div>} />)

    await waitFor(() => {
      expect(
        target1.contains(screen.getByText('Moving Content').parentElement),
      ).toBe(true)
    })

    act(() => {
      setSlotKey('default', 'slotKey2')
    })

    await waitFor(() => {
      expect(
        target2.contains(screen.getByText('Moving Content').parentElement),
      ).toBe(true)
    })

    document.body.removeChild(target1)
    document.body.removeChild(target2)
  })

  it('removes from DOM on unmount', () => {
    const target = document.createElement('div')
    document.body.appendChild(target)

    register('default', 'main', target)
    setSlotKey('default', 'main')

    const { unmount } = render(
      <InternalPortalHost node={<div>Will Be Removed</div>} />,
    )

    expect(target.children.length).toBeGreaterThan(0)

    unmount()

    expect(target.children.length).toBe(0)

    document.body.removeChild(target)
  })

  it('allows multiple InternalPortalHost to use same portal', () => {
    const target = document.createElement('div')
    document.body.appendChild(target)

    register('default', 'main', target)
    setSlotKey('default', 'main')

    render(
      <>
        <InternalPortalHost node={<div>Content 1</div>} />
        <InternalPortalHost node={<div>Content 2</div>} />
      </>,
    )

    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.getByText('Content 2')).toBeInTheDocument()

    document.body.removeChild(target)
  })
})
