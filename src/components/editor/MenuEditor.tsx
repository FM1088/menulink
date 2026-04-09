'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import {
  type MenuSection,
  type MenuItem,
  type DietaryFlag,
  type Allergen,
  DIETARY_FLAGS,
  ALLERGENS,
  formatPrice,
} from '@/lib/types'

interface Props {
  pageId: string
}

/**
 * MenuEditor — section + item CRUD with optimistic local state.
 *
 * Each mutation hits Supabase + updates local arrays. Sort order is
 * maintained by sort_order column; reorder buttons swap adjacent values.
 *
 * Photo upload skipped intentionally — restaurants can paste URLs for now,
 * full upload UI comes after first paying customer asks.
 */
export function MenuEditor({ pageId }: Props) {
  const supabase = getSupabaseBrowser()
  const [sections, setSections] = useState<MenuSection[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [savingItemId, setSavingItemId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    const [{ data: sec }, { data: it }] = await Promise.all([
      supabase
        .from('menu_sections')
        .select('*')
        .eq('page_id', pageId)
        .order('sort_order'),
      supabase
        .from('menu_items')
        .select('*')
        .eq('page_id', pageId)
        .order('sort_order'),
    ])
    setSections((sec as MenuSection[]) || [])
    setItems((it as MenuItem[]) || [])
    setLoading(false)
  }, [pageId, supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ─── Section CRUD ──────────────────────────────
  const addSection = async () => {
    const newSection = {
      page_id: pageId,
      name: 'New section',
      description: '',
      sort_order: sections.length,
    }
    const { data, error } = await supabase
      .from('menu_sections')
      .insert(newSection)
      .select()
      .single()
    if (error) {
      toast.error('Failed to add section')
      return
    }
    setSections([...sections, data as MenuSection])
  }

  const updateSection = async (id: string, patch: Partial<MenuSection>) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    )
    const { error } = await supabase
      .from('menu_sections')
      .update(patch)
      .eq('id', id)
    if (error) toast.error('Failed to save')
  }

  const deleteSection = async (id: string) => {
    if (
      !confirm(
        'Delete this section? Items inside will be moved to "Other items".',
      )
    )
      return
    const { error } = await supabase.from('menu_sections').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete section')
      return
    }
    setSections((prev) => prev.filter((s) => s.id !== id))
    setItems((prev) =>
      prev.map((i) => (i.section_id === id ? { ...i, section_id: null } : i)),
    )
  }

  const moveSection = async (id: string, dir: -1 | 1) => {
    const idx = sections.findIndex((s) => s.id === id)
    if (idx < 0) return
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= sections.length) return
    const a = sections[idx]
    const b = sections[swapIdx]
    const updated = [...sections]
    updated[idx] = { ...b, sort_order: a.sort_order }
    updated[swapIdx] = { ...a, sort_order: b.sort_order }
    setSections(updated)
    await Promise.all([
      supabase.from('menu_sections').update({ sort_order: a.sort_order }).eq('id', b.id),
      supabase.from('menu_sections').update({ sort_order: b.sort_order }).eq('id', a.id),
    ])
  }

  // ─── Item CRUD ────────────────────────────────
  const addItem = async (sectionId: string | null) => {
    const newItem = {
      page_id: pageId,
      section_id: sectionId,
      name: 'New item',
      description: '',
      price_cents: null,
      currency: 'AUD',
      dietary: [],
      allergens: [],
      photo_url: null,
      available: true,
      sort_order: items.filter((i) => i.section_id === sectionId).length,
    }
    const { data, error } = await supabase
      .from('menu_items')
      .insert(newItem)
      .select()
      .single()
    if (error) {
      toast.error('Failed to add item')
      return
    }
    setItems([...items, data as MenuItem])
  }

  const updateItem = async (id: string, patch: Partial<MenuItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
    setSavingItemId(id)
    const { error } = await supabase.from('menu_items').update(patch).eq('id', id)
    setSavingItemId(null)
    if (error) toast.error('Failed to save item')
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this item?')) return
    const { error } = await supabase.from('menu_items').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete')
      return
    }
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const toggleDietary = (item: MenuItem, flag: DietaryFlag) => {
    const next = item.dietary.includes(flag)
      ? item.dietary.filter((f) => f !== flag)
      : [...item.dietary, flag]
    updateItem(item.id, { dietary: next })
  }

  const toggleAllergen = (item: MenuItem, a: Allergen) => {
    const next = item.allergens.includes(a)
      ? item.allergens.filter((f) => f !== a)
      : [...item.allergens, a]
    updateItem(item.id, { allergens: next })
  }

  const setPriceFromInput = (item: MenuItem, raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, '')
    if (cleaned === '') {
      updateItem(item.id, { price_cents: null })
      return
    }
    const num = parseFloat(cleaned)
    if (Number.isNaN(num)) return
    updateItem(item.id, { price_cents: Math.round(num * 100) })
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading menu…</div>
  }

  const uncategorisedItems = items.filter((i) => !i.section_id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Menu items</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Structured menu with prices, dietary tags, and allergens. The
            feature that makes MenuLink an actual menu product.
          </p>
        </div>
        <Button
          size="sm"
          onClick={addSection}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="w-4 h-4 mr-1" /> Section
        </Button>
      </div>

      {sections.length === 0 && uncategorisedItems.length === 0 && (
        <Card className="p-8 text-center bg-white/[0.02] border-white/5 border-dashed">
          <p className="text-sm text-muted-foreground mb-3">
            No menu items yet. Start by adding a section like &quot;Starters&quot; or &quot;Mains&quot;.
          </p>
          <Button onClick={addSection} className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-1" /> Add first section
          </Button>
        </Card>
      )}

      {sections.map((section, sIdx) => {
        const sectionItems = items
          .filter((i) => i.section_id === section.id)
          .sort((a, b) => a.sort_order - b.sort_order)
        return (
          <Card
            key={section.id}
            className="p-4 bg-white/[0.02] border-white/10 space-y-3"
          >
            <div className="flex items-start gap-2">
              <div className="flex flex-col">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  disabled={sIdx === 0}
                  onClick={() => moveSection(section.id, -1)}
                >
                  <ChevronUp className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  disabled={sIdx === sections.length - 1}
                  onClick={() => moveSection(section.id, 1)}
                >
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  value={section.name}
                  onChange={(e) =>
                    updateSection(section.id, { name: e.target.value })
                  }
                  className="bg-white/5 border-white/10 font-semibold text-base"
                  placeholder="Section name (e.g. Starters)"
                />
                <Input
                  value={section.description}
                  onChange={(e) =>
                    updateSection(section.id, { description: e.target.value })
                  }
                  className="bg-white/5 border-white/10 text-xs"
                  placeholder="Optional description"
                />
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteSection(section.id)}
                className="text-red-400 hover:text-red-300 h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="pl-10 space-y-3">
              {sectionItems.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  saving={savingItemId === item.id}
                  onUpdate={(patch) => updateItem(item.id, patch)}
                  onDelete={() => deleteItem(item.id)}
                  onPriceChange={(raw) => setPriceFromInput(item, raw)}
                  onToggleDietary={(f) => toggleDietary(item, f)}
                  onToggleAllergen={(a) => toggleAllergen(item, a)}
                />
              ))}
              <Button
                size="sm"
                variant="outline"
                className="w-full border-white/10 border-dashed"
                onClick={() => addItem(section.id)}
              >
                <Plus className="w-3 h-3 mr-1" /> Add item to {section.name}
              </Button>
            </div>
          </Card>
        )
      })}

      {uncategorisedItems.length > 0 && (
        <Card className="p-4 bg-white/[0.02] border-white/10 space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground">
            Other items
          </h4>
          <div className="space-y-3">
            {uncategorisedItems.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                saving={savingItemId === item.id}
                onUpdate={(patch) => updateItem(item.id, patch)}
                onDelete={() => deleteItem(item.id)}
                onPriceChange={(raw) => setPriceFromInput(item, raw)}
                onToggleDietary={(f) => toggleDietary(item, f)}
                onToggleAllergen={(a) => toggleAllergen(item, a)}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ─── Single item row ─────────────────────────────────────────

interface ItemRowProps {
  item: MenuItem
  saving: boolean
  onUpdate: (patch: Partial<MenuItem>) => void
  onDelete: () => void
  onPriceChange: (raw: string) => void
  onToggleDietary: (f: DietaryFlag) => void
  onToggleAllergen: (a: Allergen) => void
}

function ItemRow({
  item,
  saving,
  onUpdate,
  onDelete,
  onPriceChange,
  onToggleDietary,
  onToggleAllergen,
}: ItemRowProps) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div
      className={`p-3 rounded-lg border ${
        item.available
          ? 'bg-white/[0.03] border-white/10'
          : 'bg-white/[0.01] border-white/5 opacity-60'
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Input
              value={item.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="bg-white/5 border-white/10 font-medium"
              placeholder="Item name"
            />
            <Input
              value={item.price_cents !== null ? (item.price_cents / 100).toFixed(2) : ''}
              onChange={(e) => onPriceChange(e.target.value)}
              className="bg-white/5 border-white/10 w-24"
              placeholder="Price"
              inputMode="decimal"
            />
          </div>
          {expanded && (
            <>
              <Textarea
                value={item.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
                className="bg-white/5 border-white/10 text-sm min-h-[60px]"
                placeholder="Description (optional)"
              />
              <Input
                value={item.photo_url || ''}
                onChange={(e) =>
                  onUpdate({ photo_url: e.target.value || null })
                }
                className="bg-white/5 border-white/10 text-xs"
                placeholder="Photo URL (optional)"
              />
              <div>
                <Label className="text-xs text-muted-foreground">Dietary</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {DIETARY_FLAGS.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => onToggleDietary(f.value)}
                      className={`text-xs px-2 py-1 rounded border transition ${
                        item.dietary.includes(f.value)
                          ? 'bg-orange-500/20 border-orange-500/40 text-orange-300'
                          : 'bg-white/[0.02] border-white/10 text-white/50 hover:text-white/80'
                      }`}
                    >
                      {f.emoji} {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Contains</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {ALLERGENS.map((a) => (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => onToggleAllergen(a.value)}
                      className={`text-xs px-2 py-1 rounded border transition ${
                        item.allergens.includes(a.value)
                          ? 'bg-red-500/20 border-red-500/40 text-red-300'
                          : 'bg-white/[0.02] border-white/10 text-white/50 hover:text-white/80'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          {!expanded && item.dietary.length + item.allergens.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.dietary.map((d) => (
                <Badge
                  key={d}
                  variant="outline"
                  className="text-[10px] border-orange-500/30 text-orange-300"
                >
                  {DIETARY_FLAGS.find((f) => f.value === d)?.emoji} {d}
                </Badge>
              ))}
              {item.allergens.length > 0 && (
                <Badge
                  variant="outline"
                  className="text-[10px] border-red-500/30 text-red-300"
                >
                  contains: {item.allergens.join(', ')}
                </Badge>
              )}
            </div>
          )}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-orange-400 hover:underline"
            >
              {expanded ? 'Less' : 'More options'}
            </button>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              {saving && <span>Saving…</span>}
              {item.price_cents !== null && (
                <span className="font-mono">
                  {formatPrice(item.price_cents, item.currency)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onUpdate({ available: !item.available })}
            className="h-7 w-7 p-0"
            title={item.available ? 'Hide from menu' : 'Show on menu'}
          >
            {item.available ? (
              <Eye className="w-3 h-3" />
            ) : (
              <EyeOff className="w-3 h-3" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="text-red-400 hover:text-red-300 h-7 w-7 p-0"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
