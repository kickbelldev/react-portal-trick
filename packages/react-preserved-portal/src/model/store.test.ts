import { describe, it, expect, beforeEach } from 'vitest'
import {
  DEFAULT_PORTAL_ID,
  getOrCreatePortal,
  register,
  unregister,
  setSlotKey,
  setReturnPath,
  resetPortal,
} from './store'

describe('store', () => {
  beforeEach(() => {
    // 각 테스트 전에 포털 상태 초기화
    // 테스트에서 사용한 포털 ID들을 리셋
    resetPortal('test-portal')
    resetPortal('new-portal')
    resetPortal('portal1')
    resetPortal('portal2')
  })

  describe('DEFAULT_PORTAL_ID', () => {
    it('기본 포털 ID가 올바른지 확인', () => {
      expect(DEFAULT_PORTAL_ID).toBe('default')
    })
  })

  describe('getOrCreatePortal', () => {
    it('존재하지 않는 포털 ID로 호출하면 새 인스턴스를 생성', () => {
      const instance = getOrCreatePortal('test-portal')
      expect(instance).toEqual({
        targets: new Map(),
        slotKey: null,
        returnPath: null,
      })
    })

    it('이미 존재하는 포털 ID로 호출하면 기존 인스턴스를 반환', () => {
      const instance1 = getOrCreatePortal('test-portal')
      instance1.slotKey = 'test-slotKey'
      const instance2 = getOrCreatePortal('test-portal')
      expect(instance2.slotKey).toBe('test-slotKey')
    })
  })

  describe('register', () => {
    it('새로운 타겟을 등록', () => {
      const target = document.createElement('div')
      register('test-portal', 'test-slotKey', target)

      const instance = getOrCreatePortal('test-portal')
      expect(instance.targets.get('test-slotKey')).toBe(target)
    })

    it('같은 슬롯 키에 다른 타겟을 등록하면 덮어쓰기', () => {
      const target1 = document.createElement('div')
      const target2 = document.createElement('div')

      register('test-portal', 'test-slotKey', target1)
      register('test-portal', 'test-slotKey', target2)

      const instance = getOrCreatePortal('test-portal')
      expect(instance.targets.get('test-slotKey')).toBe(target2)
      expect(instance.targets.size).toBe(1)
    })

    it('여러 슬롯 키를 등록할 수 있음', () => {
      const target1 = document.createElement('div')
      const target2 = document.createElement('div')

      register('test-portal', 'slotKey1', target1)
      register('test-portal', 'slotKey2', target2)

      const instance = getOrCreatePortal('test-portal')
      expect(instance.targets.size).toBe(2)
      expect(instance.targets.get('slotKey1')).toBe(target1)
      expect(instance.targets.get('slotKey2')).toBe(target2)
    })
  })

  describe('unregister', () => {
    it('등록된 타겟을 제거', () => {
      const target = document.createElement('div')
      register('test-portal', 'test-slotKey', target)
      unregister('test-portal', 'test-slotKey')

      const instance = getOrCreatePortal('test-portal')
      expect(instance.targets.has('test-slotKey')).toBe(false)
    })

    it('존재하지 않는 포털에서 제거 시도해도 에러가 발생하지 않음', () => {
      expect(() => {
        unregister('non-existent', 'test-slotKey')
      }).not.toThrow()
    })

    it('존재하지 않는 슬롯 키를 제거 시도해도 에러가 발생하지 않음', () => {
      register('test-portal', 'slotKey1', document.createElement('div'))
      expect(() => {
        unregister('test-portal', 'non-existent')
      }).not.toThrow()
    })
  })

  describe('setSlotKey', () => {
    it('포털 슬롯 키를 설정', () => {
      setSlotKey('test-portal', 'test-slotKey')
      const instance = getOrCreatePortal('test-portal')
      expect(instance.slotKey).toBe('test-slotKey')
    })

    it('슬롯 키를 null로 설정 가능', () => {
      setSlotKey('test-portal', 'test-slotKey')
      setSlotKey('test-portal', null)
      const instance = getOrCreatePortal('test-portal')
      expect(instance.slotKey).toBeNull()
    })

    it('존재하지 않는 포털에 슬롯 키를 설정하면 새 인스턴스 생성', () => {
      setSlotKey('new-portal', 'new-slotKey')
      const instance = getOrCreatePortal('new-portal')
      expect(instance.slotKey).toBe('new-slotKey')
    })
  })

  describe('setReturnPath', () => {
    it('리턴 경로를 설정', () => {
      setReturnPath('test-portal', '/test-path')
      const instance = getOrCreatePortal('test-portal')
      expect(instance.returnPath).toBe('/test-path')
    })

    it('리턴 경로를 null로 설정 가능', () => {
      setReturnPath('test-portal', '/test-path')
      setReturnPath('test-portal', null)
      const instance = getOrCreatePortal('test-portal')
      expect(instance.returnPath).toBeNull()
    })

    it('존재하지 않는 포털에 리턴 경로를 설정하면 새 인스턴스 생성', () => {
      setReturnPath('new-portal', '/new-path')
      const instance = getOrCreatePortal('new-portal')
      expect(instance.returnPath).toBe('/new-path')
    })
  })

  describe('resetPortal', () => {
    it('포털 인스턴스를 초기 상태로 리셋', () => {
      const target = document.createElement('div')
      register('test-portal', 'test-slotKey', target)
      setSlotKey('test-portal', 'test-slotKey')
      setReturnPath('test-portal', '/test-path')

      resetPortal('test-portal')

      const instance = getOrCreatePortal('test-portal')
      expect(instance.targets.size).toBe(0)
      expect(instance.slotKey).toBeNull()
      expect(instance.returnPath).toBeNull()
    })

    it('존재하지 않는 포털을 리셋해도 에러가 발생하지 않음', () => {
      expect(() => {
        resetPortal('non-existent')
      }).not.toThrow()
    })
  })

  describe('usePortalStore', () => {
    it('getOrCreatePortal을 통해 등록된 데이터를 확인할 수 있음', () => {
      const target = document.createElement('div')
      register('test-portal', 'test-slotKey', target)

      const instance = getOrCreatePortal('test-portal')
      expect(instance.targets.get('test-slotKey')).toBe(target)
    })

    it('여러 포털을 독립적으로 관리할 수 있음', () => {
      const target1 = document.createElement('div')
      const target2 = document.createElement('div')

      register('portal1', 'slotKey1', target1)
      register('portal2', 'slotKey2', target2)

      const instance1 = getOrCreatePortal('portal1')
      const instance2 = getOrCreatePortal('portal2')

      expect(instance1.targets.get('slotKey1')).toBe(target1)
      expect(instance2.targets.get('slotKey2')).toBe(target2)
    })
  })
})
