import { describe, it, expect } from 'vitest'
import { buildMenuTree, formatPrice } from './types'
import type { MenuSection, MenuItem } from './types'

function makeSection(id: string, sort_order: number, name = id): MenuSection {
  return {
    id,
    page_id: 'p1',
    name,
    description: '',
    sort_order,
  }
}

function makeItem(
  id: string,
  section_id: string | null,
  sort_order: number,
  patch: Partial<MenuItem> = {},
): MenuItem {
  return {
    id,
    page_id: 'p1',
    section_id,
    name: id,
    description: '',
    price_cents: null,
    currency: 'AUD',
    dietary: [],
    allergens: [],
    photo_url: null,
    available: true,
    sort_order,
    ...patch,
  }
}

describe('buildMenuTree', () => {
  it('groups items into sections by section_id', () => {
    const sections = [makeSection('s1', 0, 'Starters'), makeSection('s2', 1, 'Mains')]
    const items = [
      makeItem('i1', 's1', 0),
      makeItem('i2', 's2', 0),
      makeItem('i3', 's1', 1),
    ]
    const tree = buildMenuTree(sections, items)
    expect(tree.sections.map((s) => s.name)).toEqual(['Starters', 'Mains'])
    expect(tree.itemsBySection['s1'].map((i) => i.id)).toEqual(['i1', 'i3'])
    expect(tree.itemsBySection['s2'].map((i) => i.id)).toEqual(['i2'])
    expect(tree.uncategorised).toEqual([])
  })

  it('puts items with null section_id into uncategorised', () => {
    const sections = [makeSection('s1', 0)]
    const items = [makeItem('i1', null, 0), makeItem('i2', 's1', 0)]
    const tree = buildMenuTree(sections, items)
    expect(tree.uncategorised.map((i) => i.id)).toEqual(['i1'])
    expect(tree.itemsBySection['s1'].map((i) => i.id)).toEqual(['i2'])
  })

  it('puts items with deleted section_id into uncategorised', () => {
    const sections = [makeSection('s1', 0)]
    const items = [makeItem('i1', 'gone', 0), makeItem('i2', 's1', 0)]
    const tree = buildMenuTree(sections, items)
    expect(tree.uncategorised.map((i) => i.id)).toEqual(['i1'])
  })

  it('sorts sections by sort_order', () => {
    const sections = [
      makeSection('a', 2, 'Last'),
      makeSection('b', 0, 'First'),
      makeSection('c', 1, 'Middle'),
    ]
    const tree = buildMenuTree(sections, [])
    expect(tree.sections.map((s) => s.name)).toEqual(['First', 'Middle', 'Last'])
  })

  it('sorts items within a section by sort_order', () => {
    const sections = [makeSection('s1', 0)]
    const items = [
      makeItem('z', 's1', 5),
      makeItem('a', 's1', 1),
      makeItem('m', 's1', 3),
    ]
    const tree = buildMenuTree(sections, items)
    expect(tree.itemsBySection['s1'].map((i) => i.id)).toEqual(['a', 'm', 'z'])
  })

  it('handles empty input', () => {
    const tree = buildMenuTree([], [])
    expect(tree.sections).toEqual([])
    expect(tree.uncategorised).toEqual([])
    expect(Object.keys(tree.itemsBySection)).toEqual([])
  })
})

describe('formatPrice', () => {
  it('formats AUD cents to dollar string', () => {
    expect(formatPrice(1450, 'AUD')).toBe('$14.50')
    expect(formatPrice(0, 'AUD')).toBe('$0.00')
    expect(formatPrice(99, 'AUD')).toBe('$0.99')
    expect(formatPrice(123456, 'AUD')).toBe('$1234.56')
  })

  it('uses correct symbol per currency', () => {
    expect(formatPrice(1450, 'EUR')).toBe('€14.50')
    expect(formatPrice(1450, 'GBP')).toBe('£14.50')
    expect(formatPrice(1450, 'USD')).toBe('$14.50')
  })

  it('returns empty string for null', () => {
    expect(formatPrice(null, 'AUD')).toBe('')
  })
})
